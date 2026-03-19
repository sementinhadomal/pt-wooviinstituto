<?php
// Webhook para receber notificações da WayMB

require_once __DIR__ . '/config-waymb.php';

// Headers
header('Content-Type: application/json; charset=utf-8');

// Função de log
function writeLog($message, $data = null) {
    $logDir = __DIR__ . '/logs';
    if (!file_exists($logDir)) {
        mkdir($logDir, 0777, true);
    }
    
    $logFile = $logDir . '/webhook-waymb-' . date('Y-m-d') . '.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] [WEBHOOK-WAYMB] $message\n";
    if ($data !== null) {
        $logMessage .= "Dados: " . json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    }
    $logMessage .= "----------------------------------------\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

try {
    // Ler dados do webhook
    $json = file_get_contents('php://input');
    $webhookData = json_decode($json, true);
    
    writeLog("📥 Webhook recebido", [
        'method' => $_SERVER['REQUEST_METHOD'],
        'data' => $webhookData
    ]);
    
    if (!$webhookData) {
        writeLog("❌ Dados JSON inválidos");
        echo json_encode(['error' => 'Dados inválidos']);
        exit;
    }
    
    $transactionId = $webhookData['transactionId'] ?? $webhookData['id'] ?? null;
    $status = $webhookData['status'] ?? null;
    $amount = $webhookData['amount'] ?? $webhookData['value'] ?? null;
    
    if (!$transactionId) {
        writeLog("❌ ID da transação não fornecido");
        echo json_encode(['error' => 'ID da transação não fornecido']);
        exit;
    }
    
    writeLog("🔍 Processando transação", [
        'transaction_id' => $transactionId,
        'status' => $status,
        'amount' => $amount
    ]);
    
    // Conectar ao banco de dados
    $db = initDatabase();
    if ($db) {
        // Atualizar status no banco de dados
        $dataHora = date('Y-m-d H:i:s');
        
        $stmt = $db->prepare("UPDATE doacoes SET status = :status, updated_at = :updated_at WHERE transaction_id = :transaction_id");
        $stmt->execute([
            'status' => $status,
            'transaction_id' => $transactionId,
            'updated_at' => $dataHora
        ]);
        
        writeLog("✅ Status atualizado no banco de dados", [
            'transaction_id' => $transactionId,
            'status' => $status,
            'rows_affected' => $stmt->rowCount()
        ]);
    }
    
    // Se pagamento foi aprovado, enviar para Utmify
    if ($status === 'COMPLETED' || $status === 'paid' || $status === 'approved') {
        writeLog("💰 Pagamento aprovado! Enviando para Utmify");
        
        // Buscar dados da doação no banco
        $doacao = null;
        if ($db) {
            $stmt = $db->prepare("SELECT * FROM doacoes WHERE transaction_id = :transaction_id");
            $stmt->execute(['transaction_id' => $transactionId]);
            $doacao = $stmt->fetch(PDO::FETCH_ASSOC);
        }
        
        $trackingParams = [];
        if ($doacao && !empty($doacao['tracking_params'])) {
            $trackingParams = json_decode($doacao['tracking_params'], true) ?? [];
        }
        
        // Mapear metodo de pagamento para formato aceito pela Utmify
        // mbway -> pix, multibanco -> boleto
        $metodoOriginal = $doacao['metodo'] ?? 'mbway';
        $utmifyPaymentMethod = 'pix';
        if ($metodoOriginal === 'multibanco') {
            $utmifyPaymentMethod = 'boleto';
        }
        
        $utmifyData = [
            'orderId' => (string)$transactionId,
            'platform' => 'WayMB',
            'paymentMethod' => $utmifyPaymentMethod,
            'status' => 'paid',
            'createdAt' => gmdate('Y-m-d H:i:s', strtotime($doacao['created_at'] ?? 'now')),
            'approvedDate' => gmdate('Y-m-d H:i:s'),
            'refundedAt' => null,
            'customer' => [
                'name' => $doacao['nome'] ?? 'Doador Anônimo',
                'email' => 'doador@salveochico.online',
                'phone' => $doacao['telefone'] ?? null,
                'document' => $doacao['documento'] ?? '',
                'country' => 'PT',
                'ip' => $_SERVER['REMOTE_ADDR'] ?? null
            ],
            'products' => [[
                'id' => 'doacao-salveochico',
                'name' => 'Doação Salve o Chico',
                'planId' => null,
                'planName' => null,
                'quantity' => 1,
                'priceInCents' => intval(($doacao['valor'] ?? $amount ?? 0) * 100)
            ]],
            'trackingParameters' => [
                'src' => $trackingParams['src'] ?? null,
                'sck' => $trackingParams['sck'] ?? null,
                'utm_source' => $trackingParams['utm_source'] ?? null,
                'utm_campaign' => $trackingParams['utm_campaign'] ?? null,
                'utm_medium' => $trackingParams['utm_medium'] ?? null,
                'utm_content' => $trackingParams['utm_content'] ?? null,
                'utm_term' => $trackingParams['utm_term'] ?? null,
                'xcod' => $trackingParams['xcod'] ?? null,
                'fbclid' => $trackingParams['fbclid'] ?? null,
                'gclid' => $trackingParams['gclid'] ?? null,
                'ttclid' => $trackingParams['ttclid'] ?? null
            ],
            'commission' => [
                'totalPriceInCents' => intval(($doacao['valor'] ?? $amount ?? 0) * 100),
                'gatewayFeeInCents' => 0,
                'userCommissionInCents' => intval(($doacao['valor'] ?? $amount ?? 0) * 100),
                'currency' => 'EUR'
            ],
            'isTest' => false
        ];
        
        writeLog("🚀 [UTMIFY APROVADO] Enviando para Utmify", $utmifyData);
        
        $ch = curl_init(UTMIFY_API_URL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($utmifyData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'x-api-token: ' . UTMIFY_TOKEN
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $utmifyResponse = curl_exec($ch);
        $utmifyHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $utmifyCurlError = curl_error($ch);
        curl_close($ch);
        
        writeLog("📥 [UTMIFY APROVADO] Resposta da Utmify", [
            'httpCode' => $utmifyHttpCode,
            'response' => $utmifyResponse,
            'curlError' => $utmifyCurlError ?: 'nenhum',
            'success' => ($utmifyHttpCode >= 200 && $utmifyHttpCode < 300) ? 'SIM' : 'NÃO'
        ]);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Webhook processado com sucesso'
    ]);
    
} catch (Exception $e) {
    writeLog("❌ Erro no webhook", ['message' => $e->getMessage()]);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
