<?php
/** Prestations et prix du salon : ajout, modification, ordre d'affichage. */
declare(strict_types=1);

$services = q('SELECT * FROM services WHERE salon_id = ? ORDER BY sort, id', [$salon['id']])->fetchAll();
$back = admin_url('prestations');

function service_fields(?array $s): void
{
    ?>
    <div class="grid2">
      <label>Nom <input name="name" required maxlength="120" value="<?= e($s['name'] ?? '') ?>"></label>
      <label>Catégorie
        <select name="category">
          <?php foreach (CATEGORIES as $k => $label): ?><option value="<?= $k ?>"<?= ($s['category'] ?? '') === $k ? ' selected' : '' ?>><?= e($label) ?></option><?php endforeach; ?>
        </select>
      </label>
    </div>
    <label>Description <textarea name="description" rows="2" maxlength="500"><?= e($s['description'] ?? '') ?></textarea></label>
    <div class="grid2">
      <label>Durée (minutes) <input type="number" name="duration_min" min="5" max="720" step="5" required value="<?= e($s['duration_min'] ?? 30) ?>"></label>
      <label>Prix affiché <input name="price_label" maxlength="60" placeholder="ex. 20 €, dès 25 €" value="<?= e($s['price_label'] ?? '') ?>"></label>
    </div>
    <div class="row-checks">
      <label class="switch"><input type="checkbox" name="active" <?= !$s || (int) $s['active'] ? 'checked' : '' ?>><span></span> Active</label>
      <label class="switch"><input type="checkbox" name="bookable" <?= !$s || (int) $s['bookable'] ? 'checked' : '' ?>><span></span> Réservable en ligne</label>
    </div>
    <?php
}

admin_header('Prestations & prix', 'prestations', $user, $salon);
?>
<div class="page-head">
  <div><h1>Prestations & prix · <?= e($salon['name']) ?></h1><p class="muted">La durée sert à calculer les créneaux libres. Le premier montant du prix sert aux statistiques. Laissez le prix vide pour afficher « Sur devis ».</p></div>
</div>

<details class="panel">
  <summary class="panel-summary"><b>+ Ajouter une prestation</b></summary>
  <form method="post" class="stack">
    <?= csrf_field() ?><input type="hidden" name="action" value="service_save"><input type="hidden" name="back" value="<?= e($back) ?>">
    <?php service_fields(null); ?>
    <div><button class="btn" type="submit">Ajouter</button></div>
  </form>
</details>

<div class="svc-list">
  <?php foreach ($services as $i => $s): ?>
    <details class="svc-item<?= (int) $s['active'] ? '' : ' is-hidden' ?>">
      <summary>
        <span class="tag"><?= e(CATEGORIES[$s['category']] ?? '') ?></span>
        <b><?= e($s['name']) ?></b>
        <span class="muted"><?= e(fmt_duration((int) $s['duration_min'])) ?> · <?= e($s['price_label'] ?: 'Sur devis') ?></span>
        <?php if (!(int) $s['active']): ?><span class="pill">Masquée</span><?php elseif (!(int) $s['bookable']): ?><span class="pill">Non réservable</span><?php endif; ?>
        <span class="order">
          <?php foreach (['up' => '↑', 'down' => '↓'] as $dir => $arrow): if (($dir === 'up' && $i === 0) || ($dir === 'down' && $i === count($services) - 1)) continue; ?>
            <button class="link" type="submit" form="mv-<?= (int) $s['id'] ?>-<?= $dir ?>" aria-label="Monter / descendre"><?= $arrow ?></button>
          <?php endforeach; ?>
        </span>
      </summary>
      <form method="post" class="stack">
        <?= csrf_field() ?><input type="hidden" name="action" value="service_save"><input type="hidden" name="id" value="<?= (int) $s['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>">
        <?php service_fields($s); ?>
        <div class="row-between">
          <button class="btn" type="submit">Enregistrer</button>
          <button class="link danger" type="submit" form="del-<?= (int) $s['id'] ?>">Supprimer</button>
        </div>
      </form>
    </details>
    <form method="post" id="del-<?= (int) $s['id'] ?>" hidden data-confirm="Supprimer « <?= e($s['name']) ?> » ? Pour la cacher temporairement, décochez plutôt « Active »."><?= csrf_field() ?><input type="hidden" name="action" value="service_delete"><input type="hidden" name="id" value="<?= (int) $s['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>"></form>
    <?php foreach (['up', 'down'] as $dir): ?>
      <form method="post" id="mv-<?= (int) $s['id'] ?>-<?= $dir ?>" hidden><?= csrf_field() ?><input type="hidden" name="action" value="service_move"><input type="hidden" name="dir" value="<?= $dir ?>"><input type="hidden" name="id" value="<?= (int) $s['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>"></form>
    <?php endforeach; ?>
  <?php endforeach; ?>
</div>
<?php admin_footer();
