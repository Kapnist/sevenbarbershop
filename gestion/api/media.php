<?php
/** GET api/media.php → photos choisies dans l'espace gérant pour chaque emplacement du site. */
declare(strict_types=1);
require dirname(__DIR__) . '/inc/bootstrap.php';
require dirname(__DIR__) . '/inc/booking.php';
require dirname(__DIR__) . '/inc/media.php';
api_cors(['GET']);

if (!is_installed()) json_out(['slots' => new stdClass()]);
header('Cache-Control: public, max-age=60');
$slots = media_public();
http_response_code(200);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['slots' => $slots ?: new stdClass()], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
