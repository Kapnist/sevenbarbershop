/**
 * Client de l'API de réservation (dossier gestion/, en PHP sur l'hébergement OVH).
 * VITE_BOOKING_API donne son adresse, par exemple « /gestion/api » sur sevenbarbershop.fr.
 * Sans cette variable, la réservation en ligne est désactivée et le site renvoie vers Planity.
 */
import type { SalonLocation } from "./salons";

export const BOOKING_API: string | undefined =
  import.meta.env.VITE_BOOKING_API || undefined;

export interface BookingService {
  id: number;
  category: string;
  name: string;
  description: string;
  duration: number;
  price: string;
}

export interface BookingSalon {
  slug: string;
  name: string;
  city: string;
  address: string;
  booking: boolean;
  planity_url: string;
  services?: BookingService[];
  staff?: { id: number; name: string }[];
}

export interface BookingDay {
  date: string;
  slots: number;
}

export interface BookingRequest {
  salon: string;
  service: number;
  staff: number;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  note: string;
  consent: boolean;
  website: string;
}

export interface BookingConfirmation {
  ok: true;
  ref: string;
  salon: string;
  address: string;
  service: string;
  staff: string;
  date: string;
  time: string;
}

export class BookingError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BOOKING_API)
    throw new BookingError("Réservation en ligne non configurée.", 0);
  let response: Response;
  try {
    response = await fetch(`${BOOKING_API}/${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
    });
  } catch {
    throw new BookingError("Réseau indisponible.", 0);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new BookingError(
      data.error ?? "Erreur",
      response.status,
      data.fields,
    );
  return data as T;
}

let catalogPromise: Promise<BookingSalon[]> | null = null;

/** Salons, prestations et barbiers (une seule requête par visite). */
export function fetchCatalog(): Promise<BookingSalon[]> {
  catalogPromise ??= call<{ salons: BookingSalon[] }>("catalog.php")
    .then((data) => data.salons)
    .catch((error) => {
      catalogPromise = null;
      throw error;
    });
  return catalogPromise;
}

export function fetchDays(salon: string, service: number, staff: number) {
  const params = new URLSearchParams({
    salon,
    service: String(service),
    staff: String(staff),
  });
  return call<{ days: BookingDay[] }>(`days.php?${params}`).then(
    (data) => data.days,
  );
}

export function fetchSlots(
  salon: string,
  service: number,
  staff: number,
  date: string,
) {
  const params = new URLSearchParams({
    salon,
    service: String(service),
    staff: String(staff),
    date,
  });
  return call<{ slots: string[] }>(`slots.php?${params}`).then(
    (data) => data.slots,
  );
}

export function book(request: BookingRequest) {
  return call<BookingConfirmation>("book.php", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/** Identifiant d'un salon dans l'API : la fin de l'adresse de sa page (« anatole-france »). */
export function salonSlug(location: SalonLocation): string | undefined {
  return location.detailsPath?.split("/").pop();
}
