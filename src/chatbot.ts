/**
 * Chatbot OntaChat (OntaDigital, relié au workflow n8n « Seven Barbershop »).
 * Chargé une fois la page affichée et le navigateur au repos : ses ~500 Ko de scripts
 * ne retardent plus l'affichage, ce qui compte pour la vitesse et le référencement.
 * Les domaines qu'il utilise sont autorisés dans vite.config.ts (CHATBOT_SOURCES).
 */
const CHATBOT = {
  src: "https://www.ontadigital.com/ontachat.js",
  webhook: "https://n8n.ontadigital.com/webhook/f02c2bf1-0d74-49ed-8c16-5fd46a933b67/chat",
  title: "Seven Barbershop",
  subtitle: "Une question sur nos salons ou nos prestations ? Je suis là.",
  welcome:
    "{salutation} 👋 Je suis l'assistant virtuel de Seven Barbershop. Comment puis-je vous aider ?",
  placeholder: "Écrivez votre question…",
  color: "#c8a96e",
  headerColor: "#111b18",
  headerTextColor: "#f4f0e7",
  userTextColor: "#111b18",
};

/** Délai après le chargement de la page avant d'installer le chatbot. */
const DELAY_MS = 2500;

function insertChatbot() {
  const { src, ...data } = CHATBOT;
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  Object.assign(script.dataset, data);
  document.body.appendChild(script);
}

export function loadChatbotWhenIdle() {
  const start = () =>
    window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(insertChatbot, { timeout: 3000 });
      } else {
        insertChatbot();
      }
    }, DELAY_MS);

  if (document.readyState === "complete") {
    start();
  } else {
    window.addEventListener("load", start, { once: true });
  }
}
