<?php
/** Agenda du jour d'un salon : une colonne par barbier, comme sur Planity. */
declare(strict_types=1);

$salonId = (int) $salon['id'];

$date = valid_date($_GET['d'] ?? '') ? $_GET['d'] : now()->format('Y-m-d');
$dt = new DateTimeImmutable($date);
$staff = staff_list($salonId);
$appts = day_appointments($salonId, $date);
$services = q('SELECT id, category, name, duration_min FROM services WHERE salon_id = ? ORDER BY sort, id', [$salonId])->fetchAll();
$schedule = day_schedule($salonId, $date);
$back = admin_url('agenda', ['d' => $date]);

$blocks = q('SELECT * FROM blocks WHERE salon_id = ? AND start_at < ? AND end_at > ? ORDER BY start_at', [
    $salonId, $dt->modify('+1 day')->format('Y-m-d') . ' 00:00:00', "$date 00:00:00",
])->fetchAll();

// Colonnes : les barbiers + « Non attribué » s'il y a des rendez-vous sans barbier
$columns = array_map(fn($s) => ['id' => (int) $s['id'], 'name' => $s['name'], 'color' => $s['color']], $staff);
$staffIds = array_column($columns, 'id');
if (array_filter($appts, fn($a) => !in_array((int) $a['staff_id'], $staffIds, true))) {
    $columns[] = ['id' => 0, 'name' => 'Non attribué', 'color' => '#8a7b70'];
}

// Amplitude de la grille
$gStart = 9 * 60;
$gEnd = 20 * 60;
if ($schedule) {
    $gStart = min($gStart, intdiv(to_min($schedule['open']), 60) * 60);
    $gEnd = max($gEnd, (int) ceil(to_min($schedule['close']) / 60) * 60);
}
foreach ($appts as $a) {
    $gStart = min($gStart, intdiv(to_min(substr($a['start_at'], 11, 5)), 60) * 60);
    $gEnd = max($gEnd, min(24 * 60, (int) ceil((to_min(substr($a['start_at'], 11, 5)) + (int) $a['duration_min']) / 60) * 60));
}
$step = max(15, (int) $salon['slot_step']);
$ppm = 1.6; // pixels par minute
$px = fn(int $min) => round(($min - $gStart) * $ppm, 1);

// Semaine (lundi → dimanche) avec nombre de rendez-vous par jour
$monday = $dt->modify('-' . (((int) $dt->format('N')) - 1) . ' days');
$weekCounts = [];
foreach (q("SELECT start_at FROM appointments WHERE salon_id = ? AND status <> 'cancelled' AND start_at >= ? AND start_at < ?", [
    $salonId, $monday->format('Y-m-d') . ' 00:00:00', $monday->modify('+7 days')->format('Y-m-d') . ' 00:00:00',
])->fetchAll(PDO::FETCH_COLUMN) as $s) {
    $k = substr($s, 0, 10);
    $weekCounts[$k] = ($weekCounts[$k] ?? 0) + 1;
}

$isToday = $date === now()->format('Y-m-d');
$nowMin = to_min(now()->format('H:i'));
[$winFirst, $winLast] = booking_window($salon);

