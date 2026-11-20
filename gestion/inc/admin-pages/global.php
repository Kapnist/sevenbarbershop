<?php
/**
 * Vue d'ensemble (propriétaire) : tous les salons d'un coup d'œil, chiffres par salon
 * et rendez-vous du jour à pointer « Venu » ou « Pas venu ».
 */
declare(strict_types=1);

$today = now()->format('Y-m-d');
$nowStr = now()->format('Y-m-d H:i:s');
$periods = ['today' => "Aujourd'hui", '7d' => '7 derniers jours', 'month' => 'Ce mois-ci'];
$period = isset($periods[$_GET['period'] ?? '']) ? $_GET['period'] : 'today';
$from = match ($period) {
    '7d' => now()->modify('-6 days')->format('Y-m-d'),
    'month' => now()->format('Y-m-01'),
    default => $today,
};
$toNext = now()->modify('+1 day')->format('Y-m-d');
$back = admin_url('global', ['period' => $period]);
$pct = fn(int $a, int $b) => $b > 0 ? round($a * 100 / $b) : 0;
$eur = fn(int $v) => number_format($v, 0, ',', ' ') . ' €';

// Salons dont le propriétaire a choisi de ne pas afficher les statistiques
$hiddenIds = overview_hidden_ids();
$hiddenSalons = array_values(array_filter(salons_list(), fn($s) => in_array((int) $s['id'], $hiddenIds, true)));
$shownSalons = array_values(array_filter(salons_list(), fn($s) => !in_array((int) $s['id'], $hiddenIds, true)));

/** Interrupteur « afficher / masquer » d'un salon dans la vue d'ensemble. */
$toggle = function (array $sl, bool $show, string $back): string {
    $label = $show ? 'Afficher' : 'Masquer';
    $title = $show ? "Afficher les statistiques de {$sl['name']}" : "Masquer les statistiques de {$sl['name']}";
    return '<form method="post" class="inline">' . csrf_field()
        . '<input type="hidden" name="action" value="overview_toggle"><input type="hidden" name="id" value="' . (int) $sl['id'] . '">'
        . '<input type="hidden" name="show" value="' . ($show ? '1' : '0') . '"><input type="hidden" name="back" value="' . e($back) . '">'
        . '<button class="link' . ($show ? '' : ' muted') . '" type="submit" title="' . e($title) . '" aria-label="' . e($title) . '">' . $label . '</button></form>';
};

$rows = [];
$total = ['kept' => 0, 'done' => 0, 'noshow' => 0, 'cancelled' => 0, 'revenue' => 0, 'web' => 0, 'tocheck' => 0];
foreach ($shownSalons as $sl) {
    $st = stats_for((int) $sl['id'], $from, $toNext);
    $st['tocheck'] = (int) q("SELECT COUNT(*) FROM appointments WHERE salon_id = ? AND start_at < ? AND status = 'confirmed'", [$sl['id'], $nowStr])->fetchColumn();
    $st['upcoming'] = (int) q("SELECT COUNT(*) FROM appointments WHERE salon_id = ? AND start_at >= ? AND start_at < ? AND status = 'confirmed'", [$sl['id'], $nowStr, "$toNext 00:00:00"])->fetchColumn();
    foreach (array_keys($total) as $k) $total[$k] += $st[$k];
    $rows[] = [$sl, $st];
}

