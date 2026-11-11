<?php
/**
 * Médiathèque (comme dans WordPress) : photos envoyées depuis l'espace gérant, puis placées
 * sur les emplacements du site (accueil, pages Le salon / À propos / Carrières, page de chaque salon).
 *
 * Chaque photo est réenregistrée en deux tailles optimisées (640 px et 1600 px de large, WebP),
 * ce qui la redresse (photos de téléphone), retire ses métadonnées (GPS…) et neutralise tout
 * contenu caché. Tant qu'un emplacement n'a pas de photo choisie, le site garde sa photo d'origine.
 */
declare(strict_types=1);

const MEDIA_DIR = 'uploads';
const MEDIA_SIZES = ['small' => 640, 'large' => 1600];
const MEDIA_MAX_BYTES = 32 * 1024 * 1024;
const MEDIA_MAX_PIXELS = 50_000_000; // ~ 8 000 × 6 000 : au-delà, la mémoire du serveur ne suffit pas
const MEDIA_MIMES = ['image/jpeg' => 'jpeg', 'image/png' => 'png', 'image/webp' => 'webp'];

/** Crée les tables de la médiathèque si besoin (installations antérieures comprises). */
function ensure_media_schema(): void
{
    static $done = false;
    if ($done) return;
    $done = true;
    $mysql = db_driver() === 'mysql';
    $id = $mysql ? 'INT UNSIGNED AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
    $fk = $mysql ? 'INT UNSIGNED' : 'INTEGER';
    $tail = $mysql ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci' : '';
    db()->exec("CREATE TABLE IF NOT EXISTS media (
        id $id,
        base VARCHAR(190) NOT NULL,
        ext VARCHAR(5) NOT NULL,
        width INT NOT NULL,
        height INT NOT NULL,
        small_width INT NOT NULL,
        alt VARCHAR(250) NOT NULL DEFAULT '',
        title VARCHAR(120) NOT NULL DEFAULT '',
        caption VARCHAR(250) NOT NULL DEFAULT '',
        original_name VARCHAR(190) NOT NULL DEFAULT '',
        created_at DATETIME NOT NULL
    )$tail");
    db()->exec("CREATE TABLE IF NOT EXISTS media_slots (
        id $id,
        slot VARCHAR(80) NOT NULL,
        media_id $fk NOT NULL,
        sort INT NOT NULL DEFAULT 0
    )$tail");
}

/* ---------- Emplacements du site ---------- */

/** Photos d'origine du site (dans public/images), en vignette 640 px quand elle existe. */
function media_defaults_set(string $folder, array $names, string $suffix = '-640.webp'): array
{
    return array_map(fn($n) => "/images/$folder/$n$suffix", $names);
}

/**
 * Emplacements modifiables. « single » : une photo ; « gallery » : une suite de photos.
 * salon : slug du salon concerné (null = page générale du site, réservée au propriétaire).
 * defaults : photos d'origine affichées par le site (mêmes fichiers que dans le code React).
 */
