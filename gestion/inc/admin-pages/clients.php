<?php
/**
 * Fichier clients du salon : fréquence de visite, absences, consentement aux relances (CNIL),
 * export des clients relançables et droit à l'effacement.
 */
declare(strict_types=1);

$salonId = (int) $salon['id'];
$search = trim((string) ($_GET['q'] ?? ''));
$filter = $_GET['f'] ?? 'all';
$filters = ['all' => 'Tous', 'consent' => 'Relances acceptées', 'lost' => 'Pas revenus depuis 2 mois', 'noshow' => 'Déjà absents'];
if (!isset($filters[$filter])) $filter = 'all';
$nowStr = now()->format('Y-m-d H:i:s');

$params = [$nowStr, $nowStr, $salonId];
$where = '';
if ($search !== '') {
    $like = '%' . str_replace(['%', '_'], ['\%', '\_'], $search) . '%';
    $where = ' AND (c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?)';
    array_push($params, $like, $like, $like);
}
$sql = "SELECT c.*,
          SUM(CASE WHEN a.status IN ('done','confirmed') AND a.start_at < ? THEN 1 ELSE 0 END) AS visits,
          SUM(CASE WHEN a.status = 'noshow' THEN 1 ELSE 0 END) AS noshows,
          MAX(CASE WHEN a.status <> 'cancelled' AND a.start_at < ? THEN a.start_at END) AS last_visit,
          MAX(CASE WHEN a.status = 'confirmed' THEN a.start_at END) AS next_visit,
          SUM(CASE WHEN a.status IN ('done','confirmed') THEN COALESCE(a.price_eur, 0) ELSE 0 END) AS spent
        FROM clients c JOIN appointments a ON a.client_id = c.id
        WHERE a.salon_id = ?$where
        GROUP BY c.id, c.phone, c.name, c.email, c.marketing_consent, c.consent_at, c.created_at
        ORDER BY last_visit DESC";
$rows = q($sql, $params)->fetchAll();

$twoMonths = now()->modify('-60 days')->format('Y-m-d H:i:s');
$rows = array_values(array_filter($rows, fn($r) => match ($filter) {
    'consent' => (int) $r['marketing_consent'] === 1,
    'lost' => $r['last_visit'] && $r['last_visit'] < $twoMonths && (!$r['next_visit'] || $r['next_visit'] < $nowStr),
    'noshow' => (int) $r['noshows'] > 0,
    default => true,
}));

if (($_GET['export'] ?? '') === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="clients-' . $salon['slug'] . '-' . now()->format('Y-m-d') . '.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF");
    fputcsv($out, ['Nom', 'Téléphone', 'E-mail', 'Visites', 'Absences', 'Dernière visite', 'Prochain RDV', 'Relances acceptées', 'Date du consentement'], ';');
    foreach ($rows as $r) {
        fputcsv($out, [
            $r['name'], $r['phone'], $r['email'], $r['visits'], $r['noshows'],
            $r['last_visit'] ? substr($r['last_visit'], 0, 10) : '', $r['next_visit'] && $r['next_visit'] >= $nowStr ? substr($r['next_visit'], 0, 16) : '',
            (int) $r['marketing_consent'] ? 'Oui' : 'Non', $r['consent_at'] ? substr($r['consent_at'], 0, 10) : '',
        ], ';');
    }
    exit;
}

$back = 'index.php?' . http_build_query(['p' => 'clients', 'f' => $filter, 'q' => $search]);
$consenting = count(array_filter($rows, fn($r) => (int) $r['marketing_consent'] === 1));

admin_header('Clients', 'clients', $user, $salon);
?>
<div class="page-head">
  <div>
    <h1>Clients · <?= e($salon['name']) ?></h1>
    <p class="muted"><?= count($rows) ?> client<?= count($rows) > 1 ? 's' : '' ?> · <?= $consenting ?> acceptent les relances</p>
  </div>
  <div class="head-actions">
    <a class="btn ghost" href="<?= e('index.php?' . http_build_query(['p' => 'clients', 'f' => $filter, 'q' => $search, 'export' => 'csv'])) ?>">Exporter (Excel)</a>
  </div>
</div>

