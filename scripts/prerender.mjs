// Écrit le contenu pré-rendu de chaque page dans son fichier HTML (dist/), après « vite build ».
// Les moteurs de recherche et les navigateurs sans JavaScript voient ainsi le texte de la page.
import { readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const dist = resolve("dist");
const server = await import(pathToFileURL(resolve("dist-ssr/entry-server.js")).href);
const ROOT = '<div id="root"></div>';

function fileFor(route) {
  return route === "/" ? "index.html" : `${route.slice(1)}.html`;
}

function fill(page, file, html) {
  if (!page.includes(ROOT)) throw new Error(`${file} : <div id="root"></div> introuvable.`);
  return page.replace(ROOT, `<div id="root">${html}</div>`);
}

// Modèle de la page 404, lu avant que l'accueil ne soit rempli.
const homeTemplate = await readFile(resolve(dist, "index.html"), "utf8");

for (const route of server.seoRoutes) {
  const file = fileFor(route);
  const page = await readFile(resolve(dist, file), "utf8");
  await writeFile(resolve(dist, file), fill(page, file, server.render(route)));
}

// Page 404 : servie par l'hébergeur pour toute adresse inconnue, et jamais indexée.
const notFound = homeTemplate
  .replace(/<meta name="robots" content="[^"]*"/, '<meta name="robots" content="noindex, follow"')
  .replace(/<title>[^<]*<\/title>/, "<title>Page introuvable — Seven Barbershop</title>")
  .replace(/<link rel="canonical"[^>]*>\s*/, "");
await writeFile(resolve(dist, "404.html"), fill(notFound, "404.html", server.render("/page-introuvable")));

await rm(resolve("dist-ssr"), { recursive: true, force: true });
console.log(`Pré-rendu : ${server.seoRoutes.length} pages et 404.html`);
