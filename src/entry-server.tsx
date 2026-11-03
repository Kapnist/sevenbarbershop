import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App";
import { I18nProvider } from "./i18n";

export { seoRoutes } from "./data/seo";

/**
 * Pré-rendu à la compilation (scripts/prerender.mjs) : le contenu de chaque page est écrit
 * dans son fichier HTML, en français, pour les moteurs de recherche et les navigateurs sans JavaScript.
 */
export function render(path: string): string {
  const location = `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
  return renderToString(
    <StrictMode>
      <I18nProvider initialLanguage="fr">
        <StaticRouter location={location} basename={import.meta.env.BASE_URL}>
          <App />
        </StaticRouter>
      </I18nProvider>
    </StrictMode>,
  );
}
