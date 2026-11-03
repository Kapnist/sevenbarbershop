import { fr } from "../i18n/fr";
import { salonLocations, type SalonLocation } from "./salons";

// Domaine principal : le .com doit rediriger (301) vers cette adresse.
export const SITE_URL = "https://www.sevenbarbershop.fr";
/**
 * À passer à true une fois le domaine définitif branché sur l'hébergement OVH :
 * toute autre adresse (sans www, .com…) redirigera alors vers SITE_URL.
 */
export const REDIRECT_TO_SITE_URL = false;
export const SITE_NAME = "Seven Barbershop";
const DEFAULT_IMAGE = "/images/salon.png";
const LOGO = "/images/logo-seven.webp";

interface PageSeo {
  title: string;
  description: string;
  image?: string;
  breadcrumb?: string;
}

const pageSeo: Record<string, PageSeo> = {
  "/": {
    title: "Seven Barbershop — Barbier à Saint-Étienne et Nice",
    description:
      "Seven Barbershop, barbier à Saint-Étienne et Nice : coupe, taille de barbe, rasage à l'ancienne et soins. 5 salons, réservation en ligne 24h/24.",
  },
  "/prestations": {
    title: "Prestations et tarifs barbier — Seven Barbershop",
    description:
      "Coupe dès 14 €, barbe dès 10 €, rasage à l'ancienne, coupe et barbe, soins, vanilles et coloration sur rendez-vous. Découvrez la carte Seven Barbershop.",
    breadcrumb: "Prestations",
  },
  "/salon": {
    title: "L'équipe et nos réalisations — Seven Barbershop",
    description:
      "Burst fade, low taper, dégradés et barbes taillées : découvrez les réalisations et l'équipe Seven Barbershop, barbier à Saint-Étienne et Nice.",
    image: "/images/realisations/burst-fade-et-barbe-1200.webp",
    breadcrumb: "Le salon",
  },
  "/salons": {
    title: "Nos 5 barbiers à Saint-Étienne et Nice — Seven Barbershop",
    description:
      "Trouvez votre barbier Seven : Anatole France, Jean Jaurès et Chavanelle à Saint-Étienne, Le Port et Meyerbeer à Nice. Réservation en ligne 24h/24.",
    breadcrumb: "Nos salons",
  },
  "/a-propos": {
    title: "À propos de Seven Barbershop — Trust your barber",
    description:
      "Seven Barbershop, ce sont 5 salons de barbier à Saint-Étienne et Nice dans l'esprit The Old French School : savoir-faire, écoute et tradition du barbier.",
    breadcrumb: "À propos",
  },
  "/carrieres": {
    title: "Recrutement barbier Saint-Étienne & Nice — Seven Barbershop",
    description:
      "Barbier confirmé ou en devenir ? Rejoignez l'équipe Seven Barbershop à Saint-Étienne ou à Nice : transmission du métier, salons soignés, clientèle fidèle.",
    image: "/images/equipe/equipe-seven-barbershop-1200.webp",
    breadcrumb: "Carrières",
  },
  "/contact": {
    title: "Contact et suggestions — Seven Barbershop",
    description:
      "Une question ou une suggestion ? Écrivez à l'équipe Seven Barbershop, votre barbier à Saint-Étienne et Nice. Chaque message est lu.",
    breadcrumb: "Contact",
  },
  "/salons/anatole-france": {
    title: "Barbier Saint-Étienne Anatole France — Seven Barbershop",
    description:
      "Barbier au 12 rue du 11 Novembre, Saint-Étienne : coupe dès 14 €, barbe, rasage à l'ancienne. Du lundi au samedi, réservation en ligne 24h/24.",
  },
  "/salons/jean-jaures": {
    title: "Barbier Saint-Étienne Jean Jaurès — Seven Barbershop",
    description:
      "Barbier au 1 place Jean Jaurès, Saint-Étienne : coupe dès 18 €, coupe et barbe dès 25 €, soins serviette chaude. Du mardi au samedi, réservation en ligne.",
  },
  "/salons/chavanelle": {
    title: "Barbier Saint-Étienne Chavanelle — Seven Barbershop",
    description:
      "Barbier au 17 place Chavanelle, Saint-Étienne : coupe, barbe et soins dans un cadre soigné. Du lundi au samedi, réservation en ligne 24h/24.",
  },
  "/salons/le-port": {
    title: "Barbier Nice Le Port — Seven Barbershop",
    description:
      "Barbier au 1 boulevard Carnot, sur le port de Nice : coupe dès 20 €, barbe dès 20 €, coupe et barbe dès 35 €. Du mardi au samedi, réservation en ligne.",
  },
  "/salons/meyerbeer": {
    title: "Barbier Nice Meyerbeer — Seven Barbershop",
    description:
      "Barbier au 4 rue Meyerbeer, Nice : coupe dès 20 €, barbe, coupe et barbe, défrisage et lissage. Du lundi au samedi, réservation en ligne 24h/24.",
  },
};

const notFoundSeo: PageSeo = {
  title: "Page introuvable — Seven Barbershop",
  description: "Cette page n'existe pas. Retrouvez nos salons de barbier à Saint-Étienne et Nice.",
};

export const seoRoutes = Object.keys(pageSeo);

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

const organizationId = absoluteUrl("/#organization");
const websiteId = absoluteUrl("/#website");

