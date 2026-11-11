<?php
/**
 * Seven Barbershop — réservation et espace gérant : socle commun
 * (base de données, session, sécurité, réglages, utilitaires).
 * Adapté du moteur Dramey Style, étendu à plusieurs salons.
 */
declare(strict_types=1);

define('ROOT', dirname(__DIR__));
define('CONFIG_FILE', ROOT . '/config.php');

date_default_timezone_set('Europe/Paris');
mb_internal_encoding('UTF-8');

function is_installed(): bool
{
    return is_file(CONFIG_FILE);
}

function config(?string $key = null)
{
    static $cfg = null;
    if ($cfg === null) {
        $cfg = is_installed() ? require CONFIG_FILE : [];
    }
    return $key === null ? $cfg : ($cfg[$key] ?? null);
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(config('db_dsn'), config('db_user'), config('db_pass'), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        if (db_driver($pdo) === 'sqlite') {
            $pdo->exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
        } else {
            $pdo->exec("SET NAMES utf8mb4, time_zone = '" . date('P') . "'");
        }
    }
    return $pdo;
}

function db_driver(?PDO $pdo = null): string
{
    return ($pdo ?? db())->getAttribute(PDO::ATTR_DRIVER_NAME);
}

/** Exécute une requête préparée et renvoie le statement. */
function q(string $sql, array $params = []): PDOStatement
{
    $st = db()->prepare($sql);
    $st->execute($params);
    return $st;
}

/* ---------- Réglages généraux (table settings clé/valeur) ---------- */

function settings(): array
{
    static $cache = null;
    if ($cache === null) {
        $cache = [];
        foreach (q('SELECT k, v FROM settings')->fetchAll() as $row) {
            $cache[$row['k']] = $row['v'];
        }
    }
    return $cache;
}

function setting(string $key, $default = '')
{
    return settings()[$key] ?? $default;
}

function setting_set(string $key, string $value): void
{
    q('DELETE FROM settings WHERE k = ?', [$key]);
    q('INSERT INTO settings (k, v) VALUES (?, ?)', [$key, $value]);
}

/* ---------- Sortie & utilitaires ---------- */

function e($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function json_out($data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function redirect(string $url): never
{
    header('Location: ' . $url);
    exit;
}

function client_ip(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

function now(): DateTimeImmutable
{
    return new DateTimeImmutable('now');
}

function valid_date(string $s): bool
{
    $d = DateTimeImmutable::createFromFormat('!Y-m-d', $s);
    return $d !== false && $d->format('Y-m-d') === $s;
}

function valid_time(string $s): bool
{
    return (bool) preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $s);
}

function to_min(string $hhmm): int
{
    [$h, $m] = array_map('intval', explode(':', substr($hhmm, 0, 5)));
    return $h * 60 + $m;
}

function from_min(int $min): string
{
    return sprintf('%02d:%02d', intdiv($min, 60), $min % 60);
}

function fmt_hour(string $hhmm): string
{
    $hhmm = substr($hhmm, 0, 5);
    return str_ends_with($hhmm, ':00') ? (int) $hhmm . 'h' : str_replace(':', 'h', ltrim($hhmm, '0'));
}

function fmt_date_fr(string $ymd, bool $withYear = false): string
{
    $days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    $months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    $d = new DateTimeImmutable($ymd);
    $s = $days[(int) $d->format('w')] . ' ' . (int) $d->format('j') . ' ' . $months[(int) $d->format('n') - 1];
    return $withYear ? $s . ' ' . $d->format('Y') : $s;
}

function fmt_duration(int $min): string
{
    if ($min < 60) return $min . ' min';
    $h = intdiv($min, 60);
    $m = $min % 60;
    return $h . 'h' . ($m ? sprintf('%02d', $m) : '');
}

/** Numéro français normalisé « 06 12 34 56 78 », ou null s'il est invalide. */
function normalize_phone(string $s): ?string
{
    $digits = preg_replace('/\D+/', '', $s);
    if (str_starts_with($digits, '33') && strlen($digits) === 11) $digits = '0' . substr($digits, 2);
    if (!preg_match('/^0[1-9]\d{8}$/', $digits)) return null;
    return trim(chunk_split($digits, 2, ' '));
}

const WEEKDAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

/** Catégories de prestations (mêmes clés que le site React). */
const CATEGORIES = [
    'cut' => 'Coupe',
    'cutBeard' => 'Coupe & barbe',
    'beard' => 'Barbe',
    'colour' => 'Couleur & lissage',
    'care' => 'Soins',
];

/** Couleurs des colonnes des barbiers dans l'agenda. */
const STAFF_PALETTE = ['#c8a96e', '#5f8f75', '#8c6bb1', '#4f7cac', '#b5546f', '#d08a3c', '#3f9a8e'];

/* ---------- Liens signés & e-mails ---------- */

/**
 * Clé secrète du serveur. Les installations récentes l'ont dans config.php (app_secret) ;
 * sinon elle est dérivée des identifiants de la base, qui ne quittent jamais le serveur.
 */
function app_secret(): string
{
    $secret = (string) (config('app_secret') ?? '');
    if ($secret !== '') return $secret;
    return hash('sha256', 'seven|' . config('db_dsn') . '|' . config('db_user') . '|' . config('db_pass') . '|' . CONFIG_FILE);
}

/** Jeton d'annulation en ligne d'un rendez-vous (lien envoyé au client). */
function cancel_token(string $ref): string
{
    return substr(hash_hmac('sha256', 'cancel|' . $ref, app_secret()), 0, 32);
}

function cancel_token_valid(string $ref, string $token): bool
{
    return $ref !== '' && $token !== '' && hash_equals(cancel_token($ref), $token);
}

/** Adresse publique du site (config.php → site_url, sinon le domaine de la requête). */
function site_url(): string
{
    $configured = rtrim((string) (config('site_url') ?? ''), '/');
    if ($configured !== '') return $configured;
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    $host = preg_replace('/[^a-z0-9.\-:]/i', '', (string) ($_SERVER['HTTP_HOST'] ?? 'localhost'));
    return ($https ? 'https' : 'http') . '://' . $host;
}

/** Lien d'annulation à donner au client. */
function cancel_url(string $ref): string
{
    return site_url() . '/reservation/annuler?' . http_build_query(['ref' => $ref, 't' => cancel_token($ref)]);
}

/**
 * Envoie un e-mail texte. OVH exige un expéditeur du domaine hébergé :
 * on utilise noreply@<domaine> (ou config.php → mail_from).
 */
function send_mail(string $to, string $subject, string $body, string $replyTo = ''): bool
{
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) return false;
    $host = preg_replace('/^www\./', '', (string) parse_url(site_url(), PHP_URL_HOST));
    $from = (string) (config('mail_from') ?? '') ?: 'noreply@' . ($host ?: 'localhost');
    $brand = setting('brand_name', 'Seven Barbershop');
    $headers = 'From: =?UTF-8?B?' . base64_encode($brand) . "?= <$from>\r\n"
        . "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n";
    if ($replyTo !== '' && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) $headers .= "Reply-To: $replyTo\r\n";
    // Mode test : les e-mails sont écrits dans data/mails.log au lieu d'être envoyés.
    if (config('mail_log')) {
        @file_put_contents(ROOT . '/data/mails.log', "To: $to\nSubject: $subject\n\n$body\n-----\n", FILE_APPEND | LOCK_EX);
        return true;
    }
    return @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, '-f' . $from);
}

