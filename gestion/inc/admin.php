<?php
/**
 * Espace gérant : authentification, salon courant, gabarit, messages flash.
 * Deux niveaux d'accès : le propriétaire (tous les salons) et le responsable d'un salon.
 */
declare(strict_types=1);
require_once __DIR__ . '/booking.php';

const ADMIN_NAV = [
    'agenda' => ['Agenda', 'M3 5h18M3 10h18M7 3v4m10-4v4M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z'],
    'rdv' => ['Rendez-vous', 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01'],
    'equipe' => ['Barbiers', 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1m18 0v-1a4 4 0 0 0-3-3.9M15 3.1a4 4 0 0 1 0 7.8M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z'],
    'planning' => ['Horaires & réservation', 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
    'prestations' => ['Prestations & prix', 'M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm2.1-8.1L20 18M20 6 8.1 17.1'],
    'salons' => ['Salons', 'M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6'],
    'comptes' => ['Accès gérants', 'M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9 13a6 6 0 0 1 12 0M19 8v6m3-3h-6'],
    'compte' => ['Mon compte', 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0'],
];

/** Pages réservées au propriétaire. */
const OWNER_PAGES = ['salons', 'comptes'];

function admin_user(): ?array
{
    start_session();
    if (empty($_SESSION['admin_id'])) return null;
    // Expiration après 8 h d'inactivité
    if (($_SESSION['admin_seen'] ?? 0) < time() - 8 * 3600) {
        unset($_SESSION['admin_id']);
        return null;
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

function attempt_login(string $email, string $password): bool
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
<link rel="stylesheet" href="admin.css?v=3">
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
        if (in_array($key, OWNER_PAGES, true) && !$user['is_owner']) continue; ?>
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
<script src="admin.js?v=3" defer></script>
</body>
</html>
<?php
}
