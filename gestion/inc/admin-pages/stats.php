<?php
/**
 * Statistiques d'un salon : rendez-vous, chiffre d'affaires estimé, absences,
 * remplissage, barbiers, prestations, jours et heures de pointe.
 * Le propriétaire voit aussi la comparaison entre ses salons.
 */
declare(strict_types=1);

$salonId = (int) $salon['id'];
$today = now()->format('Y-m-d');
$periods = [
    '7d' => '7 derniers jours',
    '30d' => '30 derniers jours',
    'month' => 'Ce mois-ci',
    'lastmonth' => 'Mois dernier',
    '12m' => '12 derniers mois',
    'next7' => '7 prochains jours',
];
$period = isset($periods[$_GET['period'] ?? '']) ? $_GET['period'] : '30d';
$first = new DateTimeImmutable('first day of this month');
[$from, $to] = match ($period) {
    '7d' => [now()->modify('-6 days')->format('Y-m-d'), $today],
    'month' => [$first->format('Y-m-d'), $today],
    'lastmonth' => [$first->modify('-1 month')->format('Y-m-d'), $first->modify('-1 day')->format('Y-m-d')],
    '12m' => [now()->modify('-1 year +1 day')->format('Y-m-d'), $today],
    'next7' => [$today, now()->modify('+6 days')->format('Y-m-d')],
    default => [now()->modify('-29 days')->format('Y-m-d'), $today],
};
$toNext = (new DateTimeImmutable($to))->modify('+1 day')->format('Y-m-d');

