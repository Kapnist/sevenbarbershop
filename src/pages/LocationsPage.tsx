import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import { salonLocations } from "../data/salons";
import { useI18n } from "../i18n";
import BookingLink from "../components/BookingLink";

const cities = ["Saint-Étienne", "Nice"];

function LocationsPage() {
  const { t, formatHours } = useI18n();
  const page = t.locations;

  return (
    <>
      <PageIntro
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
      />
      <section className="page-section">
        <div className="wrap location-cities">
          {cities.map((city) => {
            const locations = salonLocations.filter(
              (location) => location.city === city,
            );

            return (
              <section className="city-section" key={city}>
                <div className="city-heading">
                  <div>
                    <p className="eyebrow">{locations[0]?.region}</p>
                    <h2>{city}</h2>
                  </div>
                  <span className="city-count">
                    {page.count(locations.length)}
                  </span>
                </div>
                <div className="location-list">
                  {locations.map((location, index) => {
                    const hours = location.openingHours
                      ? formatHours(location.openingHours)
                      : null;

                    return (
                      <article className="location-card" key={location.name}>
                        <span className="location-index">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h3>{location.name}</h3>
                          <p>
                            <bdi dir="ltr">
                              {location.streetAddress
                                ? `${location.streetAddress} · ${location.postalCode} ${location.city}`
                                : location.city}
                            </bdi>
                          </p>
                          {hours && (
                            <p className="location-hours">
                              {hours.open.map((line) => (
                                <span key={line}>{line}</span>
                              ))}
                              <span className="location-closed">
                                {hours.closed}
                              </span>
                            </p>
                          )}
                        </div>
                        <div className="location-actions">
                          {location.detailsPath && (
                            <Link
                              className="location-link"
                              to={location.detailsPath}
                            >
                              {page.discover} <span aria-hidden="true">→</span>
                            </Link>
                          )}
                          {location.bookingUrl ? (
                            <BookingLink
                              className="location-link"
                              location={location}
                              ariaLabel={page.bookLabel(
                                location.name,
                                location.city,
                              )}
                              onlineChildren={
                                <>
                                  {page.book} <span aria-hidden="true">→</span>
                                </>
                              }
                            >
                              {page.book} <span aria-hidden="true">↗</span>
                            </BookingLink>
                          ) : (
                            <Link
                              className="location-link"
                              to={`/contact?ville=${encodeURIComponent(location.city)}&salon=${encodeURIComponent(location.name)}`}
                              aria-label={page.contactLabel(
                                location.name,
                                location.city,
                              )}
                            >
                              {page.contact} <span aria-hidden="true">→</span>
                            </Link>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </>
  );
}

export default LocationsPage;
