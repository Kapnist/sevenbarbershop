import { getHeadTags } from "./data/seo";

function upsert<T extends HTMLElement>(
  selector: string,
  create: () => T,
): T {
  const existing = document.head.querySelector<T>(selector);
  if (existing) {
    return existing;
  }
  const element = create();
  document.head.appendChild(element);
  return element;
}

// Met à jour les balises déjà présentes dans le HTML pré-généré plutôt que d'en ajouter.
export function applySeo(path: string) {
  const tags = getHeadTags(path);
  document.title = tags.title;

  for (const meta of tags.meta) {
    upsert(`meta[${meta.key}="${meta.id}"]`, () => {
      const element = document.createElement("meta");
      element.setAttribute(meta.key, meta.id);
      return element;
    }).setAttribute("content", meta.content);
  }

  upsert('link[rel="canonical"]', () => {
    const element = document.createElement("link");
    element.rel = "canonical";
    return element;
  }).setAttribute("href", tags.canonical);

  upsert("#structured-data", () => {
    const element = document.createElement("script");
    element.type = "application/ld+json";
    element.id = "structured-data";
    return element;
  }).textContent = tags.jsonLd;
}
