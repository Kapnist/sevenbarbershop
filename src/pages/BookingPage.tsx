import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import { MAX_LENGTH, PHONE_PATTERN } from "../components/useFormSubmit";
import {
  BOOKING_API,
  BookingError,
  book,
  fetchCatalog,
  fetchDays,
  fetchSlots,
  type BookingConfirmation,
  type BookingDay,
  type BookingSalon,
} from "../data/booking";
import { salonLocations } from "../data/salons";
import { useI18n } from "../i18n";

/** Étape terminée : rappel du choix et bouton « Modifier ». */
function DoneStep({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ReactNode;
  onChange: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="booking-done">
      <span className="booking-done-label">{label}</span>
      <span className="booking-done-value">{value}</span>
      <button type="button" className="text-link" onClick={onChange}>
        {t.booking.change}
      </button>
    </div>
  );
}

function StepTitle({
  number,
  children,
}: {
  number: number;
  children: ReactNode;
}) {
  return (
    <h2 className="booking-step-title">
      <span aria-hidden="true">{number}</span>
      {children}
    </h2>
  );
}

function BookingPage() {
  const { t, locale } = useI18n();
  const page = t.booking;
  const [params, setParams] = useSearchParams();

  const [catalog, setCatalog] = useState<BookingSalon[] | null>(null);
  const [catalogError, setCatalogError] = useState(false);
  const [salonSlug, setSalonSlug] = useState<string | null>(
    params.get("salon"),
  );
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [staffId, setStaffId] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [days, setDays] = useState<BookingDay[] | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(
    null,
  );
  const currentStep = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!BOOKING_API) return;
    fetchCatalog()
      .then(setCatalog)
      .catch(() => setCatalogError(true));
  }, []);

  const salon = catalog?.find((s) => s.slug === salonSlug) ?? null;
  const service = salon?.services?.find((s) => s.id === serviceId) ?? null;
  const staffName =
    staffId === 0
      ? page.anyStaff
      : (salon?.staff?.find((s) => s.id === staffId)?.name ?? "");

  // Jours libres pour la prestation et le barbier choisis
  useEffect(() => {
    setDays(null);
    if (!salon?.booking || !service || staffId === null) return;
    let active = true;
    fetchDays(salon.slug, service.id, staffId)
      .then((list) => active && setDays(list))
      .catch(() => active && setDays([]));
    return () => {
      active = false;
    };
  }, [salon, service, staffId]);

  // Créneaux du jour choisi
  useEffect(() => {
    setSlots(null);
    if (!salon?.booking || !service || staffId === null || !date) return;
    let active = true;
    fetchSlots(salon.slug, service.id, staffId, date)
      .then((list) => active && setSlots(list))
      .catch(() => active && setSlots([]));
    return () => {
      active = false;
    };
  }, [salon, service, staffId, date]);

  // Amène l'étape en cours à l'écran après chaque choix
  const stepKey = `${salonSlug}|${serviceId}|${staffId}|${date}|${time}`;
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    currentStep.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepKey]);

  const dayFormat = useMemo(
    () => ({
      weekday: new Intl.DateTimeFormat(locale, { weekday: "short" }),
      day: new Intl.DateTimeFormat(locale, { day: "numeric" }),
      month: new Intl.DateTimeFormat(locale, { month: "short" }),
      full: new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    }),
    [locale],
  );
  const asDate = (ymd: string) => new Date(`${ymd}T12:00:00`);
  const categoryLabel = (category: string) =>
    (t.salon.categories as Record<string, string>)[category] ?? category;

  function chooseSalon(slug: string | null) {
    setSalonSlug(slug);
    setServiceId(null);
    setStaffId(null);
    setDate(null);
    setTime(null);
    setParams(slug ? { salon: slug } : {}, { replace: true });
  }
  function chooseService(id: number | null) {
    setServiceId(id);
    setDate(null);
    setTime(null);
  }
  function chooseStaff(id: number | null) {
    setStaffId(id);
    setDate(null);
    setTime(null);
  }
  function chooseDate(ymd: string | null) {
    setDate(ymd);
    setTime(null);
  }
  function restart() {
    setConfirmation(null);
    chooseSalon(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!salon || !service || staffId === null || !date || !time) return;
    const data = new FormData(event.currentTarget);
    setSending(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const result = await book({
        salon: salon.slug,
        service: service.id,
        staff: staffId,
        date,
        time,
        name: String(data.get("name") ?? ""),
        phone: String(data.get("phone") ?? ""),
        email: String(data.get("email") ?? ""),
        note: String(data.get("note") ?? ""),
        consent: data.get("consent") === "on",
        website: String(data.get("website") ?? ""),
      });
      setConfirmation(result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (error instanceof BookingError && error.status === 409) {
        setFormError(page.slotTaken);
        setTime(null);
        setSlots(null);
        fetchSlots(salon.slug, service.id, staffId, date)
          .then(setSlots)
          .catch(() => setSlots([]));
      } else if (error instanceof BookingError && error.status === 422) {
        setFieldErrors(error.fields);
        setFormError(page.error);
      } else {
        setFormError(page.error);
      }
    } finally {
      setSending(false);
    }
  }

  const intro = (
    <PageIntro
      eyebrow={page.eyebrow}
      title={page.title}
      description={page.description}
    />
  );

  /* ---------- Réservation en ligne non disponible : liens Planity ---------- */
  if (!BOOKING_API || catalogError) {
    return (
      <>
        {intro}
        <section className="page-section">
          <div className="wrap booking-wrap">
            <p className="booking-message">{page.unavailable}</p>
            <ul className="booking-options">
              {salonLocations.map((location) => (
                <li key={location.name}>
                  <a
                    className="booking-option"
                    href={location.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <b>{location.name}</b>
                    <span>{location.city}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </>
    );
  }

  /* ---------- Confirmation ---------- */
  if (confirmation) {
    return (
      <>
        {intro}
        <section className="page-section">
          <div className="wrap booking-wrap">
            <div className="booking-confirmation" role="status">
              <p className="eyebrow">
                {page.reference} · {confirmation.ref}
              </p>
              <h2>{page.confirmedTitle}</h2>
              <p>{page.confirmedText}</p>
              <dl>
                <div>
                  <dt>{page.steps.service}</dt>
                  <dd>{confirmation.service}</dd>
                </div>
                <div>
                  <dt>{page.steps.date}</dt>
                  <dd>
                    {dayFormat.full.format(asDate(confirmation.date))} ·{" "}
                    {confirmation.time.replace(":", "h")}
                  </dd>
                </div>
                {confirmation.staff && (
                  <div>
                    <dt>{page.withStaff}</dt>
                    <dd>{confirmation.staff}</dd>
                  </div>
                )}
                <div>
                  <dt>{page.steps.salon}</dt>
                  <dd>
                    Seven Barbershop {confirmation.salon}
                    <br />
                    <bdi dir="ltr">{confirmation.address}</bdi>
                  </dd>
                </div>
              </dl>
              <p className="booking-note">{page.cancelNote}</p>
              <button
                type="button"
                className="button button-outline"
                onClick={restart}
              >
                {page.another}
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  const cities = [...new Set(catalog?.map((s) => s.city) ?? [])];

  return (
    <>
      {intro}
      <section className="page-section">
        <div className="wrap booking-wrap">
          {!catalog && <p className="booking-message">{page.loading}</p>}

          {/* 1. Salon */}
          {catalog && !salon && (
            <div className="booking-step" ref={currentStep}>
              <StepTitle number={1}>{page.steps.salon}</StepTitle>
              {cities.map((city) => (
                <div key={city} className="booking-group">
                  <h3>{city}</h3>
                  <ul className="booking-options">
                    {catalog
                      .filter((s) => s.city === city)
                      .map((s) => (
                        <li key={s.slug}>
                          <button
                            type="button"
                            className="booking-option"
                            onClick={() => chooseSalon(s.slug)}
                          >
                            <b>{s.name}</b>
                            <span>{s.address}</span>
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {salon && (
            <DoneStep
              label={page.steps.salon}
              value={`${salon.name} · ${salon.city}`}
              onChange={() => chooseSalon(null)}
            />
          )}

          {/* Salon encore sur Planity */}
          {salon && !salon.booking && (
            <div className="booking-step" ref={currentStep}>
              <p className="booking-message">{page.planityOnly(salon.name)}</p>
              <a
                className="button"
                href={salon.planity_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.salon.bookOnPlanity} <span aria-hidden="true">↗</span>
              </a>
            </div>
          )}

          {/* 2. Prestation */}
          {salon?.booking && !service && (
            <div className="booking-step" ref={currentStep}>
              <StepTitle number={2}>{page.steps.service}</StepTitle>
              {[...new Set(salon.services?.map((s) => s.category))].map(
                (category) => (
                  <div key={category} className="booking-group">
                    <h3>{categoryLabel(category)}</h3>
                    <ul className="booking-options booking-services">
                      {salon.services
                        ?.filter((s) => s.category === category)
                        .map((s) => (
                          <li key={s.id}>
                            <button
                              type="button"
                              className="booking-option"
                              onClick={() => chooseService(s.id)}
                            >
                              <b>{s.name}</b>
                              <span>
                                {page.minutes(s.duration)}
                                {s.price && <> · {s.price}</>}
                              </span>
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                ),
              )}
            </div>
          )}
          {service && (
            <DoneStep
              label={page.steps.service}
              value={`${categoryLabel(service.category)} · ${service.name} · ${service.price}`}
              onChange={() => chooseService(null)}
            />
          )}

          {/* 3. Barbier */}
          {service && staffId === null && (
            <div className="booking-step" ref={currentStep}>
              <StepTitle number={3}>{page.steps.staff}</StepTitle>
              <ul className="booking-options booking-staff">
                <li>
                  <button
                    type="button"
                    className="booking-option is-featured"
                    onClick={() => chooseStaff(0)}
                  >
                    <b>{page.anyStaff}</b>
                    <span>{page.anyStaffHint}</span>
                  </button>
                </li>
                {salon?.staff?.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className="booking-option"
                      onClick={() => chooseStaff(s.id)}
                    >
                      <i className="booking-avatar" aria-hidden="true">
                        {s.name.slice(0, 1)}
                      </i>
                      <b>{s.name}</b>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {staffId !== null && (
            <DoneStep
              label={page.steps.staff}
              value={staffName}
              onChange={() => chooseStaff(null)}
            />
          )}

          {/* 4. Jour */}
          {staffId !== null && !date && (
            <div className="booking-step" ref={currentStep}>
              <StepTitle number={4}>{page.steps.date}</StepTitle>
              {!days && <p className="booking-message">{page.loading}</p>}
              {days && !days.some((d) => d.slots > 0) && (
                <p className="booking-message">{page.noDays}</p>
              )}
              {days && days.some((d) => d.slots > 0) && (
                <ul className="booking-days">
                  {days.map((d) => {
                    const day = asDate(d.date);
                    return (
                      <li key={d.date}>
                        <button
                          type="button"
                          className="booking-day"
                          disabled={d.slots === 0}
                          onClick={() => chooseDate(d.date)}
                          aria-label={dayFormat.full.format(day)}
                        >
                          <span>{dayFormat.weekday.format(day)}</span>
                          <b>{dayFormat.day.format(day)}</b>
                          <span>{dayFormat.month.format(day)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
          {date && (
            <DoneStep
              label={page.steps.date}
              value={dayFormat.full.format(asDate(date))}
              onChange={() => chooseDate(null)}
            />
          )}

          {/* 5. Heure */}
          {date && !time && (
            <div className="booking-step" ref={currentStep}>
              <StepTitle number={5}>{page.steps.time}</StepTitle>
              {formError && <p className="form-status is-error">{formError}</p>}
              {!slots && <p className="booking-message">{page.loading}</p>}
              {slots && slots.length === 0 && (
                <p className="booking-message">{page.noSlots}</p>
              )}
              {slots && slots.length > 0 && (
                <ul className="booking-slots">
                  {slots.map((slot) => (
                    <li key={slot}>
                      <button
                        type="button"
                        className="booking-slot"
                        onClick={() => setTime(slot)}
                      >
                        <bdi dir="ltr">{slot.replace(":", "h")}</bdi>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {time && (
            <DoneStep
              label={page.steps.time}
              value={<bdi dir="ltr">{time.replace(":", "h")}</bdi>}
              onChange={() => setTime(null)}
            />
          )}

          {/* 6. Coordonnées */}
          {time && (
            <div className="booking-step" ref={currentStep}>
              <StepTitle number={6}>{page.steps.details}</StepTitle>
              <form
                className="booking-form"
                onSubmit={handleSubmit}
                noValidate={false}
              >
                <div className="field field-full">
                  <label htmlFor="booking-name">{page.name}</label>
                  <input
                    id="booking-name"
                    name="name"
                    autoComplete="name"
                    maxLength={MAX_LENGTH.name}
                    required
                    minLength={2}
                  />
                  {fieldErrors.name && (
                    <small className="field-error">{fieldErrors.name}</small>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="booking-phone">{page.phone}</label>
                  <input
                    id="booking-phone"
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
                  {fieldErrors.phone && (
                    <small className="field-error">{page.phoneHint}</small>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="booking-email">{page.email}</label>
                  <input
                    id="booking-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    dir="ltr"
                    maxLength={MAX_LENGTH.email}
                  />
                </div>
                <div className="field field-full">
                  <label htmlFor="booking-note">{page.note}</label>
                  <textarea
                    id="booking-note"
                    name="note"
                    rows={2}
                    maxLength={600}
                  />
                </div>
                {/* Champ piège pour les robots : invisible, doit rester vide */}
                <div className="booking-trap" aria-hidden="true">
                  <label htmlFor="booking-website">Site web</label>
                  <input
                    id="booking-website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <label className="booking-consent field-full">
                  <input type="checkbox" name="consent" />
                  <span>{page.consent}</span>
                </label>
                <p className="form-disclaimer field-full">{page.privacy}</p>
                {formError && (
                  <p className="form-status is-error field-full">{formError}</p>
                )}
                <button
                  className="button field-full"
                  type="submit"
                  disabled={sending}
                >
                  {sending ? page.submitting : page.submit}
                </button>
              </form>
            </div>
          )}

          <p className="booking-back">
            <Link className="text-link" to="/salons">
              ← {t.nav.salons}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

export default BookingPage;
