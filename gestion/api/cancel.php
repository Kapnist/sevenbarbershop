<?php
/**
 * Annulation en ligne par le client, avec le lien signé reçu à la réservation.
 * GET  api/cancel.php?ref=XXXXXX&t=JETON  → détail du rendez-vous et possibilité d'annuler
 * POST api/cancel.php {"ref": "...", "t": "..."} → annule le rendez-vous
 */
declare(strict_types=1);
require dirname(__DIR__) . '/inc/api.php';
api_cors(['GET', 'POST']);

$post = $_SERVER['REQUEST_METHOD'] === 'POST';
if (!$post && $_SERVER['REQUEST_METHOD'] !== 'GET') json_out(['error' => 'Méthode non autorisée.'], 405);

$in = $post ? (json_decode(file_get_contents('php://input') ?: '', true) ?: []) : $_GET;
$ref = strtoupper(trim((string) ($in['ref'] ?? '')));
$token = trim((string) ($in['t'] ?? ''));

// Limite les essais de jetons : 30 par heure et par appareil
if (rate_limited('cancel', 30, 3600)) json_out(['error' => 'Trop de tentatives. Réessayez plus tard.'], 429);

if (!cancel_token_valid($ref, $token) || !($appt = appointment_by_ref($ref))) {
    rate_hit('cancel');
    json_out(['error' => "Lien d'annulation invalide."], 404);
}
$salon = salon_by_id((int) $appt['salon_id']);
if (!$salon) json_out(['error' => 'Salon introuvable.'], 404);

$cancellable = client_can_cancel($appt, $salon);

if ($post) {
    if ($appt['status'] === 'cancelled') json_out(['ok' => true]);
    if (!$cancellable) json_out(['error' => "Il est trop tard pour annuler en ligne. Appelez le salon."], 409);
    cancel_by_client($appt, $salon);
    json_out(['ok' => true]);
}

json_out([
    'ref' => $appt['ref'],
    'salon' => $salon['name'],
    'address' => trim("{$salon['address']}, {$salon['postcode']} {$salon['city']}", ', '),
    'service' => $appt['service_name'],
    'staff' => (string) ($appt['staff_name'] ?? ''),
    'date' => substr($appt['start_at'], 0, 10),
    'time' => substr($appt['start_at'], 11, 5),
    'status' => $appt['status'],
    'cancellable' => $cancellable,
]);
