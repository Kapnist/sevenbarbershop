// Version OVH (npm run build) : ajoute l'espace gérant et l'API de réservation (gestion/, en PHP)
// dans dist/, pour tout envoyer d'un coup sur l'hébergement. La configuration locale, la base
// de test et les photos envoyées en local (médiathèque) ne sont jamais copiées.
import { cp } from "node:fs/promises";
import { basename, relative, resolve, sep } from "node:path";

const root = resolve("gestion");
const skip = new Set(["config.php", "mails.log"]);
await cp(root, resolve("dist/gestion"), {
  recursive: true,
  filter: (source) => {
    const name = basename(source);
    if (skip.has(name) || /\.sqlite(-journal|-wal|-shm)?$/.test(name)) return false;
    // Dossier uploads/ : seul son .htaccess de protection est publié
    const parts = relative(root, source).split(sep);
    return !(parts[0] === "uploads" && parts.length > 1 && name !== ".htaccess");
  },
});
console.log("Espace gérant copié dans dist/gestion");
