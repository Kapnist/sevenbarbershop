import type { Price } from "../i18n";
import { fr } from "../i18n/fr";
import { salonPages } from "./salonPages";
import { salonLocations } from "./salons";
import { services } from "./services";

/*
 * Fiche d'informations lue par le chatbot (outil HTTP de n8n).
 * Le site est une application React : ses pages HTML sont vides pour un robot,
 * d'où ce fichier texte généré à la compilation à partir des mêmes données que le site.
 */

const DAYS: Record<string, string> = {
  Mo: "lundi",
  Tu: "mardi",
  We: "mercredi",
  Th: "jeudi",
  Fr: "vendredi",
  Sa: "samedi",
  Su: "dimanche",
};

/** "Mo-Sa 09:00-19:00" → "du lundi au samedi, de 9h00 à 19h00". */
function frenchHours(rule: string): string {
  const [days, hours] = rule.split(" ");
  const [first, last] = days.split("-");
  const dayText = last ? `du ${DAYS[first]} au ${DAYS[last]}` : `le ${DAYS[first]}`;
  const [open, close] = hours.split("-").map((time) => time.replace(":", "h"));
  return `${dayText}, de ${open} à ${close}`;
}

function frenchPrice(price: Price | undefined): string {
  if (price === undefined || price === "quote") return "sur rendez-vous, prix sur place";
  if (typeof price === "number") return `${price} €`;
  if (Array.isArray(price)) return `${price[0]} à ${price[1]} €`;
  return `à partir de ${price.from} €`;
}

const CATEGORY: Record<string, string> = {
  cut: "Coupe",
  cutBeard: "Coupe & barbe",
  beard: "Barbe",
  colour: "Couleur & lissage",
};

function salonSection(siteUrl: string, location: (typeof salonLocations)[number]): string {
  const page = Object.values(salonPages).find((config) => config.locationName === location.name);
  const lines = [
    `### ${location.name} (${location.city})`,
    `- Adresse : ${location.streetAddress}, ${location.postalCode} ${location.city}`,
    `- Horaires : ${(location.openingHours ?? []).map(frenchHours).join(" ; ")}. Fermé les autres jours.`,
    `- Réservation et disponibilités en temps réel (Planity) : ${location.bookingUrl}`,
    `- Page du salon : ${siteUrl}${location.detailsPath}`,
  ];
  if (page) {
    const names = fr.salonPages[page.key].services;
    lines.push(`- Note Planity : ${page.rating}/5 (${page.reviews} avis)`, "- Tarifs :");
    page.services.forEach((service, index) => {
      lines.push(
        `  - ${CATEGORY[service.category]} — ${names[index]} : ${frenchPrice(service.price)} (${service.duration} min)`,
      );
    });
  } else {
    lines.push("- Tarifs : voir la page Planity du salon.");
  }
  return lines.join("\n");
}

export function renderChatbotInfo(siteUrl: string, updated: string): string {
  const serviceLines = services.map((service) => {
    const text = fr.services.items[service.number];
    const duration = Array.isArray(service.duration)
      ? `${service.duration[0]} à ${service.duration[1]} min`
      : service.duration
        ? `${service.duration} min`
        : "";
    const extra = [duration, service.place].filter(Boolean).join(", ");
    return `- **${text.name}** : ${frenchPrice(service.price)}${extra ? ` (${extra})` : ""}. ${text.description}`;
  });

  const faq = fr.about.faq.map((entry) => `**${entry.question}**\n${entry.answer}`);

  return `# Seven Barbershop — informations pour l'assistant virtuel

Mise à jour : ${updated}. Site : ${siteUrl}/

Seven Barbershop est un barbier haut de gamme à l'ambiance club anglais (fauteuils Chesterfield, billard vintage), avec cinq salons à Saint-Étienne et à Nice.
Réservation en ligne 24h/24 sur Planity, salon par salon. Les disponibilités des barbiers ne sont visibles que sur la page Planity de chaque salon.

## Salons

${salonLocations.map((location) => salonSection(siteUrl, location)).join("\n\n")}

## Prestations (prix de départ, ils varient selon le salon)

${serviceLines.join("\n")}

## Questions fréquentes

${faq.join("\n\n")}

## Contact

- Formulaire de contact : ${siteUrl}/contact
- Candidatures (recrutement) : ${siteUrl}/carrieres
`;
}
