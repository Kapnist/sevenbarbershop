<?php
/**
 * Planning et réservation, salon par salon : horaires du jour, créneaux libres,
 * création de rendez-vous, fichier clients.
 */
declare(strict_types=1);

const APPT_STATUSES = [
    'confirmed' => 'Confirmé',
    'done' => 'Venu',
    'noshow' => 'Absent',
    'cancelled' => 'Annulé',
];

const APPT_SOURCES = [
    'web' => 'En ligne',
    'admin' => 'Au salon',
    'ai' => 'Assistant IA',
];

/* ---------- Salons ---------- */

function salons_list(): array
{
    static $rows = null;
    if ($rows === null) $rows = q('SELECT * FROM salons ORDER BY sort, id')->fetchAll();
    return $rows;
}

function salon_by_id(int $id): ?array
{
    foreach (salons_list() as $s) if ((int) $s['id'] === $id) return $s;
    return null;
}

function salon_by_slug(string $slug): ?array
{
    foreach (salons_list() as $s) if ($s['slug'] === $slug) return $s;
    return null;
}

/* ---------- Horaires ---------- */

function weekly_hours(int $salonId): array
{
    static $cache = [];
    if (!isset($cache[$salonId])) {
        $cache[$salonId] = [];
        foreach (q('SELECT * FROM opening_hours WHERE salon_id = ? ORDER BY weekday', [$salonId])->fetchAll() as $r) {
            $cache[$salonId][(int) $r['weekday']] = $r;
        }
    }
    return $cache[$salonId];
}

function exception_for(int $salonId, string $date): ?array
{
    static $cache = [];
    $key = "$salonId|$date";
    if (!array_key_exists($key, $cache)) {
        $cache[$key] = q('SELECT * FROM schedule_exceptions WHERE salon_id = ? AND day = ?', [$salonId, $date])->fetch() ?: null;
    }
    return $cache[$key];
}

/**
 * Horaires effectifs d'un salon à une date (exceptions comprises).
 * @return array{open:string,close:string,break_start:?string,break_end:?string,note:string}|null  null = fermé
 */
function day_schedule(int $salonId, string $date): ?array
{
    $ex = exception_for($salonId, $date);
    if ($ex) {
        if ((int) $ex['is_closed'] === 1 || !$ex['open_time'] || !$ex['close_time']) return null;
        return ['open' => $ex['open_time'], 'close' => $ex['close_time'], 'break_start' => null, 'break_end' => null, 'note' => $ex['note']];
    }
    $w = (int) (new DateTimeImmutable($date))->format('w');
    $h = weekly_hours($salonId)[$w] ?? null;
    if (!$h || (int) $h['is_open'] !== 1) return null;
    return [
        'open' => $h['open_time'],
        'close' => $h['close_time'],
        'break_start' => $h['break_start'] ?: null,
        'break_end' => $h['break_end'] ?: null,
        'note' => '',
    ];
}

/** Rendez-vous d'un salon sur une journée (annulés exclus par défaut). */
function day_appointments(int $salonId, string $date, bool $includeCancelled = false): array
{
    $sql = 'SELECT * FROM appointments WHERE salon_id = ? AND start_at >= ? AND start_at < ?'
        . ($includeCancelled ? '' : " AND status <> 'cancelled'") . ' ORDER BY start_at, id';
    $next = (new DateTimeImmutable($date))->modify('+1 day')->format('Y-m-d');
    return q($sql, [$salonId, $date . ' 00:00:00', $next . ' 00:00:00'])->fetchAll();
}

/** Première et dernière date réservables en ligne pour un salon. */
function booking_window(array $salon): array
{
    $today = now()->format('Y-m-d');
    if ($salon['booking_mode'] === 'until' && valid_date((string) $salon['booking_until'])) {
        $last = $salon['booking_until'];
    } else {
        $last = now()->modify('+' . max(0, (int) $salon['booking_days_ahead']) . ' days')->format('Y-m-d');
    }
    $max = now()->modify('+365 days')->format('Y-m-d');
    return [$today, min($last, $max)];
}

