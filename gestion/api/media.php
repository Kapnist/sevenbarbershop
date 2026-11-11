<?php
/** GET api/media.php → photos choisies dans l'espace gérant pour chaque emplacement du site. */
declare(strict_types=1);
require dirname(__DIR__) . '/inc/bootstrap.php';
require dirname(__DIR__) . '/inc/booking.php';
require dirname(__DIR__) . '/inc/media.php';
api_cors(['GET']);

if (!is_installed()) json_out(['slots' => new stdClass()]);
// Jamais de cache : une photo changée dans l'espace gérant apparaît dès le rechargement de la page.
// (Les fichiers des photos, eux, ont un nom unique et restent en cache longtemps.)
json_out(['slots' => media_public() ?: new stdClass()]);
