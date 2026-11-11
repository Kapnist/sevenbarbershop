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

/** Photo d'origine du site gardée à sa place dans une galerie modifiée (son rang d'origine). */
export interface OriginItem {
  origin: number;
}

type SlotItem = MediaItem | OriginItem;
type MediaMap = Record<string, SlotItem[]>;

export const isOrigin = (item: SlotItem): item is OriginItem => "origin" in item;

/** Dossier gestion/ sur le serveur (« /gestion »), d'après l'adresse de l'API. */
const MEDIA_BASE = BOOKING_API ? BOOKING_API.replace(/\/api\/?$/, "") : undefined;
const CACHE_KEY = "seven-media";
const EMPTY: MediaMap = {};

let current: MediaMap = EMPTY;
let started = false;
const listeners = new Set<() => void>();

function absolute(item: SlotItem): SlotItem {
  if (isOrigin(item)) return item;
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
    .then((data: { slots?: Record<string, SlotItem[]> }) => {
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
  return slotPhoto(useMedia(), slot);
}

/** Première photo choisie d'un emplacement simple (jamais une photo d'origine). */
export function slotPhoto(media: MediaMap, slot: string): MediaItem | undefined {
  const item = media[slot]?.[0];
  return item && !isOrigin(item) ? item : undefined;
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
  const customHero = slotPhoto(media, `${slug}.hero`);
  const customGallery = media[`${slug}.gallery`];
  const original = (index: number): SalonImage | null =>
    gallery[index] ? { src: gallery[index], alt: texts[index]?.alt, label: texts[index]?.label } : null;
  return {
    hero: customHero
      ? { src: customHero.large, srcSet: mediaSrcSet(customHero), alt: customHero.alt || undefined }
      : { src: hero },
    gallery: customGallery?.length
      ? customGallery
          .map((item) =>
            isOrigin(item)
              ? original(item.origin)
              : { src: item.large, srcSet: mediaSrcSet(item), alt: item.alt || item.title, label: item.title || item.caption },
          )
          .filter((image): image is SalonImage => image !== null)
      : gallery.map((_, index) => original(index)!),
  };
}

/** Galerie : photos choisies si l'emplacement en a, sinon photos d'origine. */
export function useGallery(slot: string, defaults: Photo[]): Photo[] {
  const items = useMedia()[slot];
  if (!items?.length) return defaults;
  // Ordre choisi par l'admin : photos d'origine gardées et photos de la médiathèque mélangées
  return items
    .map((item) => (isOrigin(item) ? defaults[item.origin] : mediaToPhoto(item)))
    .filter((photo): photo is Photo => Boolean(photo));
}