function salonForPath(path: string): SalonLocation | undefined {
  return salonLocations.find((location) => location.detailsPath === path);
}

function salonId(salon: SalonLocation): string {
  return absoluteUrl(`${salon.detailsPath}#salon`);
}

function salonSchema(salon: SalonLocation) {
  return {
    "@type": "HairSalon",
    "@id": salonId(salon),
    name: `${SITE_NAME} ${salon.name}`,
    url: absoluteUrl(salon.detailsPath ?? "/salons"),
    image: salon.image ? absoluteUrl(salon.image) : undefined,
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: salon.streetAddress,
      postalCode: salon.postalCode,
      addressLocality: salon.city,
      addressRegion: salon.region,
      addressCountry: "FR",
    },
    openingHours: salon.openingHours,
    sameAs: salon.bookingUrl ? [salon.bookingUrl] : undefined,
    parentOrganization: { "@id": organizationId },
  };
}

const organizationSchema = {
  "@type": "Organization",
  "@id": organizationId,
  name: SITE_NAME,
  url: absoluteUrl("/"),
  logo: absoluteUrl(LOGO),
  slogan: "Trust your barber",
  areaServed: ["Saint-Étienne", "Nice"],
};

const websiteSchema = {
  "@type": "WebSite",
  "@id": websiteId,
  name: SITE_NAME,
  url: absoluteUrl("/"),
  inLanguage: "fr-FR",
  publisher: { "@id": organizationId },
};

function breadcrumbSchema(path: string) {
  const items = [{ name: "Accueil", path: "/" }];
  const salon = salonForPath(path);

  if (salon) {
    items.push({ name: "Nos salons", path: "/salons" });
    items.push({ name: salon.name, path });
  } else if (pageSeo[path]?.breadcrumb) {
    items.push({ name: pageSeo[path].breadcrumb!, path });
  }

  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function structuredData(path: string): object[] {
  const graph: object[] = [organizationSchema, websiteSchema];
  const salon = salonForPath(path);

  if (path !== "/") {
    graph.push(breadcrumbSchema(path));
  }

  if (salon) {
    graph.push(salonSchema(salon));
  }

  if (path === "/" || path === "/salons") {
    graph.push(...salonLocations.filter((location) => location.detailsPath).map(salonSchema));
  }

  if (path === "/a-propos") {
    graph.push(
      {
        "@type": "AboutPage",
        "@id": absoluteUrl("/a-propos#page"),
        url: absoluteUrl("/a-propos"),
        name: pageSeo["/a-propos"].title,
        description: pageSeo["/a-propos"].description,
        inLanguage: "fr-FR",
        isPartOf: { "@id": websiteId },
        about: { "@id": organizationId },
      },
      {
        "@type": "FAQPage",
        mainEntity: fr.about.faq.map((entry) => ({
          "@type": "Question",
          name: entry.question,
          acceptedAnswer: { "@type": "Answer", text: entry.answer },
        })),
      },
    );
  }

  return graph;
}

export interface HeadTags {
  title: string;
  meta: { key: "name" | "property"; id: string; content: string }[];
  canonical: string;
  jsonLd: string;
}

export function getHeadTags(path: string): HeadTags {
  const known = pageSeo[path];
  const seo = known ?? notFoundSeo;
  const salon = salonForPath(path);
  const image = absoluteUrl(seo.image ?? salon?.image ?? DEFAULT_IMAGE);
  const url = absoluteUrl(known ? path : "/");

  return {
    title: seo.title,
    canonical: url,
    meta: [
      { key: "name", id: "description", content: seo.description },
      {
        key: "name",
        id: "robots",
        content: known ? "index, follow, max-image-preview:large" : "noindex, follow",
      },
      { key: "property", id: "og:type", content: "website" },
      { key: "property", id: "og:locale", content: "fr_FR" },
      { key: "property", id: "og:site_name", content: SITE_NAME },
      { key: "property", id: "og:title", content: seo.title },
      { key: "property", id: "og:description", content: seo.description },
      { key: "property", id: "og:url", content: url },
      { key: "property", id: "og:image", content: image },
      { key: "name", id: "twitter:card", content: "summary_large_image" },
      { key: "name", id: "twitter:title", content: seo.title },
      { key: "name", id: "twitter:description", content: seo.description },
      { key: "name", id: "twitter:image", content: image },
    ],
    jsonLd: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": structuredData(path),
    }).replace(/</g, "\\u003c"),
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Balises <head> statiques, injectées à la compilation dans chaque page. */
export function renderHeadTags(path: string): string {
  const tags = getHeadTags(path);
  return [
    `<title>${escapeHtml(tags.title)}</title>`,
    ...tags.meta.map(
      (meta) => `<meta ${meta.key}="${meta.id}" content="${escapeHtml(meta.content)}" />`,
    ),
    `<link rel="canonical" href="${tags.canonical}" />`,
    `<script type="application/ld+json" id="structured-data">${tags.jsonLd}</script>`,
  ].join("\n    ");
}

export function renderSitemap(lastModified: string): string {
  const urls = seoRoutes
    .map(
      (path) =>
        `  <url>\n    <loc>${absoluteUrl(path)}</loc>\n    <lastmod>${lastModified}</lastmod>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function renderRobots(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`;
}
