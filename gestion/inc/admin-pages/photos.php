<?php
/**
 * Photos du site : pour chaque emplacement (accueil, pages générales, page de chaque salon),
 * la photo affichée, avec « Changer » (choix dans la médiathèque ou nouvel envoi),
 * l'ordre des galeries et le retour à la photo d'origine.
 * Le propriétaire gère tout le site ; un responsable gère les photos de son salon.
 */
declare(strict_types=1);

$slots = array_filter(media_slots(), fn($key) => can_edit_slot($user, $key), ARRAY_FILTER_USE_KEY);
$library = media_all();
$back = admin_url('photos');
$siteRoot = '../../';

// Le propriétaire voit d'abord le salon choisi en haut de l'écran, puis le reste
$groups = [];
foreach ($slots as $key => $def) $groups[$def['group']][$key] = $def;

admin_header('Photos du site', 'photos', $user, $salon);
?>
<div class="page-head">
  <div>
    <h1>Photos du site</h1>
    <p class="muted">Cliquez sur « Changer » pour choisir une photo de la <a href="<?= e(admin_url('medias')) ?>">médiathèque</a> ou en envoyer une nouvelle. Le site est mis à jour aussitôt.</p>
  </div>
  <div class="head-actions"><a class="btn ghost" href="<?= e($siteRoot) ?>" target="_blank" rel="noopener">Voir le site ↗</a></div>
</div>

<?php if ($user['is_owner'] && count($groups) > 1): ?>
<nav class="chips photo-groups" aria-label="Sections">
  <?php foreach (array_keys($groups) as $i => $g): ?><a class="chip" href="#g<?= $i ?>"><?= e($g) ?></a><?php endforeach; ?>
</nav>
<?php endif; ?>

<?php $gi = 0; foreach ($groups as $group => $defs): ?>
  <h2 class="photo-group-title" id="g<?= $gi++ ?>"><?= e($group) ?></h2>
  <div class="slot-grid">
  <?php foreach ($defs as $key => $def):
      $current = slot_media($key);
      $custom = (bool) $current;
      $isGallery = $def['type'] === 'gallery'; ?>
    <section class="panel slot<?= $isGallery ? ' slot-gallery' : '' ?>" id="slot-<?= e($key) ?>">
      <div class="slot-head">
        <div>
          <h3><?= e($def['label']) ?></h3>
          <p class="muted small"><?= e($def['help']) ?></p>
        </div>
        <?php if (!$custom): ?><span class="pill">Photo<?= $isGallery ? 's' : '' ?> d'origine</span>
        <?php elseif ($isGallery): ?><span class="pill ok">Galerie personnalisée · <?= count($current) ?> photo<?= count($current) > 1 ? 's' : '' ?></span>
        <?php else: ?><span class="pill ok">Photo choisie</span><?php endif; ?>
      </div>

      <?php if (!$isGallery): ?>
        <?php $src = $custom ? '../' . media_path($current[0]) : ($def['defaults'][0] ?? null); ?>
        <div class="slot-preview">
          <?php if ($src): ?><img src="<?= e($custom ? $src : $siteRoot . ltrim($src, '/')) ?>" alt="" loading="lazy"><?php else: ?><span class="muted">Aucune photo</span><?php endif; ?>
        </div>
      <?php else: ?>
        <?php
          // Chaque photo de la galerie, d'origine ou choisie, se modifie une par une.
          $items = $custom
              ? array_map(fn($m) => $m['origin'] !== null && $m['link_media'] == 0
                  ? ['link' => (int) $m['link_id'], 'origin' => (int) $m['origin'], 'src' => $siteRoot . ltrim($def['defaults'][(int) $m['origin']] ?? '', '/'), 'alt' => '']
                  : ['link' => (int) $m['link_id'], 'origin' => null, 'src' => '../' . media_path($m), 'alt' => $m['alt']], $current)
              : array_map(fn($src, $i) => ['link' => 0, 'origin' => $i, 'src' => $siteRoot . ltrim($src, '/'), 'alt' => ''], $def['defaults'], array_keys($def['defaults']));
          $n = count($items);
        ?>
        <ol class="slot-thumbs">
          <?php foreach ($items as $i => $it):
              $target = '<input type="hidden" name="slot" value="' . e($key) . '"><input type="hidden" name="link" value="' . $it['link'] . '"><input type="hidden" name="origin" value="' . ($it['link'] ? '' : $it['origin']) . '"><input type="hidden" name="back" value="' . e($back . '#slot-' . $key) . '">'; ?>
            <li class="<?= $it['origin'] !== null ? 'is-default' : '' ?>">
              <span class="thumb-num"><?= $i + 1 ?></span>
              <?php if ($i < ($def['home'] ?? 0)): ?><span class="thumb-home" title="Affichée sur la page d'accueil">Accueil</span><?php endif; ?>
              <?php if ($it['origin'] !== null): ?><span class="thumb-tag">Origine</span><?php endif; ?>
              <img src="<?= e($it['src']) ?>" alt="<?= e($it['alt']) ?>" loading="lazy">
              <div class="thumb-actions">
                <?php if ($i > 0): ?>
                  <form method="post" class="inline"><?= csrf_field() ?><input type="hidden" name="action" value="slot_move"><input type="hidden" name="dir" value="up"><?= $target ?><button type="submit" title="Avancer" aria-label="Avancer la photo <?= $i + 1 ?>">←</button></form>
                <?php endif; ?>
                <button type="button" class="thumb-change" data-pick="<?= e($key) ?>" data-mode="replace" data-link="<?= $it['link'] ?>" data-origin="<?= $it['link'] ? '' : $it['origin'] ?>" data-label="<?= e($def['label'] . ' · photo ' . ($i + 1)) ?>" title="Changer cette photo">Changer</button>
                <?php if ($i < $n - 1): ?>
                  <form method="post" class="inline"><?= csrf_field() ?><input type="hidden" name="action" value="slot_move"><input type="hidden" name="dir" value="down"><?= $target ?><button type="submit" title="Reculer" aria-label="Reculer la photo <?= $i + 1 ?>">→</button></form>
                <?php endif; ?>
                <?php if ($n > 1): ?>
                  <form method="post" class="inline" data-confirm="Retirer la photo <?= $i + 1 ?> de la galerie ?"><?= csrf_field() ?><input type="hidden" name="action" value="slot_remove"><?= $target ?><button type="submit" title="Retirer de la galerie" aria-label="Retirer la photo <?= $i + 1 ?>">✕</button></form>
                <?php endif; ?>
              </div>
            </li>
          <?php endforeach; ?>
        </ol>
      <?php endif; ?>

      <div class="slot-actions">
        <button class="btn small" type="button" data-pick="<?= e($key) ?>" data-mode="<?= $isGallery ? 'gallery' : 'single' ?>" data-label="<?= e($def['label']) ?>">
          <?= $isGallery ? '+ Ajouter des photos' : 'Changer la photo' ?>
        </button>
        <?php if ($custom): ?>
          <form method="post" class="inline" data-confirm="Revenir <?= $isGallery ? 'aux photos' : 'à la photo' ?> d'origine pour « <?= e($def['label']) ?> » ?">
            <?= csrf_field() ?><input type="hidden" name="action" value="slot_reset"><input type="hidden" name="slot" value="<?= e($key) ?>"><input type="hidden" name="back" value="<?= e($back . '#slot-' . $key) ?>">
            <button class="link small" type="submit">Rétablir l'origine</button>
          </form>
        <?php endif; ?>
      </div>
    </section>
  <?php endforeach; ?>
  </div>
