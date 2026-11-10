<?php
/**
 * Espace gérant — routeur.
 * Chaque page vit dans inc/admin-pages/, chaque action POST dans inc/admin-actions.php.
 */
declare(strict_types=1);
require dirname(__DIR__) . '/inc/bootstrap.php';
require dirname(__DIR__) . '/inc/admin.php';

$user = require_admin();
$salon = current_salon($user);
$page = $_GET['p'] ?? 'agenda';
if (!array_key_exists($page, ADMIN_NAV) || (in_array($page, OWNER_PAGES, true) && !$user['is_owner'])) $page = 'agenda';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require dirname(__DIR__) . '/inc/admin-actions.php';
    if (!csrf_valid($_POST['csrf'] ?? null)) {
        flash('Session expirée : rechargez la page et recommencez.', 'err');
    } else {
        try {
            run_admin_action((string) ($_POST['action'] ?? ''), $user, $salon);
        } catch (InvalidArgumentException | RuntimeException $ex) {
            flash($ex->getMessage(), 'err');
        }
    }
    // Page de retour (une action peut la changer, par exemple vers « Barbiers » après la création d'un salon)
    $back = (string) ($_POST['back'] ?? '');
    if (!preg_match('/^index\.php\?[\w=&%.\-]*$/', $back)) $back = admin_url($page);
    redirect($back);
}

require dirname(__DIR__) . '/inc/admin-pages/' . $page . '.php';
