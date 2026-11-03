import type { Price } from "./price";
import type { Dictionary } from "../i18n/fr";

export type ServiceNumber = keyof Dictionary["services"]["items"];

export interface Service {
  number: ServiceNumber;
  /** Absent : prestation sur rendez-vous uniquement. */
  price?: Price;
  /** Durée en minutes, ou fourchette [min, max]. */
  duration?: number | [number, number];
  /** Lieu affiché à la place de la durée quand la prestation n'existe pas partout. */
  place?: string;
}

// Les noms et descriptions sont dans les dictionnaires de langue (services.items).
export const services: Service[] = [
  { number: "01", price: { from: 14 }, duration: 30 },
  { number: "02", price: { from: 10 }, duration: 15 },
  { number: "03", price: 15, place: "Saint-Étienne" },
  { number: "04", price: { from: 25 }, duration: [30, 60] },
  { number: "05", price: { from: 35 }, duration: [40, 60] },
  { number: "06" },
];

/** Prestations mises en avant sur l'accueil : coupe, barbe, coupe & barbe. */
export const featuredServices = (["01", "02", "04"] as const).map(
  (number) => services.find((service) => service.number === number)!,
);
