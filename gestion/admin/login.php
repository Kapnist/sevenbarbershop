<?php
declare(strict_types=1);
require dirname(__DIR__) . '/inc/bootstrap.php';
require dirname(__DIR__) . '/inc/admin.php';

if (!is_installed()) redirect('../install.php');
send_security_headers();
if (admin_user()) redirect('index.php');

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_valid($_POST['csrf'] ?? null)) {
        $error = 'Session expirée, réessayez.';
    } elseif (login_blocked()) {
        $error = 'Trop de tentatives. Réessayez dans 15 minutes.';
    } elseif (attempt_login(trim($_POST['email'] ?? ''), (string) ($_POST['password'] ?? ''), isset($_POST['remember']))) {
        redirect('index.php');
    } else {
        $error = 'E-mail ou mot de passe incorrect.';
    }
}
$brand = setting('brand_name', 'Seven Barbershop');
?><!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Connexion — <?= e($brand) ?></title>
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
<body class="auth">
<main class="auth-card">
  <div class="brand"><span class="brand-mark">7</span><?= e($brand) ?></div>
  <h1>Espace gérant</h1>
  <?php if ($error): ?><div class="alert err" role="alert"><?= e($error) ?></div><?php endif; ?>
  <form method="post" class="stack">
    <?= csrf_field() ?>
    <label>E-mail <input type="email" name="email" autocomplete="username" required autofocus value="<?= e($_POST['email'] ?? '') ?>"></label>
    <label>Mot de passe <input type="password" name="password" autocomplete="current-password" required></label>
    <label class="check"><input type="checkbox" name="remember"> Rester connecté sur cet appareil (30 jours)</label>
    <p class="muted small">À cocher seulement sur la tablette du salon, jamais sur un appareil partagé.</p>
    <button class="btn" type="submit">Se connecter</button>
  </form>
  <p class="small"><a href="../../">← Retour au site</a></p>
</main>
</body>
</html>
