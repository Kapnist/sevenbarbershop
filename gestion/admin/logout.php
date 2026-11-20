<?php
declare(strict_types=1);
require dirname(__DIR__) . '/inc/bootstrap.php';
require dirname(__DIR__) . '/inc/admin.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && csrf_valid($_POST['csrf'] ?? null)) {
    // Se déconnecter oublie aussi cet appareil (« Rester connecté »)
    forget_device();
    start_session();
    $_SESSION = [];
    session_destroy();
}
redirect('login.php');
