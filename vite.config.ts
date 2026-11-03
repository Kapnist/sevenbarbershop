import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import {
  REDIRECT_TO_SITE_URL,
  SITE_URL,
  renderHeadTags,
  renderRobots,
  renderSitemap,
  seoRoutes,
} from "./src/data/seo";

const SEO_BLOCK = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;

function withSeo(html: string, path: string): string {
  return html.replace(
    SEO_BLOCK,
    `<!--seo:start-->\n    ${renderHeadTags(path)}\n    <!--seo:end-->`,
  );
}

// Génère une page HTML par route avec ses balises SEO, ainsi que sitemap.xml et robots.txt.
function seoPages(): Plugin {
  return {
    name: "seven-seo-pages",
    enforce: "post",
    transformIndexHtml(html, context) {
      const path = (context.originalUrl ?? "/").split(/[?#]/)[0];
      return withSeo(html, path.length > 1 ? path.replace(/\/+$/, "") : "/");
    },
    generateBundle(_options, bundle) {
      const index = bundle["index.html"];
      if (!index || index.type !== "asset") {
        this.error("index.html est introuvable dans le bundle.");
      }
      const template = String(index.source);

      for (const route of seoRoutes) {
        if (route === "/") {
          continue;
        }
        this.emitFile({
          type: "asset",
          fileName: `${route.slice(1)}.html`,
          source: withSeo(template, route),
        });
      }

      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: renderSitemap(new Date().toISOString().split("T")[0]),
      });
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: renderRobots(),
      });
    },
  };
}

// Politique de sécurité du contenu : seuls le site lui-même et FormSubmit (envoi des formulaires) sont autorisés.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  // Les styles en ligne servent au cadrage des photos (object-position).
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://formsubmit.co",
  "form-action 'self' https://formsubmit.co",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
];

// Directives refusées dans une balise <meta> : uniquement dans les en-têtes HTTP.
const HEADER_ONLY_POLICY = ["frame-ancestors 'none'", "upgrade-insecure-requests"];

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": [...CONTENT_SECURITY_POLICY, ...HEADER_ONLY_POLICY].join("; "),
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Cross-Origin-Opener-Policy": "same-origin",
};

function renderNetlifyHeaders(): string {
  const lines = Object.entries(SECURITY_HEADERS).map(
    ([name, value]) => `  ${name}: ${value}`,
  );
  return `/*\n${lines.join("\n")}\n`;
}

// Pensé pour l'hébergement mutualisé OVH (Apache).
function renderHtaccess(): string {
  const headers = Object.entries(SECURITY_HEADERS)
    .map(([name, value]) => `  Header always set ${name} "${value}"`)
    .join("\n");
  const canonicalHost = SITE_URL.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const hostRedirect = REDIRECT_TO_SITE_URL
    ? `  # Domaine principal : toute autre adresse redirige vers ${SITE_URL}.
  RewriteCond %{HTTP_HOST} !^${canonicalHost.replace(/\./g, "\\.")}$ [NC]
  RewriteRule ^(.*)$ ${SITE_URL}/$1 [R=301,L]
`
    : "";

  return `# Généré à la compilation par vite.config.ts : ne pas modifier à la main.
Options -Indexes

<IfModule mod_headers.c>
${headers}
  # Les pages sont toujours revérifiées ; les fichiers versionnés restent en cache un an.
  <FilesMatch "\\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType text/javascript "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/webp "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/jpeg "access plus 1 month"
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json image/svg+xml application/xml text/xml text/plain
</IfModule>

<IfModule mod_dir.c>
  DirectorySlash Off
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On
  # HTTPS obligatoire (méthode recommandée par OVH pour l'hébergement mutualisé).
  RewriteCond %{SERVER_PORT} 80
  RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]
${hostRedirect}  # Adresses propres : /salons sert salons.html.
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME}.html -f
  RewriteRule ^(.+?)/?$ $1.html [L]
  # Toute autre adresse est confiée à l'application (page 404 comprise).
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^ index.html [L]
</IfModule>

# Fichiers cachés et extensions serveur : jamais servis.
<FilesMatch "(^\\.|\\.(php|phtml|phar|sql|env|log|ini|sh|bak|old)$)">
  Require all denied
</FilesMatch>
`;
}

// Ajoute la politique de sécurité dans chaque page et les fichiers d'en-têtes des hébergeurs.
function securityHeaders(): Plugin {
  return {
    name: "seven-security-headers",
    apply: "build",
    transformIndexHtml() {
      return [
        {
          tag: "meta",
          attrs: {
            "http-equiv": "Content-Security-Policy",
            content: CONTENT_SECURITY_POLICY.join("; "),
          },
          injectTo: "head-prepend",
        },
        {
          tag: "meta",
          attrs: { name: "referrer", content: "strict-origin-when-cross-origin" },
          injectTo: "head-prepend",
        },
      ];
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "_headers", source: renderNetlifyHeaders() });
      this.emitFile({ type: "asset", fileName: ".htaccess", source: renderHtaccess() });
    },
  };
}

export default defineConfig({
  plugins: [react(), securityHeaders(), seoPages()],
});
