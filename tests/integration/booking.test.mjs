/**
 * Tests d'intégration du back-office : installation, API publique de réservation,
 * annulation par le client et espace gérant, sur un vrai serveur PHP + SQLite.
 *   npm test            (PHP dans le PATH, ou PHP_BIN=chemin/vers/php)
 */
import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { json, phpAvailable, startBackOffice } from "../helpers/php-server.mjs";

/** Date-heure de Paris (fuseau du back-office), décalée de N minutes : « 2026-11-10 18:30:00 ». */
function parisTime(offsetMinutes = 0) {
  const d = new Date(Date.now() + offsetMinutes * 60000);
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
}

const PHP_ERRORS =/(Fatal error|Warning:|Notice:|Deprecated:|Parse error|Uncaught)/;

describe("Back-office de réservation (PHP)", { skip: !phpAvailable() && "PHP introuvable (PHP_BIN)" }, () => {
  let bo;
  let admin;
  let salon; // anatole-france, une fois ouvert
  const api = (path, init) => fetch(`${bo.base}/api/${path}`, init);
  const post = (path, body) =>
    api(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

  /** Premier jour avec des créneaux libres et ses créneaux. */
  async function firstFreeDay(serviceId, staff = 0) {
    const { days } = await json(await api(`days.php?salon=anatole-france&service=${serviceId}&staff=${staff}`));
    const day = days.find((d) => d.slots > 0);
    assert.ok(day, "au moins un jour réservable");
    const { slots } = await json(await api(`slots.php?salon=anatole-france&service=${serviceId}&staff=${staff}&date=${day.date}`));
    return { date: day.date, slots };
  }

  const client = (extra = {}) => ({
    salon: "anatole-france",
    name: "Jean Test",
    phone: "06 12 34 56 78",
    email: "jean@example.com",
    note: "",
    consent: true,
    website: "",
    ...extra,
  });

  before(async () => {
    bo = await startBackOffice();
  });
  after(() => bo?.stop());

  test("l'API répond 503 tant que l'installation n'est pas faite", async () => {
    const res = await api("catalog.php");
    assert.equal(res.status, 503);
  });

  test("installation SQLite : 5 salons, barbiers, prestations, compte propriétaire", async () => {
    const html = await bo.install();
    assert.match(html, /Installation terminée/);
    assert.equal(bo.sql("SELECT COUNT(*) n FROM salons")[0].n, 5);
    assert.ok(bo.sql("SELECT COUNT(*) n FROM staff")[0].n >= 15);
    assert.ok(bo.sql("SELECT COUNT(*) n FROM services")[0].n >= 40);
    const second = await fetch(`${bo.base}/install.php`);
    assert.equal(second.status, 403, "install.php refuse une deuxième installation");
  });

  test("catalogue : salons fermés à la réservation en ligne, avec lien Planity", async () => {
    const { salons } = await json(await api("catalog.php"));
    assert.equal(salons.length, 5);
    for (const s of salons) {
      assert.equal(s.booking, false);
      assert.match(s.planity_url, /^https:\/\/www\.planity\.com\//);
      assert.equal(s.services, undefined);
    }
    const days = await api("days.php?salon=anatole-france&service=1&staff=0");
    assert.equal(days.status, 409);
    assert.match((await json(days)).planity_url, /planity/);
  });

  test("connexion gérant : mauvais mot de passe refusé, bon mot de passe accepté", async () => {
    const bad = await bo.login(undefined, "mauvais-mot-de-passe");
    assert.equal(bad.ok, false);
    assert.match(bad.text, /incorrect/);
    const good = await bo.login();
    assert.equal(good.ok, true);
    admin = good.session;
    bo.sql("DELETE FROM login_attempts");
  });

  test("toutes les pages de l'espace gérant s'affichent sans erreur PHP", async () => {
    for (const p of ["agenda", "rdv", "clients", "stats", "equipe", "planning", "prestations", "salons", "comptes", "compte"]) {
      const { res, text } = await admin.get(`/admin/index.php?p=${p}`);
      assert.equal(res.status, 200, p);
      assert.doesNotMatch(text, PHP_ERRORS, `page ${p}`);
      assert.match(text, /<main class="content">/, p);
    }
  });

  test("action sans jeton CSRF : refusée", async () => {
    const { res } = await admin.post("/admin/index.php?p=planning", { action: "booking_save", booking_enabled: "1" });
    assert.equal(res.status, 302);
    assert.equal(bo.sql("SELECT booking_enabled FROM salons WHERE slug='anatole-france'")[0].booking_enabled, 0);
  });

  test("le gérant ouvre la réservation en ligne d'Anatole France", async () => {
    const page = await admin.action(
      {
        action: "booking_save",
        booking_enabled: "1",
        booking_mode: "rolling",
        booking_days_ahead: "21",
        booking_min_notice_h: "2",
        slot_step: "15",
        notify_email: "salon@example.com",
        phone: "04 77 00 00 00",
      },
      "planning",
    );
    assert.match(page, /Réservation en ligne ouverte/);
    const { salons } = await json(await api("catalog.php"));
    salon = salons.find((s) => s.slug === "anatole-france");
    assert.equal(salon.booking, true);
    assert.ok(salon.services.length > 0 && salon.staff.length === 5);
    assert.ok(salons.filter((s) => s.booking).length === 1, "les autres salons restent sur Planity");
  });

  test("jours et créneaux : dimanche fermé, créneaux dans les horaires, durée respectée", async () => {
    const service = salon.services.find((s) => s.duration === 40) ?? salon.services[0];
    const { days } = await json(await api(`days.php?salon=anatole-france&service=${service.id}&staff=0`));
    assert.equal(days.length, 22, "fenêtre de 21 jours + aujourd'hui");
    for (const d of days) {
      if (new Date(`${d.date}T12:00:00`).getDay() === 0) assert.equal(d.slots, 0, `dimanche ${d.date}`);
    }
    const { slots } = await firstFreeDay(service.id);
    const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
    for (const t of slots) {
      assert.ok(toMin(t) >= 9 * 60, t);
      assert.ok(toMin(t) + service.duration <= 19 * 60, `${t} + ${service.duration} min dépasse 19h`);
    }
  });

  test("réservation refusée si les coordonnées sont invalides (422)", async () => {
    const service = salon.services[0];
    const { date, slots } = await firstFreeDay(service.id);
    const res = await post("book.php", client({ service: service.id, staff: 0, date, time: slots[0], phone: "123", name: "J" }));
    assert.equal(res.status, 422);
    const body = await json(res);
    assert.ok(body.fields.phone && body.fields.name);
  });

  test("champ piège rempli : faux succès, aucun rendez-vous créé", async () => {
    const before = bo.sql("SELECT COUNT(*) n FROM appointments")[0].n;
    const res = await post("book.php", client({ service: salon.services[0].id, staff: 0, date: "2030-01-01", time: "10:00", website: "spam" }));
    assert.equal((await json(res)).ref, "------");
    assert.equal(bo.sql("SELECT COUNT(*) n FROM appointments")[0].n, before);
  });

  let booked;
  test("réservation « sans préférence » : barbier attribué, fiche client, e-mails avec lien d'annulation", async () => {
    bo.resetRateLimits();
    const service = salon.services[0];
    const { date, slots } = await firstFreeDay(service.id);
    const res = await post("book.php", client({ service: service.id, staff: 0, date, time: slots[0] }));
    assert.equal(res.status, 200);
    booked = await json(res);
    assert.match(booked.ref, /^[A-Z0-9]{6}$/);
    assert.match(booked.token, /^[a-f0-9]{32}$/);
    assert.ok(booked.staff, "un barbier est attribué automatiquement");
    assert.equal(booked.duration, service.duration);

    const [appt] = bo.sql("SELECT * FROM appointments WHERE ref = ?", [booked.ref]);
    assert.equal(appt.status, "confirmed");
    assert.equal(appt.source, "web");
    assert.equal(appt.client_phone, "06 12 34 56 78");
    const [c] = bo.sql("SELECT * FROM clients WHERE phone = ?", ["06 12 34 56 78"]);
    assert.equal(c.marketing_consent, 1);

    const mails = bo.mails();
    assert.match(mails, /To: salon@example\.com/);
    assert.match(mails, /To: jean@example\.com/);
    assert.ok(mails.includes(`https://www.example.test/reservation/annuler?ref=${booked.ref}&t=${booked.token}`));
  });

  test("double réservation du même barbier sur le même créneau : refusée (409)", async () => {
    bo.resetRateLimits();
    const service = salon.services[0];
    const raph = salon.staff.find((s) => s.name === "Raph");
    const { date, slots } = await firstFreeDay(service.id, raph.id);
    const time = slots.at(-1);
    const first = await post("book.php", client({ service: service.id, staff: raph.id, date, time, phone: "06 00 00 00 01" }));
    assert.equal(first.status, 200);
    const again = await post("book.php", client({ service: service.id, staff: raph.id, date, time, phone: "06 00 00 00 02" }));
    assert.equal(again.status, 409);
    const { slots: after } = await json(await api(`slots.php?salon=anatole-france&service=${service.id}&staff=${raph.id}&date=${date}`));
    assert.ok(!after.includes(time), "le créneau n'est plus proposé");
  });

  test("« sans préférence » : complet quand tous les barbiers sont pris", async () => {
    bo.resetRateLimits();
    const service = salon.services[0];
    const { date } = await firstFreeDay(service.id);
    // Créneau choisi dans un jour libre ; on réserve autant de fois qu'il y a de barbiers dispos
    const { slots } = await json(await api(`slots.php?salon=anatole-france&service=${service.id}&staff=0&date=${date}`));
    const time = slots[Math.floor(slots.length / 2)];
    let n = 0;
    for (; n < 10; n++) {
      if (n % 4 === 0) bo.resetRateLimits();
      const r = await post("book.php", client({ service: service.id, staff: 0, date, time, phone: `06 10 00 00 ${String(n).padStart(2, "0")}` }));
      if (r.status === 409) break;
      assert.equal(r.status, 200);
    }
    const free = bo.sql("SELECT COUNT(*) n FROM staff WHERE salon_id = (SELECT id FROM salons WHERE slug='anatole-france')")[0].n;
    assert.ok(n <= free && n >= 1, `${n} réservations acceptées pour ${free} barbiers`);
    const staffIds = bo.sql("SELECT staff_id FROM appointments WHERE start_at = ?", [`${date} ${time}:00`]).map((r) => r.staff_id);
    assert.equal(new Set(staffIds).size, staffIds.length, "jamais deux clients pour le même barbier");
  });

  test("limite anti-abus : 5 réservations par heure et par appareil", async () => {
    bo.resetRateLimits();
    for (let i = 0; i < 5; i++) {
      bo.sql("INSERT INTO rate_hits (kind, ip, hit_at) VALUES ('book', '127.0.0.1', ?)", [parisTime(-i)]);
    }
    const res = await post("book.php", client({ service: salon.services[0].id, staff: 0, date: "2030-01-01", time: "10:00" }));
    assert.equal(res.status, 429);
    bo.resetRateLimits();
  });

  test("annulation par le client : jeton vérifié, créneau libéré, salon prévenu", async () => {
    const wrong = await api(`cancel.php?ref=${booked.ref}&t=${"0".repeat(32)}`);
    assert.equal(wrong.status, 404);

    const info = await json(await api(`cancel.php?ref=${booked.ref}&t=${booked.token}`));
    assert.equal(info.status, "confirmed");
    assert.equal(info.cancellable, true);
    assert.equal(info.date, booked.date);

    const done = await post("cancel.php", { ref: booked.ref, t: booked.token });
    assert.equal(done.status, 200);
    const [appt] = bo.sql("SELECT status, admin_note FROM appointments WHERE ref = ?", [booked.ref]);
    assert.equal(appt.status, "cancelled");
    assert.match(appt.admin_note, /Annulé en ligne par le client/);
    assert.match(bo.mails(), /Annulation · Anatole France/);

    const again = await json(await api(`cancel.php?ref=${booked.ref}&t=${booked.token}`));
    assert.equal(again.status, "cancelled");
  });

  test("annulation trop tardive (moins de 2 h avant) : refusée (409)", async () => {
    bo.resetRateLimits();
    const service = salon.services[0];
    const { date, slots } = await firstFreeDay(service.id);
    const r = await json(await post("book.php", client({ service: service.id, staff: 0, date, time: slots[1], phone: "06 99 99 99 99" })));
    bo.sql("UPDATE appointments SET start_at = ? WHERE ref = ?", [parisTime(30), r.ref]);
    const info = await json(await api(`cancel.php?ref=${r.ref}&t=${r.token}`));
    assert.equal(info.cancellable, false);
    const res = await post("cancel.php", { ref: r.ref, t: r.token });
    assert.equal(res.status, 409);
  });

  test("espace gérant : rendez-vous au salon, statut « Absent », statistiques et fichier clients", async () => {
    const day = bo.sql("SELECT substr(start_at,1,10) d FROM appointments WHERE status='confirmed' LIMIT 1")[0].d;
    const service = salon.services[0];
    const kamel = salon.staff.find((s) => s.name === "Kamel");
    const page = await admin.action({
      action: "appt_create",
      service_id: String(service.id),
      date: day,
      time: "18:00",
      duration: "",
      staff_id: String(kamel.id),
      client_name: "Client Comptoir",
      client_phone: "07 11 22 33 44",
      admin_note: "",
    });
    assert.match(page, /Rendez-vous ajouté/);
    const [appt] = bo.sql("SELECT id FROM appointments WHERE client_name='Client Comptoir'");

    const status = await admin.action({ action: "appt_status", status: "noshow", id: String(appt.id) }, "rdv");
    assert.match(status, /Statut : Absent/);

    const { text: stats } = await admin.get("/admin/index.php?p=stats&period=next7");
    assert.doesNotMatch(stats, PHP_ERRORS);
    assert.match(stats, /Comparaison des salons/);
    assert.match(stats, /Absences/);

    const { text: clients } = await admin.get("/admin/index.php?p=clients");
    assert.match(clients, /Jean Test/);
    assert.match(clients, /Client Comptoir/);

    const csv = await admin.request("/admin/index.php?p=clients&f=consent&export=csv");
    assert.match(csv.headers.get("content-type"), /text\/csv/);
    const body = await csv.text();
    assert.match(body, /Relances acceptées/);
    assert.doesNotMatch(body, /Client Comptoir/, "export filtré sur les clients consentants");
  });

  test("CNIL : retrait du consentement et effacement d'un client", async () => {
    const [c] = bo.sql("SELECT id FROM clients WHERE phone = '06 12 34 56 78'");
    await admin.action({ action: "client_consent", id: String(c.id), consent: "0" }, "clients");
    assert.equal(bo.sql("SELECT marketing_consent m FROM clients WHERE id = ?", [c.id])[0].m, 0);

    const page = await admin.action({ action: "client_delete", id: String(c.id) }, "clients");
    assert.match(page, /Client effacé/);
    assert.equal(bo.sql("SELECT COUNT(*) n FROM clients WHERE id = ?", [c.id])[0].n, 0);
    assert.equal(bo.sql("SELECT COUNT(*) n FROM appointments WHERE client_phone = '06 12 34 56 78'")[0].n, 0);
  });

  test("propriétaire : ouvrir puis fermer la réservation en ligne dans tous les salons", async () => {
    const opened = await admin.action({ action: "booking_all", open: "1" }, "salons");
    assert.match(opened, /ouverte dans tous les salons/);
    let { salons } = await json(await api("catalog.php"));
    assert.ok(salons.every((s) => s.booking && s.services.length > 0 && s.staff.length > 0), "les 5 salons réservables avec carte et barbiers");

    const closed = await admin.action({ action: "booking_all", open: "0" }, "salons");
    assert.match(closed, /renvoient vers Planity/);
    ({ salons } = await json(await api("catalog.php")));
    assert.ok(salons.every((s) => !s.booking));
  });

  test("le serveur PHP n'a journalisé aucune erreur", () => {
    assert.doesNotMatch(bo.log, PHP_ERRORS);
  });
});