/* ---------- Équipe ---------- */

function staff_list(int $salonId, bool $onlyBookable = false): array
{
    return q('SELECT * FROM staff WHERE salon_id = ? AND active = 1' . ($onlyBookable ? ' AND bookable = 1' : '') . ' ORDER BY sort, id', [$salonId])->fetchAll();
}

function staff_hours_map(): array
{
    static $map = null;
    if ($map === null) {
        $map = [];
        foreach (q('SELECT * FROM staff_hours')->fetchAll() as $r) $map[(int) $r['staff_id']][(int) $r['weekday']] = $r;
    }
    return $map;
}

/** Plage de travail d'un barbier à une date (en minutes), ou null s'il ne travaille pas. */
function staff_window(int $salonId, int $staffId, string $date): ?array
{
    $sch = day_schedule($salonId, $date);
    if (!$sch) return null;
    $w = (int) (new DateTimeImmutable($date))->format('w');
    $h = staff_hours_map()[$staffId][$w] ?? null;
    if (!$h || (int) $h['is_working'] !== 1) return null;
    $start = max(to_min($sch['open']), to_min($h['start_time']));
    $end = min(to_min($sch['close']), to_min($h['end_time']));
    return $end > $start ? [$start, $end] : null;
}

/** Intervalles occupés (rendez-vous, blocages, pause) d'un barbier à une date, en minutes. */
function staff_busy(int $salonId, int $staffId, string $date, ?int $ignoreAppointmentId = null): array
{
    $dayStart = $date . ' 00:00:00';
    $dayEnd = (new DateTimeImmutable($date))->modify('+1 day')->format('Y-m-d') . ' 00:00:00';
    $clip = function (string $s, string $e) use ($dayStart, $dayEnd): array {
        $a = $s < $dayStart ? 0 : to_min(substr($s, 11, 5));
        $b = $e >= $dayEnd ? 24 * 60 : to_min(substr($e, 11, 5));
        return [$a, $b];
    };
    $busy = [];
    $appts = q("SELECT id, start_at, end_at FROM appointments WHERE staff_id = ? AND status <> 'cancelled' AND start_at < ? AND end_at > ?", [$staffId, $dayEnd, $dayStart])->fetchAll();
    foreach ($appts as $r) {
        if ($ignoreAppointmentId !== null && (int) $r['id'] === $ignoreAppointmentId) continue;
        $busy[] = $clip($r['start_at'], $r['end_at']);
    }
    $blocks = q('SELECT start_at, end_at FROM blocks WHERE salon_id = ? AND (staff_id = ? OR staff_id IS NULL) AND start_at < ? AND end_at > ?', [$salonId, $staffId, $dayEnd, $dayStart])->fetchAll();
    foreach ($blocks as $r) $busy[] = $clip($r['start_at'], $r['end_at']);
    $sch = day_schedule($salonId, $date);
    if ($sch && $sch['break_start'] && $sch['break_end']) $busy[] = [to_min($sch['break_start']), to_min($sch['break_end'])];
    return $busy;
}

/** Minute à partir de laquelle on peut réserver ce jour-là (délai de prévenance). */
function min_start_for(array $salon, string $date): int
{
    $today = now()->format('Y-m-d');
    if ($date !== $today) return $date < $today ? PHP_INT_MAX : 0;
    $n = now()->modify('+' . (int) $salon['booking_min_notice_h'] . ' hours');
    return $n->format('Y-m-d') > $date ? PHP_INT_MAX : to_min($n->format('H:i'));
}

function booking_open_for(array $salon, string $date): bool
{
    if ((int) $salon['booking_enabled'] !== 1) return false;
    [$first, $last] = booking_window($salon);
    return $date >= $first && $date <= $last;
}

