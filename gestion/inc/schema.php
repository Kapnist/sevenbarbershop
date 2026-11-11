<?php
/**
 * Schéma de la base + données initiales (5 salons, barbiers, horaires, prestations).
 * Utilisé uniquement par install.php.
 */
declare(strict_types=1);

function schema_sql(string $driver): array
{
    $id = $driver === 'mysql' ? 'INT UNSIGNED AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
    $tail = $driver === 'mysql' ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci' : '';
    $fk = $driver === 'mysql' ? 'INT UNSIGNED' : 'INTEGER';

    return [
        "CREATE TABLE settings (
            k VARCHAR(64) NOT NULL PRIMARY KEY,
            v TEXT NOT NULL
        )$tail",
        // salon_id NULL : propriétaire (tous les salons) ; sinon responsable d'un seul salon
        "CREATE TABLE admins (
            id $id,
            name VARCHAR(80) NOT NULL DEFAULT '',
            email VARCHAR(190) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            salon_id $fk NULL,
            created_at DATETIME NOT NULL
        )$tail",
        "CREATE TABLE login_attempts (
            id $id,
            ip VARCHAR(64) NOT NULL,
            attempted_at DATETIME NOT NULL
        )$tail",
        "CREATE TABLE rate_hits (
            id $id,
            kind VARCHAR(20) NOT NULL,
            ip VARCHAR(64) NOT NULL,
            hit_at DATETIME NOT NULL
        )$tail",
        "CREATE TABLE salons (
            id $id,
            slug VARCHAR(40) NOT NULL UNIQUE,
            name VARCHAR(80) NOT NULL,
            city VARCHAR(80) NOT NULL,
            address VARCHAR(160) NOT NULL DEFAULT '',
            postcode VARCHAR(10) NOT NULL DEFAULT '',
            phone VARCHAR(30) NOT NULL DEFAULT '',
            planity_url VARCHAR(255) NOT NULL DEFAULT '',
            notify_email VARCHAR(190) NOT NULL DEFAULT '',
            booking_enabled TINYINT NOT NULL DEFAULT 0,
            booking_mode VARCHAR(10) NOT NULL DEFAULT 'rolling',
            booking_until DATE NULL,
            booking_days_ahead INT NOT NULL DEFAULT 30,
            booking_min_notice_h INT NOT NULL DEFAULT 1,
            slot_step INT NOT NULL DEFAULT 15,
            sort INT NOT NULL DEFAULT 0
        )$tail",
        "CREATE TABLE opening_hours (
            salon_id $fk NOT NULL,
            weekday TINYINT NOT NULL,
            is_open TINYINT NOT NULL DEFAULT 1,
            open_time VARCHAR(5) NOT NULL DEFAULT '09:00',
            close_time VARCHAR(5) NOT NULL DEFAULT '19:00',
            break_start VARCHAR(5) NULL,
            break_end VARCHAR(5) NULL,
            PRIMARY KEY (salon_id, weekday)
        )$tail",
        "CREATE TABLE schedule_exceptions (
            id $id,
            salon_id $fk NOT NULL,
            day DATE NOT NULL,
            is_closed TINYINT NOT NULL DEFAULT 1,
            open_time VARCHAR(5) NULL,
            close_time VARCHAR(5) NULL,
            note VARCHAR(200) NOT NULL DEFAULT ''
        )$tail",
        "CREATE UNIQUE INDEX idx_exception_day ON schedule_exceptions (salon_id, day)",
        "CREATE TABLE staff (
            id $id,
            salon_id $fk NOT NULL,
            name VARCHAR(80) NOT NULL,
            color VARCHAR(7) NOT NULL DEFAULT '#c8a96e',
            bookable TINYINT NOT NULL DEFAULT 1,
            active TINYINT NOT NULL DEFAULT 1,
            sort INT NOT NULL DEFAULT 0
        )$tail",
        "CREATE TABLE staff_hours (
            staff_id $fk NOT NULL,
            weekday TINYINT NOT NULL,
            is_working TINYINT NOT NULL DEFAULT 1,
            start_time VARCHAR(5) NOT NULL DEFAULT '09:00',
            end_time VARCHAR(5) NOT NULL DEFAULT '19:00',
            PRIMARY KEY (staff_id, weekday)
        )$tail",
        // staff_id NULL : tout le salon est bloqué
        "CREATE TABLE blocks (
            id $id,
            salon_id $fk NOT NULL,
            staff_id $fk NULL,
            start_at DATETIME NOT NULL,
            end_at DATETIME NOT NULL,
            note VARCHAR(200) NOT NULL DEFAULT ''
        )$tail",
        "CREATE TABLE services (
            id $id,
            salon_id $fk NOT NULL,
            category VARCHAR(20) NOT NULL,
            name VARCHAR(120) NOT NULL,
            description TEXT NOT NULL,
            duration_min INT NOT NULL DEFAULT 30,
            price_label VARCHAR(60) NOT NULL DEFAULT '',
            price_eur INT NULL,
            bookable TINYINT NOT NULL DEFAULT 1,
            active TINYINT NOT NULL DEFAULT 1,
            sort INT NOT NULL DEFAULT 0
        )$tail",
        // Fichier clients : sert aux relances et aux statistiques (étapes suivantes).
        "CREATE TABLE clients (
            id $id,
            phone VARCHAR(30) NOT NULL UNIQUE,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(190) NOT NULL DEFAULT '',
            marketing_consent TINYINT NOT NULL DEFAULT 0,
            consent_at DATETIME NULL,
            created_at DATETIME NOT NULL
        )$tail",
        "CREATE TABLE appointments (
            id $id,
            ref VARCHAR(12) NOT NULL UNIQUE,
            salon_id $fk NOT NULL,
            staff_id $fk NULL,
            client_id $fk NULL,
            service_id $fk NULL,
            service_name VARCHAR(160) NOT NULL,
            price_eur INT NULL,
            duration_min INT NOT NULL,
            start_at DATETIME NOT NULL,
            end_at DATETIME NOT NULL,
            client_name VARCHAR(120) NOT NULL,
            client_phone VARCHAR(30) NOT NULL,
            client_email VARCHAR(190) NOT NULL DEFAULT '',
            note TEXT NOT NULL,
            admin_note TEXT NOT NULL,
            status VARCHAR(12) NOT NULL DEFAULT 'confirmed',
            source VARCHAR(10) NOT NULL DEFAULT 'web',
            created_at DATETIME NOT NULL
        )$tail",
        "CREATE INDEX idx_appt_start ON appointments (salon_id, start_at)",
        "CREATE INDEX idx_appt_staff ON appointments (staff_id, start_at)",
        "CREATE INDEX idx_appt_client ON appointments (client_id)",
        "CREATE INDEX idx_block_start ON blocks (salon_id, start_at)",
        "CREATE INDEX idx_login_ip ON login_attempts (ip, attempted_at)",
        "CREATE INDEX idx_rate ON rate_hits (kind, ip, hit_at)",
    ];
}

