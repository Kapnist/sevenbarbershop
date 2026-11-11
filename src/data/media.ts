/**
 * Photos choisies par le propriétaire dans l'espace gérant (médiathèque), emplacement par emplacement.
 * Tant qu'un emplacement n'a pas de photo choisie — ou si l'API ne répond pas (GitHub Pages,
 * pré-rendu) — le site affiche sa photo d'origine. Les emplacements sont définis dans
 * gestion/inc/media.php (mêmes clés).
 */
import { useSyncExternalStore } from "react";
import { BOOKING_API } from "./booking";
import type { Photo } from "./photos";

export interface MediaItem {
  src: string;
  large: string;
  smallWidth: number;
  width: number;
  height: number;
  alt: string;
  title: string;
  caption: string;
}

type MediaMap = Record<string, MediaItem[]>;

/** Dossier gestion/ sur le serveur (« /gestion »), d'après l'adresse de l'API. */
const MEDIA_BASE = BOOKING_API ? BOOKING_API.replace(/\/api\/?$/, "") : undefined;
const CACHE_KEY = "seven-media";
const EMPTY: MediaMap = {};

let current: MediaMap = EMPTY;
let started = false;
const listeners = new Set<() => void>();

function absolute(item: MediaItem): MediaItem {
  const prefix = (path: string) => (/^(https?:)?\//.test(path) ? path : `${MEDIA_BASE}/${path}`);
  return { ...item, src: prefix(item.src), large: prefix(item.large) };
}

function publish(map: MediaMap) {
  current = map;
  listeners.forEach((listener) => listener());
}

function load() {
  if (started || !MEDIA_BASE || typeof window === "undefined") return;
  started = true;
  // Dernière version connue d'abord (pas de clignotement d'une page à l'autre), puis mise à jour.
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) current = JSON.parse(cached) as MediaMap;
  } catch {
    /* stockage indisponible */
  }
  fetch(`${MEDIA_BASE}/api/media.php`, { headers: { Accept: "application/json" } })
    .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
    .then((data: { slots?: Record<string, MediaItem[]> }) => {
      const map: MediaMap = {};
      for (const [slot, items] of Object.entries(data.slots ?? {})) map[slot] = items.map(absolute);
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(map));
      } catch {
        /* stockage indisponible */
      }
      publish(map);
    })
    .catch(() => {
      /* API absente : photos d'origine */
    });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  load();
  return () => listeners.delete(listener);
}

/** Toutes les photos choisies (vide au premier rendu, identique au pré-rendu). */
export function useMedia(): MediaMap {
  return useSyncExternalStore(subscribe, () => current, () => EMPTY);
}

/** Photo choisie pour un emplacement simple, ou undefined (photo d'origine). */
export function useSlotPhoto(slot: string): MediaItem | undefined {
  return useMedia()[slot]?.[0];
}

export function mediaSrcSet(item: MediaItem): string {
  return item.smallWidth < item.width
    ? `${item.src} ${item.smallWidth}w, ${item.large} ${item.width}w`
    : `${item.large} ${item.width}w`;
}

/** Transforme une photo de la médiathèque en Photo utilisable par les galeries (Lookbook). */
export function mediaToPhoto(item: MediaItem): Photo {
  return {
    id: "interior",
    base: item.large,
    largeWidth: item.width,
    custom: {
      src: item.src,
      srcSet: mediaSrcSet(item),
      large: item.large,
      alt: item.alt,
      title: item.title,
      caption: item.caption,
    },
  };
}

export interface SalonImage {
  src: string;
  srcSet?: string;
  alt?: string;
  label?: string;
}

/**
 * Photos d'une page salon : photo principale et galerie choisies dans l'espace gérant
 * (emplacements « <slug>.hero » et « <slug>.gallery »), sinon celles d'origine avec leurs textes.
 */
export function useSalonImages(
  slug: string,
  hero: string,
  gallery: string[],
  texts: { alt: string; label: string }[],
): { hero: SalonImage; gallery: SalonImage[] } {
  const media = useMedia();
  const customHero = media[`${slug}.hero`]?.[0];
  const customGallery = media[`${slug}.gallery`];
  return {
    hero: customHero
      ? { src: customHero.large, srcSet: mediaSrcSet(customHero), alt: customHero.alt || undefined }
      : { src: hero },
    gallery: customGallery?.length
      ? customGallery.map((item) => ({
          src: item.large,
          srcSet: mediaSrcSet(item),
          alt: item.alt || item.title,
          label: item.title || item.caption,
        }))
      : gallery.map((src, index) => ({ src, alt: texts[index]?.alt, label: texts[index]?.label })),
  };
}

/** Galerie : photos choisies si l'emplacement en a, sinon photos d'origine. */
export function useGallery(slot: string, defaults: Photo[]): Photo[] {
  const items = useMedia()[slot];
  return items?.length ? items.map(mediaToPhoto) : defaults;
}
