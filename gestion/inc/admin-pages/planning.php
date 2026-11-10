<?php
/** Réservation en ligne du salon, horaires, fermetures exceptionnelles. */
declare(strict_types=1);

$salonId = (int) $salon['id'];
$hours = weekly_hours($salonId);
$exceptions = q('SELECT * FROM schedule_exceptions WHERE salon_id = ? AND day >= ? ORDER BY day', [$salonId, now()->format('Y-m-d')])->fetchAll();
$salonBlocks = q('SELECT * FROM blocks WHERE salon_id = ? AND staff_id IS NULL AND end_at > ? ORDER BY start_at', [$salonId, now()->format('Y-m-d H:i:s')])->fetchAll();
[$first, $last] = booking_window($salon);
$mode = $salon['booking_mode'];
$enabled = (int) $salon['booking_enabled'] === 1;
$back = admin_url('planning');

admin_header('Horaires & réservation', 'planning', $user, $salon);
?>
<div class="page-head">
  <div><h1>Horaires & réservation · <?= e($salon['name']) ?></h1><p class="muted">Ouvrez la réservation en ligne de ce salon, réglez ses horaires et ses fermetures.</p></div>
</div>

<section class="panel highlight">
  <div class="panel-head">
    <h2>Réservation en ligne</h2>
    <span class="pill <?= $enabled ? 'ok' : 'warn' ?>"><?= $enabled ? 'Ouverte jusqu\'au ' . e(fmt_date_fr($last, true)) : 'Fermée : le site renvoie vers Planity' ?></span>
  </div>
  <form method="post" class="stack">
    <?= csrf_field() ?><input type="hidden" name="action" value="booking_save"><input type="hidden" name="back" value="<?= e($back) ?>">
    <label class="switch"><input type="checkbox" name="booking_enabled" <?= $enabled ? 'checked' : '' ?>><span></span> Les clients réservent ce salon sur le site Seven (sinon, le bouton « Réserver » mène à Planity)</label>

    <fieldset class="radio-cards">
      <legend>Planning ouvert</legend>
      <label class="radio-card">
        <input type="radio" name="booking_mode" value="rolling" <?= $mode !== 'until' ? 'checked' : '' ?>>
        <span><b>En continu</b> sur les <input type="number" name="booking_days_ahead" min="1" max="365" value="<?= e($salon['booking_days_ahead']) ?>" class="tiny"> prochains jours
        <small>Chaque jour, une nouvelle journée s'ouvre automatiquement.</small></span>
      </label>
      <label class="radio-card">
        <input type="radio" name="booking_mode" value="until" <?= $mode === 'until' ? 'checked' : '' ?>>
        <span><b>Jusqu'à une date</b> : <input type="date" name="booking_until" value="<?= e($salon['booking_until'] ?: $last) ?>" min="<?= e($first) ?>">
        <small>Vous ouvrez le planning à la main, par exemple mois par mois.</small></span>
      </label>
    </fieldset>

    <div class="grid2">
      <label>Délai minimum avant un rendez-vous
        <select name="booking_min_notice_h">
          <?php foreach ([0 => 'Aucun', 1 => '1 heure', 2 => '2 heures', 4 => '4 heures', 12 => '12 heures', 24 => '24 heures', 48 => '48 heures'] as $h => $label): ?>
            <option value="<?= $h ?>"<?= (int) $salon['booking_min_notice_h'] === $h ? ' selected' : '' ?>><?= $label ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Créneaux proposés toutes les
        <select name="slot_step">
          <?php foreach ([10, 15, 20, 30, 45, 60] as $m): ?><option value="<?= $m ?>"<?= (int) $salon['slot_step'] === $m ? ' selected' : '' ?>><?= $m ?> minutes</option><?php endforeach; ?>
        </select>
      </label>
    </div>
    <div class="grid2">
      <label>E-mail qui reçoit les nouvelles réservations <input type="email" name="notify_email" value="<?= e($salon['notify_email']) ?>" placeholder="salon@exemple.fr"></label>
      <label>Téléphone du salon <input type="tel" name="phone" value="<?= e($salon['phone']) ?>" placeholder="04 77 00 00 00"></label>
    </div>
    <div><button class="btn" type="submit">Enregistrer</button></div>
  </form>
</section>

