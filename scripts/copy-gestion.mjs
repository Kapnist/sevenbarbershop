// Version OVH (npm run build) : ajoute l'espace gérant et l'API de réservation (gestion/, en PHP)
// dans dist/, pour tout envoyer d'un coup sur l'hébergement. La configuration locale n'est jamais copiée.
import { cp } from "node:fs/promises";
import { basename, resolve } from "node:path";

const skip = new Set(["config.php"]);
await cp(resolve("gestion"), resolve("dist/gestion"), {
  recursive: true,
  filter: (source) => !skip.has(basename(source)) && !source.endsWith(".sqlite"),
});
console.log("Espace gérant copié dans dist/gestion");
