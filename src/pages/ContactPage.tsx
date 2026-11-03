import { useState, type ChangeEvent, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import { MAX_LENGTH, PHONE_PATTERN, useFormSubmit } from "../components/useFormSubmit";
import { salonLocations } from "../data/salons";
import { useI18n } from "../i18n";

function ContactPage() {
  const { t } = useI18n();
  const page = t.contact;
  const { state, submit } = useFormSubmit("Nouvelle suggestion — site Seven Barbershop");
  const [searchParams] = useSearchParams();
  const selectedSalon = searchParams.get("salon") ?? "";
  const selectedCity = searchParams.get("ville") ?? "";
  const [selectedLocation, setSelectedLocation] = useState(
    selectedSalon ? `${selectedCity}|${selectedSalon}` : "",
  );
  const selectedLocationDetails = salonLocations.find(
    (location) =>
      `${location.city}|${location.name}` === selectedLocation,
  );

  function handleLocationChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedLocation(event.target.value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    // Le courriel reçu par l'équipe reste en français, quelle que soit la langue du site.
    const sent = await submit(
      {
        Nom: data.get("name"),
        email: data.get("email"),
        Téléphone: data.get("phone"),
        Salon: selectedLocationDetails
          ? `${selectedLocationDetails.name} — ${selectedLocationDetails.city}`
          : "Non précisé",
        Message: data.get("message"),
      },
      form,
    );
    if (sent) setSelectedLocation("");
  }

  return (
    <>
      <PageIntro
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
      />
      <section className="page-section contact-page">
        <div className="wrap contact-page-grid">
          <div className="contact-addresses">
            <p className="eyebrow">{page.citiesEyebrow}</p>
            <h2>{page.citiesTitle}</h2>
            {["Saint-Étienne", "Nice"].map((city) => (
              <div className="contact-city" key={city}>
                <h3>{city}</h3>
                <ul>
                  {salonLocations
                    .filter((location) => location.city === city)
                    .map((location) => (
                      <li key={location.name}>{location.name}</li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="contact-form-panel" id="suggestions">
            <p className="eyebrow">{page.formEyebrow}</p>
            <h2>{page.formTitle}</h2>
            <p className="form-disclaimer">{page.disclaimer}</p>
            {selectedLocationDetails?.bookingUrl && (
              <a
                className="button contact-booking-link"
                href={selectedLocationDetails.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.salon.bookOnPlanity} <span aria-hidden="true">↗</span>
              </a>
            )}
            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="field field-full">
                <label htmlFor="contact-name">{page.name}</label>
                <input
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  maxLength={MAX_LENGTH.name}
                  required
                />
              </div>
              <div className="field field-full">
                <label htmlFor="contact-email">{page.email}</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  maxLength={MAX_LENGTH.email}
                  autoComplete="email"
                  dir="ltr"
                  required
                />
              </div>
              <div className="field field-full">
                <label htmlFor="contact-phone">{page.phone}</label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  dir="ltr"
                  placeholder="06 12 34 56 78"
                  pattern={PHONE_PATTERN}
                  title={page.phoneHint}
                  required
                />
              </div>
              <div className="field field-full">
                <label htmlFor="contact-salon">{page.salon}</label>
                <select
                  id="contact-salon"
                  name="salon"
                  value={selectedLocation}
                  onChange={handleLocationChange}
                >
                  <option value="">{page.allSalons}</option>
                  {salonLocations.map((location) => (
                    <option
                      key={`${location.city}-${location.name}`}
                      value={`${location.city}|${location.name}`}
                    >
                      {location.name} — {location.city}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field field-full">
                <label htmlFor="contact-message">{page.message}</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  minLength={10}
                  maxLength={MAX_LENGTH.message}
                  required
                />
              </div>
              {/* Champ piège invisible : rempli uniquement par les robots. */}
              <input
                className="form-honeypot"
                type="text"
                name="_honey"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <button
                className="button field-full"
                type="submit"
                disabled={state === "sending"}
              >
                {state === "sending" ? page.sendingButton : page.send}
              </button>
              <p className="form-status" role="status" aria-live="polite">
                {page.status[state]}
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default ContactPage;
