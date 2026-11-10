<?php
/** Compte administrateur : e-mail et mot de passe. */
declare(strict_types=1);

$back = admin_url('compte');
admin_header('Mon compte', 'compte', $user, $salon);
?>
<div class="page-head"><div><h1>Mon compte</h1></div></div>
<section class="panel narrow">
  <form method="post" class="stack">
    <?= csrf_field() ?><input type="hidden" name="action" value="account_save"><input type="hidden" name="back" value="<?= e($back) ?>">
    <label>Prénom <input name="name" value="<?= e($user['name']) ?>"></label>
    <label>E-mail de connexion <input type="email" name="email" required value="<?= e($user['email']) ?>" autocomplete="username"></label>
    <label>Nouveau mot de passe <span class="muted small">(laisser vide pour ne pas changer)</span> <input type="password" name="new" minlength="10" autocomplete="new-password"></label>
    <label>Confirmer le nouveau mot de passe <input type="password" name="confirm" autocomplete="new-password"></label>
    <hr>
    <label>Mot de passe actuel <span class="muted small">(obligatoire pour valider)</span> <input type="password" name="current" required autocomplete="current-password"></label>
    <div><button class="btn" type="submit">Enregistrer</button></div>
  </form>
</section>
<?php admin_footer();
