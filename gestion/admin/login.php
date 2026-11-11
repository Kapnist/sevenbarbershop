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
    } elseif (attempt_login(trim($_POST['email'] ?? ''), (string) ($_POST['password'] ?? ''))) {
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
<link rel="stylesheet" href="admin.css?v=5">
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
    <button class="btn" type="submit">Se connecter</button>
  </form>
  <p class="small"><a href="../../">← Retour au site</a></p>
</main>
</body>
</html>
