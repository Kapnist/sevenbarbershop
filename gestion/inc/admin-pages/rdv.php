<?php
/** Liste des rendez-vous avec recherche, filtres et export CSV. */
declare(strict_types=1);

$period = $_GET['period'] ?? 'upcoming';
$status = $_GET['status'] ?? '';
$search = trim((string) ($_GET['q'] ?? ''));
$nowStr = now()->format('Y-m-d H:i:s');
$today = now()->format('Y-m-d');

$where = ['a.salon_id = ?'];
$params = [$salon['id']];
switch ($period) {
    case 'today':
        $where[] = 'a.start_at >= ? AND a.start_at < ?';
        array_push($params, "$today 00:00:00", now()->modify('+1 day')->format('Y-m-d') . ' 00:00:00');
        break;
    case 'past':
        $where[] = 'a.start_at < ?';
        $params[] = $nowStr;
        break;
    case 'new':
        $where[] = "a.source <> 'admin' AND a.created_at >= ?";
        $params[] = now()->modify('-7 days')->format('Y-m-d H:i:s');
        break;
    case 'all':
        break;
    default:
        $period = 'upcoming';
        $where[] = 'a.start_at >= ?';
        $params[] = "$today 00:00:00";
}
if (isset(APPT_STATUSES[$status])) {
    $where[] = 'a.status = ?';
    $params[] = $status;
}
if ($search !== '') {
    $where[] = '(a.client_name LIKE ? OR a.client_phone LIKE ? OR a.ref LIKE ? OR a.service_name LIKE ?)';
    $like = '%' . str_replace(['%', '_'], ['\%', '\_'], $search) . '%';
    array_push($params, $like, $like, $like, $like);
}
$sql = 'SELECT a.*, s.name AS staff_name, s.color AS staff_color FROM appointments a LEFT JOIN staff s ON s.id = a.staff_id'
    . ' WHERE ' . implode(' AND ', $where)
    . ' ORDER BY a.start_at ' . ($period === 'past' ? 'DESC' : 'ASC') . ' LIMIT 500';
$rows = q($sql, $params)->fetchAll();

if (($_GET['export'] ?? '') === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="rendez-vous-' . $salon['slug'] . '-' . $today . '.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF"); // BOM pour Excel
    fputcsv($out, ['Référence', 'Date', 'Heure', 'Durée (min)', 'Prestation', 'Prix (€)', 'Barbier', 'Client', 'Téléphone', 'E-mail', 'Statut', 'Origine', 'Précisions', 'Note interne'], ';');
    foreach ($rows as $r) {
        fputcsv($out, [
            $r['ref'], substr($r['start_at'], 0, 10), substr($r['start_at'], 11, 5), $r['duration_min'], $r['service_name'], $r['price_eur'] ?? '', $r['staff_name'] ?? '',
            $r['client_name'], $r['client_phone'], $r['client_email'], APPT_STATUSES[$r['status']] ?? $r['status'],
            APPT_SOURCES[$r['source']] ?? $r['source'], $r['note'], $r['admin_note'],
        ], ';');
    }
    exit;
}

$periods = ['upcoming' => 'À venir', 'today' => "Aujourd'hui", 'new' => 'Nouvelles réservations en ligne', 'past' => 'Passés', 'all' => 'Tous'];
$back = 'index.php?' . http_build_query(['p' => 'rdv', 'period' => $period, 'status' => $status, 'q' => $search]);

admin_header('Rendez-vous', 'rdv', $user, $salon);
?>
<div class="page-head">
  <div><h1>Rendez-vous · <?= e($salon['name']) ?></h1><p class="muted"><?= count($rows) ?> résultat<?= count($rows) > 1 ? 's' : '' ?><?= count($rows) === 500 ? ' (500 maximum affichés)' : '' ?></p></div>
  <div class="head-actions">
    <a class="btn ghost" href="<?= e('index.php?' . http_build_query(['p' => 'rdv', 'period' => $period, 'status' => $status, 'q' => $search, 'export' => 'csv'])) ?>">Exporter (Excel)</a>
    <a class="btn" href="<?= e(admin_url('agenda')) ?>">Ouvrir l'agenda</a>
  </div>
</div>

<form method="get" class="filters" data-autosubmit-select>
  <input type="hidden" name="p" value="rdv">
  <div class="chips">
    <?php foreach ($periods as $k => $label): ?>
      <a class="chip<?= $k === $period ? ' on' : '' ?>" href="<?= e('index.php?' . http_build_query(['p' => 'rdv', 'period' => $k, 'status' => $status, 'q' => $search])) ?>"><?= e($label) ?></a>
    <?php endforeach; ?>
  </div>
  <input type="hidden" name="period" value="<?= e($period) ?>">
  <input type="search" name="q" value="<?= e($search) ?>" placeholder="Nom, téléphone, référence…" aria-label="Rechercher">
  <select name="status" aria-label="Statut">
    <option value="">Tous les statuts</option>
    <?php foreach (APPT_STATUSES as $k => $label): ?><option value="<?= $k ?>"<?= $k === $status ? ' selected' : '' ?>><?= e($label) ?></option><?php endforeach; ?>
  </select>
  <button class="btn ghost" type="submit">Rechercher</button>
</form>

<?php if (!$rows): ?>
  <div class="empty-box">Aucun rendez-vous pour ces critères.</div>
<?php else: ?>
<div class="appt-list">
  <?php $lastDay = null; foreach ($rows as $r): $day = substr($r['start_at'], 0, 10); ?>
    <?php if ($day !== $lastDay): $lastDay = $day; ?>
      <h2 class="day-title"><a href="<?= e(admin_url('agenda', ['d' => $day])) ?>"><?= e(ucfirst(fmt_date_fr($day, true))) ?></a></h2>
    <?php endif; ?>
    <article class="appt-row status-<?= e($r['status']) ?>">
      <div class="appt-time"><b><?= e(substr($r['start_at'], 11, 5)) ?></b><span><?= e(fmt_duration((int) $r['duration_min'])) ?></span></div>
      <div class="appt-main">
        <b><?= e($r['client_name']) ?></b>
        <span><?= e($r['service_name']) ?><?php if ($r['staff_name']): ?> · <i class="dot" style="background:<?= e($r['staff_color']) ?>"></i><?= e($r['staff_name']) ?><?php endif; ?></span>
        <?php if ($r['note']): ?><small>« <?= e($r['note']) ?> »</small><?php endif; ?>
      </div>
      <div class="appt-contact">
        <?php if ($r['client_phone']): ?><a href="tel:<?= e(preg_replace('/\s+/', '', $r['client_phone'])) ?>"><?= e($r['client_phone']) ?></a><?php endif; ?>
        <small><?= e($r['ref']) ?> · <?= e(mb_strtolower(APPT_SOURCES[$r['source']] ?? $r['source'])) ?></small>
      </div>
      <div class="appt-actions">
        <span class="pill status-<?= e($r['status']) ?>"><?= e(APPT_STATUSES[$r['status']] ?? $r['status']) ?></span>
        <?php if ($r['status'] === 'confirmed'): ?>
          <form method="post" class="inline" data-confirm="Annuler le rendez-vous de <?= e($r['client_name']) ?> ?">
            <?= csrf_field() ?><input type="hidden" name="action" value="appt_status"><input type="hidden" name="status" value="cancelled">
            <input type="hidden" name="id" value="<?= (int) $r['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>">
            <button class="link danger" type="submit">Annuler</button>
          </form>
        <?php endif; ?>
      </div>
    </article>
  <?php endforeach; ?>
</div>
<?php endif; ?>
<?php admin_footer();
