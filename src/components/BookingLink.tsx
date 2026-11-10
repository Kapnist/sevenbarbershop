import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { BOOKING_API, fetchCatalog, salonSlug } from "../data/booking";
import type { SalonLocation } from "../data/salons";

/** Salons qui prennent les rendez-vous sur le site (null tant que ce n'est pas connu). */
export function useOnlineSalons(): Set<string> | null {
  const [online, setOnline] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!BOOKING_API) return;
    let active = true;
    fetchCatalog()
      .then((salons) => {
        if (active)
          setOnline(
            new Set(salons.filter((s) => s.booking).map((s) => s.slug)),
          );
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return online;
}

/**
 * Bouton « Réserver » d'un salon : la page de réservation du site si le salon y est ouvert,
 * sinon sa page Planity (c'est aussi ce que voient les robots et le pré-rendu).
 */
function BookingLink({
  location,
  className,
  children,
  onlineChildren,
  ariaLabel,
}: {
  location: SalonLocation;
  className?: string;
  /** Contenu du lien Planity. */
  children: ReactNode;
  /** Contenu du lien vers la réservation du site. */
  onlineChildren: ReactNode;
  ariaLabel?: string;
}) {
  const online = useOnlineSalons();
  const slug = salonSlug(location);

  if (slug && online?.has(slug)) {
    return (
      <Link
        className={className}
        to={`/reservation?salon=${slug}`}
        aria-label={ariaLabel}
      >
        {onlineChildren}
      </Link>
    );
  }

  if (!location.bookingUrl) return null;
  return (
    <a
      className={className}
      href={location.bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}

export default BookingLink;
