# Seven Barbershop : réservation en ligne et espace gérant

Le dossier `gestion/` contient la réservation en ligne et l'espace gérant. Il est écrit en PHP et MySQL, sans framework ni compilation. Il s'installe sur l'hébergement OVH, à côté du site React. Il est adapté du moteur de Dramey Style et étendu à plusieurs salons.

- **Clients** : ils réservent sur `/reservation` du site Seven, sans créer de compte. Les étapes sont : salon, prestation, barbier (ou « sans préférence »), jour, heure, puis nom et téléphone. Seuls les créneaux réellement libres sont proposés.
- **Gérants** : ils travaillent sur `/gestion/admin/`. On y trouve :
  - l'agenda du jour, avec une colonne par barbier ;
  - les barbiers et leur planning de la semaine, leurs absences et leurs congés ;
  - les horaires et les fermetures de chaque salon ;
  - les prestations et les prix ;
  - la liste des rendez-vous, exportable en Excel ;
  - le **fichier clients** : visites, absences, consentement aux relances, export, effacement ;
  - les **statistiques** : rendez-vous, chiffre d'affaires estimé, remplissage, absences, barbiers, prestations, jours et heures de pointe, comparaison des salons (propriétaire) ;
  - les salons ;
  - les accès gérants.
- **Annulation en ligne** : après sa réservation, le client reçoit un lien signé (à l'écran et dans l'e-mail de confirmation). Il peut annuler lui-même jusqu'au délai de prévenance du salon (*Horaires & réservation*). Le créneau est libéré et le salon reçoit un e-mail.

## Accès

| Accès | Ce qu'il voit |
|---|---|
| **Propriétaire** | Tous les salons. Il peut aussi ajouter un salon en un clic et créer les accès des responsables. |
| **Responsable de salon** | Seulement son salon : agenda, barbiers, horaires, prix et rendez-vous. |
| **Barbiers** | Pas de compte. Le gérant règle leur planning dans *Barbiers*. |

## Installation sur OVH (une seule fois)

1. **Créer une base MySQL** dans l'espace client OVH (*Hébergements*, puis *Bases de données*, puis *Créer une base*). Notez le serveur, le nom de la base, l'utilisateur et le mot de passe.
2. **Compiler le site** avec `npm run build`. Le dossier `dist/` contient alors le site **et** `dist/gestion/`.
3. **Envoyer le contenu de `dist/`** dans le dossier `www/` de l'hébergement, par FTP avec FileZilla. N'oubliez pas les fichiers cachés `.htaccess`.
4. **Lancer l'installation** en ouvrant `https://www.sevenbarbershop.fr/gestion/install.php`. Choisissez MySQL, saisissez les identifiants de la base, puis le prénom, l'e-mail et le mot de passe du propriétaire. Les 5 salons sont alors créés, avec leurs barbiers, leurs horaires et leurs prestations.
5. **Supprimer `gestion/install.php`** du serveur par FTP. C'est important pour la sécurité.
6. **Se connecter** sur `https://www.sevenbarbershop.fr/gestion/admin/`.

Le fichier `gestion/config.php`, créé par l'installation, contient le mot de passe de la base. Il n'est jamais servi au navigateur, et il ne faut pas l'envoyer sur GitHub (il est dans `.gitignore`).

## Passer un salon de Planity au site, sans risque

Les clients réservent sur le site depuis le bouton **« Réserver »** de l'en-tête, l'accueil, la page Prestations, le pied de page et chaque page salon.

À l'installation, la case « Les clients réservent sur le site Seven dans les 5 salons dès maintenant » est **cochée par défaut**. Décochez-la pour garder Planity et ouvrir les salons un par un. Plus tard, le propriétaire peut tout ouvrir ou tout fermer en un clic dans *Salons*. Un salon fermé renvoie vers Planity.

Pour passer un salon de Planity au site sans risque :

