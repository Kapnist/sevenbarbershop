/**
 * Adresse d'un fichier de public/ (par exemple "/images/logo.webp"), préfixée par
 * le dossier où le site est publié : "/" sur le domaine, "/sevenbarbershop/" sur GitHub Pages.
 */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}