/** Barbiers connus par salon (à compléter ou corriger dans l'espace gérant → Équipe). */
const SEED_STAFF = [
    'anatole-france' => ['Kamel', 'Raph', 'Khaled', 'Fares', 'Diogo'],
    'jean-jaures' => ['Yakow', 'Melih', 'Noah'],
    'chavanelle' => ['Angel', 'Pierre', 'Simon', 'Julia', 'Pierrot'],
    'le-port' => ['Tigran', 'Simon'],
    'meyerbeer' => ['Archaf', 'Ayouba', 'Panos', 'Raza'],
];

/** $openBooking : les clients réservent tout de suite sur le site (sinon chaque salon reste sur Planity). */
function seed_data(PDO $pdo, bool $openBooking = false): void
{
    $seed = json_decode((string) file_get_contents(__DIR__ . '/seed.json'), true);
    $settings = [
        'brand_name' => 'Seven Barbershop',
        'notify_email' => '',
    ];
    $st = $pdo->prepare('INSERT INTO settings (k, v) VALUES (?, ?)');
    foreach ($settings as $k => $v) $st->execute([$k, $v]);

    $insSalon = $pdo->prepare('INSERT INTO salons (slug, name, city, address, postcode, planity_url, sort, booking_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ' . ($openBooking ? 1 : 0) . ')');
    $insHours = $pdo->prepare('INSERT INTO opening_hours (salon_id, weekday, is_open, open_time, close_time) VALUES (?, ?, ?, ?, ?)');
    $insStaff = $pdo->prepare('INSERT INTO staff (salon_id, name, color, bookable, active, sort) VALUES (?, ?, ?, 1, 1, ?)');
    $insStaffHours = $pdo->prepare('INSERT INTO staff_hours (staff_id, weekday, is_working, start_time, end_time) VALUES (?, ?, ?, ?, ?)');
    $insService = $pdo->prepare('INSERT INTO services (salon_id, category, name, description, duration_min, price_label, price_eur, bookable, active, sort) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?)');

    // Le salon Chavanelle n'a pas encore de carte détaillée sur le site : celle d'Anatole France sert de base.
    $fallbackServices = null;
    foreach ($seed['salons'] as $s) if ($s['services']) { $fallbackServices = $s['services']; break; }

    foreach ($seed['salons'] as $i => $s) {
        $insSalon->execute([$s['slug'], $s['name'], $s['city'], $s['address'] ?? '', $s['postcode'] ?? '', $s['planity_url'] ?? '', ($i + 1) * 10]);
        $salonId = (int) $pdo->lastInsertId();
        foreach ($s['hours'] as $h) {
            $insHours->execute([$salonId, $h['weekday'], $h['open'] ? 1 : 0, $h['from'], $h['to']]);
        }
        foreach (SEED_STAFF[$s['slug']] ?? [] as $j => $name) {
            $insStaff->execute([$salonId, $name, STAFF_PALETTE[$j % count(STAFF_PALETTE)], ($j + 1) * 10]);
            $staffId = (int) $pdo->lastInsertId();
            foreach ($s['hours'] as $h) {
                $insStaffHours->execute([$staffId, $h['weekday'], $h['open'] ? 1 : 0, $h['from'], $h['to']]);
            }
        }
        foreach ($s['services'] ?: $fallbackServices ?: [] as $k => $svc) {
            $insService->execute([$salonId, $svc['category'], $svc['name'], '', (int) $svc['duration'], $svc['price_label'], $svc['price_eur'], ($k + 1) * 10]);
        }
    }
}
