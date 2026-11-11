/**
 * Installation avec la case « Les clients réservent sur le site Seven » (cochée par défaut) :
 * les 5 salons prennent tout de suite les rendez-vous en ligne.
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { OWNER, Session, json, phpAvailable, startBackOffice } from "../helpers/php-server.mjs";

const skip = !phpAvailable() && "PHP introuvable (PHP_BIN)";
let bo;

before(async () => {
  if (!skip) bo = await startBackOffice();
});
after(() => bo?.stop());

test("le formulaire d'installation propose la réservation en ligne, cochée par défaut", { skip }, async () => {
  const { text } = await new Session(bo.base).get("/install.php");
  assert.match(text, /name="open_booking" value="1" checked/);
});

test("installation avec réservation ouverte : les 5 salons sont réservables tout de suite", { skip }, async () => {
  const { text } = await new Session(bo.base).post("/install.php", {
    driver: "sqlite",
    admin_name: OWNER.name,
    email: OWNER.email,
    password: OWNER.password,
    open_booking: "1",
    origins: "",
  });
  assert.match(text, /réservation en ligne est <strong>ouverte<\/strong>/);
  const { salons } = await json(await fetch(`${bo.base}/api/catalog.php`));
  assert.equal(salons.length, 5);
  for (const s of salons) {
    assert.equal(s.booking, true, s.slug);
    assert.ok(s.services.length > 0, `${s.slug} a des prestations`);
    assert.ok(s.staff.length > 0, `${s.slug} a des barbiers`);
    const service = s.services[0].id;
    const { days } = await json(await fetch(`${bo.base}/api/days.php?salon=${s.slug}&service=${service}&staff=0`));
    assert.ok(days.some((d) => d.slots > 0), `${s.slug} propose des créneaux libres`);
  }
});
