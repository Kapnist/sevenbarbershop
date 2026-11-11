import { Link } from "react-router-dom";
import type { SalonPageConfig } from "../data/salonPages";
import { salonSlug } from "../data/booking";
import { useSalonImages } from "../data/media";
import { salonLocations } from "../data/salons";
import { useI18n } from "../i18n";
import { asset } from "../asset";
import BookingLink from "../components/BookingLink";

interface SalonText {
  heroAlt: string;
  aboutTitle: string;
  aboutText: string;
  bookingNote?: string;
  servicesIntro?: string;
  galleryTitle: string;
  galleryIntro?: string;
  photos: { label: string; alt: string }[];
  services: string[];
}

function ExternalArrow() {
  return <span aria-hidden="true">↗</span>;
}

// Page commune aux salons Anatole France, Jean Jaurès, Meyerbeer et Le Port.
function SalonDetailPage({ config }: { config: SalonPageConfig }) {
  const { t, formatNumber, formatPrice } = useI18n();
  const text: SalonText = t.salonPages[config.key];
  const salon = salonLocations.find(
    (location) => location.name === config.locationName,
  );
  const images = useSalonImages(
    (salon && salonSlug(salon)) ?? "",
    asset(config.heroImage),
    config.photos.map((src) => asset(src)),
    text.photos,
  );

  if (!salon?.bookingUrl) {
    throw new Error(
      `Les informations de réservation de ${config.title} sont manquantes.`,
    );
  }

  const address = `${salon.streetAddress} · ${salon.postalCode} ${salon.city}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${salon.streetAddress}, ${salon.postalCode} ${salon.city}`,
  )}`;
  const rating = formatNumber(
    config.rating,
    Number.isInteger(config.rating) ? 0 : 1,
  );
  const hero = config.heroStyle;
  const galleryHeading =
    config.galleryStyle === "anatole"
      ? "anatole-section-heading"
      : "jean-jaures-gallery-heading";

  return (
    <>
      <section className={`${hero}-hero`}>
        <img
          className={`${hero}-hero-image`}
          src={images.hero.src}
          srcSet={images.hero.srcSet}
          sizes={images.hero.srcSet ? "100vw" : undefined}
          alt={images.hero.alt || text.heroAlt}
          fetchPriority="high"
        />
        <div className={`${hero}-hero-shade`} />
        <div className="wrap anatole-hero-content">
          <h1>
            <span className="eyebrow heading-eyebrow">
              {t.format.barberIn(salon.city)} · Seven Barbershop
            </span>{" "}
            {config.title}
          </h1>
          <a
            className="anatole-address"
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <bdi dir="ltr">{address}</bdi>
            <ExternalArrow />
          </a>
          <BookingLink
            className="button"
            location={salon}
            onlineChildren={
              <>
                {t.booking.cta} <span aria-hidden="true">→</span>
              </>
            }
          >
            {t.salon.bookOnPlanity} <ExternalArrow />
          </BookingLink>
          <p className="anatole-rating">
            <span aria-label={t.salon.ratingLabel(rating)}>★★★★★</span>
            <span>{t.salon.reviews(rating, formatNumber(config.reviews))}</span>
          </p>
        </div>
      </section>

      <section className="page-section anatole-about">
        <div className="wrap anatole-about-grid">
          <div>
            <p className="eyebrow">Trust your barber</p>
            <h2>{text.aboutTitle}</h2>
          </div>
          <div>
            <p>{text.aboutText}</p>
            <p className="anatole-booking-note">
              {text.bookingNote ?? t.salon.bookingNote}
            </p>
            <BookingLink
              className="text-link"
              location={salon}
              onlineChildren={
                <>
                  {t.salon.choose} <span aria-hidden="true">→</span>
                </>
              }
            >
              {t.salon.choose} <ExternalArrow />
            </BookingLink>
          </div>
        </div>
      </section>

      <section className="page-section anatole-services">
        <div className="wrap">
          <div className="anatole-section-heading">
            <div>
              <p className="eyebrow">{t.salon.servicesEyebrow}</p>
              <h2>{t.salon.servicesTitle}</h2>
            </div>
            <p className="section-intro">
              {text.servicesIntro ?? t.salon.servicesIntro}
            </p>
          </div>
          <div className="anatole-service-list">
            {config.services.map((service, index) => (
              <article
                className="anatole-service-row"
                key={`${service.category}-${index}`}
              >
                <span className="anatole-service-category">
                  {t.salon.categories[service.category]}
                </span>
                <h3>{text.services[index]}</h3>
                <span className="anatole-service-duration">
                  {t.format.duration(service.duration)}
                </span>
                <span className="anatole-service-price">
                  {formatPrice(service.price)}
                </span>
              </article>
            ))}
          </div>
          <BookingLink
            className="text-link anatole-full-menu"
            location={salon}
            onlineChildren={
              <>
                {t.booking.seeSlots} <span aria-hidden="true">→</span>
              </>
            }
          >
            {t.salon.seeAvailability} <ExternalArrow />
          </BookingLink>
        </div>
      </section>

      <section
        className={`page-section ${config.galleryStyle}-gallery-section`}
      >
        <div className="wrap">
          <div className={galleryHeading}>
            <div>
              <p className="eyebrow">{t.salon.galleryEyebrow}</p>
              <h2>{text.galleryTitle}</h2>
            </div>
            <p className="section-intro">
              {text.galleryIntro ?? t.salon.galleryIntro}
            </p>
          </div>
          <div className={`${config.galleryStyle}-gallery`}>
            {images.gallery.map((photo, index) => (
              <figure
                className={
                  config.galleryStyle === "anatole"
                    ? `anatole-photo${index === 0 ? " anatole-photo-featured" : ""}`
                    : "jean-jaures-photo"
                }
                key={`${photo.src}-${index}`}
              >
                <img
                  src={photo.src}
                  srcSet={photo.srcSet}
                  sizes={photo.srcSet ? "(max-width: 760px) 100vw, 50vw" : undefined}
                  alt={photo.alt ?? ""}
                  loading="lazy"
                  decoding="async"
                />
                {photo.label && <figcaption>{photo.label}</figcaption>}
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="anatole-booking">
        <div className="wrap anatole-booking-inner">
          <div>
            <p className="eyebrow">
              <bdi dir="ltr">
                {salon.streetAddress} · {salon.city}
              </bdi>
            </p>
            <h2>{t.salon.seeYouSoon}</h2>
          </div>
          <BookingLink
            className="button"
            location={salon}
            onlineChildren={
              <>
                {t.salon.makeAppointment} <span aria-hidden="true">→</span>
              </>
            }
          >
            {t.salon.makeAppointment} <ExternalArrow />
          </BookingLink>
        </div>
      </section>

      <div className="wrap anatole-back">
        <Link className="text-link" to="/salons">
          <span aria-hidden="true">←</span> {t.salon.allSalons}
        </Link>
      </div>
    </>
  );
}

export default SalonDetailPage;
