<?php
/** Salons (propriétaire uniquement) : ajout en un clic, coordonnées, ordre d'affichage. */
declare(strict_types=1);

$all = salons_list();
$back = admin_url('salons');
$counts = [];
foreach (q('SELECT salon_id, COUNT(*) AS n FROM staff WHERE active = 1 GROUP BY salon_id')->fetchAll() as $r) $counts[(int) $r['salon_id']] = (int) $r['n'];

function salon_fields(?array $s): void
{
    ?>
    <div class="grid2">
      <label>Nom du salon <input name="name" required maxlength="80" placeholder="ex. Rue de la République" value="<?= e($s['name'] ?? '') ?>"></label>
      <label>Ville <input name="city" required maxlength="80" placeholder="ex. Lyon" value="<?= e($s['city'] ?? '') ?>"></label>
    </div>
    <div class="grid3">
      <label>Adresse <input name="address" maxlength="160" value="<?= e($s['address'] ?? '') ?>"></label>
      <label>Code postal <input name="postcode" maxlength="10" value="<?= e($s['postcode'] ?? '') ?>"></label>
      <label>Téléphone <input name="phone" type="tel" maxlength="30" value="<?= e($s['phone'] ?? '') ?>"></label>
    </div>
    <label>Lien Planity <span class="muted small">(facultatif : utilisé tant que la réservation en ligne de ce salon est fermée)</span>
      <input name="planity_url" type="url" value="<?= e($s['planity_url'] ?? '') ?>"></label>
    <?php
}

admin_header('Salons', 'salons', $user, $salon);
?>
<div class="page-head">
  <div><h1>Salons</h1><p class="muted">Ajoutez un salon en un clic : il reprend les horaires et la carte d'un salon existant, puis vous ajoutez ses barbiers. Il apparaît dans la réservation en ligne dès que vous l'ouvrez.</p></div>
</div>

<?php $openCount = count(array_filter($all, fn($s) => (int) $s['booking_enabled'] === 1)); ?>
<section class="panel">
  <div class="panel-head">
    <div>
      <h2>Réservation sur le site Seven</h2>
      <p class="muted small"><?= $openCount ?> salon<?= $openCount > 1 ? 's' : '' ?> sur <?= count($all) ?> prenne<?= $openCount > 1 ? 'nt' : '' ?> les rendez-vous en ligne. Les autres renvoient vers Planity.</p>
    </div>
    <div class="head-actions">
      <?php if ($openCount < count($all)): ?>
        <form method="post" class="inline" data-confirm="Ouvrir la réservation en ligne dans tous les salons ? Pensez à fermer les réservations sur Planity pour éviter les doublons.">
          <?= csrf_field() ?><input type="hidden" name="action" value="booking_all"><input type="hidden" name="open" value="1"><input type="hidden" name="back" value="<?= e($back) ?>">
          <button class="btn" type="submit">Ouvrir dans tous les salons</button>
        </form>
      <?php endif; ?>
      <?php if ($openCount > 0): ?>
        <form method="post" class="inline" data-confirm="Fermer la réservation en ligne partout ? Les clients seront renvoyés vers Planity.">
          <?= csrf_field() ?><input type="hidden" name="action" value="booking_all"><input type="hidden" name="open" value="0"><input type="hidden" name="back" value="<?= e($back) ?>">
          <button class="btn ghost" type="submit">Tout renvoyer vers Planity</button>
        </form>
      <?php endif; ?>
    </div>
  </div>
  <ul class="list">
    <?php foreach ($all as $s): ?>
      <li><span><?= e($s['name']) ?> <span class="muted small"><?= e($s['city']) ?></span></span>
        <?= (int) $s['booking_enabled'] === 1 ? '<span class="pill ok">Site Seven</span>' : '<span class="pill">Planity</span>' ?></li>
    <?php endforeach; ?>
  </ul>
</section>

<section class="panel highlight">
  <div class="panel-head"><h2>+ Ajouter un salon</h2></div>
  <form method="post" class="stack">
    <?= csrf_field() ?><input type="hidden" name="action" value="salon_save"><input type="hidden" name="back" value="<?= e($back) ?>">
    <?php salon_fields(null); ?>
    <label>Reprendre les horaires et les prestations de
      <select name="copy_from">
        <?php foreach ($all as $s): ?><option value="<?= (int) $s['id'] ?>"<?= $s['id'] === $salon['id'] ? ' selected' : '' ?>><?= e($s['name']) ?> (<?= e($s['city']) ?>)</option><?php endforeach; ?>
        <option value="0">Aucun : horaires 9h–19h du lundi au samedi, sans prestation</option>
      </select>
    </label>
    <div><button class="btn" type="submit">Créer le salon</button></div>
  </form>
</section>

<div class="cards">
  <?php foreach ($all as $i => $s): ?>
    <details class="panel staff-card">
      <summary>
        <i class="avatar" style="background: var(--clay)"><?= e(mb_substr($s['name'], 0, 1)) ?></i>
        <span><b><?= e($s['name']) ?> · <?= e($s['city']) ?></b>
          <small><?= $counts[(int) $s['id']] ?? 0 ?> barbier<?= ($counts[(int) $s['id']] ?? 0) > 1 ? 's' : '' ?> ·
            <?= (int) $s['booking_enabled'] ? 'réservation en ligne ouverte' : 'réservation sur Planity' ?></small></span>
        <span class="order">
          <?php foreach (['up' => '↑', 'down' => '↓'] as $dir => $arrow): if (($dir === 'up' && $i === 0) || ($dir === 'down' && $i === count($all) - 1)) continue; ?>
            <button class="link" type="submit" form="mv-salon-<?= (int) $s['id'] ?>-<?= $dir ?>" aria-label="Déplacer <?= $dir === 'up' ? 'vers le haut' : 'vers le bas' ?>"><?= $arrow ?></button>
          <?php endforeach; ?>
        </span>
        <span class="chev" aria-hidden="true">›</span>
      </summary>
      <form method="post" class="stack">
        <?= csrf_field() ?><input type="hidden" name="action" value="salon_save"><input type="hidden" name="id" value="<?= (int) $s['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>">
        <?php salon_fields($s); ?>
        <div class="row-between">
          <button class="btn" type="submit">Enregistrer</button>
          <span>
            <a class="btn ghost" href="<?= e(admin_url('equipe', ['salon' => $s['slug']])) ?>">Barbiers</a>
            <a class="btn ghost" href="<?= e(admin_url('planning', ['salon' => $s['slug']])) ?>">Horaires & réservation</a>
          </span>
        </div>
      </form>
      <form method="post" class="inline right" data-confirm="Supprimer le salon <?= e($s['name']) ?> ? Possible seulement s'il n'a encore aucun rendez-vous.">
        <?= csrf_field() ?><input type="hidden" name="action" value="salon_delete"><input type="hidden" name="id" value="<?= (int) $s['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>">
        <button class="link danger" type="submit">Supprimer ce salon</button>
      </form>
    </details>
    <?php foreach (['up', 'down'] as $dir): ?>
      <form method="post" id="mv-salon-<?= (int) $s['id'] ?>-<?= $dir ?>" hidden><?= csrf_field() ?><input type="hidden" name="action" value="salon_move"><input type="hidden" name="dir" value="<?= $dir ?>"><input type="hidden" name="id" value="<?= (int) $s['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>"></form>
    <?php endforeach; ?>
  <?php endforeach; ?>
</div>
<?php admin_footer();
