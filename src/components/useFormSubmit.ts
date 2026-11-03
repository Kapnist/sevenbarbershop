import { useRef, useState } from "react";

/**
 * Identifiant aléatoire fourni par FormSubmit après l'activation de la boîte de réception.
 * Une fois renseigné, l'adresse Gmail n'apparaît plus du tout dans le site publié.
 */
const FORMSUBMIT_ALIAS = "";
// En attendant, l'adresse est découpée pour ne pas figurer en clair dans le code publié.
const MAILBOX = ["sevenanatol", "gmail.com"];

/** Destinataire des formulaires, relayés par FormSubmit. */
export const FORMSUBMIT_ID = FORMSUBMIT_ALIAS || MAILBOX.join("@");

/** Accepte 06 12 34 56 78, +33 6 12 34 56 78 ou 06.12.34.56.78. */
export const PHONE_PATTERN = "[0-9\\+\\(\\)\\.\\s\\-]{10,20}";

/** Longueurs maximales des champs, pour limiter les envois abusifs. */
export const MAX_LENGTH = { name: 100, email: 150, url: 300, message: 3000 };

export type FormState = "idle" | "sending" | "sent" | "error";

// Un humain met plusieurs secondes à remplir un formulaire ; un robot, presque rien.
const MIN_FILL_TIME = 3000;

/**
 * Repère les envois automatisés : champ piège rempli, ou formulaire envoyé
 * trop vite après l'affichage de la page.
 */
export function useBotGuard() {
  const shownAt = useRef(Date.now());

  return function isSuspicious(form: HTMLFormElement): boolean {
    const honeypot = new FormData(form).get("_honey");
    return Boolean(honeypot) || Date.now() - shownAt.current < MIN_FILL_TIME;
  };
}

/** Envoie un formulaire par courriel via FormSubmit et suit l'état de l'envoi. */
export function useFormSubmit(subject: string) {
  const [state, setState] = useState<FormState>("idle");
  const isSuspicious = useBotGuard();

  async function submit(fields: Record<string, unknown>, form: HTMLFormElement) {
    // Un robot reçoit la même réponse qu'un humain, mais rien n'est envoyé.
    if (isSuspicious(form)) {
      form.reset();
      setState("sent");
      return true;
    }

    setState("sending");
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...fields,
          _honey: "",
          _subject: subject,
          _template: "table",
        }),
      });

      if (!response.ok) {
        throw new Error(`FormSubmit a répondu ${response.status}`);
      }

      form.reset();
      setState("sent");
      return true;
    } catch {
      setState("error");
      return false;
    }
  }

  return { state, submit };
}