<form method="get" class="filters">
  <input type="hidden" name="p" value="clients">
  <div class="chips">
    <?php foreach ($filters as $k => $label): ?>
      <a class="chip<?= $k === $filter ? ' on' : '' ?>" href="<?= e('index.php?' . http_build_query(['p' => 'clients', 'f' => $k, 'q' => $search])) ?>"><?= e($label) ?></a>
    <?php endforeach; ?>
  </div>
  <input type="hidden" name="f" value="<?= e($filter) ?>">
  <input type="search" name="q" value="<?= e($search) ?>" placeholder="Nom, téléphone, e-mail…" aria-label="Rechercher un client">
  <button class="btn ghost" type="submit">Rechercher</button>
</form>

<p class="muted small">Seuls les clients ayant coché « J'accepte que Seven Barbershop me contacte » peuvent recevoir des relances ou des offres (règle CNIL). Retirez le consentement dès qu'un client le demande.</p>

<?php if (!$rows): ?>
  <div class="empty-box">Aucun client pour ces critères.</div>
<?php else: ?>
<div class="table-wrap panel flush">
  <table class="table clients-table">
    <thead><tr><th>Client</th><th>Contact</th><th class="num">Visites</th><th class="num">Absences</th><th>Dernière visite</th><th>Relances</th><th><span class="sr-only">Actions</span></th></tr></thead>
    <tbody>
    <?php foreach ($rows as $r): ?>
      <tr>
        <td data-label="Client"><b><?= e($r['name']) ?></b><?php if ($r['next_visit'] && $r['next_visit'] >= $nowStr): ?><br><span class="muted small">Prochain RDV : <?= e(fmt_date_fr(substr($r['next_visit'], 0, 10))) ?> <?= e(substr($r['next_visit'], 11, 5)) ?></span><?php endif; ?></td>
        <td data-label="Contact"><a href="tel:<?= e(preg_replace('/\s+/', '', $r['phone'])) ?>"><?= e($r['phone']) ?></a><?php if ($r['email']): ?><br><a class="small" href="mailto:<?= e($r['email']) ?>"><?= e($r['email']) ?></a><?php endif; ?></td>
        <td data-label="Visites" class="num"><?= (int) $r['visits'] ?></td>
        <td data-label="Absences" class="num"><?= (int) $r['noshows'] ? '<span class="pill warn">' . (int) $r['noshows'] . '</span>' : '0' ?></td>
        <td data-label="Dernière visite"><?= $r['last_visit'] ? e(fmt_date_fr(substr($r['last_visit'], 0, 10), true)) : '—' ?></td>
        <td data-label="Relances">
          <form method="post" class="inline">
            <?= csrf_field() ?><input type="hidden" name="action" value="client_consent"><input type="hidden" name="id" value="<?= (int) $r['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>">
            <input type="hidden" name="consent" value="<?= (int) $r['marketing_consent'] ? 0 : 1 ?>">
            <?php if ((int) $r['marketing_consent']): ?>
              <span class="pill ok" title="Depuis le <?= e(substr((string) $r['consent_at'], 0, 10)) ?>">Acceptées</span> <button class="link small" type="submit">Retirer</button>
            <?php else: ?>
              <span class="pill">Non</span> <button class="link small" type="submit" title="Uniquement si le client l'a demandé">Le client accepte</button>
            <?php endif; ?>
          </form>
        </td>
        <td class="right-cell">
          <a class="link small" href="<?= e('index.php?' . http_build_query(['p' => 'rdv', 'period' => 'all', 'q' => $r['phone']])) ?>">Historique</a>
          <?php if ($user['is_owner']): ?>
            <form method="post" class="inline" data-confirm="Effacer définitivement <?= e($r['name']) ?> ? Ses coordonnées seront retirées de tous les rendez-vous (droit à l'effacement).">
              <?= csrf_field() ?><input type="hidden" name="action" value="client_delete"><input type="hidden" name="id" value="<?= (int) $r['id'] ?>"><input type="hidden" name="back" value="<?= e($back) ?>">
              <button class="link danger small" type="submit">Effacer</button>
            </form>
          <?php endif; ?>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php endif; ?>
<?php admin_footer();