function media_slots(): array
{
    static $slots = null;
    if ($slots !== null) return $slots;
    $slots = [
        'home.spirit' => ['group' => 'Accueil', 'label' => "Photo « L'esprit Seven »", 'type' => 'single', 'salon' => null,
            'help' => "À côté du texte de présentation, sur la page d'accueil.", 'defaults' => ['/images/meyerbeer/photo-5.webp']],
        'site.realisations' => ['group' => 'Accueil', 'label' => 'Réalisations (coupes et barbes)', 'type' => 'gallery', 'salon' => null,
            'help' => "Les 3 premières sur l'accueil, toutes sur la page « Le salon ».",
            'defaults' => media_defaults_set('realisations', ['burst-fade-et-barbe', 'degrade-bas-et-barbe-taillee', 'low-taper-cheveux-ondules', 'taper-coiffe-en-arriere', 'low-fade-cheveux-boucles', 'taper-cheveux-boucles'])],
        'salon.interior' => ['group' => 'Page « Le salon »', 'label' => 'Photo principale', 'type' => 'single', 'salon' => null,
            'help' => "En haut de la page, à côté de l'histoire du salon.", 'defaults' => ['/images/salon/salon-billard-fauteuils-cuir-640.webp']],
        'salon.team' => ['group' => 'Page « Le salon »', 'label' => "L'équipe au travail", 'type' => 'gallery', 'salon' => null,
            'help' => 'Mosaïque : la première photo est affichée en grand.',
            'defaults' => media_defaults_set('equipe', ['barbier-seven-barbershop', 'rasage-coupe-chou', 'coupe-courte-degrade', 'barbiers-au-travail-billard', 'equipe-seven-barbershop'])],
        'salon.details' => ['group' => 'Page « Le salon »', 'label' => 'Les détails du lieu', 'type' => 'gallery', 'salon' => null,
            'help' => 'Bas de la page : enseigne, fauteuils, produits…',
            'defaults' => ['/images/salon/salon-billard-fauteuils-cuir-640.webp', '/images/salon/devanture-enseigne-seven-barber-shop-640.webp', '/images/equipe/polo-trust-your-barber-640.webp', '/images/salon/produits-soin-barbe-640.webp']],
        'about.brand' => ['group' => 'Pages « À propos » et « Carrières »', 'label' => 'Photo de la page À propos', 'type' => 'single', 'salon' => null,
            'help' => 'Photo verticale de préférence.', 'defaults' => ['/images/equipe/polo-trust-your-barber-640.webp']],
        'careers.hero' => ['group' => 'Pages « À propos » et « Carrières »', 'label' => 'Grande photo de la page Carrières', 'type' => 'single', 'salon' => null,
            'help' => "Bandeau en haut de la page, sur toute la largeur de l'écran.", 'defaults' => ['/images/equipe/equipe-seven-barbershop-1200.webp']],
    ];
    $salonDefaults = [
        'anatole-france' => ['/images/anatole-france/devanture.webp', ['interieur', 'equipe', 'photo-3', 'photo-4', 'salon-cuir']],
        'jean-jaures' => ['/images/jean-jaures/photo-1.webp', ['photo-2', 'photo-5', 'photo-4', 'photo-6']],
        'chavanelle' => ['/images/chavanelle/photo-1.webp', ['photo-2', 'photo-3', 'photo-4', 'photo-5', 'photo-6']],
        'le-port' => ['/images/le-port/photo-1.webp', ['photo-1', 'photo-2']],
        'meyerbeer' => ['/images/meyerbeer/photo-2.webp', ['photo-5', 'photo-4', 'photo-1', 'photo-3', 'photo-6']],
    ];
    foreach (salons_list() as $s) {
        [$hero, $gallery] = $salonDefaults[$s['slug']] ?? [null, []];
        $group = 'Salon ' . $s['name'] . ' · ' . $s['city'];
        $slots[$s['slug'] . '.hero'] = ['group' => $group, 'label' => 'Photo principale du salon', 'type' => 'single', 'salon' => $s['slug'],
            'help' => 'En haut de la page du salon, et sur les cartes « Nos salons » et de l\'accueil.', 'defaults' => $hero ? [$hero] : []];
        $slots[$s['slug'] . '.gallery'] = ['group' => $group, 'label' => 'Galerie du salon', 'type' => 'gallery', 'salon' => $s['slug'],
            'help' => 'Section « Le salon en images » de sa page.', 'defaults' => media_defaults_set($s['slug'], $gallery, '.webp')];
    }
    return $slots;
}

/** L'utilisateur peut-il modifier cet emplacement ? (propriétaire : tout ; responsable : son salon) */
function can_edit_slot(array $user, string $slot): bool
{
    $def = media_slots()[$slot] ?? null;
    if (!$def) return false;
    if ($user['is_owner']) return true;
    if ($def['salon'] === null) return false;
    $own = salon_by_id((int) $user['salon_id']);
    return $own && $own['slug'] === $def['salon'];
}

/* ---------- Fichiers ---------- */

function media_root(): string
{
    return ROOT . '/' . MEDIA_DIR;
}

/** Chemin public d'une taille, relatif au dossier gestion/ (« uploads/2026/11/coupe-ab12cd-640.webp »). */
function media_path(array $m, string $size = 'small'): string
{
    return $m['base'] . '-' . MEDIA_SIZES[$size] . '.' . $m['ext'];
}

/** Explique une erreur d'envoi PHP en français. */
function upload_error_message(int $code, string $name): string
{
    return match ($code) {
        UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => "« $name » est trop lourde pour le serveur (limite : " . ini_get('upload_max_filesize') . ').',
        UPLOAD_ERR_PARTIAL => "« $name » n'a été envoyée qu'en partie : réessayez.",
        UPLOAD_ERR_NO_FILE => 'Aucune photo choisie.',
        default => "« $name » n'a pas pu être enregistrée (erreur $code).",
    };
}

