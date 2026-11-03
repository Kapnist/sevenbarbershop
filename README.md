# Seven Barbershop — site vitrine

Site officiel de **Seven Barbershop**, salons de barbier haut de gamme à **Saint-Étienne** et **Nice**.
Ambiance club anglais : vert émeraude, or vieilli, fauteuils Chesterfield et billard vintage.

🔗 https://www.sevenbarbershop.fr

## Fonctionnalités

- **Pages** : Accueil, Prestations, Le salon, Nos salons, À propos, Carrières, Contact, et une page 404
- **5 salons**, chacun avec sa propre page (adresse, horaires, photos et lien de réservation Planity) :
  - Saint-Étienne : Anatole France, Jean Jaurès, Place Chavanelle
  - Nice : Le Port, Rue Meyerbeer
- **5 langues** : français, anglais, italien, espagnol et arabe (avec affichage de droite à gauche). La langue est choisie d'après le navigateur, puis mémorisée.
- **Galerie photos** (lookbook) qui s'ouvre en grand dans une fenêtre
- **Formulaires** de contact et de candidature, envoyés par e-mail via [FormSubmit](https://formsubmit.co), avec une protection contre les robots (champ piège et délai minimal de remplissage)
- **Responsive** : mobile, tablette et ordinateur, avec un menu mobile
- **Navigation sans rechargement** grâce à React Router

## SEO et sécurité

À la compilation, `vite.config.ts` génère automatiquement :

- une page HTML par route, avec son titre, sa description, ses balises Open Graph et ses données structurées schema.org (`src/data/seo.ts`) : salons (`HairSalon`) avec adresse, horaires, carte des tarifs et lien de réservation, fil d'Ariane, FAQ ;
- le **contenu pré-rendu** de chaque page, en français (`src/entry-server.tsx` et `scripts/prerender.mjs`) : les moteurs de recherche lisent le texte sans exécuter le JavaScript, puis l'application prend le relais dans le navigateur ;
- une page `404.html` non indexée ;
- le `sitemap.xml`, le `robots.txt` et `assistant.md`, la fiche lue par le chatbot ;
- les en-têtes de sécurité (Content-Security-Policy, HSTS, X-Frame-Options…), sous forme de `.htaccess` pour OVH (Apache) et de `_headers` pour Netlify.

Les robots (Google, Bing, aperçus WhatsApp…) voient toujours le site en français, quelle que soit la langue de leur navigateur.

> La politique de sécurité n'autorise que le site lui-même, FormSubmit et le chatbot (`CHATBOT_SOURCES` dans `vite.config.ts`). Les polices et les images doivent être hébergées dans le projet : pas de Google Fonts, pas d'images externes, pas d'iframe Google Maps.

## Chatbot

Le chatbot OntaChat est configuré dans `src/chatbot.ts` (webhook n8n, textes, couleurs). Il se charge 2,5 secondes après l'affichage de la page, pour ne pas ralentir le site. Il répond à partir de `assistant.md`, régénéré à chaque compilation.

## Technologies

- [React 19](https://react.dev) et TypeScript
- [Vite 6](https://vite.dev)
- [React Router 7](https://reactrouter.com)
- Du CSS sans framework (`src/styles.css`)

## Installation

Prérequis : Node.js 20 ou plus récent.

```bash
npm install
npm run dev       # serveur de développement sur http://localhost:5173
npm run build     # vérification TypeScript puis compilation dans dist/
npm run preview   # aperçu de la version compilée
```

## Structure

```
public/
  images/            Photos des salons, de l'équipe et des réalisations (WebP)
src/
  main.tsx           Point d'entrée
  App.tsx            Routes
  applySeo.ts        Met à jour les balises SEO à chaque changement de page
  components/        Mise en page, galerie, cartes de prestations, envoi des formulaires
  pages/             Une page par route
  data/
    salons.ts        Adresses, horaires et liens de réservation des salons
    salonPages.ts    Contenu des pages de chaque salon
    services.ts      Prix et durées des prestations
    photos.ts        Liste des photos des galeries
    seo.ts           Titres, descriptions, URL du site, sitemap et robots.txt
  i18n/              Traductions (fr, en, it, es, ar)
vite.config.ts       Génération des pages SEO et des en-têtes de sécurité
```

## Modifier le contenu

| Pour changer…                        | Fichier                                           |
| ------------------------------------ | ------------------------------------------------- |
| Prix ou durée d'une prestation       | `src/data/services.ts`                            |
| Nom ou description d'une prestation  | `src/i18n/*.ts` (dans chaque langue)              |
| Adresse, horaires ou lien Planity    | `src/data/salons.ts`                              |
| Photos d'une galerie                 | `public/images/` puis `src/data/photos.ts`        |
| Titres et descriptions SEO           | `src/data/seo.ts`                                 |
| Destinataire des formulaires         | `src/components/useFormSubmit.ts`                 |

## Mise en ligne

### GitHub Pages (version de test)

Le site est publié automatiquement sur https://kapnist.github.io/sevenbarbershop/ à chaque envoi sur la branche `main` (`.github/workflows/deploy.yml`).
Cette version est compilée avec `npm run build:github`, qui place le site dans le sous-dossier `/sevenbarbershop/`.
Dans le code, une image de `public/` s'écrit donc `asset("/images/…")` (voir `src/asset.ts`) plutôt qu'avec un chemin brut.

### OVH (domaine sevenbarbershop.fr)

1. Lancer `npm run build`.
2. Envoyer **le contenu** du dossier `dist/` à la racine de l'hébergement (`www/` chez OVH), sans oublier le fichier caché `.htaccess`.

Le `.htaccess` généré force le HTTPS, sert des adresses propres (`/salons` affiche `salons.html`) et renvoie les autres adresses vers l'application.
Pour rediriger toutes les variantes du domaine vers `https://www.sevenbarbershop.fr`, passer `REDIRECT_TO_SITE_URL` à `true` dans `src/data/seo.ts`.

## Licence

© Seven Barbershop. Tous droits réservés. Le code, les textes, les photos et le logo ne peuvent pas être réutilisés sans autorisation.