/* ---------- Session & sécurité ---------- */

function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    session_name('seven_sid');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function csrf_token(): string
{
    start_session();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';
}

function csrf_valid(?string $token): bool
{
    start_session();
    return is_string($token) && !empty($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $token);
}

function send_security_headers(): void
{
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('X-Frame-Options: SAMEORIGIN');
}

/**
 * En-têtes CORS de l'API publique. Les sites autorisés (par exemple la version de test
 * sur GitHub Pages) sont listés dans config.php → allowed_origins. Le site installé
 * sur le même domaine que /gestion n'en a pas besoin.
 */
function api_cors(array $methods = ['GET']): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = (array) (config('allowed_origins') ?? []);
    if ($origin !== '' && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: ' . implode(', ', [...$methods, 'OPTIONS']));
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Max-Age: 86400');
    }
    header('X-Content-Type-Options: nosniff');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/**
 * Limite le nombre d'actions par adresse IP (réservations en ligne…).
 * @return bool true si la limite est atteinte
 */
function rate_limited(string $kind, int $max, int $windowSeconds): bool
{
    $since = now()->modify("-$windowSeconds seconds")->format('Y-m-d H:i:s');
    q('DELETE FROM rate_hits WHERE hit_at < ?', [now()->modify('-1 day')->format('Y-m-d H:i:s')]);
    $count = (int) q('SELECT COUNT(*) FROM rate_hits WHERE kind = ? AND ip = ? AND hit_at > ?', [$kind, client_ip(), $since])->fetchColumn();
    return $count >= $max;
}

function rate_hit(string $kind): void
{
    q('INSERT INTO rate_hits (kind, ip, hit_at) VALUES (?, ?, ?)', [$kind, client_ip(), now()->format('Y-m-d H:i:s')]);
}

/**
 * Exécute $fn sous un verrou exclusif pour éviter deux réservations simultanées
 * sur le même créneau.
 */
function with_booking_lock(callable $fn)
{
    $pdo = db();
    if (db_driver() === 'mysql') {
        $got = (int) $pdo->query("SELECT GET_LOCK('seven_booking', 10)")->fetchColumn();
        if ($got !== 1) throw new RuntimeException('Serveur occupé, réessayez.');
        try {
            return $fn();
        } finally {
            $pdo->query("SELECT RELEASE_LOCK('seven_booking')");
        }
    }
    $pdo->exec('BEGIN IMMEDIATE');
    try {
        $result = $fn();
        $pdo->exec('COMMIT');
        return $result;
    } catch (Throwable $t) {
        $pdo->exec('ROLLBACK');
        throw $t;
    }
}
