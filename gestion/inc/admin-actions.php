<?php
/**
 * Actions POST de l'espace gérant. Chaque action valide ses entrées, vérifie que les
 * données touchées appartiennent au salon courant, écrit en base puis pose un message flash.
 */
declare(strict_types=1);

function post(string $key, string $default = ''): string
{
    $v = $_POST[$key] ?? $default;
    return is_string($v) ? trim($v) : $default;
}

function post_int(string $key): int
{
    return (int) ($_POST[$key] ?? 0);
}

function require_date(string $key, string $label = 'la date'): string
{
    $v = post($key);
    if (!valid_date($v)) throw new InvalidArgumentException("Indiquez $label.");
    return $v;
}

function require_time(string $key, string $label = "l'heure"): string
{
    $v = substr(post($key), 0, 5);
    if (!valid_time($v)) throw new InvalidArgumentException("Indiquez $label.");
    return $v;
}

/** Barbier du salon courant (0 : aucun / tout le salon). */
function optional_staff(array $salon, string $key = 'staff_id'): ?int
{
    $id = post_int($key);
    if ($id === 0) return null;
    if (!owned_by_salon('staff', $id, $salon)) throw new InvalidArgumentException('Barbier introuvable dans ce salon.');
    return $id;
}

function require_owned(string $table, int $id, array $salon, string $what): void
{
    if (!owned_by_salon($table, $id, $salon)) throw new InvalidArgumentException("$what introuvable dans ce salon.");
}

/** Téléphone facultatif : vide, ou numéro français valide. */
function optional_phone(string $key): string
{
    $phone = post($key);
    if ($phone === '') return '';
    return normalize_phone($phone) ?? throw new InvalidArgumentException('Numéro de téléphone invalide.');
}

/** Prix affiché → montant en euros pour les statistiques (« dès 25 € » → 25). */
function price_value(string $label): ?int
{
    return preg_match('/(\d+)/', $label, $m) ? (int) $m[1] : null;
}

/** Identifiant d'adresse unique tiré du nom (« Rue Meyerbeer » → « rue-meyerbeer »). */
function salon_slug(string $name): string
{
    $base = strtolower(trim((string) preg_replace('/[^a-z0-9]+/i', '-', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $name) ?: $name), '-')) ?: 'salon';
    $slug = $base;
    for ($i = 2; q('SELECT 1 FROM salons WHERE slug = ?', [$slug])->fetchColumn(); $i++) $slug = "$base-$i";
    return $slug;
}