/** Créneaux libres d'un barbier. $ignoreWindow : pour l'espace gérant (pas de délai ni de fenêtre). */
function staff_free_slots(array $salon, int $staffId, string $date, int $duration, bool $ignoreWindow = false, ?int $ignoreAppointmentId = null): array
{
    $salonId = (int) $salon['id'];
    $win = staff_window($salonId, $staffId, $date);
    if (!$win) return [];
    $step = max(5, (int) $salon['slot_step']);
    $minStart = $ignoreWindow ? 0 : min_start_for($salon, $date);
    $busy = staff_busy($salonId, $staffId, $date, $ignoreAppointmentId);
    $slots = [];
    for ($t = $win[0]; $t + $duration <= $win[1]; $t += $step) {
        if ($t < $minStart) continue;
        $end = $t + $duration;
        foreach ($busy as [$bs, $be]) {
            if ($t < $be && $end > $bs) continue 2;
        }
        $slots[] = from_min($t);
    }
    return $slots;
}

/**
 * Créneaux libres pour une prestation. $staffId = null : « sans préférence »
 * (un créneau est libre si au moins un barbier est disponible).
 * @return array<string, int[]>  heure => ids des barbiers disponibles
 */
function available_slots(array $salon, string $date, int $duration, ?int $staffId = null): array
{
    if (!valid_date($date) || $duration <= 0 || !booking_open_for($salon, $date)) return [];
    $result = [];
    foreach (staff_list((int) $salon['id'], true) as $s) {
        if ($staffId !== null && (int) $s['id'] !== $staffId) continue;
        foreach (staff_free_slots($salon, (int) $s['id'], $date, $duration) as $t) $result[$t][] = (int) $s['id'];
    }
    ksort($result);
    return $result;
}

/**
 * Jours réservables à venir, avec le nombre de créneaux libres pour la prestation choisie.
 * @return list<array{date:string,slots:int}>
 */
function booking_days(array $salon, int $duration, ?int $staffId = null): array
{
    [$first, $last] = booking_window($salon);
    $days = [];
    for ($d = new DateTimeImmutable($first); $d->format('Y-m-d') <= $last; $d = $d->modify('+1 day')) {
        $ymd = $d->format('Y-m-d');
        $days[] = ['date' => $ymd, 'slots' => count(available_slots($salon, $ymd, $duration, $staffId))];
    }
    return $days;
}

function new_ref(): string
{
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    do {
        $ref = '';
        for ($i = 0; $i < 6; $i++) $ref .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    } while (q('SELECT 1 FROM appointments WHERE ref = ?', [$ref])->fetchColumn());
    return $ref;
}

/**
 * Fiche client retrouvée par téléphone (créée au besoin). Le consentement aux relances
 * n'est jamais retiré par une nouvelle réservation : seulement ajouté ou retiré à la demande.
 */
function upsert_client(string $name, string $phone, string $email = '', ?bool $consent = null): ?int
{
    if ($phone === '') return null;
    $c = q('SELECT * FROM clients WHERE phone = ?', [$phone])->fetch();
    $nowStr = now()->format('Y-m-d H:i:s');
    if ($c) {
        $fields = ['name = ?'];
        $params = [$name];
        if ($email !== '') { $fields[] = 'email = ?'; $params[] = $email; }
        if ($consent === true && !(int) $c['marketing_consent']) { $fields[] = 'marketing_consent = 1, consent_at = ?'; $params[] = $nowStr; }
        $params[] = $c['id'];
        q('UPDATE clients SET ' . implode(', ', $fields) . ' WHERE id = ?', $params);
        return (int) $c['id'];
    }
    q('INSERT INTO clients (phone, name, email, marketing_consent, consent_at, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
        $phone, $name, $email, $consent ? 1 : 0, $consent ? $nowStr : null, $nowStr,
    ]);
    return (int) db()->lastInsertId();
}

