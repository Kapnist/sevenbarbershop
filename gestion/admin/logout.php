<?php
declare(strict_types=1);
require dirname(__DIR__) . '/inc/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && csrf_valid($_POST['csrf'] ?? null)) {
    start_session();
    $_SESSION = [];
    session_destroy();
}
redirect('login.php');
