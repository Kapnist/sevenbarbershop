/**
 * Tests de bout en bout dans Chrome : parcours de réservation complet sur mobile,
 * annulation, absence de débordement horizontal (responsive) sur le site et l'espace gérant.
 *   npm run test:e2e   (compile le site puis lance les tests ; Chrome doit être installé)
 *   SCREENSHOT_DIR=… pour enregistrer des captures.
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { createServer } from "node:net";
import { join, resolve } from "node:path";
import { after, before, describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { phpAvailable, startBackOffice } from "../helpers/php-server.mjs";

const ROOT = resolve(fileURLToPath(import.meta.url), "../../..");
const SHOTS = process.env.SCREENSHOT_DIR;
// Petits et grands téléphones, tablettes (portrait et paysage), portables, grands écrans.
const WIDTHS = [320, 360, 375, 390, 414, 600, 768, 820, 1024, 1280, 1440, 1920];
const ADMIN_WIDTHS = [320, 360, 414, 768, 1024, 1280, 1920];
const PAGES = [
  "/",
  "/prestations",
  "/salon",
  "/salons",
  "/salons/anatole-france",
  "/salons/jean-jaures",
  "/salons/chavanelle",
  "/salons/le-port",
  "/salons/meyerbeer",
  "/a-propos",
  "/carrieres",
  "/contact",
  "/reservation",
  "/reservation?salon=anatole-france",
  "/reservation/annuler?ref=XXXXXX&t=0",
];

function freePort() {
  return new Promise((ok) => {
    const s = createServer();
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => ok(port));
    });
  });
}

async function waitFor(url, ms = 20000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* pas encore prêt */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Serveur indisponible : ${url}`);
}

/** Largeur qui dépasse de l'écran (0 = aucun défilement horizontal de la page). */
const overflow = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

/** Éléments responsables d'un débordement, pour un message d'erreur utile. */
const culprits = (page) =>
  page.evaluate(() => {
    const w = document.documentElement.clientWidth;
    return [...document.querySelectorAll("body *")]
      .filter((el) => el.getBoundingClientRect().right > w + 1 && getComputedStyle(el).position !== "fixed")
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join(".")}`);
  });

async function shot(page, name) {
  if (!SHOTS) return;
  mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: join(SHOTS, `${name}.png`), fullPage: true });
}

const skip = !phpAvailable()
  ? "PHP introuvable (PHP_BIN)"
  : !existsSync(join(ROOT, "dist/index.html"))
    ? "Lancez d'abord npm run build"
    : false;

