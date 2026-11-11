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

  /** Résumé lisible d'une galerie : « o0 » = photo d'origine n°0, « m12 » = photo 12 de la médiathèque. */
  const summary = async (slot) =>
    ((await media())[slot] ?? []).map((it) => ("origin" in it ? `o${it.origin}` : `m${it.src.match(/-([a-f0-9]{6})-640/)[1]}`));
  const tag = (id) => bo.sql("SELECT base FROM media WHERE id = ?", [id])[0].base.slice(-6);

  test("équipe : changer UNE photo garde les autres photos d'origine à leur place", async () => {
    const [m1] = bo.sql("SELECT id FROM media ORDER BY id LIMIT 1");
    // Galerie jamais modifiée : on vise la 2e photo d'origine par son rang
    const page = await owner.action({ action: "slot_set", slot: "salon.team", origin: "1", "media[]": String(m1.id) }, "photos");
    assert.match(page, /Photo remplacée dans « L&#039;équipe au travail »|Photo remplacée dans « L'équipe au travail »/);
    assert.deepEqual(await summary("salon.team"), ["o0", `m${tag(m1.id)}`, "o2", "o3", "o4"]);
  });

  test("équipe : changer une autre photo, puis remplacer une photo déjà choisie", async () => {
    const [m1, m2] = bo.sql("SELECT id FROM media ORDER BY id LIMIT 2");
    const links = bo.sql("SELECT id FROM media_slots WHERE slot = 'salon.team' ORDER BY sort, id");
    await owner.action({ action: "slot_set", slot: "salon.team", link: String(links[4].id), "media[]": String(m2.id) }, "photos");
    assert.deepEqual(await summary("salon.team"), ["o0", `m${tag(m1.id)}`, "o2", "o3", `m${tag(m2.id)}`]);
    await owner.action({ action: "slot_set", slot: "salon.team", link: String(links[1].id), "media[]": String(m2.id) }, "photos");
    assert.deepEqual(await summary("salon.team"), ["o0", `m${tag(m2.id)}`, "o2", "o3", `m${tag(m2.id)}`]);
  });

  test("envoyer une nouvelle photo depuis « Changer » : elle remplace seulement cette photo", async () => {
    const page = await owner.upload({ action: "media_upload", assign_slot: "chavanelle.gallery", origin: "2", alt: "Fauteuils" }, [
      { name: "fauteuils.jpg", type: "image/jpeg", bytes: makeImage(1400, 1000) },
    ], "photos");
    assert.match(page, /placée sur le site/);
    const m = lastMedia();
    assert.deepEqual(await summary("chavanelle.gallery"), ["o0", "o1", `m${tag(m.id)}`, "o3", "o4"]);
  });

  test("galerie : ordre, retrait, ajout à la suite, dernière photo protégée, retour à l'origine", async () => {
    // Déplacer une photo d'origine d'une galerie jamais modifiée
    await owner.action({ action: "slot_move", slot: "le-port.gallery", origin: "1", dir: "up" }, "photos");
    assert.deepEqual(await summary("le-port.gallery"), ["o1", "o0"]);

    // Ajouter des photos « à la fin » : à la suite, sans effacer les photos d'origine
    const ids = bo.sql("SELECT id FROM media ORDER BY id LIMIT 2").map((r) => String(r.id));
    const form = new URLSearchParams({ action: "slot_add", slot: "le-port.gallery", position: "end", csrf: await owner.csrf("/admin/index.php?p=photos") });
    ids.forEach((id) => form.append("media[]", id));
    await owner.request("/admin/index.php?p=photos", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form });
    assert.deepEqual(await summary("le-port.gallery"), ["o1", "o0", `m${tag(ids[0])}`, `m${tag(ids[1])}`]);

    // Retirer des photos (d'origine ou non), jusqu'à la dernière, qui est protégée
    for (let i = 0; i < 3; i++) {
      const [first] = bo.sql("SELECT id FROM media_slots WHERE slot = 'le-port.gallery' ORDER BY sort, id LIMIT 1");
      await owner.action({ action: "slot_remove", slot: "le-port.gallery", link: String(first.id) }, "photos");
    }
    assert.deepEqual(await summary("le-port.gallery"), [`m${tag(ids[1])}`]);
    const [last] = bo.sql("SELECT id FROM media_slots WHERE slot = 'le-port.gallery'");
    const refused = await owner.action({ action: "slot_remove", slot: "le-port.gallery", link: String(last.id) }, "photos");
    assert.match(refused, /garde au moins une photo/);
    assert.equal(bo.sql("SELECT COUNT(*) n FROM media")[0].n >= 2, true, "retirer d'une galerie ne supprime pas la photo");

    // Une photo d'une autre galerie ne peut pas être visée
    const [foreign] = bo.sql("SELECT id FROM media_slots WHERE slot = 'salon.team' LIMIT 1");
    const wrong = await owner.action({ action: "slot_remove", slot: "le-port.gallery", link: String(foreign.id) }, "photos");
    assert.match(wrong, /ne fait plus partie de la galerie/);

    const reset = await owner.action({ action: "slot_reset", slot: "le-port.gallery" }, "photos");
    assert.match(reset, /Photo d&#039;origine rétablie|Photo d'origine rétablie/);
    assert.equal((await media())["le-port.gallery"], undefined);
  });

  test("réalisations : une photo ajoutée va en tête par défaut, donc visible tout de suite sur l'accueil", async () => {
    const [m] = bo.sql("SELECT id FROM media ORDER BY id LIMIT 1");
    const page = await owner.action({ action: "slot_add", slot: "site.realisations", "media[]": String(m.id) }, "photos");
    assert.match(page, /en tête de la galerie/);
    const order = await summary("site.realisations");
    assert.equal(order[0], `m${tag(m.id)}`, "la nouvelle photo est la 1re (l'accueil montre les 3 premières)");
    assert.deepEqual(order.slice(1), ["o0", "o1", "o2", "o3", "o4", "o5"]);
    const { text } = await owner.get("/admin/index.php?p=photos");
    const block = text.slice(text.indexOf('id="slot-site.realisations"'), text.indexOf('id="slot-salon.interior"'));
    assert.equal((block.match(/class="thumb-home"/g) ?? []).length, 3, "les 3 photos de l'accueil sont signalées");
  });

  test("l'API des photos n'est jamais mise en cache (changement visible au rechargement)", async () => {
    const res = await fetch(`${bo.base}/api/media.php`);
    assert.match(res.headers.get("cache-control") ?? "", /no-store/);
  });

  test("la page Photos du site propose « Changer » sur chaque photo de chaque galerie", async () => {
    const { text } = await owner.get("/admin/index.php?p=photos");
    assert.doesNotMatch(text, PHP_ERRORS);
    const count = (slot) => (text.match(new RegExp(`data-pick="${slot.replace(".", "\\.")}" data-mode="replace"`, "g")) ?? []).length;
    assert.equal(count("salon.team"), 5, "5 photos de l'équipe, chacune modifiable");
    assert.equal(count("site.realisations"), 7, "6 photos d'origine + 1 ajoutée");
    assert.equal(count("meyerbeer.gallery"), 5);
    assert.match(text, /Galerie personnalisée · 5 photos/);
  });

  test("modifier les textes d'une photo (description, titre, légende)", async () => {
    // La photo placée en tête de la page Anatole France
    const [m] = bo.sql("SELECT media_id AS id FROM media_slots WHERE slot = 'anatole-france.hero'");
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
    const ok = await manager.action({ action: "slot_set", slot: "anatole-france.gallery", origin: "0", "media[]": String(m.id) }, "photos");
    assert.match(ok, /Photo remplacée/);
    const added = await manager.action({ action: "slot_add", slot: "anatole-france.gallery", "media[]": String(m.id) }, "photos");
    assert.match(added, /déjà dans la galerie/, "une même photo n'est pas ajoutée deux fois");
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
