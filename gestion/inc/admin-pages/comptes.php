<?php
/** Accès gérants (propriétaire uniquement) : qui peut se connecter, et à quels salons. */
declare(strict_types=1);

$admins = q('SELECT a.*, s.name AS salon_name FROM admins a LEFT JOIN salons s ON s.id = a.salon_id ORDER BY a.salon_id IS NOT NULL, s.sort, a.name, a.email')->fetchAll();
$back = admin_url('comptes');

function admin_fields(?array $a, ?int $defaultSalon = null): void
{
    ?>
    <div class="grid2">
      <label>Prénom <input name="name" maxlength="80" value="<?= e($a['name'] ?? '') ?>"></label>
      <label>E-mail de connexion <input type="email" name="email" required value="<?= e($a['email'] ?? '') ?>" autocomplete="off"></label>
    </div>
    <div class="grid2">
      <label>Accès
        <select name="salon_id">
          <?php foreach (salons_list() as $s):
              $selected = $a ? $a['salon_id'] !== null && (int) $a['salon_id'] === (int) $s['id'] : (int) $s['id'] === $defaultSalon; ?>
            <option value="<?= (int) $s['id'] ?>"<?= $selected ? ' selected' : '' ?>>Compte du salon <?= e($s['name']) ?> (<?= e($s['city']) ?>) : ne voit que ce salon</option>
          <?php endforeach; ?>
          <option value="0"<?= $a && $a['salon_id'] === null ? ' selected' : '' ?>>Propriétaire : vue globale, tous les salons</option>
        </select>
      </label>
      <label><?= $a ? 'Nouveau mot de passe <span class="muted small">(vide : inchangé)</span>' : 'Mot de passe (10 caractères minimum)' ?>
        <input type="password" name="password" minlength="10" <?= $a ? '' : 'required' ?> autocomplete="new-password"></label>
    </div>
    <?php
}

admin_header('Comptes des salons', 'comptes', $user, $salon);
?>
<div class="page-head">
  <div><h1>Comptes des salons</h1><p class="muted">Créez un compte pour chaque salon : en se connectant, le salon ne voit que ses propres informations (agenda, rendez-vous, clients, barbiers, horaires, prix et statistiques). Le compte propriétaire garde la vue globale sur tous les salons. Les barbiers n'ont pas besoin de compte.</p></div>
</div>

<?php // Salons qui n'ont pas encore de compte : création en un clic
$withAccount = array_map('intval', array_filter(array_column($admins, 'salon_id'), fn($v) => $v !== null));
$missing = array_values(array_filter(salons_list(), fn($s) => !in_array((int) $s['id'], $withAccount, true)));
if ($missing): ?>
  <p class="muted small">Salons sans compte : <?= e(implode(', ', array_map(fn($s) => $s['name'], $missing))) ?>.</p>
<?php endif; ?>

<div class="cards">
  <?php foreach ($admins as $a): ?>
    <details class="panel staff-card">
      <summary>
        <i class="avatar" style="background: <?= $a['salon_id'] === null ? 'var(--gold)' : 'var(--moss)' ?>"><?= e(mb_strtoupper(mb_substr($a['name'] ?: $a['email'], 0, 1))) ?></i>
        <span><b><?= e($a['name'] ?: $a['email']) ?><?= (int) $a['id'] === (int) $user['id'] ? ' (vous)' : '' ?></b>
          <small><?= $a['salon_id'] === null ? 'Propriétaire · vue globale' : 'Compte du salon ' . e($a['salon_name']) ?> · <?= e($a['email']) ?></small></span>
        <span class="chev" aria-hidden="true">›</span>
      </summary>
      <form method="post" class="stack">
        <?= csrf_field() ?><input type="hidden" name="action" value="admin_save"><input type="hidden" name="id" value="<?= (int) $a['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>">
        <?php admin_fields($a); ?>
        <div><button class="btn" type="submit">Enregistrer</button></div>
      </form>
      <?php if ((int) $a['id'] !== (int) $user['id']): ?>
        <form method="post" class="inline right" data-confirm="Supprimer l'accès de <?= e($a['name'] ?: $a['email']) ?> ?">
          <?= csrf_field() ?><input type="hidden" name="action" value="admin_delete"><input type="hidden" name="id" value="<?= (int) $a['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>">
          <button class="link danger" type="submit">Supprimer cet accès</button>
        </form>
      <?php endif; ?>
    </details>
  <?php endforeach; ?>

  <details class="panel staff-card add">
    <summary><i class="avatar plus">+</i><span><b>Créer un compte de salon</b><small>Le salon ne verra que ses informations</small></span><span class="chev" aria-hidden="true">›</span></summary>
    <form method="post" class="stack">
      <?= csrf_field() ?><input type="hidden" name="action" value="admin_save"><input type="hidden" name="back" value="<?= e($back) ?>">
      <?php admin_fields(null, $missing ? (int) $missing[0]['id'] : (int) $salon['id']); ?>
      <div><button class="btn" type="submit">Créer le compte</button></div>
    </form>
  </details>
</div>
<?php admin_footer();