describe("Site et espace gérant dans Chrome", { skip }, () => {
  let bo;
  let preview;
  let browser;
  let base;

  before(async () => {
    bo = await startBackOffice();
    await bo.install();
    const { session } = await bo.login();
    await session.action(
      {
        action: "booking_save",
        booking_enabled: "1",
        booking_mode: "rolling",
        booking_days_ahead: "21",
        booking_min_notice_h: "2",
        slot_step: "15",
        notify_email: "",
        phone: "",
      },
      "planning",
    );
    const port = await freePort();
    base = `http://127.0.0.1:${port}`;
    preview = spawn(
      process.execPath,
      [join(ROOT, "node_modules/vite/bin/vite.js"), "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
      { cwd: ROOT, env: { ...process.env, PHP_DEV_SERVER: bo.base }, stdio: "ignore" },
    );
    await waitFor(base);
    browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "chrome" });
  });

  after(async () => {
    await browser?.close();
    preview?.kill();
    bo?.stop();
  });

  async function newPage(width, height = 900, language = "fr") {
    const context = await browser.newContext({ viewport: { width, height }, locale: "fr-FR" });
    await context.addInitScript((lang) => localStorage.setItem("seven-language", lang), language);
    // Pas de services externes pendant les tests (assistant de chat, Planity…)
    await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    return { page, errors, context };
  }

  test("parcours complet sur mobile : salon → réservation → confirmation → annulation", async () => {
    const { page, errors, context } = await newPage(375, 812);
    await page.goto(`${base}/salons/anatole-france`);
    // Le bouton du salon mène à la réservation du site (salon ouvert en ligne)
    const cta = page.locator(".anatole-hero-content a.button");
    await assert.doesNotReject(cta.waitFor());
    await page.waitForFunction(() => document.querySelector(".anatole-hero-content a.button")?.getAttribute("href")?.startsWith("/reservation"));
    assert.equal(await cta.getAttribute("href"), "/reservation?salon=anatole-france");
    await cta.click();

    await page.getByRole("heading", { name: /Prestation/ }).waitFor();
    assert.equal(await overflow(page), 0, "étape prestation");
    await page.locator(".booking-services .booking-option").first().click();

    await page.getByRole("button", { name: /Sans préférence/ }).click();
    await page.locator(".booking-day:not([disabled])").first().click();
    await page.locator(".booking-slot").first().waitFor();
    assert.equal(await overflow(page), 0, "étape heure");
    await shot(page, "mobile-reservation-heures");
    await page.locator(".booking-slot").first().click();

    await page.fill("#booking-name", "Client Navigateur");
    await page.fill("#booking-phone", "06 55 44 33 22");
    await page.fill("#booking-email", "navigateur@example.com");
    await page.check(".booking-consent input");
    assert.equal(await overflow(page), 0, "formulaire");
    await shot(page, "mobile-reservation-formulaire");
    await page.getByRole("button", { name: "Confirmer le rendez-vous" }).click();

    await page.getByRole("heading", { name: "C'est réservé !" }).waitFor();
    assert.equal(await overflow(page), 0, "confirmation");
    await shot(page, "mobile-reservation-confirmee");
    const ref = (await page.locator(".booking-confirmation .eyebrow").textContent()).split("·").pop().trim();
    assert.equal(bo.sql("SELECT status FROM appointments WHERE ref = ?", [ref])[0].status, "confirmed");
    assert.match(await page.locator('a[download$=".ics"]').getAttribute("href"), /^data:text\/calendar/);

    await page.getByRole("link", { name: "Annuler ce rendez-vous" }).click();
    await page.getByRole("button", { name: "Oui, annuler le rendez-vous" }).click();
    await page.getByRole("heading", { name: "Rendez-vous annulé." }).waitFor();
    assert.equal(bo.sql("SELECT status FROM appointments WHERE ref = ?", [ref])[0].status, "cancelled");
    assert.deepEqual(errors, []);
    await context.close();
  });

  test("salon resté sur Planity : le bouton garde le lien Planity", async () => {
    const { page, context } = await newPage(1280);
    await page.goto(`${base}/salons/meyerbeer`);
    await page.waitForLoadState("networkidle");
    const href = await page.locator(".anatole-hero-content a.button").getAttribute("href");
    assert.match(href, /planity\.com/);
    await context.close();
  });

  test("le client trouve « Réserver » partout : en-tête, accueil, prestations, pied de page", async () => {
    const { page, context } = await newPage(1280);
    await page.goto(base + "/");
    for (const selector of [".nav-book", ".hero-actions .button", ".anatole-booking .button", ".footer-links a[href='/reservation']"]) {
      assert.equal(await page.locator(selector).first().getAttribute("href"), "/reservation", selector);
    }
    await page.goto(base + "/prestations");
    assert.equal(await page.locator(".page-cta .button").getAttribute("href"), "/reservation");
    await page.locator(".nav-book").click();
    await page.getByRole("heading", { name: /Salon/ }).waitFor();
    assert.ok((await page.locator(".booking-option").count()) >= 5, "les 5 salons sont proposés");
    await context.close();
  });

  test("tous les salons ouverts : chaque bouton de salon mène à la réservation du site", async () => {
    const { session } = await bo.login();
    await session.action({ action: "booking_all", open: "1" }, "salons");
    bo.sql("DELETE FROM login_attempts");
    const { page, context } = await newPage(390, 844);
    for (const slug of ["anatole-france", "jean-jaures", "chavanelle", "le-port", "meyerbeer"]) {
      await page.goto(`${base}/salons/${slug}`);
      const cta = page.locator("a.button").filter({ hasText: /Réserver|rendez-vous/i }).first();
      await page.waitForFunction(
        () => [...document.querySelectorAll("a.button")].some((a) => a.getAttribute("href")?.startsWith("/reservation")),
      );
      assert.match(await cta.getAttribute("href"), new RegExp(`^/reservation\\?salon=${slug}$`), slug);
    }
    // Réservation possible dans chaque salon : au moins un créneau libre proposé
    await page.goto(`${base}/reservation?salon=meyerbeer`);
    await page.locator(".booking-services .booking-option").first().click();
    await page.getByRole("button", { name: /Sans préférence/ }).click();
    await page.locator(".booking-day:not([disabled])").first().click();
    await page.locator(".booking-slot").first().waitFor();
    await context.close();
  });

  test("en-tête : logo, « Réserver », langue et menu ne se chevauchent sur aucun écran", async () => {
    const problems = [];
    for (const width of WIDTHS) {
      const { page, context } = await newPage(width);
      await page.goto(base + "/");
      const boxes = await page.evaluate(() =>
        [".brand", ".nav-book", ".language-switcher", ".menu-toggle", ".nav-links"]
          .map((s) => [s, document.querySelector(s)])
          .filter(([, el]) => el && getComputedStyle(el).display !== "none" && el.getBoundingClientRect().width > 0)
          .map(([s, el]) => {
            const r = el.getBoundingClientRect();
            return { s, left: r.left, right: r.right, top: r.top, bottom: r.bottom };
          }),
      );
      if (!boxes.some((b) => b.s === ".nav-book")) problems.push(`${width}px : bouton Réserver absent`);
      const brand = boxes.find((b) => b.s === ".brand");
      if (!brand || brand.right - brand.left < 60) problems.push(`${width}px : logo écrasé (${brand ? Math.round(brand.right - brand.left) : 0}px)`);
      // Chaque lien du menu affiché tient sur une seule ligne
      const wrapped = await page.evaluate(() =>
        [...document.querySelectorAll(".nav-links a")]
          .filter((a) => a.getClientRects().length && getComputedStyle(a.closest(".nav-links")).display !== "none")
          .filter((a) => a.getBoundingClientRect().height > parseFloat(getComputedStyle(a).fontSize) * 2.2)
          .map((a) => a.textContent),
      );
      if (wrapped.length) problems.push(`${width}px : liens sur deux lignes (${wrapped.join(", ")})`);
      // Quand le menu est replié, le bouton l'ouvre
      if (await page.locator(".menu-toggle").isVisible()) {
        await page.locator(".menu-toggle").click();
        if (!(await page.locator(".nav-links.is-open a").first().isVisible())) problems.push(`${width}px : le menu ne s'ouvre pas`);
        await page.locator(".menu-toggle").click();
      }
      for (const b of boxes) if (b.right > width + 1 || b.left < -1) problems.push(`${width}px : ${b.s} sort de l'écran`);
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i], c = boxes[j];
          if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1)
            problems.push(`${width}px : ${a.s} chevauche ${c.s}`);
        }
      if ([320, 768, 1024, 1920].includes(width)) await shot(page, `entete-${width}`);
      await context.close();
    }
    assert.deepEqual(problems, []);
  });

  test("téléphone à l'horizontale et tablette : réservation utilisable", async () => {
    for (const [w, h, name] of [[844, 390, "telephone-paysage"], [1024, 768, "tablette-paysage"], [768, 1024, "tablette-portrait"]]) {
      const { page, errors, context } = await newPage(w, h);
      await page.goto(`${base}/reservation?salon=anatole-france`);
      await page.locator(".booking-services .booking-option").first().click();
      await page.getByRole("button", { name: /Sans préférence/ }).click();
      await page.locator(".booking-day:not([disabled])").first().click();
      await page.locator(".booking-slot").first().waitFor();
      assert.equal(await overflow(page), 0, name);
      // Les créneaux restent des cibles tactiles confortables (44 px de haut au minimum).
      const slotHeight = await page.locator(".booking-slot").first().evaluate((el) => el.getBoundingClientRect().height);
      assert.ok(slotHeight >= 44, `${name} : créneau de ${slotHeight}px`);
      await shot(page, `reservation-${name}`);
      assert.deepEqual(errors, []);
      await context.close();
    }
  });

  test("responsive : aucune page du site ne déborde horizontalement (320 → 1920 px)", async () => {
    const problems = [];
    for (const width of WIDTHS) {
      const { page, errors, context } = await newPage(width);
      for (const path of PAGES) {
        await page.goto(base + path);
        await page.waitForLoadState("networkidle");
        const extra = await overflow(page);
        if (extra > 0) problems.push(`${path} @${width}px : +${extra}px (${(await culprits(page)).join(", ")})`);
      }
      if (errors.length) problems.push(`${width}px : erreurs JS ${errors.join(" | ")}`);
      if (width === 375) {
        await page.goto(`${base}/reservation?salon=anatole-france`);
        await page.waitForLoadState("networkidle");
        await shot(page, "mobile-reservation-prestations");
      }
      await context.close();
    }
    assert.deepEqual(problems, []);
  });

  test("responsive : réservation en arabe (de droite à gauche) sur mobile", async () => {
    const { page, errors, context } = await newPage(360, 800, "ar");
    await page.goto(`${base}/reservation?salon=anatole-france`);
    await page.locator(".booking-services .booking-option").first().waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.dir), "rtl");
    assert.equal(await overflow(page), 0);
    assert.deepEqual(errors, []);
    await context.close();
  });

  test("espace gérant : menu mobile, pages lisibles du téléphone au grand écran", async () => {
    const problems = [];
    for (const width of ADMIN_WIDTHS) {
      const { page, context } = await newPage(width);
      await page.goto(`${base}/gestion/admin/login.php`);
      assert.equal(await overflow(page), 0, `connexion @${width}`);
      await page.fill('input[name="email"]', "owner@example.com");
      await page.fill('input[name="password"]', "motdepasse-solide");
      await page.click('button[type="submit"]');
      await page.waitForURL(/index\.php/);
      bo.sql("DELETE FROM login_attempts");

      for (const p of ["agenda", "rdv", "clients", "stats", "equipe", "planning", "prestations", "salons", "comptes", "compte"]) {
        await page.goto(`${base}/gestion/admin/index.php?p=${p}`);
        const extra = await overflow(page);
        if (extra > 0) problems.push(`admin ${p} @${width}px : +${extra}px (${(await culprits(page)).join(", ")})`);
        if (width === 360 && ["agenda", "stats", "clients"].includes(p)) await shot(page, `admin-mobile-${p}`);
        if (width === 1280 && p === "stats") await shot(page, "admin-desktop-stats");
      }

      const burger = page.locator("[data-sidebar-toggle]");
      if (width < 900) {
        assert.ok(await burger.isVisible(), "bouton menu visible sur mobile");
        await burger.click();
        await page.locator("#sidebar.is-open").waitFor();
        assert.ok(await page.getByRole("link", { name: "Statistiques" }).isVisible());
      } else {
        assert.equal(await burger.isVisible(), false);
        assert.ok(await page.getByRole("link", { name: "Statistiques" }).isVisible());
      }
      await context.close();
    }
    assert.deepEqual(problems, []);
  });
});
