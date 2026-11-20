<?php
/**
 * Espace gérant : authentification, salon courant, gabarit, messages flash.
 * Deux niveaux d'accès : le propriétaire (tous les salons) et le responsable d'un salon.
 */
declare(strict_types=1);
require_once __DIR__ . '/booking.php';
require_once __DIR__ . '/media.php';

const ADMIN_NAV = [
    'global' => ["Vue d'ensemble", 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z'],
    'agenda' => ['Agenda', 'M3 5h18M3 10h18M7 3v4m10-4v4M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z'],
    'rdv' => ['Rendez-vous', 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01'],
    'clients' => ['Clients', 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm11 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8'],
    'stats' => ['Statistiques', 'M3 3v18h18M7 15l4-4 3 3 5-6'],
    'equipe' => ['Barbiers', 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1m18 0v-1a4 4 0 0 0-3-3.9M15 3.1a4 4 0 0 1 0 7.8M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z'],
    'planning' => ['Horaires & réservation', 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
    'prestations' => ['Prestations & prix', 'M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm2.1-8.1L20 18M20 6 8.1 17.1'],
    'photos' => ['Photos du site', 'M4 16l4.6-4.6a2 2 0 0 1 2.8 0L16 16m-2-2 1.6-1.6a2 2 0 0 1 2.8 0L20 14M14 8h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z'],
    'medias' => ['Médiathèque', 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm9 3v6m-3-3h6'],
    'salons' => ['Salons', 'M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6'],
    'comptes' => ['Comptes des salons', 'M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9 13a6 6 0 0 1 12 0M19 8v6m3-3h-6'],
    'compte' => ['Mon compte', 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0'],
];

/** Pages réservées au propriétaire. */
const OWNER_PAGES = ['global', 'salons', 'comptes'];

/* ---------- « Rester connecté sur cet appareil » (tablette du salon) ---------- */

const REMEMBER_COOKIE = 'seven_remember';
const REMEMBER_DAYS = 30;

/** Jetons de connexion durable : seul un hachage du secret est gardé en base. */
function ensure_remember_schema(): void
{
    static $done = false;
    if ($done) return;
    $done = true;
    $mysql = db_driver() === 'mysql';
    $id = $mysql ? 'INT UNSIGNED AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
    $fk = $mysql ? 'INT UNSIGNED' : 'INTEGER';
    $tail = $mysql ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci' : '';
    db()->exec("CREATE TABLE IF NOT EXISTS admin_tokens (
        id $id,
        admin_id $fk NOT NULL,
        selector VARCHAR(24) NOT NULL UNIQUE,
        token_hash VARCHAR(64) NOT NULL,
        device VARCHAR(190) NOT NULL DEFAULT '',
        expires_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL
    )$tail");
}

function https_request(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}

function set_remember_cookie(string $value, int $expires): void
{
    setcookie(REMEMBER_COOKIE, $value, [
        'expires' => $expires,
        'path' => '/',
        'secure' => https_request(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

/** Crée un jeton pour cet appareil (ou le renouvelle) et pose le cookie pour 30 jours. */
function remember_device(int $adminId): void
{
    ensure_remember_schema();
    $selector = bin2hex(random_bytes(12));
    $validator = bin2hex(random_bytes(32));
    $expires = time() + REMEMBER_DAYS * 86400;
    q('DELETE FROM admin_tokens WHERE expires_at < ?', [now()->format('Y-m-d H:i:s')]);
    q('INSERT INTO admin_tokens (admin_id, selector, token_hash, device, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
        $adminId, $selector, hash('sha256', $validator), mb_substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 190),
        date('Y-m-d H:i:s', $expires), now()->format('Y-m-d H:i:s'),
    ]);
    // Séparateur « . » : setcookie() n'encode pas ce caractère (« : » deviendrait « %3A »)
    set_remember_cookie("$selector.$validator", $expires);
}

/** Oublie cet appareil (déconnexion). */
function forget_device(): void
{
    $cookie = (string) ($_COOKIE[REMEMBER_COOKIE] ?? '');
    if ($cookie !== '' && str_contains($cookie, '.')) {
        ensure_remember_schema();
        q('DELETE FROM admin_tokens WHERE selector = ?', [explode('.', $cookie, 2)[0]]);
    }
    set_remember_cookie('', time() - 3600);
}

/** Déconnecte tous les appareils d'un compte (mot de passe changé, accès supprimé). */
function forget_all_devices(int $adminId): void
{
    ensure_remember_schema();
    q('DELETE FROM admin_tokens WHERE admin_id = ?', [$adminId]);
}

/** Reconnecte l'appareil grâce à son cookie, si le jeton est valide (le secret est alors renouvelé). */
function login_from_cookie(): bool
{
    $cookie = (string) ($_COOKIE[REMEMBER_COOKIE] ?? '');
    if (!preg_match('/^([a-f0-9]{24})\.([a-f0-9]{64})$/', $cookie, $m)) return false;
    ensure_remember_schema();
    $row = q('SELECT * FROM admin_tokens WHERE selector = ?', [$m[1]])->fetch();
    if (!$row || $row['expires_at'] < now()->format('Y-m-d H:i:s') || !hash_equals($row['token_hash'], hash('sha256', $m[2]))) {
        if ($row) q('DELETE FROM admin_tokens WHERE id = ?', [$row['id']]);
        set_remember_cookie('', time() - 3600);
        return false;
    }
    q('DELETE FROM admin_tokens WHERE id = ?', [$row['id']]);
    start_session();
    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int) $row['admin_id'];
    $_SESSION['admin_seen'] = time();
    $_SESSION['remembered'] = true;
    remember_device((int) $row['admin_id']);
    return true;
}

function admin_user(): ?array
{
    start_session();
    if (empty($_SESSION['admin_id']) && !login_from_cookie()) return null;
    // Expiration après 8 h d'inactivité, sauf sur un appareil où l'on a choisi de rester connecté
    if (empty($_SESSION['remembered']) && ($_SESSION['admin_seen'] ?? 0) < time() - 8 * 3600) {
        unset($_SESSION['admin_id']);
        if (!login_from_cookie()) return null;
    }
    $_SESSION['admin_seen'] = time();
    $u = q('SELECT id, name, email, salon_id FROM admins WHERE id = ?', [$_SESSION['admin_id']])->fetch();
    if (!$u) return null;
    $u['is_owner'] = $u['salon_id'] === null;
    return $u;
}

function require_admin(): array
{
    if (!is_installed()) redirect('../install.php');
    $u = admin_user();
    if (!$u) redirect('login.php');
    return $u;
}

/** Salons que l'utilisateur peut gérer. */
function admin_salons(array $user): array
{
    if ($user['is_owner']) return salons_list();
    $s = salon_by_id((int) $user['salon_id']);
    return $s ? [$s] : [];
}

/**
 * Salon affiché : choisi dans le menu (?salon=slug, mémorisé en session) pour le propriétaire,
 * toujours le sien pour un responsable de salon.
 */
function current_salon(array $user): array
{
    $allowed = admin_salons($user);
    if (!$allowed) throw new RuntimeException('Aucun salon associé à ce compte.');
    start_session();
    if (isset($_GET['salon'])) {
        foreach ($allowed as $s) if ($s['slug'] === $_GET['salon']) $_SESSION['salon_id'] = (int) $s['id'];
    }
    foreach ($allowed as $s) if ((int) $s['id'] === (int) ($_SESSION['salon_id'] ?? 0)) return $s;
    $_SESSION['salon_id'] = (int) $allowed[0]['id'];
    return $allowed[0];
}

/** Vérifie qu'une ligne (barbier, prestation, rendez-vous…) appartient au salon courant. */
function owned_by_salon(string $table, int $id, array $salon): bool
{
    if (!in_array($table, ['staff', 'services', 'appointments', 'blocks', 'schedule_exceptions'], true)) return false;
    return (bool) q("SELECT 1 FROM $table WHERE id = ? AND salon_id = ?", [$id, $salon['id']])->fetchColumn();
}

function login_blocked(): bool
{
    $since = now()->modify('-15 minutes')->format('Y-m-d H:i:s');
    return (int) q('SELECT COUNT(*) FROM login_attempts WHERE ip = ? AND attempted_at > ?', [client_ip(), $since])->fetchColumn() >= 5;
}

function attempt_login(string $email, string $password, bool $remember = false): bool
{
    q('DELETE FROM login_attempts WHERE attempted_at < ?', [now()->modify('-1 day')->format('Y-m-d H:i:s')]);
    if (login_blocked()) return false;
    $u = q('SELECT * FROM admins WHERE email = ?', [$email])->fetch();
    if (!$u || !password_verify($password, $u['password_hash'])) {
        q('INSERT INTO login_attempts (ip, attempted_at) VALUES (?, ?)', [client_ip(), now()->format('Y-m-d H:i:s')]);
        return false;
    }
    if (password_needs_rehash($u['password_hash'], PASSWORD_DEFAULT)) {
        q('UPDATE admins SET password_hash = ? WHERE id = ?', [password_hash($password, PASSWORD_DEFAULT), $u['id']]);
    }
    start_session();
    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int) $u['id'];
    $_SESSION['admin_seen'] = time();
    if ($remember) {
        $_SESSION['remembered'] = true;
        remember_device((int) $u['id']);
    }
    q('DELETE FROM login_attempts WHERE ip = ?', [client_ip()]);
    return true;
}

function flash(string $msg, string $type = 'ok'): void
{
    start_session();
    $_SESSION['flash'][] = [$type, $msg];
}

function take_flashes(): array
{
    start_session();
    $f = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $f;
}

function icon(string $path, int $size = 20): string
{
    return '<svg width="' . $size . '" height="' . $size . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' . e($path) . '"/></svg>';
}

function admin_url(string $page, array $params = []): string
{
    return 'index.php?' . http_build_query(['p' => $page] + $params);
}

function admin_header(string $title, string $active, array $user, array $salon): void
{
    send_security_headers();
    header('Cache-Control: no-store');
    $pending = (int) q("SELECT COUNT(*) FROM appointments WHERE salon_id = ? AND status = 'confirmed' AND source <> 'admin' AND created_at >= ?", [
        $salon['id'], now()->modify('-1 day')->format('Y-m-d H:i:s'),
    ])->fetchColumn();
    $salons = admin_salons($user);
    $brand = setting('brand_name', 'Seven Barbershop');
    ?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?= e($title) ?> · <?= e($salon['name']) ?> — <?= e($brand) ?></title>
<link rel="stylesheet" href="admin.css?v=13">
<!-- Icône sur l'écran d'accueil de la tablette : ouvre l'espace gérant en plein écran, comme une application -->
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#111b18">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="Seven gérant">
<link rel="apple-touch-icon" href="icon-180.png">
<link rel="icon" href="icon-192.png" type="image/png">
</head>
<body class="admin">
<header class="topbar">
  <button class="nav-btn" type="button" aria-controls="sidebar" aria-expanded="false" aria-label="Ouvrir le menu" data-sidebar-toggle>
    <span class="burger" aria-hidden="true"><span></span><span></span><span></span></span>
  </button>
  <a class="brand" href="index.php"><span class="brand-mark">7</span><span class="brand-name"><?= e($brand) ?></span></a>
  <?php if (count($salons) > 1): ?>
    <form method="get" class="salon-switch" data-autosubmit>
      <input type="hidden" name="p" value="<?= e($active) ?>">
      <label class="sr-only" for="salon-switch">Salon</label>
      <select id="salon-switch" name="salon">
        <?php foreach ($salons as $s): ?>
          <option value="<?= e($s['slug']) ?>"<?= $s['id'] === $salon['id'] ? ' selected' : '' ?>><?= e($s['name']) ?> · <?= e($s['city']) ?></option>
        <?php endforeach; ?>
      </select>
    </form>
  <?php else: ?>
    <span class="salon-name"><?= e($salon['name']) ?> · <?= e($salon['city']) ?></span>
  <?php endif; ?>
  <a class="topbar-site" href="../../" target="_blank" rel="noopener">Voir le site ↗</a>
</header>
<aside class="sidebar" id="sidebar">
  <nav aria-label="Administration">
    <?php foreach (ADMIN_NAV as $key => [$label, $path]):
        if (in_array($key, OWNER_PAGES, true) && !$user['is_owner']) continue;
        if ($key === 'stats' && !can_see_stats($user)) continue; ?>
      <a href="<?= e(admin_url($key)) ?>"<?= $key === $active ? ' aria-current="page"' : '' ?>>
        <?= icon($path) ?><span><?= e($label) ?></span>
        <?php if ($key === 'rdv' && $pending): ?><b class="badge" title="Réservations en ligne des dernières 24 h"><?= $pending ?></b><?php endif; ?>
      </a>
    <?php endforeach; ?>
  </nav>
  <div class="sidebar-foot">
    <span><?= e($user['name'] ?: $user['email']) ?><small><?= $user['is_owner'] ? 'Propriétaire' : 'Responsable ' . e($salon['name']) ?></small></span>
    <form method="post" action="logout.php"><?= csrf_field() ?><button type="submit" class="link">Se déconnecter</button></form>
  </div>
</aside>
<div class="scrim" data-sidebar-scrim></div>
<main class="content">
  <?php foreach (take_flashes() as [$type, $msg]): ?>
    <div class="alert <?= e($type) ?>" role="status"><?= e($msg) ?></div>
  <?php endforeach; ?>
<?php
}

function admin_footer(): void
{
    ?>
</main>
<script src="admin.js?v=10" defer></script>
</body>
</html>
<?php
}