// Rendez-vous du jour, tous salons
$todayAppts = q("SELECT a.*, s.name AS staff_name, s.color AS staff_color, sa.name AS salon_name, sa.slug AS salon_slug
    FROM appointments a LEFT JOIN staff s ON s.id = a.staff_id JOIN salons sa ON sa.id = a.salon_id
    WHERE a.start_at >= ? AND a.start_at < ? AND a.status <> 'cancelled' ORDER BY sa.sort, a.start_at", ["$today 00:00:00", "$toNext 00:00:00"])->fetchAll();
$todayAppts = array_values(array_filter($todayAppts, fn($r) => !in_array((int) $r['salon_id'], $hiddenIds, true)));

admin_header("Vue d'ensemble", 'global', $user, $salon);
?>
<div class="page-head">
  <div><h1>Vue d'ensemble</h1><p class="muted">Tous vos salons d'un coup d'œil. Chaque responsable de salon ne voit que le sien. « Masquer » retire un salon des chiffres et de la liste du jour, sans rien supprimer.</p></div>
</div>

<nav class="chips" aria-label="Période">
  <?php foreach ($periods as $k => $label): ?>
    <a class="chip<?= $k === $period ? ' on' : '' ?>" href="<?= e(admin_url('global', ['period' => $k])) ?>"><?= e($label) ?></a>
  <?php endforeach; ?>
</nav>

<div class="kpis">
  <div class="kpi"><span>Rendez-vous</span><b><?= $total['kept'] ?></b><small><?= $total['web'] ?> réservé<?= $total['web'] > 1 ? 's' : '' ?> en ligne</small></div>
  <div class="kpi"><span>Chiffre d'affaires estimé</span><b><?= e($eur($total['revenue'])) ?></b><small>tous salons</small></div>
  <div class="kpi<?= $pct($total['noshow'], $total['done'] + $total['noshow']) >= 10 ? ' is-alert' : '' ?>"><span>Pas venus</span><b><?= $total['noshow'] ?></b><small><?= $pct($total['noshow'], $total['done'] + $total['noshow']) ?> % des rendez-vous pointés</small></div>
  <div class="kpi<?= $total['tocheck'] ? ' is-alert' : '' ?>"><span>À pointer</span><b><?= $total['tocheck'] ?></b><small>rendez-vous passés sans « Venu » ni « Pas venu »</small></div>
</div>

<section class="panel">
  <h2>Par salon · <?= e(mb_strtolower($periods[$period])) ?><?= $hiddenSalons ? ' <span class="muted small">(' . count($shownSalons) . ' sur ' . count(salons_list()) . ' affichés)</span>' : '' ?></h2>
  <div class="table-wrap"><table class="table">
    <thead><tr><th>Salon</th><th class="num">RDV</th><th class="num">Venus</th><th class="num">Pas venus</th><th class="num">À pointer</th><th class="num">Annulés</th><th class="num">CA estimé</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($rows as [$sl, $st]): ?>
      <tr>
        <td><b><?= e($sl['name']) ?></b> <span class="muted small"><?= e($sl['city']) ?></span>
          <?= (int) $sl['booking_enabled'] === 1 ? '' : ' <span class="pill">Planity</span>' ?></td>
        <td class="num"><?= $st['kept'] ?></td>
        <td class="num"><?= $st['done'] ?></td>
        <td class="num"><?= $st['noshow'] ?></td>
        <td class="num"><?php if ($st['tocheck']): ?><a href="<?= e(admin_url('rdv', ['period' => 'tocheck', 'salon' => $sl['slug']])) ?>"><b><?= $st['tocheck'] ?></b></a><?php else: ?>0<?php endif; ?></td>
        <td class="num"><?= $st['cancelled'] ?></td>
        <td class="num"><?= e($eur($st['revenue'])) ?></td>
        <td class="right nowrap"><a class="btn ghost small" href="<?= e(admin_url('agenda', ['salon' => $sl['slug']])) ?>">Agenda</a> <?= $toggle($sl, false, $back) ?></td>
      </tr>
    <?php endforeach; ?>
    <?php if (!$rows): ?>
      <tr><td colspan="8" class="muted">Tous les salons sont masqués.</td></tr>
    <?php endif; ?>
    </tbody>
  </table></div>
  <?php if ($hiddenSalons): ?>
    <p class="hidden-salons muted small">Salons masqués :
      <?php foreach ($hiddenSalons as $i => $sl): ?>
        <span class="nowrap"><?= $i ? ' · ' : '' ?><b><?= e($sl['name']) ?></b> <?= $toggle($sl, true, $back) ?></span>
      <?php endforeach; ?>
    </p>
  <?php endif; ?>
</section>

<section class="panel">
  <h2>Rendez-vous d'aujourd'hui · <?= count($todayAppts) ?></h2>
  <?php if (!$todayAppts): ?>
    <p class="muted">Aucun rendez-vous aujourd'hui.</p>
  <?php else: ?>
    <div class="appt-list">
      <?php $lastSalon = null; foreach ($todayAppts as $r): ?>
        <?php if ($r['salon_name'] !== $lastSalon): $lastSalon = $r['salon_name']; ?>
          <h3 class="day-title"><a href="<?= e(admin_url('agenda', ['salon' => $r['salon_slug']])) ?>"><?= e($r['salon_name']) ?></a></h3>
        <?php endif; ?>
        <article class="appt-row status-<?= e($r['status']) ?>">
          <div class="appt-time"><b><?= e(substr($r['start_at'], 11, 5)) ?></b><span><?= e(fmt_duration((int) $r['duration_min'])) ?></span></div>
          <div class="appt-main">
            <b><?= e($r['client_name']) ?></b>
            <span><?= e($r['service_name']) ?><?php if ($r['staff_name']): ?> · <i class="dot" style="background:<?= e($r['staff_color']) ?>"></i><?= e($r['staff_name']) ?><?php endif; ?></span>
          </div>
          <div class="appt-contact">
            <?php if ($r['client_phone']): ?><a href="tel:<?= e(preg_replace('/\s+/', '', $r['client_phone'])) ?>"><?= e($r['client_phone']) ?></a><?php endif; ?>
          </div>
          <div class="appt-actions">
            <div class="attendance" role="group" aria-label="Le client est-il venu ?">
              <?php foreach (['done' => '✓ Venu', 'noshow' => '✗ Pas venu'] as $st => $label): ?>
                <form method="post" class="inline">
                  <?= csrf_field() ?><input type="hidden" name="action" value="appt_status"><input type="hidden" name="status" value="<?= $st ?>">
                  <input type="hidden" name="id" value="<?= (int) $r['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>">
                  <button type="submit" class="att att-<?= $st ?><?= $r['status'] === $st ? ' is-on' : '' ?>"<?= $r['status'] === $st ? ' aria-pressed="true" disabled' : ' aria-pressed="false"' ?>><?= $label ?></button>
                </form>
              <?php endforeach; ?>
            </div>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</section>
<?php admin_footer();
