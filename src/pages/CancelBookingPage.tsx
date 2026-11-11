import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BookingError, cancelBooking, fetchCancelInfo, type CancelInfo } from "../data/booking";
import PageIntro from "../components/PageIntro";
import { useI18n } from "../i18n";

type State = "loading" | "ready" | "cancelling" | "cancelled" | "invalid" | "tooLate" | "error";

/** Annulation en ligne par le client, depuis le lien reçu à la réservation ou par e-mail. */
function CancelBookingPage() {
  const { t, locale } = useI18n();
  const b = t.booking;
  const [params] = useSearchParams();
  const ref = params.get("ref") ?? "";
  const token = params.get("t") ?? "";
  const [info, setInfo] = useState<CancelInfo | null>(null);
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!ref || !token) {
      setState("invalid");
      return;
    }
    fetchCancelInfo(ref, token)
      .then((result) => {
        setInfo(result);
        if (result.status === "cancelled") setState("invalid");
        else setState(result.cancellable ? "ready" : "tooLate");
      })
      .catch((err) => setState(err instanceof BookingError && err.status === 0 ? "error" : "invalid"));
  }, [ref, token]);

  const fullDate = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }),
    [locale],
  );

  async function confirm() {
    setState("cancelling");
    try {
      await cancelBooking(ref, token);
      setState("cancelled");
    } catch (err) {
      setState(err instanceof BookingError && err.status === 409 ? "tooLate" : "error");
    }
  }

  const message: Partial<Record<State, string>> = {
    loading: b.loading,
    invalid: b.cancelInvalid,
    tooLate: b.cancelTooLate,
    error: b.error,
  };

  return (
    <>
      <PageIntro eyebrow={b.cancelEyebrow} title={state === "cancelled" ? b.cancelledTitle : b.cancelTitle} description={state === "cancelled" ? b.cancelledText : b.cancelText} />
      <section className="page-section">
        <div className="wrap booking-wrap">
          {message[state] && <p className="booking-message">{message[state]}</p>}

          {info && state !== "invalid" && (
            <div className="booking-confirmation">
              <p className="eyebrow">
                {b.reference} · {info.ref}
              </p>
              <dl>
                <div>
                  <dt>{b.steps.service}</dt>
                  <dd>{info.service}</dd>
                </div>
                <div>
                  <dt>{b.steps.date}</dt>
                  <dd>
                    {fullDate.format(new Date(`${info.date}T12:00:00`))} ·{" "}
                    <bdi dir="ltr">{info.time.replace(":", "h")}</bdi>
                  </dd>
                </div>
                {info.staff && (
                  <div>
                    <dt>{b.withStaff}</dt>
                    <dd>{info.staff}</dd>
                  </div>
                )}
                <div>
                  <dt>{b.steps.salon}</dt>
                  <dd>
                    Seven Barbershop {info.salon}
                    <br />
                    <bdi dir="ltr">{info.address}</bdi>
                  </dd>
                </div>
              </dl>
              {(state === "ready" || state === "cancelling") && (
                <div className="booking-confirmation-actions">
                  <button type="button" className="button button-danger" onClick={confirm} disabled={state === "cancelling"}>
                    {state === "cancelling" ? b.cancelling : b.cancelConfirm}
                  </button>
                  <Link className="button button-outline" to="/">
                    {b.cancelKeep}
                  </Link>
                </div>
              )}
            </div>
          )}

          <p className="booking-back">
            <Link className="text-link" to="/reservation">
              {state === "cancelled" ? b.another : t.booking.cta} →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

export default CancelBookingPage;
