import type { Dictionary } from "../i18n/fr";
import { asset } from "../asset";

export type PhotoId = keyof Dictionary["photos"];

export interface Photo {
  /** Clé des textes (alt, titre, légende) dans les dictionnaires de langue. */
  id: PhotoId;
  /** Chemin sans suffixe : les fichiers existent en -640.webp et -1200.webp. */
  base: string;
  /** Largeur réelle du grand fichier, pour un srcset exact. */
  largeWidth: number;
  position?: string;
  /** Photo choisie dans la médiathèque de l'espace gérant (remplace fichiers et textes d'origine). */
  custom?: {
    src: string;
    srcSet: string;
    large: string;
    alt: string;
    title: string;
    caption: string;
  };
}

export function photoSrc(photo: Photo, size: "small" | "large" = "small"): string {
  if (photo.custom) return size === "small" ? photo.custom.src : photo.custom.large;
  return `${asset(photo.base)}-${size === "small" ? 640 : 1200}.webp`;
}

export function photoSrcSet(photo: Photo): string {
  if (photo.custom) return photo.custom.srcSet;
  return `${photoSrc(photo)} 640w, ${photoSrc(photo, "large")} ${photo.largeWidth}w`;
}

export interface PhotoText {
  alt: string;
  title: string;
  caption?: string;
}

/** Textes d'une photo : ceux saisis dans la médiathèque, sinon ceux des dictionnaires de langue. */
export function photoText(photo: Photo, photos: Dictionary["photos"]): PhotoText {
  if (photo.custom) {
    return {
      alt: photo.custom.alt || photo.custom.title,
      title: photo.custom.title || photo.custom.alt || "Seven Barbershop",
      caption: photo.custom.caption || undefined,
    };
  }
  return photos[photo.id] as PhotoText;
}

export const realisations: Photo[] = [
  {
    id: "burstFade",
    base: "/images/realisations/burst-fade-et-barbe",
    largeWidth: 1200,
    position: "center 8%",
  },
  {
    id: "lowFadeBeard",
    base: "/images/realisations/degrade-bas-et-barbe-taillee",
    largeWidth: 1200,
    position: "center 30%",
  },
  {
    id: "lowTaper",
    base: "/images/realisations/low-taper-cheveux-ondules",
    largeWidth: 1200,
    position: "center 12%",
  },
  {
    id: "classicTaper",
    base: "/images/realisations/taper-coiffe-en-arriere",
    largeWidth: 1200,
    position: "center 35%",
  },
  {
    id: "curlyLowFade",
    base: "/images/realisations/low-fade-cheveux-boucles",
    largeWidth: 1200,
    position: "center 30%",
  },
  {
    id: "taperMullet",
    base: "/images/realisations/taper-cheveux-boucles",
    largeWidth: 1200,
    position: "center 30%",
  },
];

export const teamPhotos: Photo[] = [
  {
    id: "barber",
    base: "/images/equipe/barbier-seven-barbershop",
    largeWidth: 1200,
    position: "center 35%",
  },
  {
    id: "shave",
    base: "/images/equipe/rasage-coupe-chou",
    largeWidth: 1200,
    position: "center 45%",
  },
  {
    id: "finish",
    base: "/images/equipe/coupe-courte-degrade",
    largeWidth: 1200,
    position: "center 40%",
  },
  {
    id: "workshop",
    base: "/images/equipe/barbiers-au-travail-billard",
    largeWidth: 1200,
    position: "center 30%",
  },
  {
    id: "team",
    base: "/images/equipe/equipe-seven-barbershop",
    largeWidth: 1079,
    position: "center 40%",
  },
];

export const salonInterior: Photo = {
  id: "interior",
  base: "/images/salon/salon-billard-fauteuils-cuir",
  largeWidth: 1183,
};

export const salonDetails: Photo[] = [
  salonInterior,
  {
    id: "sign",
    base: "/images/salon/devanture-enseigne-seven-barber-shop",
    largeWidth: 1175,
    position: "center top",
  },
  {
    id: "polo",
    base: "/images/equipe/polo-trust-your-barber",
    largeWidth: 680,
    position: "center 55%",
  },
  {
    id: "products",
    base: "/images/salon/produits-soin-barbe",
    largeWidth: 1165,
  },
];

export const brandPhoto: Photo = {
  id: "polo",
  base: "/images/equipe/polo-trust-your-barber",
  largeWidth: 680,
  position: "center 40%",
};