<section class="panel">
  <div class="panel-head"><h2>Horaires du salon</h2><span class="muted small">Les horaires de chaque barbier se règlent dans <a href="<?= e(admin_url('equipe')) ?>">Barbiers</a>.</span></div>
  <form method="post">
    <?= csrf_field() ?><input type="hidden" name="action" value="hours_save"><input type="hidden" name="back" value="<?= e($back) ?>">
    <div class="hours-table">
      <div class="hours-row head"><span>Jour</span><span>Ouverture</span><span>Fermeture</span><span>Pause (facultatif)</span></div>
      <?php foreach ([1, 2, 3, 4, 5, 6, 0] as $d): $h = $hours[$d] ?? ['is_open' => 0, 'open_time' => '09:00', 'close_time' => '19:00', 'break_start' => null, 'break_end' => null]; ?>
        <div class="hours-row<?= (int) $h['is_open'] ? '' : ' is-off' ?>" data-hours-row>
          <label class="check"><input type="checkbox" name="open[<?= $d ?>]" <?= (int) $h['is_open'] ? 'checked' : '' ?>> <?= WEEKDAYS[$d] ?></label>
          <input type="time" name="open_time[<?= $d ?>]" value="<?= e($h['open_time']) ?>" aria-label="Ouverture <?= WEEKDAYS[$d] ?>">
          <input type="time" name="close_time[<?= $d ?>]" value="<?= e($h['close_time']) ?>" aria-label="Fermeture <?= WEEKDAYS[$d] ?>">
          <span class="pair"><input type="time" name="break_start[<?= $d ?>]" value="<?= e($h['break_start'] ?? '') ?>" aria-label="Début de pause"> – <input type="time" name="break_end[<?= $d ?>]" value="<?= e($h['break_end'] ?? '') ?>" aria-label="Fin de pause"></span>
        </div>
      <?php endforeach; ?>
    </div>
    <button class="btn" type="submit">Enregistrer les horaires</button>
  </form>
</section>

<section class="panel">
  <div class="panel-head"><h2>Fermetures &amp; horaires spéciaux</h2></div>
  <form method="post" class="stack" data-exception-form>
    <?= csrf_field() ?><input type="hidden" name="action" value="exception_save"><input type="hidden" name="back" value="<?= e($back) ?>">
    <div class="grid3">
      <label>Du <input type="date" name="date_from" required min="<?= e($first) ?>"></label>
      <label>Au (inclus) <input type="date" name="date_to" min="<?= e($first) ?>"></label>
      <label>Type
        <select name="kind" data-kind>
          <option value="closed">Salon fermé</option>
          <option value="special">Horaires spéciaux</option>
        </select>
      </label>
    </div>
    <div class="grid3" data-special hidden>
      <label>Ouverture <input type="time" name="open_time" value="10:00"></label>
      <label>Fermeture <input type="time" name="close_time" value="16:00"></label>
    </div>
    <label>Motif (interne) <input name="note" placeholder="Congés d'été, jour férié…"></label>
    <div><button class="btn" type="submit">Ajouter</button></div>
  </form>

  <?php if ($exceptions): ?>
    <ul class="list">
      <?php foreach ($exceptions as $x): ?>
        <li>
          <span><b><?= e(ucfirst(fmt_date_fr($x['day'], true))) ?></b> · <?= (int) $x['is_closed'] ? 'fermé' : e(fmt_hour($x['open_time']) . '–' . fmt_hour($x['close_time'])) ?><?= $x['note'] ? ' · ' . e($x['note']) : '' ?></span>
          <form method="post" class="inline"><?= csrf_field() ?><input type="hidden" name="action" value="exception_delete"><input type="hidden" name="id" value="<?= (int) $x['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>"><button class="link danger" type="submit">Supprimer</button></form>
        </li>
      <?php endforeach; ?>
    </ul>
  <?php else: ?>
    <p class="muted">Aucune fermeture prévue.</p>
  <?php endif; ?>

  <?php if ($salonBlocks): ?>
    <h3 class="sub">Créneaux bloqués pour tout le salon</h3>
    <ul class="list">
      <?php foreach ($salonBlocks as $b): ?>
        <li><span><?= e(substr($b['start_at'], 0, 16)) ?> → <?= e(substr($b['end_at'], 0, 16)) ?><?= $b['note'] ? ' · ' . e($b['note']) : '' ?></span>
          <form method="post" class="inline"><?= csrf_field() ?><input type="hidden" name="action" value="block_delete"><input type="hidden" name="id" value="<?= (int) $b['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>"><button class="link danger" type="submit">Débloquer</button></form>
        </li>
      <?php endforeach; ?>
    </ul>
  <?php endif; ?>
</section>
<?php admin_footer();
