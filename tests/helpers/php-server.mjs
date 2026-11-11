/**
 * Lance le back-office PHP (gestion/) sur une copie temporaire, avec une base SQLite neuve.
 * PHP doit être installé (commande « php ») ou indiqué par la variable PHP_BIN.
 */
import { spawn, spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "../../..");
export const PHP = process.env.PHP_BIN || "php";

export const OWNER = { name: "Test", email: "owner@example.com", password: "motdepasse-solide" };

function freePort() {
  return new Promise((ok, ko) => {
    const srv = createServer();
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => ok(port));
    });
    srv.on("error", ko);
  });
}

async function waitFor(url, timeoutMs = 10000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  throw new Error(`Le serveur PHP ne répond pas : ${url}`);
}

/** Petit navigateur : garde le cookie de session entre les requêtes. */
export class Session {
  constructor(base) {
    this.base = base;
    this.cookies = new Map();
  }
  async request(path, init = {}) {
    const headers = new Headers(init.headers);
    if (this.cookies.size) headers.set("Cookie", [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; "));
    const res = await fetch(this.base + path, { ...init, headers, redirect: "manual" });
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(";");
      const i = pair.indexOf("=");
      this.cookies.set(pair.slice(0, i), pair.slice(i + 1));
    }
    return res;
  }
  async get(path) {
    const res = await this.request(path);
    return { res, text: await res.text() };
  }
  async post(path, fields) {
    const body = new URLSearchParams(fields);
    const res = await this.request(path, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    return { res, text: await res.text() };
  }
  /** Jeton CSRF lu dans une page de l'espace gérant. */
  async csrf(path = "/admin/index.php") {
    const { text } = await this.get(path);
    const m = text.match(/name="csrf" value="([a-f0-9]+)"/);
    if (!m) throw new Error(`Jeton CSRF introuvable sur ${path}`);
    return m[1];
  }
  /** Envoie une action de l'espace gérant et renvoie la page suivante (avec ses messages). */
  async action(fields, page = "agenda") {
    const csrf = await this.csrf(`/admin/index.php?p=${page}`);
    const { res } = await this.post(`/admin/index.php?p=${page}`, { csrf, ...fields });
    const location = res.headers.get("location") ?? `index.php?p=${page}`;
    return (await this.get(`/admin/${location}`)).text;
  }
}

export async function json(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Réponse non JSON (${res.status}) : ${text.slice(0, 400)}`);
  }
}

export function phpAvailable() {
  return spawnSync(PHP, ["-v"], { encoding: "utf8" }).status === 0;
}

/** Démarre un back-office neuf. */
export async function startBackOffice() {
  const dir = mkdtempSync(join(tmpdir(), "seven-gestion-"));
  const app = join(dir, "gestion");
  cpSync(join(ROOT, "gestion"), app, {
    recursive: true,
    filter: (p) => !/(config\.php|\.sqlite|mails\.log)$/.test(p),
  });
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const server = spawn(PHP, ["-S", `127.0.0.1:${port}`, "-t", app], { stdio: ["ignore", "pipe", "pipe"] });
  let log = "";
  server.stdout.on("data", (d) => (log += d));
  server.stderr.on("data", (d) => (log += d));
  await waitFor(`${base}/api/catalog.php`);

  const db = join(app, "data", "seven.sqlite");
  const ctx = {
    base,
    dir,
    app,
    get log() {
      return log;
    },
    /** Exécute une requête SQL sur la base de test (via PHP, pour ne dépendre de rien d'autre). */
    sql(query, params = []) {
      const code = `$p=new PDO('sqlite:'.$argv[1]);$p->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);$s=$p->prepare($argv[2]);$s->execute(json_decode($argv[3],true));echo json_encode($s->fetchAll(PDO::FETCH_ASSOC));`;
      const r = spawnSync(PHP, ["-r", code, db, query, JSON.stringify(params)], { encoding: "utf8" });
      if (r.status !== 0) throw new Error(r.stderr || r.stdout);
      return JSON.parse(r.stdout || "[]");
    },
    mails() {
      try {
        return readFileSync(join(app, "data", "mails.log"), "utf8");
      } catch {
        return "";
      }
    },
    async install() {
      const s = new Session(base);
      const { text } = await s.post("/install.php", {
        driver: "sqlite",
        admin_name: OWNER.name,
        email: OWNER.email,
        password: OWNER.password,
        origins: "http://localhost:4173",
      });
      // Mode test : e-mails écrits dans data/mails.log, liens vers un domaine fictif.
      const cfgPath = join(app, "config.php");
      const cfg = readFileSync(cfgPath, "utf8").replace(
        "'site_url' => '',",
        "'site_url' => 'https://www.example.test',\n  'mail_log' => true,",
      );
      writeFileSync(cfgPath, cfg);
      return text;
    },
    async login(email = OWNER.email, password = OWNER.password) {
      const s = new Session(base);
      const csrf = await s.csrf("/admin/login.php");
      const { res, text } = await s.post("/admin/login.php", { csrf, email, password });
      return { session: s, ok: res.status === 302 && /index\.php/.test(res.headers.get("location") ?? ""), text };
    },
    /** Remet à zéro les limites anti-abus (les tests réservent plus de 5 fois par heure). */
    resetRateLimits() {
      ctx.sql("DELETE FROM rate_hits");
    },
    stop() {
      server.kill();
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch {
        // Windows peut garder la base ouverte quelques instants.
      }
    },
  };
  return ctx;
}
