// Exporte les données du site (salons, horaires, prestations, prix) vers gestion/inc/seed.json,
// utilisé par gestion/install.php pour préremplir la base. Lancer : npm run seed
import { writeFileSync } from "node:fs";
import { fr } from "../src/i18n/fr";
import type { Price } from "../src/data/price";
import { salonPages } from "../src/data/salonPages";
import { salonLocations } from "../src/data/salons";

const DAYS: Record<string, number> = { Su: 0, Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6 };

function hours(rules: string[] = []) {
  const week = Array.from({ length: 7 }, (_, weekday) => ({ weekday, open: false, from: "09:00", to: "19:00" }));
  for (const rule of rules) {
    const [days, range] = rule.split(" ");
    const [first, last = first] = days.split("-").map((d) => DAYS[d]);
    const [from, to] = range.split("-");
    for (let d = first; d <= last; d++) week[d] = { weekday: d, open: true, from, to };
  }
  return week;
}

function price(p: Price | undefined): { label: string; value: number | null } {
  if (p === undefined || p === "quote") return { label: "Sur devis", value: null };
  if (typeof p === "number") return { label: `${p} €`, value: p };
  if (Array.isArray(p)) return { label: `${p[0]} à ${p[1]} €`, value: p[0] };
  return { label: `dès ${p.from} €`, value: p.from };
}

const salons = salonLocations.map((location) => {
  const page = Object.values(salonPages).find((c) => c.locationName === location.name);
  const services = page
    ? page.services.map((s, i) => {
        const p = price(s.price);
        return { category: s.category, name: fr.salonPages[page.key].services[i], duration: s.duration, price_label: p.label, price_eur: p.value };
      })
    : null;
  return {
    slug: location.detailsPath!.split("/").pop()!,
    name: location.name,
    city: location.city,
    address: location.streetAddress,
    postcode: location.postalCode,
    planity_url: location.bookingUrl ?? "",
    hours: hours(location.openingHours),
    services,
  };
});

writeFileSync("gestion/inc/seed.json", JSON.stringify({ salons }, null, 2) + "\n");
console.log(salons.map((s) => `${s.slug}: ${s.services?.length ?? 0} prestations`).join("\n"));
