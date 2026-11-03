import type { Price } from "../i18n";

export type SalonPageKey = "anatole" | "jeanJaures" | "meyerbeer" | "lePort";
type Category = "cut" | "cutBeard" | "beard" | "colour";

interface SalonService {
  category: Category;
  /** Durée en minutes. */
  duration: number;
  price: Price;
}

export interface SalonPageConfig {
  /** Clé des textes dans les dictionnaires (salonPages). */
  key: SalonPageKey;
  /** Nom du salon dans salons.ts. */
  locationName: string;
  title: string;
  heroImage: string;
  /** Les deux variantes visuelles d'en-tête et de galerie déjà définies dans le CSS. */
  heroStyle: "anatole" | "jean-jaures";
  galleryStyle: "anatole" | "jean-jaures";
  rating: number;
  reviews: number;
  photos: string[];
  /** Les noms des prestations sont dans les dictionnaires, dans le même ordre. */
  services: SalonService[];
}

// Tarifs, durées et notes relevés sur Planity.
export const salonPages: Record<SalonPageKey, SalonPageConfig> = {
  anatole: {
    key: "anatole",
    locationName: "Anatole France",
    title: "Anatole France",
    heroImage: "/images/anatole-france/devanture.png",
    heroStyle: "anatole",
    galleryStyle: "anatole",
    rating: 4.8,
    reviews: 1212,
    photos: [
      "/images/anatole-france/interieur.jpeg",
      "/images/anatole-france/equipe.jpeg",
      "/images/anatole-france/photo-3.webp",
      "/images/anatole-france/photo-4.webp",
      "/images/anatole-france/salon-cuir.jpeg",
    ],
    services: [
      { category: "cut", duration: 30, price: 20 },
      { category: "cut", duration: 30, price: 17 },
      { category: "cut", duration: 30, price: 14 },
      { category: "cut", duration: 40, price: 25 },
      { category: "cutBeard", duration: 30, price: 30 },
      { category: "cutBeard", duration: 30, price: 25 },
      { category: "cutBeard", duration: 40, price: [35, 40] },
      { category: "beard", duration: 15, price: 10 },
      { category: "beard", duration: 30, price: 20 },
      { category: "beard", duration: 20, price: 15 },
    ],
  },
  jeanJaures: {
    key: "jeanJaures",
    locationName: "Jean Jaurès",
    title: "Jean Jaurès",
    heroImage: "/images/jean-jaures/photo-1.webp",
    heroStyle: "jean-jaures",
    galleryStyle: "jean-jaures",
    rating: 4.8,
    reviews: 125,
    photos: [
      "/images/jean-jaures/photo-2.webp",
      "/images/jean-jaures/photo-5.webp",
      "/images/jean-jaures/photo-4.webp",
      "/images/jean-jaures/photo-6.webp",
    ],
    services: [
      { category: "cutBeard", duration: 30, price: 35 },
      { category: "cutBeard", duration: 30, price: 25 },
      { category: "cutBeard", duration: 45, price: 45 },
      { category: "cut", duration: 30, price: 18 },
      { category: "cut", duration: 30, price: 20 },
      { category: "cut", duration: 40, price: 25 },
      { category: "beard", duration: 15, price: 10 },
      { category: "beard", duration: 20, price: 15 },
      { category: "beard", duration: 30, price: 20 },
    ],
  },
  meyerbeer: {
    key: "meyerbeer",
    locationName: "Rue Meyerbeer",
    title: "Meyerbeer",
    heroImage: "/images/meyerbeer/photo-2.webp",
    heroStyle: "jean-jaures",
    galleryStyle: "anatole",
    rating: 4.9,
    reviews: 828,
    photos: [
      "/images/meyerbeer/photo-5.webp",
      "/images/meyerbeer/photo-4.webp",
      "/images/meyerbeer/photo-1.webp",
      "/images/meyerbeer/photo-3.webp",
      "/images/meyerbeer/photo-6.webp",
    ],
    services: [
      { category: "cutBeard", duration: 60, price: 40 },
      { category: "cutBeard", duration: 60, price: 35 },
      { category: "cutBeard", duration: 60, price: 45 },
      { category: "cut", duration: 30, price: 25 },
      { category: "cut", duration: 30, price: 20 },
      { category: "cut", duration: 30, price: 20 },
      { category: "cut", duration: 30, price: 30 },
      { category: "beard", duration: 30, price: 20 },
      { category: "beard", duration: 30, price: 25 },
      { category: "colour", duration: 30, price: { from: 10 } },
      { category: "colour", duration: 60, price: { from: 70 } },
      { category: "colour", duration: 90, price: "quote" },
    ],
  },
  lePort: {
    key: "lePort",
    locationName: "Le Port",
    title: "Le Port",
    heroImage: "/images/le-port/photo-1.webp",
    heroStyle: "jean-jaures",
    galleryStyle: "jean-jaures",
    rating: 5,
    reviews: 63,
    photos: ["/images/le-port/photo-1.webp", "/images/le-port/photo-2.webp"],
    services: [
      { category: "cutBeard", duration: 60, price: 40 },
      { category: "cutBeard", duration: 60, price: 35 },
      { category: "cutBeard", duration: 60, price: 45 },
      { category: "cut", duration: 30, price: 25 },
      { category: "cut", duration: 30, price: 20 },
      { category: "cut", duration: 30, price: 30 },
      { category: "beard", duration: 30, price: 20 },
      { category: "beard", duration: 30, price: 25 },
    ],
  },
};