/** Nom de fichier lisible et sûr, à partir du nom d'origine (« Coupe été.JPG » → « coupe-ete »). */
function media_slug(string $name): string
{
    $name = mb_strtolower(pathinfo($name, PATHINFO_FILENAME));
    // Table explicite : iconv translittère différemment selon le système (« é » → « 'e » sous Windows)
    $ascii = strtr($name, [
        'à' => 'a', 'â' => 'a', 'ä' => 'a', 'á' => 'a', 'ã' => 'a', 'å' => 'a', 'æ' => 'ae', 'ç' => 'c',
        'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e', 'í' => 'i', 'ì' => 'i', 'î' => 'i', 'ï' => 'i',
        'ñ' => 'n', 'ó' => 'o', 'ò' => 'o', 'ô' => 'o', 'ö' => 'o', 'õ' => 'o', 'œ' => 'oe',
        'ú' => 'u', 'ù' => 'u', 'û' => 'u', 'ü' => 'u', 'ý' => 'y', 'ÿ' => 'y', 'ß' => 'ss',
    ]);
    $slug = trim((string) preg_replace('/[^a-z0-9]+/', '-', $ascii), '-');
    return substr($slug ?: 'photo', 0, 60);
}

/** Redresse une photo de téléphone selon son orientation EXIF. */
function media_orient(GdImage $img, string $file, string $mime): GdImage
{
    if ($mime !== 'image/jpeg' || !function_exists('exif_read_data')) return $img;
    $exif = @exif_read_data($file);
    $angle = match ((int) ($exif['Orientation'] ?? 1)) { 3 => 180, 6 => -90, 8 => 90, default => 0 };
    if ($angle === 0) return $img;
    $rotated = imagerotate($img, $angle, 0);
    return $rotated ?: $img;
}

/** Réduit l'image à $width de large au plus (jamais agrandie). */
function media_resize(GdImage $img, int $width): GdImage
{
    $w = imagesx($img);
    $h = imagesy($img);
    if ($w <= $width) return $img;
    $nh = max(1, (int) round($h * $width / $w));
    $out = imagecreatetruecolor($width, $nh);
    imagealphablending($out, false);
    imagesavealpha($out, true);
    imagecopyresampled($out, $img, 0, 0, 0, 0, $width, $nh, $w, $h);
    return $out;
}

/**
 * Enregistre une photo envoyée et renvoie sa ligne dans la médiathèque.
 * @throws InvalidArgumentException si le fichier n'est pas une photo exploitable
 */
function media_store(string $tmp, string $originalName, string $alt = ''): array
{
    if (!extension_loaded('gd')) throw new RuntimeException("Le module d'images de PHP (GD) n'est pas activé sur le serveur.");
    $label = mb_substr(basename($originalName), 0, 120);
    if (!is_uploaded_file($tmp) && !is_file($tmp)) throw new InvalidArgumentException("« $label » est introuvable.");
    if (filesize($tmp) > MEDIA_MAX_BYTES) throw new InvalidArgumentException("« $label » dépasse 32 Mo.");
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($tmp) ?: '';
    if (!isset(MEDIA_MIMES[$mime])) throw new InvalidArgumentException("« $label » n'est pas une photo JPEG, PNG ou WebP.");
    $info = @getimagesize($tmp);
    if (!$info || $info[0] < 1 || $info[1] < 1) throw new InvalidArgumentException("« $label » est illisible.");
    if ($info[0] * $info[1] > MEDIA_MAX_PIXELS) throw new InvalidArgumentException("« $label » est trop grande (plus de 50 mégapixels).");

    $img = match ($mime) {
        'image/jpeg' => @imagecreatefromjpeg($tmp),
        'image/png' => @imagecreatefrompng($tmp),
        'image/webp' => @imagecreatefromwebp($tmp),
    };
    if (!$img) throw new InvalidArgumentException("« $label » est illisible.");
    if (!imageistruecolor($img)) imagepalettetotruecolor($img);
    imagealphablending($img, false);
    imagesavealpha($img, true);
    $img = media_orient($img, $tmp, $mime);

    $ext = function_exists('imagewebp') ? 'webp' : 'jpg';
    $dir = MEDIA_DIR . '/' . now()->format('Y/m');
    if (!is_dir(ROOT . '/' . $dir) && !@mkdir(ROOT . '/' . $dir, 0755, true)) {
        throw new RuntimeException("Impossible de créer le dossier des photos sur le serveur ($dir).");
    }
    $base = $dir . '/' . media_slug($originalName) . '-' . bin2hex(random_bytes(3));

    $sizes = [];
    foreach (MEDIA_SIZES as $key => $width) {
        $out = media_resize($img, $width);
        $file = ROOT . '/' . $base . '-' . $width . '.' . $ext;
        $ok = $ext === 'webp' ? imagewebp($out, $file, 82) : imagejpeg($out, $file, 85);
        if (!$ok) throw new RuntimeException("« $label » n'a pas pu être enregistrée sur le serveur.");
        $sizes[$key] = [imagesx($out), imagesy($out)];
    }

    q('INSERT INTO media (base, ext, width, height, small_width, alt, title, caption, original_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        $base, $ext, $sizes['large'][0], $sizes['large'][1], $sizes['small'][0],
        mb_substr($alt, 0, 250), '', '', $label, now()->format('Y-m-d H:i:s'),
    ]);
    return media_get((int) db()->lastInsertId());
}

