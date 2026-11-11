<?php
/**
 * Installation en une étape : connexion à la base, création des tables, données
 * des 5 salons, compte du propriétaire. À SUPPRIMER du serveur une fois l'installation faite.
 */
declare(strict_types=1);
require __DIR__ . '/inc/bootstrap.php';
require __DIR__ . '/inc/schema.php';

if (is_installed()) {
    http_response_code(403);
    exit('La réservation est déjà installée. Supprimez install.php de votre serveur.');
}

$errors = [];
$done = false;
$in = [
    'driver' => $_POST['driver'] ?? 'mysql',
    'host' => trim($_POST['host'] ?? 'localhost'),
    'name' => trim($_POST['name'] ?? ''),
    'user' => trim($_POST['user'] ?? ''),
    'pass' => $_POST['pass'] ?? '',
    'admin_name' => trim($_POST['admin_name'] ?? ''),
    'email' => trim($_POST['email'] ?? ''),
    'password' => $_POST['password'] ?? '',
    'origins' => trim($_POST['origins'] ?? 'https://kapnist.github.io'),
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!filter_var($in['email'], FILTER_VALIDATE_EMAIL)) $errors[] = 'Adresse e-mail du propriétaire invalide.';
    if (strlen($in['password']) < 10) $errors[] = 'Le mot de passe doit contenir au moins 10 caractères.';
    if ($in['driver'] === 'mysql' && ($in['name'] === '' || $in['user'] === '')) $errors[] = "Renseignez le nom de la base et l'utilisateur MySQL.";
    if (!is_writable(__DIR__)) $errors[] = "Le dossier n'est pas accessible en écriture (impossible de créer config.php).";
    $origins = array_values(array_filter(array_map('trim', preg_split('/[\s,]+/', $in['origins']) ?: []), fn($o) => (bool) preg_match('#^https?://[^/\s]+$#', $o)));

    if (!$errors) {
        if ($in['driver'] === 'sqlite') {
            @mkdir(__DIR__ . '/data', 0755, true);
            $dsn = 'sqlite:' . __DIR__ . '/data/seven.sqlite';
            $user = $pass = null;
        } else {
            $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $in['host'], $in['name']);
            $user = $in['user'];
            $pass = $in['pass'];
        }
        try {
            $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
            // Pas de transaction autour du DDL : MySQL valide implicitement chaque CREATE TABLE.
            foreach (schema_sql($driver) as $sql) $pdo->exec($sql);
            $pdo->beginTransaction();
            seed_data($pdo);
            $pdo->prepare('INSERT INTO admins (name, email, password_hash, salon_id, created_at) VALUES (?, ?, ?, NULL, ?)')
                ->execute([$in['admin_name'] ?: 'Propriétaire', $in['email'], password_hash($in['password'], PASSWORD_DEFAULT), date('Y-m-d H:i:s')]);
            $pdo->commit();

            $cfg = "<?php\n// Généré par install.php le " . date('d/m/Y H:i') . "\nreturn " . var_export([
                'db_dsn' => $dsn,
                'db_user' => $user,
                'db_pass' => $pass,
                // Sites autorisés à appeler l'API de réservation depuis un autre domaine
                'allowed_origins' => $origins,
                // Signe les liens d'annulation envoyés aux clients : ne pas modifier après la mise en ligne
                'app_secret' => bin2hex(random_bytes(32)),
                // Adresse publique du site, utilisée dans les e-mails (vide : domaine de la requête)
                'site_url' => '',
            ], true) . ";\n";
            file_put_contents(CONFIG_FILE, $cfg, LOCK_EX);
            @chmod(CONFIG_FILE, 0640);
            $done = true;
        } catch (Throwable $t) {
            if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
            $errors[] = 'Erreur base de données : ' . $t->getMessage();
        }
    }
}
send_security_headers();
?><!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Installation — Seven Barbershop</title>
<link rel="stylesheet" href="admin/admin.css">
</head>
<body class="auth">
<main class="auth-card wide">
  <div class="brand"><span class="brand-mark">7</span> Installation de la réservation</div>
  <?php if ($done): ?>
    <div class="alert ok">Installation terminée : 5 salons, leurs barbiers, horaires et prestations ont été créés.</div>
    <p><strong>Important :</strong> supprimez maintenant le fichier <code>install.php</code> de votre serveur.</p>
    <p>La réservation en ligne est <strong>fermée</strong> dans chaque salon : ouvrez-la salon par salon dans <em>Planning</em> quand vous êtes prêt.</p>
    <p><a class="btn" href="admin/">Ouvrir l'espace gérant</a></p>
  <?php else: ?>
    <?php foreach ($errors as $err): ?><div class="alert err"><?= e($err) ?></div><?php endforeach; ?>
    <form method="post" class="stack">
      <fieldset class="stack">
        <legend>Base de données</legend>
        <label>Type
          <select name="driver" data-driver>
            <option value="mysql" <?= $in['driver'] === 'mysql' ? 'selected' : '' ?>>MySQL / MariaDB (hébergement OVH)</option>
            <option value="sqlite" <?= $in['driver'] === 'sqlite' ? 'selected' : '' ?>>SQLite (test en local)</option>
          </select>
        </label>
        <div class="stack" data-mysql <?= $in['driver'] === 'sqlite' ? 'hidden' : '' ?>>
          <label>Serveur <input name="host" value="<?= e($in['host']) ?>"></label>
          <label>Nom de la base <input name="name" value="<?= e($in['name']) ?>"></label>
          <label>Utilisateur <input name="user" value="<?= e($in['user']) ?>" autocomplete="off"></label>
          <label>Mot de passe <input name="pass" type="password" autocomplete="off"></label>
        </div>
      </fieldset>
      <fieldset class="stack">
        <legend>Compte du propriétaire (accès à tous les salons)</legend>
        <label>Prénom <input name="admin_name" value="<?= e($in['admin_name']) ?>"></label>
        <label>E-mail <input name="email" type="email" required value="<?= e($in['email']) ?>"></label>
        <label>Mot de passe (10 caractères minimum) <input name="password" type="password" required minlength="10" autocomplete="new-password"></label>
      </fieldset>
      <fieldset class="stack">
        <legend>Sites autorisés à réserver depuis un autre domaine</legend>
        <label>Adresses, une par ligne <span class="muted small">(inutile pour le site installé sur ce domaine)</span>
          <textarea name="origins" rows="2"><?= e($in['origins']) ?></textarea></label>
      </fieldset>
      <button class="btn" type="submit">Installer</button>
    </form>
    <script src="admin/install.js"></script>
  <?php endif; ?>
</main>
</body>
</html>