/** Agrège les rendez-vous d'un salon sur la période. */
function stats_for(int $salonId, string $from, string $toNext): array
{
    $rows = q('SELECT a.*, s.name AS staff_name, s.color AS staff_color FROM appointments a LEFT JOIN staff s ON s.id = a.staff_id
               WHERE a.salon_id = ? AND a.start_at >= ? AND a.start_at < ?', [$salonId, "$from 00:00:00", "$toNext 00:00:00"])->fetchAll();
    $st = ['rows' => $rows, 'total' => 0, 'kept' => 0, 'done' => 0, 'noshow' => 0, 'cancelled' => 0, 'web' => 0, 'revenue' => 0, 'priced' => 0, 'minutes' => 0];
    foreach ($rows as $r) {
        $st['total']++;
        if ($r['status'] === 'cancelled') { $st['cancelled']++; continue; }
        if ($r['status'] === 'noshow') { $st['noshow']++; continue; }
        $st['kept']++;
        if ($r['status'] === 'done') $st['done']++;
        if ($r['source'] !== 'admin') $st['web']++;
        $st['minutes'] += (int) $r['duration_min'];
        if ($r['price_eur'] !== null) { $st['revenue'] += (int) $r['price_eur']; $st['priced']++; }
    }
    return $st;
}

$s = stats_for($salonId, $from, $toNext);
$pct = fn(int $a, int $b) => $b > 0 ? round($a * 100 / $b) : 0;
$eur = fn(int $v) => number_format($v, 0, ',', ' ') . ' €';

// Capacité : minutes de travail des barbiers réservables sur la période (pauses déduites)
$capacity = 0;
$staffAll = staff_list($salonId);
for ($d = new DateTimeImmutable($from); $d->format('Y-m-d') < $toNext; $d = $d->modify('+1 day')) {
    $ymd = $d->format('Y-m-d');
    $sch = day_schedule($salonId, $ymd);
    if (!$sch) continue;
    $break = ($sch['break_start'] && $sch['break_end']) ? max(0, to_min($sch['break_end']) - to_min($sch['break_start'])) : 0;
    foreach ($staffAll as $st) {
        $win = staff_window($salonId, (int) $st['id'], $ymd);
        if ($win) $capacity += max(0, $win[1] - $win[0] - $break);
    }
}

// Par barbier, par prestation, par jour de semaine, par heure
$byStaff = $byService = $byWeekday = $byHour = [];
foreach ($s['rows'] as $r) {
    if (in_array($r['status'], ['cancelled'], true)) continue;
    $k = $r['staff_name'] ?? 'Non attribué';
    $byStaff[$k] ??= ['color' => $r['staff_color'] ?? '#8a7b70', 'count' => 0, 'revenue' => 0, 'noshow' => 0, 'minutes' => 0];
    if ($r['status'] === 'noshow') { $byStaff[$k]['noshow']++; continue; }
    $byStaff[$k]['count']++;
    $byStaff[$k]['minutes'] += (int) $r['duration_min'];
    $byStaff[$k]['revenue'] += (int) ($r['price_eur'] ?? 0);
    $byService[$r['service_name']] ??= ['count' => 0, 'revenue' => 0];
    $byService[$r['service_name']]['count']++;
    $byService[$r['service_name']]['revenue'] += (int) ($r['price_eur'] ?? 0);
    $w = (int) (new DateTimeImmutable($r['start_at']))->format('N'); // 1 = lundi
    $byWeekday[$w] = ($byWeekday[$w] ?? 0) + 1;
    $h = (int) substr($r['start_at'], 11, 2);
    $byHour[$h] = ($byHour[$h] ?? 0) + 1;
}
uasort($byStaff, fn($a, $b) => $b['count'] <=> $a['count']);
uasort($byService, fn($a, $b) => $b['count'] <=> $a['count']);
$byService = array_slice($byService, 0, 8, true);
ksort($byHour);
$maxService = max([1, ...array_column($byService, 'count')]);
$maxWeekday = max([1, ...array_values($byWeekday)]);
$maxHour = max([1, ...array_values($byHour)]);

// Nouveaux clients (première réservation sur la période)
$newClients = (int) q('SELECT COUNT(*) FROM (SELECT client_id, MIN(start_at) AS first_at FROM appointments
    WHERE salon_id = ? AND client_id IS NOT NULL AND status <> \'cancelled\' GROUP BY client_id) t WHERE first_at >= ? AND first_at < ?', [
    $salonId, "$from 00:00:00", "$toNext 00:00:00",
])->fetchColumn();

admin_header('Statistiques', 'stats', $user, $salon);
?>
<div class="page-head">
  <div>
    <h1>Statistiques · <?= e($salon['name']) ?></h1>
    <p class="muted">Du <?= e(fmt_date_fr($from, true)) ?> au <?= e(fmt_date_fr($to, true)) ?></p>
  </div>
</div>

<div class="chips stats-periods">
  <?php foreach ($periods as $k => $label): ?>
    <a class="chip<?= $k === $period ? ' on' : '' ?>" href="<?= e(admin_url('stats', ['period' => $k])) ?>"><?= e($label) ?></a>
  <?php endforeach; ?>
</div>

<div class="kpis">
  <div class="kpi"><span>Rendez-vous</span><b><?= $s['kept'] ?></b><small><?= $s['web'] ?> en ligne (<?= $pct($s['web'], $s['kept']) ?> %)</small></div>
  <div class="kpi"><span>Chiffre d'affaires estimé</span><b><?= e($eur($s['revenue'])) ?></b><small>Panier moyen <?= e($eur($s['priced'] ? intdiv($s['revenue'], $s['priced']) : 0)) ?></small></div>
  <div class="kpi"><span>Remplissage</span><b><?= $pct($s['minutes'], $capacity) ?> %</b><small><?= e(fmt_duration($s['minutes'])) ?> réservées sur <?= e(fmt_duration($capacity)) ?></small></div>
  <div class="kpi<?= $pct($s['noshow'], $s['done'] + $s['noshow']) >= 10 ? ' is-alert' : '' ?>"><span>Absences</span><b><?= $pct($s['noshow'], $s['done'] + $s['noshow']) ?> %</b><small><?= $s['noshow'] ?> client<?= $s['noshow'] > 1 ? 's' : '' ?> non venu<?= $s['noshow'] > 1 ? 's' : '' ?></small></div>
  <div class="kpi"><span>Annulations</span><b><?= $s['cancelled'] ?></b><small><?= $pct($s['cancelled'], $s['total']) ?> % des réservations</small></div>
  <div class="kpi"><span>Nouveaux clients</span><b><?= $newClients ?></b><small>première visite sur la période</small></div>
</div>
<p class="muted small">Le chiffre d'affaires est estimé à partir des prix de la carte (rendez-vous confirmés et venus, hors absences et annulations). Pensez à marquer « Venu » ou « Absent » dans l'agenda pour des chiffres justes.</p>

<div class="stats-grid">
  <section class="panel">
    <h2>Par barbier</h2>
    <?php if (!$byStaff): ?><p class="muted">Aucun rendez-vous sur la période.</p><?php else: ?>
    <div class="table-wrap"><table class="table">
      <thead><tr><th>Barbier</th><th class="num">RDV</th><th class="num">CA estimé</th><th class="num">Temps</th><th class="num">Absents</th></tr></thead>
      <tbody>
      <?php foreach ($byStaff as $name => $row): ?>
        <tr><td><i class="dot" style="background:<?= e($row['color']) ?>"></i><?= e($name) ?></td><td class="num"><?= $row['count'] ?></td><td class="num"><?= e($eur($row['revenue'])) ?></td><td class="num"><?= e(fmt_duration($row['minutes'])) ?></td><td class="num"><?= $row['noshow'] ?></td></tr>
      <?php endforeach; ?>
      </tbody>
    </table></div>
    <?php endif; ?>
  </section>

  <section class="panel">
    <h2>Prestations les plus demandées</h2>
    <?php if (!$byService): ?><p class="muted">Aucun rendez-vous sur la période.</p><?php else: ?>
    <ul class="bars">
      <?php foreach ($byService as $name => $row): ?>
        <li><span class="bar-label"><?= e($name) ?></span><span class="bar"><i style="width:<?= round($row['count'] * 100 / $maxService) ?>%"></i></span><b><?= $row['count'] ?></b></li>
      <?php endforeach; ?>
    </ul>
    <?php endif; ?>
  </section>

  <section class="panel">
    <h2>Jours les plus chargés</h2>
    <div class="columns-chart" role="img" aria-label="Rendez-vous par jour de la semaine">
      <?php foreach ([1 => 'Lun', 2 => 'Mar', 3 => 'Mer', 4 => 'Jeu', 5 => 'Ven', 6 => 'Sam', 7 => 'Dim'] as $w => $label): $v = $byWeekday[$w] ?? 0; ?>
        <div class="col"><b><?= $v ?></b><span class="col-bar"><i style="height:<?= round($v * 100 / $maxWeekday) ?>%"></i></span><span><?= $label ?></span></div>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="panel">
    <h2>Heures de pointe</h2>
    <?php if (!$byHour): ?><p class="muted">Aucun rendez-vous sur la période.</p><?php else: ?>
    <div class="columns-chart" role="img" aria-label="Rendez-vous par heure de début">
      <?php for ($h = min(array_keys($byHour)); $h <= max(array_keys($byHour)); $h++): $v = $byHour[$h] ?? 0; ?>
        <div class="col"><b><?= $v ?></b><span class="col-bar"><i style="height:<?= round($v * 100 / $maxHour) ?>%"></i></span><span><?= $h ?>h</span></div>
      <?php endfor; ?>
    </div>
    <?php endif; ?>
  </section>
</div>

<?php if ($user['is_owner'] && count(salons_list()) > 1): ?>
<section class="panel">
  <h2>Comparaison des salons</h2>
  <div class="table-wrap"><table class="table">
    <thead><tr><th>Salon</th><th class="num">RDV</th><th class="num">En ligne</th><th class="num">CA estimé</th><th class="num">Absences</th><th class="num">Annulations</th><th>Réservation</th></tr></thead>
    <tbody>
    <?php foreach (salons_list() as $sl): $x = stats_for((int) $sl['id'], $from, $toNext); ?>
      <tr<?= (int) $sl['id'] === $salonId ? ' class="is-current"' : '' ?>>
        <td><a href="<?= e(admin_url('stats', ['period' => $period, 'salon' => $sl['slug']])) ?>"><?= e($sl['name']) ?></a> <span class="muted small"><?= e($sl['city']) ?></span></td>
        <td class="num"><?= $x['kept'] ?></td>
        <td class="num"><?= $pct($x['web'], $x['kept']) ?> %</td>
        <td class="num"><?= e($eur($x['revenue'])) ?></td>
        <td class="num"><?= $pct($x['noshow'], $x['done'] + $x['noshow']) ?> %</td>
        <td class="num"><?= $x['cancelled'] ?></td>
        <td><?= (int) $sl['booking_enabled'] === 1 ? '<span class="pill ok">Site Seven</span>' : '<span class="pill">Planity</span>' ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table></div>
</section>
<?php endif; ?>
<?php admin_footer();