function media_get(int $id): ?array
{
    ensure_media_schema();
    return q('SELECT * FROM media WHERE id = ?', [$id])->fetch() ?: null;
}

function media_all(): array
{
    ensure_media_schema();
    return q('SELECT * FROM media ORDER BY created_at DESC, id DESC')->fetchAll();
}

/** Supprime une photo de la médiathèque, de ses emplacements et du disque. */
function media_delete(int $id): void
{
    $m = media_get($id);
    if (!$m) return;
    q('DELETE FROM media_slots WHERE media_id = ?', [$id]);
    q('DELETE FROM media WHERE id = ?', [$id]);
    foreach (array_keys(MEDIA_SIZES) as $size) {
        $file = ROOT . '/' . media_path($m, $size);
        // Garde-fou : on ne supprime que dans le dossier des photos envoyées
        if (str_starts_with(realpath($file) ?: '', realpath(media_root()) ?: "\0")) @unlink($file);
    }
}

/* ---------- Photos placées sur les emplacements ---------- */

/** Photos d'un emplacement, dans l'ordre. */
function slot_media(string $slot): array
{
    ensure_media_schema();
    return q('SELECT m.*, ms.id AS link_id, ms.sort FROM media_slots ms JOIN media m ON m.id = ms.media_id WHERE ms.slot = ? ORDER BY ms.sort, ms.id', [$slot])->fetchAll();
}

/** Emplacements où une photo est utilisée (pour la médiathèque). */
function media_usage(): array
{
    ensure_media_schema();
    $out = [];
    foreach (q('SELECT media_id, slot FROM media_slots')->fetchAll() as $r) $out[(int) $r['media_id']][] = $r['slot'];
    return $out;
}

function slot_set_single(string $slot, int $mediaId): void
{
    q('DELETE FROM media_slots WHERE slot = ?', [$slot]);
    q('INSERT INTO media_slots (slot, media_id, sort) VALUES (?, ?, 10)', [$slot, $mediaId]);
}

function slot_add(string $slot, array $mediaIds): int
{
    $max = (int) q('SELECT COALESCE(MAX(sort), 0) FROM media_slots WHERE slot = ?', [$slot])->fetchColumn();
    $already = array_map('intval', q('SELECT media_id FROM media_slots WHERE slot = ?', [$slot])->fetchAll(PDO::FETCH_COLUMN));
    $n = 0;
    foreach ($mediaIds as $id) {
        if (in_array($id, $already, true) || !media_get($id)) continue;
        $max += 10;
        q('INSERT INTO media_slots (slot, media_id, sort) VALUES (?, ?, ?)', [$slot, $id, $max]);
        $already[] = $id;
        $n++;
    }
    return $n;
}

/** Déplace une photo d'une galerie d'un cran (-1 : avant, +1 : après). */
function slot_move(string $slot, int $linkId, int $dir): void
{
    $rows = q('SELECT id FROM media_slots WHERE slot = ? ORDER BY sort, id', [$slot])->fetchAll(PDO::FETCH_COLUMN);
    $rows = array_map('intval', $rows);
    $i = array_search($linkId, $rows, true);
    $j = $i === false ? false : $i + $dir;
    if ($i === false || $j < 0 || $j >= count($rows)) return;
    [$rows[$i], $rows[$j]] = [$rows[$j], $rows[$i]];
    foreach ($rows as $k => $id) q('UPDATE media_slots SET sort = ? WHERE id = ?', [($k + 1) * 10, $id]);
}

/** Données publiques pour le site : emplacement → photos (chemins relatifs au dossier gestion/). */
function media_public(): array
{
    ensure_media_schema();
    $out = [];
    $rows = q('SELECT ms.slot, m.* FROM media_slots ms JOIN media m ON m.id = ms.media_id ORDER BY ms.slot, ms.sort, ms.id')->fetchAll();
    foreach ($rows as $m) {
        $out[$m['slot']][] = [
            'src' => media_path($m, 'small'),
            'large' => media_path($m, 'large'),
            'smallWidth' => (int) $m['small_width'],
            'width' => (int) $m['width'],
            'height' => (int) $m['height'],
            'alt' => $m['alt'],
            'title' => $m['title'],
            'caption' => $m['caption'],
        ];
    }
    return $out;
}
