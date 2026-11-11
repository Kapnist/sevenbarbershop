import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import { mediaToPhoto, useSlotPhoto } from "../data/media";
import { brandPhoto, photoSrc, photoSrcSet, photoText } from "../data/photos";
import { salonLocations } from "../data/salons";
import { useI18n } from "../i18n";

const cities = ["Saint-Étienne", "Nice"];

function AboutPage() {
  const { t } = useI18n();
  const page = t.about;
  const custom = useSlotPhoto("about.brand");
  const photo = custom ? mediaToPhoto(custom) : brandPhoto;

  return (
    <>
      <PageIntro
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
      />

      <section className="page-section salon-story">
        <div className="wrap salon-story-grid">
          <div className="salon-story-copy">
            <p className="eyebrow">{page.storyEyebrow}</p>
            <h2 lang="en">The Old French School.</h2>
            <p>{page.storyText}</p>
            <p>
              {page.mottoBefore}
              <em lang="en">Trust your barber</em>
              {page.mottoAfter}
            </p>
          </div>
          <img
            className="salon-story-image salon-story-image-portrait"
            src={photoSrc(photo)}
            srcSet={photoSrcSet(photo)}
            sizes="(max-width: 760px) 100vw, 55vw"
            alt={photoText(photo, t.photos).alt}
            style={{ objectPosition: photo.position }}
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>

      <section className="page-section">
        <div className="wrap">
          <div className="anatole-section-heading">
            <div>
              <p className="eyebrow">{page.valuesEyebrow}</p>
              <h2>{page.valuesTitle}</h2>
            </div>
          </div>
          <div className="services-grid">
            {page.values.map((value, index) => (
              <article className="service-card" key={value.name}>
                <span className="service-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{value.name}</h3>
                  <p>{value.description}</p>
                </div>
                <span className="service-label">{value.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section salon-story">
        <div className="wrap location-cities">
          {cities.map((city) => (
            <section className="city-section" key={city}>
              <div className="city-heading">
                <div>
                  <p className="eyebrow">{page.citiesEyebrow}</p>
                  <h2>{city}</h2>
                </div>
              </div>
              <div className="location-list">
                {salonLocations
                  .filter((location) => location.city === city)
                  .map((location, index) => (
                    <article className="location-card" key={location.name}>
                      <span className="location-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3>{location.name}</h3>
                        <p>
                          <bdi dir="ltr">
                            {location.streetAddress} · {location.postalCode}{" "}
                            {location.city}
                          </bdi>
                        </p>
                      </div>
                      {location.detailsPath && (
                        <div className="location-actions">
                          <Link
                            className="location-link"
                            to={location.detailsPath}
                            aria-label={page.discoverLabel(location.name, location.city)}
                          >
                            {t.locations.discover} <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      )}
                    </article>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="wrap">
          <div className="anatole-section-heading">
            <div>
              <p className="eyebrow">{page.faqEyebrow}</p>
              <h2>{page.faqTitle}</h2>
            </div>
          </div>
          <div className="faq-list">
            {page.faq.map((entry) => (
              <article className="faq-item" key={entry.question}>
                <h3>{entry.question}</h3>
                <p>{entry.answer}</p>
              </article>
            ))}
          </div>
          <div className="page-cta">
            <p>{page.ctaText}</p>
            <Link className="button" to="/salons">
              {page.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutPage;
