<?php
/** GET api/slots.php?salon=slug&service=ID&date=YYYY-MM-DD[&staff=ID] → créneaux libres */
declare(strict_types=1);
require dirname(__DIR__) . '/inc/api.php';
api_cors(['GET']);

$salon = api_salon((string) ($_GET['salon'] ?? ''));
$service = api_service($salon, (int) ($_GET['service'] ?? 0));
$staffId = api_staff($salon, (int) ($_GET['staff'] ?? 0));
$date = (string) ($_GET['date'] ?? '');
if (!valid_date($date)) json_out(['error' => 'Date invalide.'], 400);

json_out([
    'date' => $date,
    'label' => fmt_date_fr($date),
    'slots' => array_keys(available_slots($salon, $date, (int) $service['duration_min'], $staffId)),
]);
