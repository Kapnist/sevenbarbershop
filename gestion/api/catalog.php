<?php
/**
 * GET api/catalog.php → salons, prestations et barbiers réservables.
 * Un salon dont la réservation en ligne est fermée est renvoyé avec booking:false et son lien Planity.
 */
declare(strict_types=1);
require dirname(__DIR__) . '/inc/api.php';
api_cors(['GET']);

$out = [];
foreach (salons_list() as $s) {
    $enabled = (int) $s['booking_enabled'] === 1;
    $item = [
        'slug' => $s['slug'],
        'name' => $s['name'],
        'city' => $s['city'],
        'address' => trim("{$s['address']}, {$s['postcode']} {$s['city']}", ', '),
        'booking' => $enabled,
        'planity_url' => $s['planity_url'],
    ];
    if ($enabled) {
        $item['services'] = array_map(fn($r) => [
            'id' => (int) $r['id'],
            'category' => $r['category'],
            'name' => $r['name'],
            'description' => $r['description'],
            'duration' => (int) $r['duration_min'],
            'price' => $r['price_label'],
        ], q('SELECT * FROM services WHERE salon_id = ? AND active = 1 AND bookable = 1 ORDER BY sort, id', [$s['id']])->fetchAll());
        $item['staff'] = array_map(fn($r) => ['id' => (int) $r['id'], 'name' => $r['name']], staff_list((int) $s['id'], true));
    }
    $out[] = $item;
}
json_out(['salons' => $out]);