/** Nom affiché d'une prestation : « Coupe & barbe · Adulte (+25 ans) ». */
function service_label(array $service): string
{
    $cat = CATEGORIES[$service['category']] ?? '';
    return $cat && mb_stripos($service['name'], $cat) === false ? "$cat · {$service['name']}" : $service['name'];
}

/**
 * Crée un rendez-vous.
 * En ligne : $staffId = barbier choisi ou null (« sans préférence », attribution automatique).
 * Espace gérant ($force = true) : place le rendez-vous sans vérifier les disponibilités.
 * @throws InvalidArgumentException si le créneau n'est plus libre
 */
function create_appointment(array $salon, array $service, string $date, string $time, array $client, ?int $staffId = null, string $source = 'web', bool $force = false): array
{
    $duration = (int) $service['duration_min'];
    $salonId = (int) $salon['id'];
    return with_booking_lock(function () use ($salon, $salonId, $service, $date, $time, $client, $staffId, $source, $force, $duration) {
        if (!$force) {
            $free = available_slots($salon, $date, $duration, $staffId)[$time] ?? [];
            if (!$free) throw new InvalidArgumentException("Ce créneau vient d'être pris. Choisissez-en un autre.");
            if ($staffId === null) {
                // Répartit la charge : le barbier libre le moins occupé ce jour-là
                $load = [];
                foreach ($free as $sid) {
                    $load[$sid] = (int) q("SELECT COUNT(*) FROM appointments WHERE staff_id = ? AND status <> 'cancelled' AND start_at >= ? AND start_at < ?", [$sid, "$date 00:00:00", "$date 23:59:59"])->fetchColumn();
                }
                asort($load);
                $staffId = (int) array_key_first($load);
            }
        }
        $start = new DateTimeImmutable("$date $time:00");
        $end = $start->modify("+$duration minutes");
        $ref = new_ref();
        $clientId = upsert_client($client['name'], $client['phone'] ?? '', $client['email'] ?? '', $client['consent'] ?? null);
        q('INSERT INTO appointments (ref, salon_id, staff_id, client_id, service_id, service_name, price_eur, duration_min, start_at, end_at,
             client_name, client_phone, client_email, note, admin_note, status, source, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            $ref, $salonId, $staffId, $clientId, $service['id'], service_label($service), $service['price_eur'] ?? null, $duration,
            $start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s'),
            $client['name'], $client['phone'] ?? '', $client['email'] ?? '', $client['note'] ?? '', $client['admin_note'] ?? '',
            'confirmed', $source, now()->format('Y-m-d H:i:s'),
        ]);
        $staffName = $staffId ? (string) q('SELECT name FROM staff WHERE id = ?', [$staffId])->fetchColumn() : '';
        return ['ref' => $ref, 'start' => $start, 'end' => $end, 'staff_id' => $staffId, 'staff_name' => $staffName];
    });
}

/** Adresse qui reçoit les alertes d'un salon (celle du salon, sinon l'adresse générale). */
function salon_notify_email(array $salon): string
{
    $to = $salon['notify_email'] ?: setting('notify_email');
    return filter_var($to, FILTER_VALIDATE_EMAIL) ? $to : '';
}

/** Alerte e-mail au salon pour une réservation en ligne. */
function notify_new_booking(array $salon, array $appt, array $service, array $client): void
{
    $to = salon_notify_email($salon);
    if (!$to) return;
    $body = "Nouveau rendez-vous pris sur le site :\n\n"
        . "Salon : {$salon['name']} ({$salon['city']})\n"
        . 'Prestation : ' . service_label($service) . ' (' . fmt_duration((int) $service['duration_min']) . ")\n"
        . 'Date : ' . fmt_date_fr($appt['start']->format('Y-m-d'), true) . ' à ' . $appt['start']->format('H:i') . "\n"
        . ($appt['staff_name'] ? "Avec : {$appt['staff_name']}\n" : '')
        . "Client : {$client['name']}\nTéléphone : {$client['phone']}\n"
        . ($client['email'] ? "E-mail : {$client['email']}\n" : '')
        . ($client['note'] ? "Précisions : {$client['note']}\n" : '')
        . "Référence : {$appt['ref']}\n";
    send_mail($to, "Nouveau rendez-vous · {$salon['name']} · " . service_label($service), $body, (string) $client['email']);
}