admin_header('Agenda', 'agenda', $user, $salon);
?>
<div class="page-head">
  <div>
    <h1><?= e(ucfirst(fmt_date_fr($date, true))) ?></h1>
    <p class="muted">
      <?= count($appts) ?> rendez-vous ·
      <?php if (!$schedule): ?><span class="pill warn">Salon fermé ce jour</span>
      <?php else: ?>salon ouvert <?= e(fmt_hour($schedule['open'])) ?>–<?= e(fmt_hour($schedule['close'])) ?><?php endif; ?>
      <?php if ((int) $salon['booking_enabled'] !== 1): ?> · <span class="pill warn">Réservation en ligne fermée (Planity)</span>
      <?php elseif ($date > $winLast): ?> · <span class="pill">Hors planning ouvert (jusqu'au <?= e(fmt_date_fr($winLast)) ?>)</span><?php endif; ?>
    </p>
  </div>
  <div class="head-actions">
    <a class="btn ghost icon-only" href="<?= e(admin_url('agenda', ['d' => $dt->modify('-1 day')->format('Y-m-d')])) ?>" aria-label="Jour précédent">‹</a>
    <a class="btn ghost" href="<?= e(admin_url('agenda')) ?>">Aujourd'hui</a>
    <a class="btn ghost icon-only" href="<?= e(admin_url('agenda', ['d' => $dt->modify('+1 day')->format('Y-m-d')])) ?>" aria-label="Jour suivant">›</a>
    <form method="get" class="inline" data-autosubmit><input type="hidden" name="p" value="agenda"><input type="date" name="d" value="<?= e($date) ?>" aria-label="Aller à la date"></form>
    <button class="btn" type="button" data-open-new data-staff="<?= (int) ($columns[0]['id'] ?? 0) ?>" data-time="<?= e($schedule['open'] ?? '10:00') ?>">+ Rendez-vous</button>
  </div>
</div>

<nav class="week" aria-label="Semaine">
  <?php for ($i = 0; $i < 7; $i++): $d = $monday->modify("+$i day"); $ymd = $d->format('Y-m-d'); $open = day_schedule($salonId, $ymd) !== null; ?>
    <a href="<?= e(admin_url('agenda', ['d' => $ymd])) ?>" class="week-day<?= $ymd === $date ? ' is-current' : '' ?><?= $open ? '' : ' is-closed' ?>"<?= $ymd === $date ? ' aria-current="date"' : '' ?>>
      <span><?= e(mb_substr(WEEKDAYS[(int) $d->format('w')], 0, 3)) ?> <?= $d->format('j') ?></span>
      <b><?= $weekCounts[$ymd] ?? 0 ?></b>
    </a>
  <?php endfor; ?>
</nav>

<?php if (!$columns): ?>
  <div class="empty-box">Ajoutez d'abord les barbiers de ce salon dans <a href="<?= e(admin_url('equipe')) ?>">Barbiers</a>.</div>
<?php else: ?>
<div class="agenda" style="--cols: <?= count($columns) ?>; --h: <?= $px($gEnd) ?>px;">
  <div class="agenda-head">
    <div class="agenda-corner"></div>
    <?php foreach ($columns as $c): ?>
      <div class="agenda-staff"><i style="background: <?= e($c['color']) ?>"></i><?= e($c['name']) ?></div>
    <?php endforeach; ?>
  </div>
  <div class="agenda-body">
    <div class="agenda-times">
      <?php for ($m = $gStart; $m < $gEnd; $m += 60): ?>
        <span style="top: <?= $px($m) ?>px"><?= sprintf('%02d:00', intdiv($m, 60)) ?></span>
      <?php endfor; ?>
    </div>
    <?php foreach ($columns as $c):
        $win = $c['id'] ? staff_window($salonId, $c['id'], $date) : null; ?>
      <div class="agenda-col" data-staff="<?= $c['id'] ?>" style="--color: <?= e($c['color']) ?>">
        <?php // Zones hors horaires de travail
        if ($c['id']):
            if (!$win): ?>
              <div class="off" style="top:0;height:<?= $px($gEnd) ?>px"><span>Ne travaille pas</span></div>
            <?php else:
              if ($win[0] > $gStart): ?><div class="off" style="top:0;height:<?= $px($win[0]) ?>px"></div><?php endif;
              if ($win[1] < $gEnd): ?><div class="off" style="top:<?= $px($win[1]) ?>px;height:<?= round(($gEnd - $win[1]) * $ppm, 1) ?>px"></div><?php endif;
              if ($schedule && $schedule['break_start'] && $schedule['break_end']): ?>
                <div class="off" style="top:<?= $px(to_min($schedule['break_start'])) ?>px;height:<?= round((to_min($schedule['break_end']) - to_min($schedule['break_start'])) * $ppm, 1) ?>px"><span>Pause</span></div>
              <?php endif;
            endif;
        endif; ?>

        <?php // Cases cliquables pour ajouter un rendez-vous
        for ($m = $gStart; $m < $gEnd; $m += $step): ?>
          <button type="button" class="cell<?= $m % 60 === 0 ? ' hour' : '' ?>" style="top:<?= $px($m) ?>px;height:<?= $step * $ppm ?>px" data-open-new data-staff="<?= $c['id'] ?>" data-time="<?= from_min($m) ?>" aria-label="Ajouter à <?= from_min($m) ?> pour <?= e($c['name']) ?>"></button>
        <?php endfor; ?>

        <?php // Blocages
        foreach ($blocks as $b):
            if ($b['staff_id'] !== null && (int) $b['staff_id'] !== $c['id']) continue;
            $bs = $b['start_at'] < "$date 00:00:00" ? $gStart : max($gStart, to_min(substr($b['start_at'], 11, 5)));
            $be = substr($b['end_at'], 0, 10) > $date ? $gEnd : min($gEnd, to_min(substr($b['end_at'], 11, 5)));
            if ($be <= $bs) continue; ?>
          <button type="button" class="block" style="top:<?= $px($bs) ?>px;height:<?= round(($be - $bs) * $ppm, 1) ?>px" data-block='<?= e(json_encode(['id' => (int) $b['id'], 'label' => ($b['note'] ?: 'Bloqué') . ($b['staff_id'] === null ? ' (tout le salon)' : ''), 'when' => substr($b['start_at'], 0, 16) . ' → ' . substr($b['end_at'], 0, 16)])) ?>'>
            <span><?= e($b['note'] ?: 'Bloqué') ?></span>
          </button>
        <?php endforeach; ?>

        <?php // Rendez-vous
        foreach ($appts as $a):
            $col = in_array((int) $a['staff_id'], $staffIds, true) ? (int) $a['staff_id'] : 0;
            if ($col !== $c['id']) continue;
            $s = to_min(substr($a['start_at'], 11, 5));
            $h = max(22, round((int) $a['duration_min'] * $ppm, 1));
            $payload = [
                'id' => (int) $a['id'], 'ref' => $a['ref'], 'service_id' => (int) $a['service_id'], 'service_name' => $a['service_name'],
                'staff_id' => (int) $a['staff_id'], 'date' => substr($a['start_at'], 0, 10), 'time' => substr($a['start_at'], 11, 5),
                'duration' => (int) $a['duration_min'], 'status' => $a['status'], 'client_name' => $a['client_name'],
                'client_phone' => $a['client_phone'], 'client_email' => $a['client_email'], 'note' => $a['note'],
                'admin_note' => $a['admin_note'], 'source' => $a['source'], 'created_at' => $a['created_at'],
            ]; ?>
          <button type="button" class="appt status-<?= e($a['status']) ?><?= $h < 44 ? ' compact' : '' ?>" style="top:<?= $px($s) ?>px;height:<?= $h ?>px" data-appt='<?= e(json_encode($payload, JSON_UNESCAPED_UNICODE)) ?>'>
            <b><?= e(substr($a['start_at'], 11, 5)) ?> · <?= e($a['client_name']) ?></b>
            <span><?= e($a['service_name']) ?><?= $a['source'] === 'web' ? ' · en ligne' : ($a['source'] === 'ai' ? ' · assistant IA' : '') ?></span>
          </button>
        <?php endforeach; ?>

        <?php if ($isToday && $nowMin >= $gStart && $nowMin < $gEnd): ?><div class="now" style="top:<?= $px($nowMin) ?>px"></div><?php endif; ?>
      </div>
    <?php endforeach; ?>
  </div>
</div>
<p class="legend"><span class="lg web"></span> Réservé en ligne <span class="lg admin"></span> Ajouté au salon <span class="lg done"></span> Venu <span class="lg noshow"></span> Absent <span class="lg blocked"></span> Bloqué · Cliquez sur une case vide pour ajouter un rendez-vous ou bloquer un créneau.</p>
<?php endif; ?>

<!-- Nouveau rendez-vous / blocage -->
<dialog class="modal" data-dlg-new aria-labelledby="dlg-new-title">
  <div class="modal-head">
    <h2 id="dlg-new-title">Ajouter</h2>
    <button type="button" class="close" data-close aria-label="Fermer">✕</button>
  </div>
  <div class="seg" role="tablist">
    <button type="button" role="tab" aria-selected="true" data-seg="appt">Rendez-vous</button>
    <button type="button" role="tab" aria-selected="false" data-seg="block">Bloquer un créneau</button>
  </div>
  <form method="post" class="stack" data-seg-panel="appt">
    <?= csrf_field() ?>
    <input type="hidden" name="action" value="appt_create">
    <input type="hidden" name="back" value="<?= e($back) ?>">
    <label>Prestation
      <select name="service_id" required data-service-select>
        <option value="">Choisir…</option>
        <?php foreach (CATEGORIES as $k => $label): ?>
          <optgroup label="<?= e($label) ?>">
            <?php foreach ($services as $s): if ($s['category'] !== $k) continue; ?>
              <option value="<?= (int) $s['id'] ?>" data-duration="<?= (int) $s['duration_min'] ?>"><?= e($s['name']) ?> (<?= e(fmt_duration((int) $s['duration_min'])) ?>)</option>
            <?php endforeach; ?>
          </optgroup>
        <?php endforeach; ?>
      </select>
    </label>
    <div class="grid3">
      <label>Date <input type="date" name="date" value="<?= e($date) ?>" required></label>
      <label>Heure <input type="time" name="time" step="300" required data-field="time"></label>
      <label>Durée (min) <input type="number" name="duration" min="5" max="720" step="5" data-field="duration"></label>
    </div>
    <label>Barbier
      <select name="staff_id" data-field="staff">
        <?php foreach ($staff as $s): ?><option value="<?= (int) $s['id'] ?>"><?= e($s['name']) ?></option><?php endforeach; ?>
        <option value="0">Non attribué</option>
      </select>
    </label>
    <div class="grid2">
      <label>Nom du client <input name="client_name" required autocomplete="off"></label>
      <label>Téléphone <input name="client_phone" type="tel" autocomplete="off"></label>
    </div>
    <label>Note interne <textarea name="admin_note" rows="2"></textarea></label>
    <label class="check"><input type="checkbox" name="force"> Forcer même si le créneau est déjà occupé</label>
    <div class="modal-foot"><button class="btn" type="submit">Ajouter le rendez-vous</button></div>
  </form>
  <form method="post" class="stack" data-seg-panel="block" hidden>
    <?= csrf_field() ?>
    <input type="hidden" name="action" value="block_create">
    <input type="hidden" name="mode" value="hours">
    <input type="hidden" name="back" value="<?= e($back) ?>">
    <p class="muted">Le créneau bloqué n'est plus proposé à la réservation en ligne (pause, formation, rendez-vous personnel…).</p>
    <label>Pour
      <select name="staff_id" data-field="staff">
        <?php foreach ($staff as $s): ?><option value="<?= (int) $s['id'] ?>"><?= e($s['name']) ?></option><?php endforeach; ?>
        <option value="0">Tout le salon</option>
      </select>
    </label>
    <div class="grid3">
      <label>Date <input type="date" name="date" value="<?= e($date) ?>" required></label>
      <label>De <input type="time" name="start" step="300" required data-field="time"></label>
      <label>À <input type="time" name="end" step="300" required data-field="time-end"></label>
    </div>
    <label>Motif <input name="note" placeholder="Pause déjeuner, formation…"></label>
    <div class="modal-foot"><button class="btn" type="submit">Bloquer</button></div>
  </form>
</dialog>

<!-- Détail / modification d'un rendez-vous -->
<dialog class="modal" data-dlg-appt aria-labelledby="dlg-appt-title">
  <div class="modal-head">
    <div><h2 id="dlg-appt-title" data-a="client_name"></h2><p class="muted small" data-a="meta"></p></div>
    <button type="button" class="close" data-close aria-label="Fermer">✕</button>
  </div>
  <div class="quick">
    <a class="btn ghost" data-a="tel" href="#">Appeler</a>
    <?php foreach (['done' => 'Venu', 'noshow' => 'Absent', 'cancelled' => 'Annuler le RDV'] as $st => $label): ?>
      <form method="post" class="inline" <?= $st === 'cancelled' ? 'data-confirm="Annuler ce rendez-vous ? Le créneau redevient réservable."' : '' ?>>
        <?= csrf_field() ?><input type="hidden" name="action" value="appt_status"><input type="hidden" name="status" value="<?= $st ?>">
        <input type="hidden" name="id" data-a="id"><input type="hidden" name="back" value="<?= e($back) ?>">
        <button class="btn <?= $st === 'cancelled' ? 'danger' : 'ghost' ?>" type="submit"><?= e($label) ?></button>
      </form>
    <?php endforeach; ?>
  </div>
  <p class="client-note" data-a="note"></p>
  <form method="post" class="stack">
    <?= csrf_field() ?>
    <input type="hidden" name="action" value="appt_update">
    <input type="hidden" name="id" data-a="id">
    <input type="hidden" name="back" value="<?= e($back) ?>">
    <label>Prestation
      <select name="service_id" data-a="service_id">
        <?php foreach ($services as $s): ?><option value="<?= (int) $s['id'] ?>"><?= e(service_label($s)) ?></option><?php endforeach; ?>
      </select>
    </label>
    <div class="grid3">
      <label>Date <input type="date" name="date" data-a="date" required></label>
      <label>Heure <input type="time" name="time" step="300" data-a="time" required></label>
      <label>Durée (min) <input type="number" name="duration" min="5" max="720" step="5" data-a="duration" required></label>
    </div>
    <div class="grid2">
      <label>Barbier
        <select name="staff_id" data-a="staff_id">
          <?php foreach ($staff as $s): ?><option value="<?= (int) $s['id'] ?>"><?= e($s['name']) ?></option><?php endforeach; ?>
          <option value="0">Non attribué</option>
        </select>
      </label>
      <label>Statut
        <select name="status" data-a="status">
          <?php foreach (APPT_STATUSES as $k => $label): ?><option value="<?= $k ?>"><?= e($label) ?></option><?php endforeach; ?>
        </select>
      </label>
    </div>
    <div class="grid2">
      <label>Nom <input name="client_name" data-a="client_name" required></label>
      <label>Téléphone <input name="client_phone" type="tel" data-a="client_phone"></label>
    </div>
    <label>E-mail <input name="client_email" type="email" data-a="client_email"></label>
    <label>Précisions du client <textarea name="note" rows="2" data-a="note"></textarea></label>
    <label>Note interne <textarea name="admin_note" rows="2" data-a="admin_note"></textarea></label>
    <label class="check"><input type="checkbox" name="force"> Forcer même si le nouveau créneau est déjà occupé</label>
    <div class="modal-foot"><button class="btn" type="submit">Enregistrer</button></div>
  </form>
</dialog>

<!-- Blocage -->
<dialog class="modal small" data-dlg-block>
  <div class="modal-head"><h2 data-b="label"></h2><button type="button" class="close" data-close aria-label="Fermer">✕</button></div>
  <p class="muted" data-b="when"></p>
  <form method="post" class="modal-foot">
    <?= csrf_field() ?><input type="hidden" name="action" value="block_delete"><input type="hidden" name="id" data-b="id"><input type="hidden" name="back" value="<?= e($back) ?>">
    <button class="btn danger" type="submit">Débloquer ce créneau</button>
  </form>
</dialog>
<?php admin_footer();
