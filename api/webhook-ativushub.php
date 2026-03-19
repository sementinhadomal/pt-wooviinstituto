<?php
// Webhook para receber notificações da AtivusHub e repassar à UTMify

require_once __DIR__ . '/config-ativushub.php';

header('Content-Type: application/json; charset=utf-8');

function writeLog($message, $data = null) {
    $logDir = sys_get_temp_dir() . '/webhook-logs';
    if (!file_exists($logDir)) { @mkdir($logDir, 0777, true); }
    $logFile = $logDir . '/webhook-' . date('Y-m-d') . '.log';
    $ts = date('Y-m-d H:i:s');
    $line = "[$ts] $message\n";
    if ($data !== null) { $line .= json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n"; }
    $line .= "---\n";
    @file_put_contents($logFile, $line, FILE_APPEND);
}

try {
    $json = file_get_contents('php://input');
    $webhookData = json_decode($json, true);

    // Fallback para POST padrão se JSON falhar
    if (!$webhookData && !empty($_POST)) {
        $webhookData = $_POST;
        writeLog("📥 Webhook recebido via $_POST", ['method' => $_SERVER['REQUEST_METHOD'], 'data' => $webhookData]);
    } else {
        writeLog("📥 Webhook recebido via php://input", ['method' => $_SERVER['REQUEST_METHOD'], 'data' => $webhookData]);
    }

    if (!$webhookData) {
        // Tentar capturar se vier como string query
        parse_str($json, $output);
        if ($output && count($output) > 1) {
            $webhookData = $output;
            writeLog("📥 Webhook recebido via parse_str", ['data' => $webhookData]);
        }
    }

    if (!$webhookData || count($webhookData) === 0) {
        writeLog("⚠️ Webhook vazio ou inválido ignorado.");
        http_response_code(200); // Responder 200 para o gateway parar de tentar se estiver enviando algo inútil
        echo json_encode(['status' => 'ignored', 'message' => 'Nenhum dado capturado']);
        exit;
    }

    // Normalizar dados (flexibilidade total)
    $transactionId = $webhookData['idtransaction'] 
                   ?? $webhookData['idTransaction'] 
                   ?? $webhookData['id_transaction'] 
                   ?? $webhookData['transaction_id']
                   ?? $webhookData['id'] 
                   ?? null;

    $statusRaw = $webhookData['status'] 
               ?? $webhookData['payment_status'] 
               ?? $webhookData['transaction_status'] 
               ?? '';
    $status = strtolower(trim($statusRaw));

    $amount = floatval($webhookData['amount'] 
                     ?? $webhookData['value'] 
                     ?? $webhookData['total_amount'] 
                     ?? $webhookData['price']
                     ?? 0);

    // Metadata pode vir como JSON string ou array
    $metadata = $webhookData['metadata'] ?? [];
    if (is_string($metadata)) {
        $metadata = json_decode($metadata, true) ?? [];
    }

    if (!$transactionId) {
        writeLog("❌ ID da transação não encontrado no payload");
        http_response_code(400);
        echo json_encode(['error' => 'ID da transação não encontrado']);
        exit;
    }

    writeLog("🔍 Transação Identificada", ['id' => $transactionId, 'status' => $status, 'amount' => $amount]);

    // Status de pagamento aprovado na AtivusHub
    $paidStatuses = ['paid_out', 'paid', 'completed', 'approved', 'approved_smart_link', 'pago', 'aprovado'];
    // Status de pagamento pendente na AtivusHub
    $pendingStatuses = ['pending', 'waiting_payment', 'aguardando_pagamento', 'pendente', 'waiting', 'created'];

    $isPaid    = in_array($status, $paidStatuses);
    $isPending = in_array($status, $pendingStatuses);

    if ($isPaid || $isPending) {
        $utmifyStatus = $isPaid ? 'paid' : 'waiting_payment';
        writeLog("🔔 Processando status [$status] -> UTMify [$utmifyStatus]");

        // Formato de data ISO 8601 exigido pela UTMify
        $nowIso = gmdate('Y-m-d\TH:i:s\Z');

        // Extração de cliente
        $clientName  = $webhookData['client_name']  ?? $metadata['name']  ?? $webhookData['name']  ?? 'Doador Anônimo';
        $clientEmail = $webhookData['client_email'] ?? $metadata['email'] ?? $webhookData['email'] ?? 'doador@salveamaria-alice.online';
        $clientPhone = $webhookData['client_phone'] ?? $metadata['phone'] ?? $webhookData['phone'] ?? '+5511999999999';

        $utmifyData = [
            'orderId'       => (string)$transactionId,
            'platform'      => 'AtivusHub',
            'paymentMethod' => 'pix',
            'status'        => $utmifyStatus,
            'createdAt'     => $nowIso,
            'approvedDate'  => $isPaid ? $nowIso : null,
            'refundedAt'    => null,
            'customer' => [
                'name'     => $clientName,
                'email'    => $clientEmail,
                'phone'    => $clientPhone,
                'document' => $webhookData['client_document'] ?? $metadata['document'] ?? $webhookData['document'] ?? '',
                'country'  => 'BR',
                'ip'       => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'
            ],
            'products' => [[
                'id'        => 'doacao-maria-alice',
                'name'      => $metadata['product_name'] ?? 'Doação Maria Alice',
                'planId'    => null,
                'planName'  => null,
                'quantity'  => 1,
                'priceInCents' => intval($amount * 100)
            ]],
            'trackingParameters' => [
                'src'          => $metadata['src']          ?? $webhookData['src']          ?? null,
                'sck'          => $metadata['sck']          ?? $webhookData['sck']          ?? null,
                'utm_source'   => $metadata['utm_source']   ?? $webhookData['utm_source']   ?? null,
                'utm_campaign' => $metadata['utm_campaign'] ?? $webhookData['utm_campaign'] ?? null,
                'utm_medium'   => $metadata['utm_medium']   ?? $webhookData['utm_medium']   ?? null,
                'utm_content'  => $metadata['utm_content']  ?? $webhookData['utm_content']  ?? null,
                'utm_term'     => $metadata['utm_term']     ?? $webhookData['utm_term']     ?? null,
                'fbclid'       => $metadata['fbclid']       ?? $webhookData['fbclid']       ?? null,
                'gclid'        => $metadata['gclid']        ?? $webhookData['gclid']        ?? null,
            ],
            'commission' => [
                'totalPriceInCents'      => intval($amount * 100),
                'gatewayFeeInCents'      => 0,
                'userCommissionInCents'  => intval($amount * 100),
                'currency'               => 'BRL'
            ],
            'isTest' => false
        ];


        writeLog("🚀 Enviando para UTMify", $utmifyData);

        $ch = curl_init(UTMIFY_API_URL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($utmifyData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'x-api-token: ' . UTMIFY_TOKEN
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);

        $utmifyResponse = curl_exec($ch);
        $utmifyCode     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr        = curl_error($ch);
        curl_close($ch);

        writeLog("📥 Resposta UTMify", [
            'http_code' => $utmifyCode,
            'response'  => $utmifyResponse,
            'curl_error'=> $curlErr ?: 'nenhum',
            'success'   => ($utmifyCode >= 200 && $utmifyCode < 300) ? 'SIM' : 'NÃO'
        ]);

        // --- SALVAR STATUS PARA POLLING DO FRONTEND ---
        $statusFile = __DIR__ . '/status/' . $transactionId . '.json';
        file_put_contents($statusFile, json_encode([
            'status' => $utmifyStatus,
            'updated_at' => date('Y-m-d H:i:s')
        ]));
        // ----------------------------------------------
    } else {
        writeLog("ℹ️ Status não é de aprovação, ignorando: $status");
    }

    echo json_encode(['status' => 'success', 'message' => 'Webhook processado.']);

} catch (Exception $e) {
    writeLog("❌ Erro", ['message' => $e->getMessage()]);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