<?php endforeach; ?>

<!-- Choix d'une photo (médiathèque ou nouvel envoi) -->
<dialog class="modal wide" data-dlg-pick aria-labelledby="dlg-pick-title">
  <div class="modal-head">
    <div><h2 id="dlg-pick-title">Choisir une photo</h2><p class="muted small" data-pick-label></p></div>
    <button type="button" class="close" data-close aria-label="Fermer">✕</button>
  </div>
  <div class="seg" role="tablist">
    <button type="button" role="tab" aria-selected="true" data-seg="library">Médiathèque</button>
    <button type="button" role="tab" aria-selected="false" data-seg="upload">Envoyer de nouvelles photos</button>
  </div>
  <form method="post" class="stack" data-seg-panel="library" data-pick-form>
    <?= csrf_field() ?><input type="hidden" name="action" value="slot_set" data-pick-action><input type="hidden" name="slot" data-pick-slot><input type="hidden" name="link" data-pick-link><input type="hidden" name="origin" data-pick-origin><input type="hidden" name="back" value="<?= e($back) ?>" data-pick-back>
    <?php if (!$library): ?>
      <div class="empty-box">La médiathèque est vide : envoyez vos photos avec l'onglet « Envoyer de nouvelles photos ».</div>
    <?php else: ?>
      <div class="picker-grid">
        <?php foreach ($library as $m): ?>
          <label class="picker-item" title="<?= e($m['title'] ?: $m['original_name']) ?>">
            <input type="radio" name="media[]" value="<?= (int) $m['id'] ?>" data-pick-input>
            <img src="<?= e('../' . media_path($m)) ?>" alt="<?= e($m['alt']) ?>" loading="lazy">
          </label>
        <?php endforeach; ?>
      </div>
      <div class="modal-foot pick-foot">
        <label class="pick-position" data-pick-position hidden>Placer
          <select name="position"><option value="start">au début de la galerie (vue en premier)</option><option value="end">à la fin de la galerie</option></select>
        </label>
        <button class="btn" type="submit" data-pick-submit>Utiliser cette photo</button>
      </div>
    <?php endif; ?>
  </form>
  <form method="post" enctype="multipart/form-data" class="stack" data-seg-panel="upload" data-upload hidden>
    <?= csrf_field() ?><input type="hidden" name="action" value="media_upload"><input type="hidden" name="assign_slot" data-pick-slot><input type="hidden" name="link" data-pick-link><input type="hidden" name="origin" data-pick-origin><input type="hidden" name="back" value="<?= e($back) ?>" data-pick-back>
    <label class="drop" data-drop>
      <span class="drop-icon" aria-hidden="true">⇪</span>
      <b>Glissez vos photos ici ou cliquez pour les choisir</b>
      <small>Elles sont ajoutées à la médiathèque et placées directement sur cet emplacement.</small>
      <input type="file" name="photos[]" accept="image/jpeg,image/png,image/webp" required data-pick-files>
    </label>
    <div class="previews" data-previews></div>
    <label>Description de la photo <span class="muted small">(ce qu'elle montre, pour Google et les malvoyants)</span> <input name="alt" maxlength="250"></label>
    <label class="pick-position" data-pick-position hidden>Placer
      <select name="position"><option value="start">au début de la galerie (vue en premier)</option><option value="end">à la fin de la galerie</option></select>
    </label>
    <div class="modal-foot"><button class="btn" type="submit">Envoyer et utiliser</button></div>
  </form>
</dialog>
<?php admin_footer();
