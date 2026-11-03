import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import Lookbook from "../components/Lookbook";
import {
  FORMSUBMIT_ID,
  MAX_LENGTH,
  PHONE_PATTERN,
  useBotGuard,
} from "../components/useFormSubmit";
import { photoSrc, photoSrcSet, realisations, teamPhotos } from "../data/photos";
import { useI18n } from "../i18n";
import { fr } from "../i18n/fr";

const MAX_CV_SIZE = 5 * 1024 * 1024;
const CV_EXTENSIONS = ["pdf", "doc", "docx", "odt", "jpg", "jpeg", "png"];

const heroPhoto = teamPhotos.find((photo) => photo.id === "team")!;
const lifePhotos = [
  ...teamPhotos.filter((photo) => ["barber", "shave", "workshop"].includes(photo.id)),
  realisations.find((photo) => photo.id === "lowTaper")!,
];

function CareersPage() {
  const { t } = useI18n();
  const page = t.careers;
  const [searchParams] = useSearchParams();
  const sent = searchParams.get("candidature") === "envoyee";
  const [cvName, setCvName] = useState("");
  const [cvError, setCvError] = useState<"size" | "type" | null>(null);
  const [sending, setSending] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const isSuspicious = useBotGuard();

  // FormSubmit renvoie ici après l'envoi : on affiche la confirmation au formulaire.
  useEffect(() => {
    if (sent) {
      document.getElementById("candidature")?.scrollIntoView();
    }
  }, [sent]);

  function handleCvChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setCvName(file?.name ?? "");
    const extension = file?.name.split(".").pop()?.toLowerCase() ?? "";
    if (file && !CV_EXTENSIONS.includes(extension)) {
      setCvError("type");
    } else if (file && file.size > MAX_CV_SIZE) {
      setCvError("size");
    } else {
      setCvError(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (cvError) {
      event.preventDefault();
      return;
    }
    // Un robot voit la confirmation habituelle, mais rien n'est envoyé.
    if (isSuspicious(event.currentTarget)) {
      event.preventDefault();
      event.currentTarget.reset();
      setCvName("");
      setBlocked(true);
      return;
    }
    setSending(true);
  }

  return (
    <>
      <section className="jean-jaures-hero careers-hero">
        <img
          className="jean-jaures-hero-image"
          src={photoSrc(heroPhoto, "large")}
          srcSet={photoSrcSet(heroPhoto)}
          sizes="100vw"
          alt={page.heroAlt}
          style={{ objectPosition: "center 35%" }}
          fetchPriority="high"
        />
        <div className="jean-jaures-hero-shade" />
        <div className="wrap anatole-hero-content">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="careers-hero-copy">{page.description}</p>
          <a className="button" href="#candidature">
            {page.heroCta}
          </a>
        </div>
      </section>

      <section className="page-section">
        <div className="wrap">
          <div className="anatole-section-heading">
            <div>
              <p className="eyebrow">{page.whyEyebrow}</p>
              <h2>{page.whyTitle}</h2>
            </div>
          </div>
          <div className="perks-grid">
            {page.perks.map((perk, index) => (
              <article className="service-card" key={perk.title}>
                <span className="service-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{perk.title}</h3>
                  <p>{perk.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section salon-story">
        <div className="wrap">
          <div className="anatole-section-heading">
            <div>
              <p className="eyebrow">{page.lifeEyebrow}</p>
              <h2>{page.lifeTitle}</h2>
            </div>
          </div>
          <div className="careers-life">
            <Lookbook photos={lifePhotos} label={page.lifeLabel} />
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="wrap careers-profile">
          <div>
            <p className="eyebrow">{page.profileEyebrow}</p>
            <h2>{page.profileTitle}</h2>
            <ul className="profile-list">
              {page.profile.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <figure className="careers-quote">
            <blockquote>
              <p>{page.quote}</p>
            </blockquote>
            <figcaption lang="en">Trust your barber</figcaption>
          </figure>
        </div>
      </section>

      <section className="page-section contact-page salon-story" id="candidature">
        <div className="wrap contact-page-grid">
          <div className="contact-addresses">
            <p className="eyebrow">{page.formEyebrow}</p>
            <h2>{page.formTitle}</h2>
            <p className="careers-form-intro">{page.formIntro}</p>
          </div>
          <div className="contact-form-panel">
            {/* Envoi classique (et non en arrière-plan) : seul moyen pour FormSubmit de transmettre le CV en pièce jointe. */}
            <form
              className="booking-form"
              action={`https://formsubmit.co/${FORMSUBMIT_ID}`}
              method="POST"
              encType="multipart/form-data"
              onSubmit={handleSubmit}
            >
              <input
                type="hidden"
                name="_subject"
                value="Nouvelle candidature — site Seven Barbershop"
              />
              <input type="hidden" name="_template" value="table" />
              <input
                type="hidden"
                name="_next"
                value={`${window.location.origin}${import.meta.env.BASE_URL}carrieres?candidature=envoyee`}
              />
              {/* Les noms de champs et les valeurs envoyées restent en français pour l'équipe. */}
              <div className="field field-full">
                <label htmlFor="careers-name">{t.contact.name}</label>
                <input
                  id="careers-name"
                  name="Nom"
                  autoComplete="name"
                  maxLength={MAX_LENGTH.name}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="careers-email">{t.contact.email}</label>
                <input
                  id="careers-email"
                  name="email"
                  type="email"
                  maxLength={MAX_LENGTH.email}
                  autoComplete="email"
                  dir="ltr"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="careers-phone">{t.contact.phone}</label>
                <input
                  id="careers-phone"
                  name="Téléphone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  dir="ltr"
                  placeholder="06 12 34 56 78"
                  pattern={PHONE_PATTERN}
                  title={t.contact.phoneHint}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="careers-city">{page.city}</label>
                <select
                  id="careers-city"
                  name="Ville souhaitée"
                  defaultValue={fr.careers.anyCity}
                >
                  <option value={fr.careers.anyCity}>{page.anyCity}</option>
                  <option value="Saint-Étienne">Saint-Étienne</option>
                  <option value="Nice">Nice</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="careers-experience">{page.experience}</label>
                <select
                  id="careers-experience"
                  name="Expérience"
                  defaultValue={fr.careers.experienceLevels[0]}
                >
                  {page.experienceLevels.map((level, index) => (
                    <option key={level} value={fr.careers.experienceLevels[index]}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field field-full">
                <label htmlFor="careers-portfolio">{page.portfolio}</label>
                <input
                  id="careers-portfolio"
                  name="Réalisations"
                  inputMode="url"
                  maxLength={MAX_LENGTH.url}
                  dir="ltr"
                  placeholder="instagram.com/…"
                />
              </div>
              <div className="field field-full">
                <span className="field-label">{page.cv}</span>
                <label className="file-field" htmlFor="careers-cv">
                  <input
                    id="careers-cv"
                    name="CV"
                    type="file"
                    accept={CV_EXTENSIONS.map((extension) => `.${extension}`).join(",")}
                    onChange={handleCvChange}
                    aria-describedby="careers-cv-hint"
                  />
                  <span className="file-field-button">{page.cvButton}</span>
                  <span className="file-field-name">{cvName}</span>
                </label>
                <span
                  className={`file-field-hint${cvError ? " is-error" : ""}`}
                  id="careers-cv-hint"
                  role={cvError ? "alert" : undefined}
                >
                  {cvError === "size"
                    ? page.cvTooLarge
                    : cvError === "type"
                      ? page.cvWrongType
                      : page.cvHint}
                </span>
              </div>
              <div className="field field-full">
                <label htmlFor="careers-message">{page.message}</label>
                <textarea
                  id="careers-message"
                  name="Message"
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
              <button className="button field-full" type="submit" disabled={sending}>
                {sending ? t.contact.sendingButton : page.send}
              </button>
              <p className="form-status" role="status" aria-live="polite">
                {sent || blocked ? page.sent : ""}
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default CareersPage;
