import { Link } from "react-router-dom";
import type { SalonPageConfig } from "../data/salonPages";
import { salonLocations } from "../data/salons";
import { useI18n } from "../i18n";
import { asset } from "../asset";

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

  if (!salon?.bookingUrl) {
    throw new Error(`Les informations de réservation de ${config.title} sont manquantes.`);
  }

  const address = `${salon.streetAddress} · ${salon.postalCode} ${salon.city}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${salon.streetAddress}, ${salon.postalCode} ${salon.city}`,
  )}`;
  const rating = formatNumber(config.rating, Number.isInteger(config.rating) ? 0 : 1);
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
          src={asset(config.heroImage)}
          alt={text.heroAlt}
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
          <a
            className="button"
            href={salon.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.salon.bookOnPlanity} <ExternalArrow />
          </a>
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
            <a
              className="text-link"
              href={salon.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.salon.choose} <ExternalArrow />
            </a>
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
          <a
            className="text-link anatole-full-menu"
            href={salon.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.salon.seeAvailability} <ExternalArrow />
          </a>
        </div>
      </section>

      <section className={`page-section ${config.galleryStyle}-gallery-section`}>
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
            {config.photos.map((src, index) => (
              <figure
                className={
                  config.galleryStyle === "anatole"
                    ? `anatole-photo${index === 0 ? " anatole-photo-featured" : ""}`
                    : "jean-jaures-photo"
                }
                key={src}
              >
                <img
                  src={asset(src)}
                  alt={text.photos[index].alt}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>{text.photos[index].label}</figcaption>
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
          <a
            className="button"
            href={salon.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.salon.makeAppointment} <ExternalArrow />
          </a>
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
