<?php
/** Outils communs de l'API publique (api/*.php). */
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/booking.php';

if (!is_installed()) json_out(['error' => "La réservation en ligne n'est pas encore installée."], 503);

/** Salon demandé (?salon=slug ou champ JSON « salon »), ouvert à la réservation en ligne. */
function api_salon(?string $slug): array
{
    $salon = $slug ? salon_by_slug($slug) : null;
    if (!$salon) json_out(['error' => 'Salon introuvable.'], 404);
    if ((int) $salon['booking_enabled'] !== 1) {
        json_out(['error' => "Ce salon ne prend pas encore les rendez-vous sur le site.", 'planity_url' => $salon['planity_url']], 409);
    }
    return $salon;
}

function api_service(array $salon, int $serviceId): array
{
    $service = q('SELECT * FROM services WHERE id = ? AND salon_id = ? AND active = 1 AND bookable = 1', [$serviceId, $salon['id']])->fetch();
    if (!$service) json_out(['error' => 'Prestation introuvable.'], 404);
    return $service;
}

/** Barbier choisi (0 ou absent : sans préférence). */
function api_staff(array $salon, int $staffId): ?int
{
    if ($staffId === 0) return null;
    if (!q('SELECT 1 FROM staff WHERE id = ? AND salon_id = ? AND active = 1 AND bookable = 1', [$staffId, $salon['id']])->fetchColumn()) {
        json_out(['error' => 'Barbier introuvable.'], 404);
    }
    return $staffId;
}
