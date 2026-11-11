<?php
/**
 * Médiathèque (comme dans WordPress) : envoi de photos par glisser-déposer, textes
 * (description pour Google et les malvoyants, titre, légende), emplacements où chaque photo sert.
 */
declare(strict_types=1);

$items = media_all();
$usage = media_usage();
$slots = media_slots();
$back = admin_url('medias');
$filter = $_GET['f'] ?? 'all';
if ($filter === 'unused') $items = array_values(array_filter($items, fn($m) => empty($usage[(int) $m['id']])));

admin_header('Médiathèque', 'medias', $user, $salon);
?>
<div class="page-head">
  <div>
    <h1>Médiathèque</h1>
    <p class="muted">Toutes les photos du site. Ajoutez-en ici, puis placez-les sur le site depuis <a href="<?= e(admin_url('photos')) ?>">Photos du site</a>.</p>
  </div>
</div>

<section class="panel">
  <form method="post" enctype="multipart/form-data" class="stack" data-upload>
    <?= csrf_field() ?><input type="hidden" name="action" value="media_upload"><input type="hidden" name="back" value="<?= e($back) ?>">
    <label class="drop" data-drop>
      <span class="drop-icon" aria-hidden="true">⇪</span>
      <b>Glissez vos photos ici ou cliquez pour les choisir</b>
      <small>JPEG, PNG ou WebP · plusieurs à la fois · elles sont redimensionnées et optimisées automatiquement</small>
      <input type="file" name="photos[]" accept="image/jpeg,image/png,image/webp" multiple required>
    </label>
    <div class="previews" data-previews></div>
    <div><button class="btn" type="submit">Ajouter à la médiathèque</button></div>
  </form>
</section>

<div class="chips media-filters">
  <a class="chip<?= $filter !== 'unused' ? ' on' : '' ?>" href="<?= e(admin_url('medias')) ?>">Toutes (<?= count(media_all()) ?>)</a>
  <a class="chip<?= $filter === 'unused' ? ' on' : '' ?>" href="<?= e(admin_url('medias', ['f' => 'unused'])) ?>">Non utilisées</a>
</div>

<?php if (!$items): ?>
  <div class="empty-box">Aucune photo pour le moment. Ajoutez vos premières photos ci-dessus.</div>
<?php else: ?>
<div class="media-grid">
  <?php foreach ($items as $m): $used = $usage[(int) $m['id']] ?? []; ?>
    <article class="media-card">
      <a href="<?= e('../' . media_path($m, 'large')) ?>" target="_blank" rel="noopener" class="media-thumb">
        <img src="<?= e('../' . media_path($m)) ?>" alt="<?= e($m['alt']) ?>" loading="lazy" width="<?= (int) $m['small_width'] ?>">
      </a>
      <div class="media-body">
        <p class="media-name" title="<?= e($m['original_name']) ?>"><?= e($m['title'] ?: $m['original_name']) ?></p>
        <p class="muted small"><?= (int) $m['width'] ?> × <?= (int) $m['height'] ?> px · <?= e(fmt_date_fr(substr($m['created_at'], 0, 10))) ?></p>
        <?php if ($used): ?>
          <p class="small media-used">Utilisée : <?= e(implode(' · ', array_map(fn($s) => isset($slots[$s]) ? $slots[$s]['group'] . ' › ' . $slots[$s]['label'] : $s, $used))) ?></p>
        <?php else: ?>
          <p class="small"><span class="pill">Non utilisée</span></p>
        <?php endif; ?>
        <?php if (!$m['alt']): ?><p class="small"><span class="pill warn">Description manquante</span></p><?php endif; ?>
        <details>
          <summary class="link small">Modifier les textes</summary>
          <form method="post" class="stack tight">
            <?= csrf_field() ?><input type="hidden" name="action" value="media_update"><input type="hidden" name="id" value="<?= (int) $m['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>">
            <label>Description <span class="muted small">(ce que montre la photo : lue par Google et les malvoyants)</span>
              <input name="alt" maxlength="250" value="<?= e($m['alt']) ?>" placeholder="ex. Dégradé américain et barbe taillée"></label>
            <label>Titre <span class="muted small">(affiché sur les galeries)</span> <input name="title" maxlength="120" value="<?= e($m['title']) ?>"></label>
            <label>Légende <span class="muted small">(facultatif)</span> <input name="caption" maxlength="250" value="<?= e($m['caption']) ?>"></label>
            <div><button class="btn small" type="submit">Enregistrer</button></div>
          </form>
        </details>
        <?php if ($user['is_owner']): ?>
          <form method="post" class="inline" data-confirm="Supprimer définitivement cette photo ?<?= $used ? ' Elle est utilisée sur le site : ces emplacements reprendront leur photo précédente.' : '' ?>">
            <?= csrf_field() ?><input type="hidden" name="action" value="media_delete"><input type="hidden" name="id" value="<?= (int) $m['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>">
            <button class="link danger small" type="submit">Supprimer</button>
          </form>
        <?php endif; ?>
      </div>
    </article>
  <?php endforeach; ?>
</div>
<?php endif; ?>
<?php admin_footer();