1. Dans *Barbiers*, vérifiez les prénoms et le planning de chacun.
2. Dans *Prestations & prix*, vérifiez les durées : elles servent à calculer les créneaux. Pour Chavanelle, la carte d'Anatole France a été reprise : ajustez-la.
3. Recopiez dans l'agenda les rendez-vous déjà pris sur Planity pour les jours à venir. Vous pouvez aussi bloquer ces créneaux.
4. Dans *Horaires & réservation*, cochez « Les clients réservent ce salon sur le site Seven ». Le bouton du site change aussitôt.
5. Fermez les réservations de ce salon sur Planity pour éviter les doubles réservations. Les deux plannings ne se synchronisent pas.

Commencez par un salon pilote, puis passez les autres.

## Ajouter un salon

Allez dans *Salons*, puis *Ajouter un salon*. Indiquez le nom, la ville et l'adresse, puis choisissez le salon dont reprendre les horaires et la carte. Ajoutez ensuite ses barbiers et ouvrez sa réservation. Le salon apparaît aussitôt sur la page de réservation du site.

Sa **page vitrine** (une page `/salons/…` avec photos et texte) est différente : elle s'ajoute dans le code du site React.

## Fichier clients et consentement

Chaque réservation crée ou met à jour une fiche client (nom, téléphone, e-mail). La case « J'accepte que Seven Barbershop me contacte… » enregistre le consentement et sa date. Seuls ces clients pourront être relancés, comme l'exige la loi française (CNIL).

Dans *Clients*, le filtre « Relances acceptées » et l'export Excel donnent la liste des clients qu'on a le droit de relancer. Retirez le consentement dès qu'un client le demande. Le propriétaire peut aussi **effacer** un client : ses coordonnées sont retirées de tous ses rendez-vous, mais les statistiques restent justes.

## E-mails

Les e-mails partent de `noreply@<votre domaine>`, comme OVH l'exige. Pour utiliser une autre adresse du domaine, ajoutez `'mail_from' => 'contact@sevenbarbershop.fr'` dans `config.php`. Les liens d'annulation utilisent l'adresse du site (`site_url` dans `config.php`, sinon le domaine de la requête).

## Pour les développeurs

- **API publique** (JSON) :
  - `api/catalog.php` donne les salons, les prestations et les barbiers ;
  - `api/days.php` et `api/slots.php` donnent les jours et les créneaux libres ;
  - `api/book.php` (POST) crée la réservation et renvoie le jeton d'annulation ;
  - `api/cancel.php` (GET : détail, POST : annulation) avec `ref` et le jeton `t`.
- **Appel depuis un autre domaine** : un site sur un autre domaine (par exemple la version de test sur GitHub Pages) doit figurer dans `config.php`, rubrique `allowed_origins`.
- **Site React** : l'API est appelée sur `/gestion/api` (même domaine). `VITE_BOOKING_API` (dans `.env.production`) permet de viser un autre domaine. Si l'API ne répond pas, les boutons « Réserver » restent sur Planity.
- **Compilation** : `npm run build` copie `gestion/` dans `dist/gestion/` (sans `config.php` ni la base de test, via `scripts/copy-gestion.mjs`).
- **Données de départ** : `inc/seed.json` est généré à partir des données du site avec `npm run seed`.
- **Test en local** : `npm run php` lance le serveur PHP sur le port 8000, puis `npm run dev`. Vite relaie `/gestion` vers PHP. Ouvrez `http://localhost:5173/gestion/install.php` et choisissez SQLite.
- **Tests automatiques** :
  - `npm test` : tests d'intégration de l'API et de l'espace gérant, sur un vrai serveur PHP avec une base SQLite jetable ;
  - `npm run test:e2e` : parcours de réservation dans Chrome, annulation, et contrôle responsive de toutes les pages de 320 à 1440 px (site et espace gérant) ;
  - PHP doit être dans le PATH, ou indiqué par `PHP_BIN=C:\chemin\php.exe`.
- **Sécurité** :
  - mots de passe hachés, connexion bloquée après 5 essais ratés ;
  - jeton anti-CSRF et requêtes SQL préparées ;
  - verrou contre les doubles réservations sur un même créneau ;
  - limite de 5 réservations par heure et par appareil, et champ piège pour les robots ;
  - aucun script dans les pages, ce qui respecte la politique de sécurité du site.