/** Confirmation envoyée au client s'il a donné son e-mail, avec le lien d'annulation. */
function notify_client(array $salon, array $appt, array $service, array $client): void
{
    if (!$client['email'] || !filter_var($client['email'], FILTER_VALIDATE_EMAIL)) return;
    $brand = setting('brand_name', 'Seven Barbershop');
    $when = fmt_date_fr($appt['start']->format('Y-m-d'), true) . ' à ' . fmt_hour($appt['start']->format('H:i'));
    $notice = (int) $salon['booking_min_notice_h'];
    $body = "Bonjour {$client['name']},\n\n"
        . "Votre rendez-vous est confirmé :\n\n"
        . service_label($service) . "\n"
        . ucfirst($when) . "\n"
        . ($appt['staff_name'] ? "Avec {$appt['staff_name']}\n" : '')
        . "$brand {$salon['name']}, {$salon['address']}, {$salon['postcode']} {$salon['city']}\n\n"
        . "Référence : {$appt['ref']}\n\n"
        . "Un empêchement ? Annulez en un clic" . ($notice > 0 ? " (jusqu'à {$notice} h avant)" : '') . " :\n"
        . cancel_url($appt['ref']) . "\n\n"
        . "Paiement sur place, au salon.\n\n"
        . "À bientôt,\n$brand\n";
    send_mail($client['email'], "Votre rendez-vous chez $brand {$salon['name']}", $body, salon_notify_email($salon));
}

/* ---------- Annulation en ligne par le client ---------- */

/** Rendez-vous retrouvé par sa référence, avec le nom du barbier. */
function appointment_by_ref(string $ref): ?array
{
    if (!preg_match('/^[A-Z0-9]{4,12}$/', $ref)) return null;
    return q('SELECT a.*, s.name AS staff_name FROM appointments a LEFT JOIN staff s ON s.id = a.staff_id WHERE a.ref = ?', [$ref])->fetch() ?: null;
}

/** Le client peut-il encore annuler en ligne ? (rendez-vous confirmé, à venir, délai du salon respecté) */
function client_can_cancel(array $appt, array $salon): bool
{
    if ($appt['status'] !== 'confirmed') return false;
    $limit = now()->modify('+' . max(0, (int) $salon['booking_min_notice_h']) . ' hours')->format('Y-m-d H:i:s');
    return $appt['start_at'] > $limit;
}

/** Annule le rendez-vous à la demande du client et prévient le salon. */
function cancel_by_client(array $appt, array $salon): void
{
    $stamp = 'Annulé en ligne par le client le ' . now()->format('d/m/Y à H:i') . '.';
    $note = trim($appt['admin_note'] . "\n" . $stamp);
    q("UPDATE appointments SET status = 'cancelled', admin_note = ? WHERE id = ? AND status = 'confirmed'", [$note, $appt['id']]);
    $to = salon_notify_email($salon);
    if ($to) {
        $body = "Un client a annulé son rendez-vous depuis le lien reçu :\n\n"
            . "Salon : {$salon['name']}\n"
            . "Prestation : {$appt['service_name']}\n"
            . 'Date : ' . fmt_date_fr(substr($appt['start_at'], 0, 10), true) . ' à ' . substr($appt['start_at'], 11, 5) . "\n"
            . ($appt['staff_name'] ? "Avec : {$appt['staff_name']}\n" : '')
            . "Client : {$appt['client_name']} ({$appt['client_phone']})\n"
            . "Référence : {$appt['ref']}\n\nLe créneau est de nouveau réservable.\n";
        send_mail($to, "Annulation · {$salon['name']} · {$appt['client_name']}", $body);
    }
}
