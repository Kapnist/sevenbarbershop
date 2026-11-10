import { Link } from "react-router-dom";
import { salonLocations } from "../data/salons";
import { useI18n } from "../i18n";
import { asset } from "../asset";
import BookingLink from "../components/BookingLink";

const photos = [
  "/images/chavanelle/photo-2.webp",
  "/images/chavanelle/photo-3.webp",
  "/images/chavanelle/photo-4.webp",
  "/images/chavanelle/photo-5.webp",
  "/images/chavanelle/photo-6.webp",
];

function ChavanellePage() {
  const { t, formatNumber } = useI18n();
  const text = t.salonPages.chavanelle;
  const rating = formatNumber(4.8, 1);
  const salon = salonLocations.find(
    (location) => location.name === "Place Chavanelle",
  );

  if (!salon?.bookingUrl) {
    throw new Error(
      "Les informations de réservation de Chavanelle sont manquantes.",
    );
  }

  return (
    <>
      <section className="chavanelle-hero">
        <img
          className="chavanelle-hero-image"
          src={asset("/images/chavanelle/photo-1.webp")}
          alt={text.heroAlt}
          fetchPriority="high"
        />
        <div className="chavanelle-hero-shade" />
        <div className="wrap chavanelle-hero-content">
          <h1>
            <span className="eyebrow heading-eyebrow">
              {t.format.barberIn("Saint-Étienne")} · Seven Barbershop
            </span>{" "}
            Chavanelle
          </h1>
          <p>
            <bdi dir="ltr">17 Place Chavanelle · 42000 Saint-Étienne</bdi>
          </p>
          <BookingLink
            className="button"
            location={salon}
            onlineChildren={
              <>
                {t.booking.cta} <span aria-hidden="true">→</span>
              </>
            }
          >
            {t.salon.bookOnPlanity} <span aria-hidden="true">↗</span>
          </BookingLink>
          <p className="chavanelle-rating">
            <span aria-label={t.salon.ratingLabel(rating)}>★★★★★</span>
            <span>{t.salon.reviews(rating, formatNumber(521))}</span>
          </p>
        </div>
      </section>

      <section className="page-section chavanelle-about">
        <div className="wrap chavanelle-about-grid">
          <div>
            <p className="eyebrow">{text.aboutEyebrow}</p>
            <h2>Trust your barber.</h2>
          </div>
          <div>
            <p>{text.aboutText}</p>
            <BookingLink
              className="text-link"
              location={salon}
              onlineChildren={
                <>
                  {text.chooseAndBook} <span aria-hidden="true">→</span>
                </>
              }
            >
              {text.chooseAndBook} <span aria-hidden="true">↗</span>
            </BookingLink>
          </div>
        </div>
      </section>

      <section className="page-section chavanelle-gallery-section">
        <div className="wrap">
          <div className="chavanelle-gallery-heading">
            <div>
              <p className="eyebrow">{t.salon.galleryEyebrow}</p>
              <h2>{text.galleryTitle}</h2>
            </div>
            <p className="section-intro">{t.salon.galleryIntro}</p>
          </div>
          <div className="chavanelle-gallery">
            {photos.map((src, index) => (
              <figure className="chavanelle-photo" key={src}>
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

      <section className="chavanelle-booking">
        <div className="wrap chavanelle-booking-inner">
          <div>
            <p className="eyebrow">Place Chavanelle</p>
            <h2>{text.bookingTitle}</h2>
            <p>{text.bookingText}</p>
          </div>
          <BookingLink
            className="button"
            location={salon}
            onlineChildren={
              <>
                {text.bookNow} <span aria-hidden="true">→</span>
              </>
            }
          >
            {text.bookNow} <span aria-hidden="true">↗</span>
          </BookingLink>
        </div>
      </section>

      <div className="wrap chavanelle-back">
        <Link className="text-link" to="/salons">
          <span aria-hidden="true">←</span> {t.salon.allSalons}
        </Link>
      </div>
    </>
  );
}

export default ChavanellePage;
