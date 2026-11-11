<?php
/** POST api/book.php (JSON) → crée un rendez-vous si le créneau est libre */
declare(strict_types=1);
require dirname(__DIR__) . '/inc/api.php';
api_cors(['POST']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['error' => 'Méthode non autorisée.'], 405);

$in = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($in)) json_out(['error' => 'Requête invalide.'], 400);

// Pot de miel anti-robots : champ invisible qui doit rester vide
if (!empty($in['website'])) json_out(['ok' => true, 'ref' => '------']);

// Limite : 5 réservations par adresse IP et par heure
if (rate_limited('book', 5, 3600)) json_out(['error' => 'Trop de réservations depuis cet appareil. Appelez le salon ou réessayez plus tard.'], 429);

$salon = api_salon((string) ($in['salon'] ?? ''));

$errors = [];
$name = trim((string) ($in['name'] ?? ''));
$phone = normalize_phone((string) ($in['phone'] ?? ''));
$email = trim((string) ($in['email'] ?? ''));
$note = mb_substr(trim((string) ($in['note'] ?? '')), 0, 600);
$date = (string) ($in['date'] ?? '');
$time = (string) ($in['time'] ?? '');
$consent = !empty($in['consent']);

if (mb_strlen($name) < 2 || mb_strlen($name) > 120) $errors['name'] = 'Indiquez votre nom.';
if (!$phone) $errors['phone'] = 'Numéro français attendu, par exemple 06 12 34 56 78.';
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Adresse e-mail invalide.';
if (!valid_date($date) || !valid_time($time)) $errors['slot'] = 'Choisissez un créneau.';
if ($errors) json_out(['error' => 'Vérifiez le formulaire.', 'fields' => $errors], 422);

$service = api_service($salon, (int) ($in['service'] ?? 0));
$staffId = api_staff($salon, (int) ($in['staff'] ?? 0));

$client = ['name' => $name, 'phone' => $phone, 'email' => $email, 'note' => $note, 'consent' => $consent];
try {
    $appt = create_appointment($salon, $service, $date, $time, $client, $staffId);
} catch (InvalidArgumentException $ex) {
    json_out(['error' => $ex->getMessage(), 'fields' => ['slot' => $ex->getMessage()]], 409);
}
rate_hit('book');
notify_new_booking($salon, $appt, $service, $client);
notify_client($salon, $appt, $service, $client);

json_out([
    'ok' => true,
    'ref' => $appt['ref'],
    'salon' => $salon['name'],
    'address' => trim("{$salon['address']}, {$salon['postcode']} {$salon['city']}", ', '),
    'service' => service_label($service),
    'staff' => $appt['staff_name'],
    'date' => $date,
    'time' => $time,
    'duration' => (int) $service['duration_min'],
    'token' => cancel_token($appt['ref']),
]);
