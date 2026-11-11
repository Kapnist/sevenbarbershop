/**
 * Médiathèque et photos du site : envoi de vraies photos, optimisation, emplacements,
 * galeries, droits du propriétaire et des responsables, suppression, API publique.
 */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { after, before, describe, test } from "node:test";
import { gdAvailable, json, makeImage, phpAvailable, startBackOffice } from "../helpers/php-server.mjs";

const PHP_ERRORS = /(Fatal error|Warning:|Notice:|Deprecated:|Parse error|Uncaught)/;
const skip = !phpAvailable() ? "PHP introuvable (PHP_BIN)" : !gdAvailable() ? "Extension GD de PHP désactivée" : false;

describe("Médiathèque et photos du site", { skip }, () => {
  let bo;
  let owner;
  let manager;
  const media = async () => (await json(await fetch(`${bo.base}/api/media.php`))).slots;
  const lastMedia = () => bo.sql("SELECT * FROM media ORDER BY id DESC LIMIT 1")[0];

  before(async () => {
    bo = await startBackOffice();
    await bo.install();
    owner = (await bo.login()).session;
  });
  after(() => bo?.stop());

  test("l'API publique répond sans photo choisie (le site garde ses photos d'origine)", async () => {
    assert.deepEqual(await media(), {});
  });

  test("les pages Médiathèque et Photos du site s'affichent, avec tous les emplacements", async () => {
    const { text: lib } = await owner.get("/admin/index.php?p=medias");
    assert.doesNotMatch(lib, PHP_ERRORS);
    assert.match(lib, /Glissez vos photos ici/);
    const { text: photos } = await owner.get("/admin/index.php?p=photos");
    assert.doesNotMatch(photos, PHP_ERRORS);
    for (const slot of ["home.spirit", "site.realisations", "salon.team", "about.brand", "careers.hero", "anatole-france.hero", "meyerbeer.gallery"]) {
      assert.match(photos, new RegExp(`id="slot-${slot.replace(".", "\\.")}"`), slot);
    }
    assert.match(photos, /Photo d'origine/);
  });

  test("envoi de plusieurs photos : redimensionnées en 640 et 1600 px (WebP), textes enregistrés", async () => {
    const page = await owner.upload({ action: "media_upload", alt: "Fauteuil club en cuir" }, [
      { name: "Grande photo été.JPG", type: "image/jpeg", bytes: makeImage(3200, 2000, "jpeg") },
      { name: "petite.png", type: "image/png", bytes: makeImage(500, 400, "png") },
    ]);
    assert.match(page, /2 photos ajoutées à la médiathèque/);
    const rows = bo.sql("SELECT * FROM media ORDER BY id");
    assert.equal(rows.length, 2);
    const [big, small] = rows;
    assert.equal(big.width, 1600, "la grande taille est limitée à 1600 px");
    assert.equal(big.height, 1000, "les proportions sont conservées");
    assert.equal(big.small_width, 640);
    assert.equal(small.width, 500, "une petite photo n'est jamais agrandie");
    assert.equal(big.alt, "Fauteuil club en cuir");
    assert.match(big.base, /^uploads\/\d{4}\/\d{2}\/grande-photo-ete-[a-f0-9]{6}$/, "nom de fichier propre");
    for (const size of [640, 1600]) assert.ok(existsSync(join(bo.app, `${big.base}-${size}.${big.ext}`)), `fichier ${size}`);
    const served = await fetch(`${bo.base}/${big.base}-640.${big.ext}`);
    assert.equal(served.status, 200);
    assert.match(served.headers.get("content-type"), /image\//);
  });

  test("un faux fichier image (texte renommé en .jpg) est refusé", async () => {
    const before = bo.sql("SELECT COUNT(*) n FROM media")[0].n;
    const page = await owner.upload({ action: "media_upload" }, [
      { name: "pirate.jpg", type: "image/jpeg", bytes: Buffer.from("<?php echo 'pirate'; ?>") },
    ]);
    assert.match(page, /n&#039;est pas une photo JPEG, PNG ou WebP|n'est pas une photo JPEG, PNG ou WebP/);
    assert.equal(bo.sql("SELECT COUNT(*) n FROM media")[0].n, before);
  });

  test("changer une photo simple : le site la reçoit par l'API, avec ses deux tailles", async () => {
    const m = bo.sql("SELECT * FROM media ORDER BY id LIMIT 1")[0];
    const page = await owner.action({ action: "slot_set", slot: "home.spirit", "media[]": String(m.id) }, "photos");
    assert.match(page, /Photo changée/);
    const slots = await media();
    assert.equal(slots["home.spirit"].length, 1);
    const item = slots["home.spirit"][0];
    assert.equal(item.src, `${m.base}-640.${m.ext}`);
    assert.equal(item.large, `${m.base}-1600.${m.ext}`);
    assert.equal(item.width, 1600);
    assert.equal(item.alt, "Fauteuil club en cuir");
  });

  test("envoyer depuis un emplacement : la photo est ajoutée à la médiathèque et placée directement", async () => {
    const page = await owner.upload({ action: "media_upload", assign_slot: "anatole-france.hero", alt: "Devanture" }, [
      { name: "devanture.jpg", type: "image/jpeg", bytes: makeImage(1800, 1200) },
    ], "photos");
    assert.match(page, /placée sur le site/);
    const slots = await media();
    assert.equal(slots["anatole-france.hero"][0].alt, "Devanture");
  });

  test("galerie : ajout de plusieurs photos, ordre, retrait, retour aux photos d'origine", async () => {
    const ids = bo.sql("SELECT id FROM media ORDER BY id").map((r) => String(r.id));
    const form = new URLSearchParams({ action: "slot_add", slot: "meyerbeer.gallery" });
    // plusieurs valeurs media[] : on passe par la méthode bas niveau
    const csrf = await owner.csrf("/admin/index.php?p=photos");
    form.append("csrf", csrf);
    ids.forEach((id) => form.append("media[]", id));
    await owner.request("/admin/index.php?p=photos", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form });
    let gallery = (await media())["meyerbeer.gallery"];
    assert.equal(gallery.length, ids.length);
    const firstSrc = gallery[0].src;

    const links = bo.sql("SELECT id FROM media_slots WHERE slot = 'meyerbeer.gallery' ORDER BY sort, id");
    await owner.action({ action: "slot_move", slot: "meyerbeer.gallery", link: String(links[1].id), dir: "up" }, "photos");
    gallery = (await media())["meyerbeer.gallery"];
    assert.notEqual(gallery[0].src, firstSrc, "la 2e photo est passée en premier");
    assert.equal(gallery[1].src, firstSrc);

    await owner.action({ action: "slot_remove", slot: "meyerbeer.gallery", link: String(links[0].id) }, "photos");
    assert.equal((await media())["meyerbeer.gallery"].length, ids.length - 1);
    assert.equal(bo.sql("SELECT COUNT(*) n FROM media")[0].n, ids.length, "retirer d'une galerie ne supprime pas la photo");

    const reset = await owner.action({ action: "slot_reset", slot: "meyerbeer.gallery" }, "photos");
    assert.match(reset, /Photo d&#039;origine rétablie|Photo d'origine rétablie/);
    assert.equal((await media())["meyerbeer.gallery"], undefined);
  });

  test("modifier les textes d'une photo (description, titre, légende)", async () => {
    const m = lastMedia();
    await owner.action({ action: "media_update", id: String(m.id), alt: "Façade du salon", title: "La devanture", caption: "Rue du 11 Novembre" }, "medias");
    const [row] = bo.sql("SELECT alt, title, caption FROM media WHERE id = ?", [m.id]);
    assert.deepEqual(row, { alt: "Façade du salon", title: "La devanture", caption: "Rue du 11 Novembre" });
    assert.equal((await media())["anatole-france.hero"][0].title, "La devanture");
  });

  test("responsable de salon : ses photos seulement, pas celles du site ni la suppression", async () => {
    const salonId = bo.sql("SELECT id FROM salons WHERE slug = 'anatole-france'")[0].id;
    await owner.action({ action: "admin_save", id: "0", name: "Resp", email: "resp@example.com", password: "motdepasse-resp", salon_id: String(salonId) }, "comptes");
    manager = (await bo.login("resp@example.com", "motdepasse-resp")).session;
    bo.sql("DELETE FROM login_attempts");
    const m = bo.sql("SELECT id FROM media ORDER BY id LIMIT 1")[0];

    const { text: photos } = await manager.get("/admin/index.php?p=photos");
    assert.match(photos, /id="slot-anatole-france\.hero"/);
    assert.doesNotMatch(photos, /id="slot-home\.spirit"/, "pas les pages générales");
    assert.doesNotMatch(photos, /id="slot-meyerbeer\.hero"/, "pas les autres salons");

    const denied = await manager.action({ action: "slot_set", slot: "home.spirit", "media[]": String(m.id) }, "photos");
    assert.match(denied, /ne pouvez pas modifier cet emplacement/);
    const ok = await manager.action({ action: "slot_set", slot: "anatole-france.gallery", "media[]": String(m.id) }, "photos");
    assert.match(ok, /Photo changée/);
    const del = await manager.action({ action: "media_delete", id: String(m.id) }, "medias");
    assert.match(del, /Seul le propriétaire/);
  });

  test("supprimer une photo : fichiers effacés, emplacements libérés", async () => {
    const m = bo.sql("SELECT * FROM media ORDER BY id LIMIT 1")[0];
    const files = [640, 1600].map((s) => join(bo.app, `${m.base}-${s}.${m.ext}`));
    const page = await owner.action({ action: "media_delete", id: String(m.id) }, "medias");
    assert.match(page, /Photo supprimée/);
    for (const f of files) assert.equal(existsSync(f), false);
    assert.equal(bo.sql("SELECT COUNT(*) n FROM media_slots WHERE media_id = ?", [m.id])[0].n, 0);
    assert.equal((await media())["home.spirit"], undefined, "l'accueil reprend sa photo d'origine");
  });

  test("le serveur PHP n'a journalisé aucune erreur", () => {
    assert.doesNotMatch(bo.log, PHP_ERRORS);
  });
});
