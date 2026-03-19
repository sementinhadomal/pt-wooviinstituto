<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$transactionId = $_GET['id'] ?? null;

if (!$transactionId) {
    http_response_code(400);
    echo json_encode(['error' => 'ID missing']);
    exit;
}

$statusFile = __DIR__ . '/status/' . preg_replace('/[^a-zA-Z0-9_-]/', '', $transactionId) . '.json';

if (file_exists($statusFile)) {
    echo file_get_contents($statusFile);
} else {
    echo json_encode(['status' => 'not_found']);
}
?>
