<?php
/** Barbiers du salon : fiches, jours et horaires de travail, absences et congés. */
declare(strict_types=1);

$salonId = (int) $salon['id'];
$staff = staff_list($salonId);
$hoursMap = staff_hours_map();
$absences = q('SELECT b.*, s.name AS staff_name FROM blocks b JOIN staff s ON s.id = b.staff_id WHERE b.salon_id = ? AND b.end_at > ? ORDER BY b.start_at', [$salonId, now()->format('Y-m-d H:i:s')])->fetchAll();
$back = admin_url('equipe');
$palette = STAFF_PALETTE;
// Horaires proposés pour un nouveau barbier : ceux du salon
$salonHours = [];
foreach (weekly_hours($salonId) as $d => $h) $salonHours[$d] = ['is_working' => $h['is_open'], 'start_time' => $h['open_time'], 'end_time' => $h['close_time']];

function staff_form(?array $s, array $hours, array $palette, string $back, array $defaults): void
{
    $id = $s ? (int) $s['id'] : 0;
    ?>
    <form method="post" class="stack">
      <?= csrf_field() ?><input type="hidden" name="action" value="staff_save"><input type="hidden" name="id" value="<?= $id ?>"><input type="hidden" name="back" value="<?= e($back) ?>">
      <div class="grid2">
        <label>Prénom <input name="name" required maxlength="80" value="<?= e($s['name'] ?? '') ?>"></label>
        <div class="label">Couleur dans l'agenda
          <span class="colors">
            <?php foreach ($palette as $i => $c): ?>
              <label class="color"><input type="radio" name="color" value="<?= $c ?>" <?= ($s['color'] ?? $palette[0]) === $c || (!$s && $i === 0) ? 'checked' : '' ?>><span style="background:<?= $c ?>"></span></label>
            <?php endforeach; ?>
          </span>
        </div>
      </div>
      <label class="switch"><input type="checkbox" name="bookable" <?= !$s || (int) $s['bookable'] ? 'checked' : '' ?>><span></span> Les clients peuvent le choisir en ligne</label>
      <div class="hours-table compact">
        <?php foreach ([1, 2, 3, 4, 5, 6, 0] as $d): $h = $hours[$d] ?? $defaults[$d] ?? ['is_working' => 0, 'start_time' => '09:00', 'end_time' => '19:00']; ?>
          <div class="hours-row<?= (int) $h['is_working'] ? '' : ' is-off' ?>" data-hours-row>
            <label class="check"><input type="checkbox" name="working[<?= $d ?>]" <?= (int) $h['is_working'] ? 'checked' : '' ?>> <?= WEEKDAYS[$d] ?></label>
            <input type="time" name="start_time[<?= $d ?>]" value="<?= e($h['start_time']) ?>" aria-label="Début <?= WEEKDAYS[$d] ?>">
            <input type="time" name="end_time[<?= $d ?>]" value="<?= e($h['end_time']) ?>" aria-label="Fin <?= WEEKDAYS[$d] ?>">
          </div>
        <?php endforeach; ?>
      </div>
      <div><button class="btn" type="submit"><?= $id ? 'Enregistrer son planning' : 'Ajouter ce barbier' ?></button></div>
    </form>
    <?php
}

admin_header('Barbiers', 'equipe', $user, $salon);
?>
<div class="page-head">
  <div><h1>Barbiers · <?= e($salon['name']) ?></h1><p class="muted">Chaque barbier a sa colonne dans l'agenda et son propre planning de la semaine. Les clients ne voient que les créneaux où un barbier est libre.</p></div>
</div>