function run_admin_action(string $action, array $user, array $salon): void
{
    $salonId = (int) $salon['id'];
    switch ($action) {

        /* ---------- Rendez-vous ---------- */
        case 'appt_create': {
            $serviceId = post_int('service_id');
            require_owned('services', $serviceId, $salon, 'Prestation');
            $service = q('SELECT * FROM services WHERE id = ?', [$serviceId])->fetch();
            $duration = post_int('duration') ?: (int) $service['duration_min'];
            if ($duration < 5 || $duration > 720) throw new InvalidArgumentException('Durée invalide.');
            $service['duration_min'] = $duration;
            $date = require_date('date');
            $time = require_time('time');
            $staffId = optional_staff($salon);
            $name = post('client_name');
            if (mb_strlen($name) < 2) throw new InvalidArgumentException('Indiquez le nom du client.');
            $phone = optional_phone('client_phone');

            if (!isset($_POST['force']) && $staffId !== null) {
                // Vérifie le chevauchement sans tenir compte de la fenêtre de réservation en ligne
                if (!in_array($time, staff_free_slots($salon, $staffId, $date, $duration, true), true)) {
                    throw new InvalidArgumentException("Ce créneau chevauche un autre rendez-vous, un blocage ou les horaires du barbier. Cochez « Forcer » pour l'ajouter quand même.");
                }
            }
            $appt = create_appointment($salon, $service, $date, $time, [
                'name' => $name, 'phone' => $phone, 'email' => post('client_email'),
                'note' => post('note'), 'admin_note' => post('admin_note'),
            ], $staffId, 'admin', true);
            flash("Rendez-vous ajouté ({$appt['ref']}).");
            break;
        }

        case 'appt_update': {
            $id = post_int('id');
            require_owned('appointments', $id, $salon, 'Rendez-vous');
            $a = q('SELECT * FROM appointments WHERE id = ?', [$id])->fetch();
            $date = require_date('date');
            $time = require_time('time');
            $duration = post_int('duration');
            if ($duration < 5 || $duration > 720) throw new InvalidArgumentException('Durée invalide.');
            $status = post('status');
            if (!isset(APPT_STATUSES[$status])) throw new InvalidArgumentException('Statut invalide.');
            $staffId = optional_staff($salon);
            $name = post('client_name');
            if (mb_strlen($name) < 2) throw new InvalidArgumentException('Indiquez le nom du client.');
            $phone = optional_phone('client_phone');

            // Un déplacement ne doit pas chevaucher un autre rendez-vous, sauf si on force
            $moved = $date !== substr($a['start_at'], 0, 10) || $time !== substr($a['start_at'], 11, 5)
                || $duration !== (int) $a['duration_min'] || $staffId !== ($a['staff_id'] === null ? null : (int) $a['staff_id']);
            if ($moved && $status === 'confirmed' && $staffId !== null && !isset($_POST['force'])
                && !in_array($time, staff_free_slots($salon, $staffId, $date, $duration, true, $id), true)) {
                throw new InvalidArgumentException("Le nouveau créneau chevauche un autre rendez-vous ou un blocage. Cochez « Forcer » pour l'enregistrer quand même.");
            }

            $start = new DateTimeImmutable("$date $time:00");
            $end = $start->modify("+$duration minutes");
            $serviceId = post_int('service_id') ?: (int) $a['service_id'];
            $serviceName = $a['service_name'];
            $price = $a['price_eur'];
            if ($serviceId !== (int) $a['service_id'] && owned_by_salon('services', $serviceId, $salon)) {
                $svc = q('SELECT * FROM services WHERE id = ?', [$serviceId])->fetch();
                $serviceName = service_label($svc);
                $price = $svc['price_eur'];
            }
            $clientId = upsert_client($name, $phone, post('client_email'));
            q('UPDATE appointments SET service_id = ?, service_name = ?, price_eur = ?, staff_id = ?, client_id = ?, start_at = ?, end_at = ?, duration_min = ?, status = ?,
               client_name = ?, client_phone = ?, client_email = ?, note = ?, admin_note = ? WHERE id = ?', [
                $serviceId, $serviceName, $price, $staffId, $clientId, $start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s'), $duration, $status,
                $name, $phone, post('client_email'), post('note'), post('admin_note'), $id,
            ]);
            flash('Rendez-vous mis à jour.');
            break;
        }

        case 'appt_status': {
            $status = post('status');
            if (!isset(APPT_STATUSES[$status])) throw new InvalidArgumentException('Statut invalide.');
            require_owned('appointments', post_int('id'), $salon, 'Rendez-vous');
            q('UPDATE appointments SET status = ? WHERE id = ?', [$status, post_int('id')]);
            flash('Statut : ' . APPT_STATUSES[$status] . '.');
            break;
        }

        /* ---------- Blocages (pause, absence, congé) ---------- */
        case 'block_create': {
            $staffId = optional_staff($salon);
            $note = mb_substr(post('note'), 0, 200);
            if (post('mode') === 'days') {
                $from = require_date('date_from', 'la date de début');
                $to = post('date_to') ?: $from;
                if (!valid_date($to) || $to < $from) throw new InvalidArgumentException('Date de fin invalide.');
                $end = (new DateTimeImmutable($to))->modify('+1 day');
                q('INSERT INTO blocks (salon_id, staff_id, start_at, end_at, note) VALUES (?, ?, ?, ?, ?)', [$salonId, $staffId, "$from 00:00:00", $end->format('Y-m-d') . ' 00:00:00', $note]);
                flash('Absence enregistrée : ces jours ne sont plus réservables en ligne.');
            } else {
                $date = require_date('date');
                $s = require_time('start', "l'heure de début");
                $e = require_time('end', "l'heure de fin");
                if ($e <= $s) throw new InvalidArgumentException("L'heure de fin doit être après le début.");
                q('INSERT INTO blocks (salon_id, staff_id, start_at, end_at, note) VALUES (?, ?, ?, ?, ?)', [$salonId, $staffId, "$date $s:00", "$date $e:00", $note]);
                flash("Créneau bloqué : il n'est plus réservable en ligne.");
            }
            break;
        }

        case 'block_delete':
            require_owned('blocks', post_int('id'), $salon, 'Blocage');
            q('DELETE FROM blocks WHERE id = ?', [post_int('id')]);
            flash('Blocage supprimé.');
            break;

        /* ---------- Réservation en ligne & horaires du salon ---------- */
        case 'booking_save': {
            $mode = post('booking_mode') === 'until' ? 'until' : 'rolling';
            $until = null;
            if ($mode === 'until') $until = require_date('booking_until', "la date d'ouverture du planning");
            $step = post_int('slot_step');
            if (!in_array($step, [10, 15, 20, 30, 45, 60], true)) $step = 15;
            $notify = post('notify_email');
            if ($notify !== '' && !filter_var($notify, FILTER_VALIDATE_EMAIL)) throw new InvalidArgumentException('Adresse e-mail des alertes invalide.');
            q('UPDATE salons SET booking_enabled = ?, booking_mode = ?, booking_until = ?, booking_days_ahead = ?, booking_min_notice_h = ?, slot_step = ?, notify_email = ?, phone = ? WHERE id = ?', [
                isset($_POST['booking_enabled']) ? 1 : 0, $mode, $until,
                max(1, min(365, post_int('booking_days_ahead') ?: 30)), max(0, min(168, post_int('booking_min_notice_h'))),
                $step, $notify, mb_substr(post('phone'), 0, 30), $salonId,
            ]);
            flash(isset($_POST['booking_enabled'])
                ? "Réservation en ligne ouverte pour {$salon['name']}."
                : "Réglages enregistrés. La réservation en ligne de {$salon['name']} est fermée : le site renvoie vers Planity.");
            break;
        }

        case 'hours_save': {
            for ($d = 0; $d <= 6; $d++) {
                $open = isset($_POST['open'][$d]);
                $o = substr((string) ($_POST['open_time'][$d] ?? '09:00'), 0, 5);
                $c = substr((string) ($_POST['close_time'][$d] ?? '19:00'), 0, 5);
                $bs = substr((string) ($_POST['break_start'][$d] ?? ''), 0, 5);
                $be = substr((string) ($_POST['break_end'][$d] ?? ''), 0, 5);
                if ($open && (!valid_time($o) || !valid_time($c) || $c <= $o)) throw new InvalidArgumentException('Horaires invalides le ' . mb_strtolower(WEEKDAYS[$d]) . '.');
                $hasBreak = valid_time($bs) && valid_time($be) && $be > $bs;
                q('DELETE FROM opening_hours WHERE salon_id = ? AND weekday = ?', [$salonId, $d]);
                q('INSERT INTO opening_hours (salon_id, weekday, is_open, open_time, close_time, break_start, break_end) VALUES (?, ?, ?, ?, ?, ?, ?)', [
                    $salonId, $d, $open ? 1 : 0, valid_time($o) ? $o : '09:00', valid_time($c) ? $c : '19:00', $hasBreak ? $bs : null, $hasBreak ? $be : null,
                ]);
            }
            flash("Horaires de {$salon['name']} enregistrés. Pensez à les mettre à jour aussi sur Google et sur le site.");
            break;
        }

        case 'exception_save': {
            $from = require_date('date_from', 'la date');
            $to = post('date_to') ?: $from;
            if (!valid_date($to) || $to < $from) throw new InvalidArgumentException('Date de fin invalide.');
            $closed = post('kind') !== 'special';
            $o = $c = null;
            if (!$closed) {
                $o = require_time('open_time', "l'heure d'ouverture");
                $c = require_time('close_time', "l'heure de fermeture");
                if ($c <= $o) throw new InvalidArgumentException("L'heure de fermeture doit être après l'ouverture.");
            }
            $note = mb_substr(post('note'), 0, 200);
            $n = 0;
            for ($d = new DateTimeImmutable($from); $d->format('Y-m-d') <= $to && $n < 120; $d = $d->modify('+1 day'), $n++) {
                q('DELETE FROM schedule_exceptions WHERE salon_id = ? AND day = ?', [$salonId, $d->format('Y-m-d')]);
                q('INSERT INTO schedule_exceptions (salon_id, day, is_closed, open_time, close_time, note) VALUES (?, ?, ?, ?, ?, ?)', [$salonId, $d->format('Y-m-d'), $closed ? 1 : 0, $o, $c, $note]);
            }
            $days = "$n jour" . ($n > 1 ? 's' : '');
            flash($closed ? "Fermeture enregistrée ($days)." : "Horaires spéciaux enregistrés ($days).");
            break;
        }

        case 'exception_delete':
            require_owned('schedule_exceptions', post_int('id'), $salon, 'Date particulière');
            q('DELETE FROM schedule_exceptions WHERE id = ?', [post_int('id')]);
            flash('Date particulière supprimée.');
            break;

        /* ---------- Barbiers ---------- */
        case 'staff_save': {
            $id = post_int('id');
            if ($id) require_owned('staff', $id, $salon, 'Barbier');
            $name = mb_substr(post('name'), 0, 80);
            if ($name === '') throw new InvalidArgumentException('Indiquez un prénom.');
            $color = preg_match('/^#[0-9a-fA-F]{6}$/', post('color')) ? post('color') : '#c8a96e';
            $bookable = isset($_POST['bookable']) ? 1 : 0;
            if ($id) {
                q('UPDATE staff SET name = ?, color = ?, bookable = ? WHERE id = ?', [$name, $color, $bookable, $id]);
            } else {
                $sort = (int) q('SELECT COALESCE(MAX(sort), 0) + 10 FROM staff WHERE salon_id = ?', [$salonId])->fetchColumn();
                q('INSERT INTO staff (salon_id, name, color, bookable, active, sort) VALUES (?, ?, ?, ?, 1, ?)', [$salonId, $name, $color, $bookable, $sort]);
                $id = (int) db()->lastInsertId();
            }
            for ($d = 0; $d <= 6; $d++) {
                $working = isset($_POST['working'][$d]) ? 1 : 0;
                $s = substr((string) ($_POST['start_time'][$d] ?? '09:00'), 0, 5);
                $e = substr((string) ($_POST['end_time'][$d] ?? '19:00'), 0, 5);
                if (!valid_time($s)) $s = '09:00';
                if (!valid_time($e) || $e <= $s) $e = '19:00';
                q('DELETE FROM staff_hours WHERE staff_id = ? AND weekday = ?', [$id, $d]);
                q('INSERT INTO staff_hours (staff_id, weekday, is_working, start_time, end_time) VALUES (?, ?, ?, ?, ?)', [$id, $d, $working, $s, $e]);
            }
            flash("Planning de $name enregistré.");
            break;
        }

        case 'staff_delete': {
            $id = post_int('id');
            require_owned('staff', $id, $salon, 'Barbier');
            $future = (int) q("SELECT COUNT(*) FROM appointments WHERE staff_id = ? AND status = 'confirmed' AND start_at >= ?", [$id, now()->format('Y-m-d H:i:s')])->fetchColumn();
            if ($future) throw new InvalidArgumentException("Impossible : $future rendez-vous à venir sont attribués à ce barbier. Déplacez-les d'abord dans l'agenda.");
            q('UPDATE staff SET active = 0 WHERE id = ?', [$id]);
            flash("Barbier retiré de l'équipe (son historique est conservé pour les statistiques).");
            break;
        }

        /* ---------- Prestations ---------- */
        case 'service_save': {
            $id = post_int('id');
            if ($id) require_owned('services', $id, $salon, 'Prestation');
            $cat = post('category');
            if (!isset(CATEGORIES[$cat])) throw new InvalidArgumentException('Catégorie invalide.');
            $name = mb_substr(post('name'), 0, 120);
            if ($name === '') throw new InvalidArgumentException('Indiquez le nom de la prestation.');
            $dur = post_int('duration_min');
            if ($dur < 5 || $dur > 720) throw new InvalidArgumentException('Durée entre 5 min et 12 h.');
            $label = mb_substr(post('price_label'), 0, 60);
            $vals = [$cat, $name, mb_substr(post('description'), 0, 500), $dur, $label, price_value($label), isset($_POST['bookable']) ? 1 : 0, isset($_POST['active']) ? 1 : 0];
            if ($id) {
                q('UPDATE services SET category = ?, name = ?, description = ?, duration_min = ?, price_label = ?, price_eur = ?, bookable = ?, active = ? WHERE id = ?', [...$vals, $id]);
            } else {
                $sort = (int) q('SELECT COALESCE(MAX(sort), 0) + 10 FROM services WHERE salon_id = ?', [$salonId])->fetchColumn();
                q('INSERT INTO services (salon_id, category, name, description, duration_min, price_label, price_eur, bookable, active, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [$salonId, ...$vals, $sort]);
            }
            flash("Prestation « $name » enregistrée.");
            break;
        }

        case 'service_delete':
            require_owned('services', post_int('id'), $salon, 'Prestation');
            q('DELETE FROM services WHERE id = ?', [post_int('id')]);
            flash('Prestation supprimée (les rendez-vous passés gardent son nom).');
            break;

        case 'service_move': {
            $rows = array_map('intval', q('SELECT id FROM services WHERE salon_id = ? ORDER BY sort, id', [$salonId])->fetchAll(PDO::FETCH_COLUMN));
            $i = array_search(post_int('id'), $rows, true);
            $j = $i === false ? false : $i + (post('dir') === 'up' ? -1 : 1);
            if ($i !== false && isset($rows[$j])) {
                [$rows[$i], $rows[$j]] = [$rows[$j], $rows[$i]];
                foreach ($rows as $k => $sid) q('UPDATE services SET sort = ? WHERE id = ?', [($k + 1) * 10, $sid]);
            }
            break;
        }

        /* ---------- Salons (propriétaire uniquement) ---------- */
        case 'salon_save': {
            if (!$user['is_owner']) throw new InvalidArgumentException('Réservé au propriétaire.');
            $id = post_int('id');
            $name = mb_substr(post('name'), 0, 80);
            $city = mb_substr(post('city'), 0, 80);
            if ($name === '' || $city === '') throw new InvalidArgumentException('Indiquez le nom et la ville du salon.');
            $planity = post('planity_url');
            if ($planity !== '' && !filter_var($planity, FILTER_VALIDATE_URL)) throw new InvalidArgumentException('Lien Planity invalide.');
            $fields = [$name, $city, mb_substr(post('address'), 0, 160), mb_substr(post('postcode'), 0, 10), mb_substr(post('phone'), 0, 30), $planity];
            if ($id) {
                if (!salon_by_id($id)) throw new InvalidArgumentException('Salon introuvable.');
                q('UPDATE salons SET name = ?, city = ?, address = ?, postcode = ?, phone = ?, planity_url = ? WHERE id = ?', [...$fields, $id]);
                flash("Salon $name enregistré.");
                break;
            }
            $slug = salon_slug($name);
            $sort = (int) q('SELECT COALESCE(MAX(sort), 0) + 10 FROM salons')->fetchColumn();
            q('INSERT INTO salons (slug, name, city, address, postcode, phone, planity_url, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [$slug, ...$fields, $sort]);
            $newId = (int) db()->lastInsertId();
            // Horaires et carte des prestations repris d'un salon existant, sinon horaires par défaut
            $model = salon_by_id(post_int('copy_from'));
            if ($model) {
                foreach (weekly_hours((int) $model['id']) as $h) {
                    q('INSERT INTO opening_hours (salon_id, weekday, is_open, open_time, close_time, break_start, break_end) VALUES (?, ?, ?, ?, ?, ?, ?)', [
                        $newId, $h['weekday'], $h['is_open'], $h['open_time'], $h['close_time'], $h['break_start'], $h['break_end'],
                    ]);
                }
                foreach (q('SELECT * FROM services WHERE salon_id = ? ORDER BY sort, id', [$model['id']])->fetchAll() as $svc) {
                    q('INSERT INTO services (salon_id, category, name, description, duration_min, price_label, price_eur, bookable, active, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                        $newId, $svc['category'], $svc['name'], $svc['description'], $svc['duration_min'], $svc['price_label'], $svc['price_eur'], $svc['bookable'], $svc['active'], $svc['sort'],
                    ]);
                }
                q('UPDATE salons SET slot_step = ?, booking_min_notice_h = ?, booking_days_ahead = ? WHERE id = ?', [$model['slot_step'], $model['booking_min_notice_h'], $model['booking_days_ahead'], $newId]);
            } else {
                for ($d = 0; $d <= 6; $d++) {
                    q('INSERT INTO opening_hours (salon_id, weekday, is_open, open_time, close_time) VALUES (?, ?, ?, ?, ?)', [$newId, $d, $d === 0 ? 0 : 1, '09:00', '19:00']);
                }
            }
            start_session();
            $_SESSION['salon_id'] = $newId;
            flash("Salon $name créé" . ($model ? " avec les horaires et les prestations de {$model['name']}" : '') . ". Ajoutez maintenant ses barbiers, puis ouvrez la réservation en ligne quand il est prêt.");
            $_POST['back'] = admin_url('equipe');
            break;
        }

        case 'salon_move': {
            if (!$user['is_owner']) throw new InvalidArgumentException('Réservé au propriétaire.');
            $rows = array_map(fn($s) => (int) $s['id'], salons_list());
            $i = array_search(post_int('id'), $rows, true);
            $j = $i === false ? false : $i + (post('dir') === 'up' ? -1 : 1);
            if ($i !== false && isset($rows[$j])) {
                [$rows[$i], $rows[$j]] = [$rows[$j], $rows[$i]];
                foreach ($rows as $k => $sid) q('UPDATE salons SET sort = ? WHERE id = ?', [($k + 1) * 10, $sid]);
            }
            break;
        }

        case 'salon_delete': {
            if (!$user['is_owner']) throw new InvalidArgumentException('Réservé au propriétaire.');
            $id = post_int('id');
            $s = salon_by_id($id);
            if (!$s) throw new InvalidArgumentException('Salon introuvable.');
            if (count(salons_list()) <= 1) throw new InvalidArgumentException('Impossible de supprimer le dernier salon.');
            $appts = (int) q('SELECT COUNT(*) FROM appointments WHERE salon_id = ?', [$id])->fetchColumn();
            if ($appts) throw new InvalidArgumentException("Impossible : ce salon a $appts rendez-vous dans son historique. Fermez plutôt sa réservation en ligne.");
            foreach (['opening_hours', 'schedule_exceptions', 'blocks', 'services'] as $table) q("DELETE FROM $table WHERE salon_id = ?", [$id]);
            q('DELETE FROM staff_hours WHERE staff_id IN (SELECT id FROM staff WHERE salon_id = ?)', [$id]);
            q('DELETE FROM staff WHERE salon_id = ?', [$id]);
            q('DELETE FROM admins WHERE salon_id = ?', [$id]);
            q('DELETE FROM salons WHERE id = ?', [$id]);
            start_session();
            unset($_SESSION['salon_id']);
            flash("Salon {$s['name']} supprimé.");
            break;
        }

        /* ---------- Accès gérants (propriétaire uniquement) ---------- */
        case 'admin_save': {
            if (!$user['is_owner']) throw new InvalidArgumentException('Réservé au propriétaire.');
            $id = post_int('id');
            $name = mb_substr(post('name'), 0, 80);
            $email = post('email');
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new InvalidArgumentException('E-mail invalide.');
            $scope = post_int('salon_id');
            if ($scope !== 0 && !salon_by_id($scope)) throw new InvalidArgumentException('Salon invalide.');
            if ($id === (int) $user['id'] && $scope !== 0) throw new InvalidArgumentException('Vous ne pouvez pas retirer votre propre accès propriétaire.');
            $dupe = q('SELECT id FROM admins WHERE email = ? AND id <> ?', [$email, $id])->fetchColumn();
            if ($dupe) throw new InvalidArgumentException('Un accès existe déjà avec cet e-mail.');
            $password = (string) ($_POST['password'] ?? '');
            if (!$id && strlen($password) < 10) throw new InvalidArgumentException('Mot de passe de 10 caractères minimum.');
            if ($password !== '' && strlen($password) < 10) throw new InvalidArgumentException('Mot de passe de 10 caractères minimum.');
            if ($id) {
                q('UPDATE admins SET name = ?, email = ?, salon_id = ? WHERE id = ?', [$name, $email, $scope ?: null, $id]);
                if ($password !== '') q('UPDATE admins SET password_hash = ? WHERE id = ?', [password_hash($password, PASSWORD_DEFAULT), $id]);
            } else {
                q('INSERT INTO admins (name, email, password_hash, salon_id, created_at) VALUES (?, ?, ?, ?, ?)', [$name, $email, password_hash($password, PASSWORD_DEFAULT), $scope ?: null, now()->format('Y-m-d H:i:s')]);
            }
            flash("Accès de " . ($name ?: $email) . " enregistré.");
            break;
        }

        case 'admin_delete': {
            if (!$user['is_owner']) throw new InvalidArgumentException('Réservé au propriétaire.');
            $id = post_int('id');
            if ($id === (int) $user['id']) throw new InvalidArgumentException('Vous ne pouvez pas supprimer votre propre accès.');
            q('DELETE FROM admins WHERE id = ?', [$id]);
            flash('Accès supprimé.');
            break;
        }

        /* ---------- Mon compte ---------- */
        case 'account_save': {
            $u = q('SELECT * FROM admins WHERE id = ?', [$user['id']])->fetch();
            if (!password_verify((string) ($_POST['current'] ?? ''), $u['password_hash'])) throw new InvalidArgumentException('Mot de passe actuel incorrect.');
            $email = post('email');
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new InvalidArgumentException('E-mail invalide.');
            if (q('SELECT 1 FROM admins WHERE email = ? AND id <> ?', [$email, $u['id']])->fetchColumn()) throw new InvalidArgumentException('Cet e-mail est déjà utilisé.');
            $new = (string) ($_POST['new'] ?? '');
            if ($new !== '') {
                if (strlen($new) < 10) throw new InvalidArgumentException('Le nouveau mot de passe doit contenir au moins 10 caractères.');
                if ($new !== ($_POST['confirm'] ?? '')) throw new InvalidArgumentException('Les deux mots de passe ne correspondent pas.');
                q('UPDATE admins SET password_hash = ? WHERE id = ?', [password_hash($new, PASSWORD_DEFAULT), $u['id']]);
            }
            q('UPDATE admins SET name = ?, email = ? WHERE id = ?', [mb_substr(post('name'), 0, 80), $email, $u['id']]);
            flash('Compte mis à jour.');
            break;
        }

        /* ---------- Fichier clients ---------- */
        case 'client_consent': {
            $id = post_int('id');
            // Un responsable ne touche qu'aux clients venus dans son salon
            if (!q('SELECT 1 FROM appointments WHERE client_id = ? AND salon_id = ?', [$id, $salonId])->fetchColumn()) {
                throw new InvalidArgumentException('Client introuvable.');
            }
            $on = post('consent') === '1';
            q('UPDATE clients SET marketing_consent = ?, consent_at = ? WHERE id = ?', [$on ? 1 : 0, $on ? now()->format('Y-m-d H:i:s') : null, $id]);
            flash($on ? 'Consentement aux relances enregistré.' : 'Consentement retiré : ce client ne sera plus relancé.');
            break;
        }

        case 'client_delete': {
            if (!$user['is_owner']) throw new InvalidArgumentException('Réservé au propriétaire.');
            $id = post_int('id');
            if (!q('SELECT 1 FROM clients WHERE id = ?', [$id])->fetchColumn()) throw new InvalidArgumentException('Client introuvable.');
            // Droit à l'effacement : les rendez-vous restent (statistiques) mais sans coordonnées.
            q("UPDATE appointments SET client_id = NULL, client_name = 'Client effacé', client_phone = '', client_email = '', note = '' WHERE client_id = ?", [$id]);
            q('DELETE FROM clients WHERE id = ?', [$id]);
            flash('Client effacé de tous les salons.');
            break;
        }

        default:
            throw new InvalidArgumentException('Action inconnue.');
    }
}
