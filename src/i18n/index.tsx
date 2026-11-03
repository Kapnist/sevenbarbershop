import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ar } from "./ar";
import { en } from "./en";
import { es } from "./es";
import { fr, type Dictionary } from "./fr";
import { it } from "./it";

export const languages = [
  { code: "fr", label: "Français", locale: "fr-FR", dir: "ltr" },
  { code: "en", label: "English", locale: "en-GB", dir: "ltr" },
  { code: "it", label: "Italiano", locale: "it-IT", dir: "ltr" },
  { code: "es", label: "Español", locale: "es-ES", dir: "ltr" },
  // Chiffres latins, comme l'usage au Maghreb et en France.
  { code: "ar", label: "العربية", locale: "ar-u-nu-latn", dir: "rtl" },
] as const;

export type Language = (typeof languages)[number]["code"];

const dictionaries: Record<Language, Dictionary> = { fr, en, it, es, ar };
const STORAGE_KEY = "seven-language";

function isLanguage(value: string | null | undefined): value is Language {
  return languages.some((language) => language.code === value);
}

function readStoredLanguage(): Language | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLanguage(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** Robots des moteurs de recherche et des aperçus de liens : ils doivent voir le site en français. */
const CRAWLER = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|lighthouse/i;

/** Choix mémorisé du visiteur, sinon première langue du navigateur prise en charge. */
function detectLanguage(): Language {
  if (typeof navigator !== "undefined" && CRAWLER.test(navigator.userAgent)) return "fr";

  const stored = readStoredLanguage();
  if (stored) return stored;

  const preferred =
    typeof navigator === "undefined"
      ? []
      : navigator.languages?.length
        ? navigator.languages
        : [navigator.language];

  for (const tag of preferred) {
    const base = tag?.toLowerCase().split("-")[0];
    if (isLanguage(base)) return base;
  }
  return "fr";
}

interface I18nValue {
  language: Language;
  locale: string;
  dir: "ltr" | "rtl";
  t: Dictionary;
  setLanguage: (language: Language) => void;
  formatNumber: (value: number, fractionDigits?: number) => string;
  formatPrice: (price: Price) => string;
  formatHours: (openingHours: string[]) => { open: string[]; closed: string };
}

import type { Price } from "../data/price";

export type { Price };

const I18nContext = createContext<I18nValue | null>(null);

const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function I18nProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  /** Langue imposée : le pré-rendu des pages à la compilation est toujours en français. */
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(
    () => initialLanguage ?? detectLanguage(),
  );
  const { locale, dir } = languages.find((item) => item.code === language)!;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const value = useMemo<I18nValue>(() => {
    const t = dictionaries[language];
    const euro = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    });

    function parseTime(time: string): string {
      const [hours, minutes] = time.split(":").map(Number);
      return t.format.time(hours, minutes);
    }

    return {
      language,
      locale,
      dir,
      t,
      setLanguage(next) {
        setLanguageState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // Stockage indisponible (navigation privée) : le choix vaut pour la visite.
        }
      },
      formatNumber(value, fractionDigits = 0) {
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        }).format(value);
      },
      formatPrice(price) {
        if (price === "quote") return t.format.onQuote;
        if (typeof price === "number") return euro.format(price);
        if (Array.isArray(price)) {
          return `${euro.format(price[0])} – ${euro.format(price[1])}`;
        }
        return t.format.from(euro.format(price.from));
      },
      formatHours(openingHours) {
        const openDays = new Set<string>();
        const open = openingHours.map((entry) => {
          const [days, times] = entry.split(" ");
          const [opens, closes] = times.split("-");
          const [first, last = first] = days.split("-");
          weekDays
            .slice(weekDays.indexOf(first), weekDays.indexOf(last) + 1)
            .forEach((day) => openDays.add(day));
          return t.hours.open(
            t.hours.days[weekDays.indexOf(first)],
            t.hours.days[weekDays.indexOf(last)],
            parseTime(opens),
            parseTime(closes),
          );
        });
        const closedDays = weekDays
          .map((day, index) => (openDays.has(day) ? null : t.hours.days[index]))
          .filter((day): day is string => day !== null);

        return {
          open,
          closed: closedDays.length ? t.hours.closed(closedDays) : "",
        };
      },
    };
  }, [language, locale, dir]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n doit être utilisé dans un I18nProvider.");
  }
  return value;
}
