<?php
/**
 * GET api/share-image.php?salon=anatole-france&f=anatole-france-devanture
 * Image d'aperçu d'une page salon (WhatsApp, Facebook, Messenger…) : JPEG 1200 × 630.
 * - Si une photo principale a été choisie dans l'espace gérant (emplacement « <salon>.hero »),
 *   elle est recadrée et mise en cache dans uploads/partage/.
 * - Sinon, l'image fixe du site (images/partage/<f>.jpg) est renvoyée telle quelle.
 * Toujours une image, jamais une redirection : certains aperçus ne suivent pas les redirections.
 */
declare(strict_types=1);
require dirname(__DIR__) . '/inc/bootstrap.php';

const SHARE_W = 1200;
const SHARE_H = 630;

$slug = (string) ($_GET['salon'] ?? '');
$fallbackName = (string) ($_GET['f'] ?? 'salon');
if (!preg_match('/^[a-z0-9-]{1,60}$/', $slug)) $slug = '';
if (!preg_match('/^[a-z0-9-]{1,80}$/', $fallbackName)) $fallbackName = 'salon';

/** Image fixe du site React, à la racine de l'hébergement (dossier parent de gestion/). */
function share_fallback(string $name): string
{
    $file = dirname(ROOT) . "/images/partage/$name.jpg";
    return is_file($file) ? $file : dirname(ROOT) . '/images/partage/salon.jpg';
}

function send_jpeg(string $file, int $maxAge): never
{
    if (!is_file($file)) {
        http_response_code(404);
        exit;
    }
    header('Content-Type: image/jpeg');
    header('Content-Length: ' . filesize($file));
    header("Cache-Control: public, max-age=$maxAge");
    header('X-Content-Type-Options: nosniff');
    readfile($file);
    exit;
}

/** Photo principale choisie dans l'espace gérant pour ce salon, ou null. */
function chosen_hero(string $slug): ?array
{
    if ($slug === '' || !is_installed()) return null;
    require_once ROOT . '/inc/booking.php';
    require_once ROOT . '/inc/media.php';
    try {
        foreach (slot_media("$slug.hero") as $row) {
            if (!empty($row['id'])) return $row;
        }
    } catch (Throwable) {
        return null;
    }
    return null;
}

/** Recadre une photo au format 1200 × 630 (centrée, un peu au-dessus du milieu) et l'enregistre en JPEG. */
function make_share_jpeg(string $source, string $target): bool
{
    if (!function_exists('imagecreatefromstring')) return false;
    $data = @file_get_contents($source);
    $img = $data === false ? false : @imagecreatefromstring($data);
    if (!$img) return false;
    $w = imagesx($img);
    $h = imagesy($img);
    $scale = max(SHARE_W / $w, SHARE_H / $h);
    $cropW = (int) round(SHARE_W / $scale);
    $cropH = (int) round(SHARE_H / $scale);
    $x = (int) round(($w - $cropW) / 2);
    $y = (int) round(($h - $cropH) * 0.4);
    $out = imagecreatetruecolor(SHARE_W, SHARE_H);
    imagecopyresampled($out, $img, 0, 0, $x, $y, SHARE_W, SHARE_H, $cropW, $cropH);
    @mkdir(dirname($target), 0755, true);
    $ok = imagejpeg($out, $target . '.tmp', 80) && rename($target . '.tmp', $target);
    return $ok;
}

$hero = chosen_hero($slug);
if ($hero) {
    $source = ROOT . '/' . media_path($hero, 'large');
    if (!is_file($source)) $source = ROOT . '/' . media_path($hero, 'small');
    $cached = ROOT . '/uploads/partage/' . $slug . '-' . (int) $hero['id'] . '.jpg';
    if (is_file($cached) || (is_file($source) && make_share_jpeg($source, $cached))) {
        send_jpeg($cached, 3600);
    }
}
send_jpeg(share_fallback($fallbackName), 3600);
