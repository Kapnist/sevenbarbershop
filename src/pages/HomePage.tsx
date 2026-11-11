import { Link } from "react-router-dom";
import Lookbook from "../components/Lookbook";
import ServiceCard from "../components/ServiceCard";
import { realisations } from "../data/photos";
import { salonLocations } from "../data/salons";
import { featuredServices } from "../data/services";
import { useI18n } from "../i18n";
import { asset } from "../asset";

const cities = ["Saint-Étienne", "Nice"];

function HomePage() {
  const { t, formatNumber } = useI18n();
  const home = t.home;
  const highlights = [
    { value: String(salonLocations.length), label: home.highlights.salons },
    { value: "2", label: home.highlights.cities },
    { value: `${formatNumber(2700)}+`, label: home.highlights.reviews },
    { value: home.highlights.bookingValue, label: home.highlights.booking },
  ];

  return (
    <>
      <section className="hero" id="accueil">
        <div className="wrap hero-content">
          <h1>
            <span className="eyebrow heading-eyebrow">{home.eyebrow}</span>{" "}
            <span lang="en">
              Trust your
              <br />
              <span className="hero-accent">barber.</span>
            </span>
          </h1>
          <p className="hero-copy">{home.heroCopy}</p>
          <div className="hero-actions">
            <Link className="button" to="/reservation">
              {home.ctaBook}
            </Link>
            <Link className="button button-outline" to="/prestations">
              {home.ctaServices}
            </Link>
          </div>
          <ul className="hero-highlights">
            {highlights.map((item) => (
              <li key={item.label}>
                <strong>
                  <bdi dir="ltr">{item.value}</bdi>
                </strong>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="page-section home-services">
        <div className="wrap">
          <div className="anatole-section-heading">
            <div>
              <p className="eyebrow">{home.servicesEyebrow}</p>
              <h2>{home.servicesTitle}</h2>
            </div>
            <p className="section-intro">{home.servicesIntro}</p>
          </div>
          <div className="services-grid">
            {featuredServices.map((service) => (
              <ServiceCard service={service} key={service.number} />
            ))}
          </div>
          <Link className="text-link lookbook-cta" to="/prestations">
            {home.servicesLink} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="home-salon">
        <div className="wrap home-salon-grid">
          <img
            src={asset("/images/meyerbeer/photo-5.webp")}
            alt={home.spiritAlt}
            loading="lazy"
            decoding="async"
          />
          <div>
            <p className="eyebrow">{home.spiritEyebrow}</p>
            <h2>{home.spiritTitle}</h2>
            <p>{home.spiritText}</p>
            <Link className="text-link" to="/salon">
              {home.spiritLink} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="page-section salon-story">
        <div className="wrap">
          <div className="anatole-section-heading">
            <div>
              <p className="eyebrow">{home.lookbookEyebrow}</p>
              <h2>{home.lookbookTitle}</h2>
            </div>
            <p className="section-intro">{home.lookbookIntro}</p>
          </div>
          <Lookbook photos={realisations.slice(0, 3)} label={home.lookbookLabel} />
          <Link className="text-link lookbook-cta" to="/salon#realisations">
            {home.lookbookLink} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="page-section home-locations">
        <div className="wrap">
          <div className="anatole-section-heading">
            <div>
              <p className="eyebrow">{home.locationsEyebrow}</p>
              <h2>{home.locationsTitle(salonLocations.length)}</h2>
            </div>
            <p className="section-intro">{home.locationsIntro}</p>
          </div>
          {cities.map((city) => (
            <div className="home-city" key={city}>
              <h3 className="home-city-name">{city}</h3>
              <div className="salon-cards">
                {salonLocations
                  .filter((location) => location.city === city)
                  .map((location) => (
                    <Link
                      className="salon-card"
                      to={location.detailsPath ?? "/salons"}
                      key={location.name}
                    >
                      {location.image && (
                        <img
                          src={asset(location.image)}
                          alt={home.cardAlt(location.name, location.city)}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <span className="salon-card-body">
                        <span className="salon-card-name">{location.name}</span>
                        <span className="salon-card-address">
                          <bdi dir="ltr">
                            {location.streetAddress} · {location.postalCode}{" "}
                            {location.city}
                          </bdi>
                        </span>
                        <span className="salon-card-link">
                          {home.discover} <span aria-hidden="true">→</span>
                        </span>
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="anatole-booking">
        <div className="wrap anatole-booking-inner">
          <div>
            <p className="eyebrow">Trust your barber</p>
            <h2>{home.bookingTitle}</h2>
          </div>
          <Link className="button" to="/reservation">
            {home.bookingButton}
          </Link>
        </div>
      </section>
    </>
  );
}

export default HomePage;