<div class="cards">
  <?php foreach ($staff as $s): ?>
    <details class="panel staff-card">
      <summary>
        <i class="avatar" style="background:<?= e($s['color']) ?>"><?= e(mb_substr($s['name'], 0, 1)) ?></i>
        <span><b><?= e($s['name']) ?></b><small><?php
          $days = array_filter([1, 2, 3, 4, 5, 6, 0], fn($d) => (int) ($hoursMap[(int) $s['id']][$d]['is_working'] ?? 0));
          echo $days ? e(implode(', ', array_map(fn($d) => mb_substr(WEEKDAYS[$d], 0, 3), $days))) : 'Aucun jour travaillé';
          echo (int) $s['bookable'] ? '' : ' · non réservable en ligne';
        ?></small></span>
        <span class="chev" aria-hidden="true">›</span>
      </summary>
      <?php staff_form($s, $hoursMap[(int) $s['id']] ?? [], $palette, $back, $salonHours); ?>
      <form method="post" class="inline right" data-confirm="Retirer <?= e($s['name']) ?> de l'équipe de <?= e($salon['name']) ?> ?">
        <?= csrf_field() ?><input type="hidden" name="action" value="staff_delete"><input type="hidden" name="id" value="<?= (int) $s['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>">
        <button class="link danger" type="submit">Retirer de l'équipe</button>
      </form>
    </details>
  <?php endforeach; ?>

  <details class="panel staff-card add"<?= $staff ? '' : ' open' ?>>
    <summary><i class="avatar plus">+</i><span><b>Ajouter un barbier</b><small>Ses horaires partent de ceux du salon</small></span><span class="chev" aria-hidden="true">›</span></summary>
    <?php staff_form(null, [], $palette, $back, $salonHours); ?>
  </details>
</div>

<section class="panel">
  <div class="panel-head"><h2>Absences &amp; congés</h2></div>
  <form method="post" class="stack">
    <?= csrf_field() ?><input type="hidden" name="action" value="block_create"><input type="hidden" name="mode" value="days"><input type="hidden" name="back" value="<?= e($back) ?>">
    <div class="grid3">
      <label>Qui
        <select name="staff_id" required>
          <?php foreach ($staff as $s): ?><option value="<?= (int) $s['id'] ?>"><?= e($s['name']) ?></option><?php endforeach; ?>
        </select>
      </label>
      <label>Du <input type="date" name="date_from" required min="<?= e(now()->format('Y-m-d')) ?>"></label>
      <label>Au (inclus) <input type="date" name="date_to" min="<?= e(now()->format('Y-m-d')) ?>"></label>
    </div>
    <label>Motif (interne) <input name="note" placeholder="Congés, formation…"></label>
    <div><button class="btn" type="submit">Enregistrer l'absence</button></div>
  </form>
  <?php if ($absences): ?>
    <ul class="list">
      <?php foreach ($absences as $b):
          $full = substr($b['start_at'], 11) === '00:00:00' && substr($b['end_at'], 11) === '00:00:00';
          $endDay = (new DateTimeImmutable(substr($b['end_at'], 0, 10)))->modify($full ? '-1 day' : '+0 day')->format('Y-m-d'); ?>
        <li>
          <span><b><?= e($b['staff_name']) ?></b> ·
            <?php if ($full): ?><?= e(fmt_date_fr(substr($b['start_at'], 0, 10))) ?><?= $endDay !== substr($b['start_at'], 0, 10) ? ' → ' . e(fmt_date_fr($endDay)) : '' ?>
            <?php else: ?><?= e(fmt_date_fr(substr($b['start_at'], 0, 10))) ?>, <?= e(substr($b['start_at'], 11, 5)) ?>–<?= e(substr($b['end_at'], 11, 5)) ?><?php endif; ?>
            <?= $b['note'] ? ' · ' . e($b['note']) : '' ?></span>
          <form method="post" class="inline"><?= csrf_field() ?><input type="hidden" name="action" value="block_delete"><input type="hidden" name="id" value="<?= (int) $b['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>"><button class="link danger" type="submit">Supprimer</button></form>
        </li>
      <?php endforeach; ?>
    </ul>
  <?php endif; ?>
</section>
<?php admin_footer();
