<?php
/** GET api/days.php?salon=slug&service=ID[&staff=ID] → jours ouverts et nombre de créneaux libres */
declare(strict_types=1);
require dirname(__DIR__) . '/inc/api.php';
api_cors(['GET']);

$salon = api_salon((string) ($_GET['salon'] ?? ''));
$service = api_service($salon, (int) ($_GET['service'] ?? 0));
$staffId = api_staff($salon, (int) ($_GET['staff'] ?? 0));

json_out(['days' => booking_days($salon, (int) $service['duration_min'], $staffId)]);
