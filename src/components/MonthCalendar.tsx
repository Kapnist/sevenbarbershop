import { useMemo, useState } from "react";
import type { BookingDay } from "../data/booking";

/** « 2026-11-20 » → Date à midi (évite les décalages de fuseau horaire). */
function asDate(ymd: string): Date {
  return new Date(`${ymd}T12:00:00`);
}

function toYmd(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

/** Clé de mois « 2026-11 ». */
function monthKey(ymd: string): string {
  return ymd.slice(0, 7);
}

/**
 * Calendrier du mois pour choisir le jour du rendez-vous : une ligne par semaine (lundi → dimanche).
 * Les jours sans créneau libre, passés ou hors de la période de réservation sont grisés.
 */
function MonthCalendar({
  days,
  locale,
  onSelect,
  labels,
}: {
  days: BookingDay[];
  locale: string;
  onSelect: (ymd: string) => void;
  labels: { previous: string; next: string };
}) {
  const slotsByDate = useMemo(
    () => new Map(days.map((d) => [d.date, d.slots])),
    [days],
  );
  const months = useMemo(
    () => [...new Set(days.map((d) => monthKey(d.date)))],
    [days],
  );
  const firstOpen = days.find((d) => d.slots > 0)?.date ?? days[0]?.date;
  const [month, setMonth] = useState(() =>
    firstOpen ? monthKey(firstOpen) : months[0],
  );

  const format = useMemo(
    () => ({
      title: new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }),
      weekday: new Intl.DateTimeFormat(locale, { weekday: "short" }),
      full: new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    }),
    [locale],
  );

  // En-têtes lundi → dimanche (le 2 novembre 2026 est un lundi)
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    format.weekday.format(asDate(`2026-11-0${2 + i}`)),
  );

  // Semaines du mois affiché : cases vides avant le 1er pour commencer un lundi
  const [year, monthNumber] = month.split("-").map(Number);
  const first = new Date(year, monthNumber - 1, 1, 12);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const cells: (string | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      toYmd(new Date(year, monthNumber - 1, i + 1, 12)),
    ),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) =>
    cells.slice(i * 7, i * 7 + 7),
  );

  const index = months.indexOf(month);
  const openThisMonth = days.some(
    (d) => monthKey(d.date) === month && d.slots > 0,
  );
  const today = toYmd(new Date());

  return (
    <div className="calendar">
      <div className="calendar-head">
        <button
          type="button"
          className="calendar-nav"
          onClick={() => setMonth(months[index - 1])}
          disabled={index <= 0}
          aria-label={labels.previous}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <h3 className="calendar-title" aria-live="polite">
          {format.title.format(first)}
        </h3>
        <button
          type="button"
          className="calendar-nav"
          onClick={() => setMonth(months[index + 1])}
          disabled={index >= months.length - 1}
          aria-label={labels.next}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <table className="calendar-grid">
        <thead>
          <tr>
            {weekdays.map((name) => (
              <th key={name} scope="col">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, w) => (
            <tr key={w}>
              {week.map((ymd, d) => {
                if (!ymd) return <td key={d} />;
                const slots = slotsByDate.get(ymd) ?? 0;
                const classes = [
                  "calendar-day",
                  slots > 0 ? "is-open" : "",
                  ymd === today ? "is-today" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <td key={d}>
                    <button
                      type="button"
                      className={classes}
                      disabled={slots === 0}
                      onClick={() => onSelect(ymd)}
                      aria-label={format.full.format(asDate(ymd))}
                    >
                      {Number(ymd.slice(8))}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {!openThisMonth && index < months.length - 1 && (
        <button
          type="button"
          className="text-link calendar-next-hint"
          onClick={() => setMonth(months[index + 1])}
        >
          {labels.next} →
        </button>
      )}
    </div>
  );
}

export default MonthCalendar;
