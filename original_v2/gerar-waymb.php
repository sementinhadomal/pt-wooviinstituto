<?php
// CORS Headers - DEVEM SER OS PRIMEIROS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
header('Access-Control-Max-Age: 3600');
header('Content-Type: application/json; charset=utf-8');

// Tratar preflight OPTIONS imediatamente
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// API para gerar pagamento WayMB (MB WAY / Multibanco)
require_once __DIR__ . '/config-waymb.php';

// Função de log
function writeLog($message, $data = null) {
    $logDir = __DIR__ . '/logs';
    if (!file_exists($logDir)) {
        mkdir($logDir, 0777, true);
    }
    
    $logFile = $logDir . '/gerar-waymb-' . date('Y-m-d') . '.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    if ($data !== null) {
        $logMessage .= "Dados: " . json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    }
    $logMessage .= "----------------------------------------\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

try {
    writeLog("📥 Nova requisição para gerar pagamento WayMB");
    
    // Verificar método
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }
    
    // Receber dados
    $json = file_get_contents('php://input');
    $input = json_decode($json, true);
    
    writeLog("Dados recebidos", $input);
    
    if (!$input) {
        throw new Exception('Dados inválidos');
    }
    
    // Validações
    if (empty($input['payer']['name'])) {
        throw new Exception('Nome do pagador é obrigatório');
    }
    if (empty($input['payer']['document'])) {
        throw new Exception('Documento (NIF) é obrigatório');
    }
    if (empty($input['payer']['phone'])) {
        throw new Exception('Telefone é obrigatório');
    }
    if (empty($input['amount']) || $input['amount'] < 1) {
        throw new Exception('Valor inválido (mínimo 1 EUR)');
    }
    if (empty($input['method']) || !in_array($input['method'], ['mbway', 'multibanco'])) {
        throw new Exception('Método de pagamento inválido');
    }
    
    // Preparar dados para API WayMB
    $paymentData = [
        'client_id' => WAYMB_CLIENT_ID,
        'client_secret' => WAYMB_CLIENT_SECRET,
        'account_email' => WAYMB_ACCOUNT_EMAIL,
        'amount' => floatval($input['amount']),
        'method' => $input['method'],
        'currency' => 'EUR',
        'payer' => [
            'name' => $input['payer']['name'],
            'document' => $input['payer']['document'],
            'phone' => $input['payer']['phone']
        ],
        'callbackUrl' => WAYMB_CALLBACK_URL,
        'success_url' => WAYMB_SUCCESS_URL,
        'failed_url' => WAYMB_FAILED_URL
    ];
    
    writeLog("Dados preparados para API WayMB", $paymentData);
    
    // Fazer requisição para API WayMB
    $ch = curl_init(WAYMB_API_URL . '/transactions/create');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paymentData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    writeLog("Enviando requisição para API WayMB");
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    writeLog("Resposta da API WayMB", [
        'httpCode' => $httpCode,
        'response' => $response,
        'error' => $curlError
    ]);
    
    if ($curlError) {
        throw new Exception('Erro na requisição: ' . $curlError);
    }
    
    $waymb = json_decode($response, true);
    
    if (!$waymb) {
        throw new Exception('Resposta inválida da API WayMB');
    }
    
    // Verificar se houve erro
    if (isset($waymb['error'])) {
        throw new Exception('Erro WayMB: ' . $waymb['error']);
    }
    
    if ($httpCode !== 200 || $waymb['statusCode'] !== 200) {
        throw new Exception('Erro na API WayMB: ' . ($waymb['message'] ?? 'Código HTTP ' . $httpCode));
    }
    
    writeLog("Pagamento WayMB criado com sucesso", ['transaction_id' => $waymb['transactionID']]);
    
    // Salvar no banco de dados
    $db = initDatabase();
    if (!$db) {
        writeLog("⚠️ Erro ao conectar ao banco de dados, continuando sem salvar");
    } else {
        $dataHora = date('Y-m-d H:i:s');
        
        $stmt = $db->prepare("
            INSERT INTO doacoes (
                transaction_id, nome, documento, telefone, valor, metodo,
                status, mb_entity, mb_reference, mb_expires, tracking_params, created_at
            ) VALUES (
                :transaction_id, :nome, :documento, :telefone, :valor, :metodo,
                :status, :mb_entity, :mb_reference, :mb_expires, :tracking_params, :created_at
            )
        ");
        
        $stmt->execute([
            'transaction_id' => $waymb['transactionID'],
            'nome' => $input['payer']['name'],
            'documento' => $input['payer']['document'],
            'telefone' => $input['payer']['phone'],
            'valor' => $input['amount'],
            'metodo' => $input['method'],
            'status' => 'PENDING',
            'mb_entity' => $waymb['referenceData']['entity'] ?? null,
            'mb_reference' => $waymb['referenceData']['reference'] ?? null,
            'mb_expires' => $waymb['referenceData']['expiresAt'] ?? null,
            'tracking_params' => json_encode($input['trackingParams'] ?? []),
            'created_at' => $dataHora
        ]);
        
        writeLog("Doação salva no banco de dados");
    }
    
    // Enviar para Utmify (status pendente)
    $trackingParams = $input['trackingParams'] ?? [];
    
    // Utmify agora aceita EUR diretamente com o campo currency
    $amountInEur = floatval($input['amount']);
    $amountInCents = intval($amountInEur * 100);
    
    writeLog("Valor para Utmify (EUR direto)", [
        'amountEUR' => $amountInEur,
        'amountCentavos' => $amountInCents,
        'currency' => 'EUR'
    ]);
    
    // Mapear metodo de pagamento para formato aceito pela Utmify
    // Utmify aceita: credit_card, boleto, pix, paypal, free_price, unknown
    // mbway -> pix (pagamento instantaneo)
    // multibanco -> boleto (referencia bancaria)
    $utmifyPaymentMethod = 'pix'; // default
    if ($input['method'] === 'multibanco') {
        $utmifyPaymentMethod = 'boleto';
    }
    
    $utmifyData = [
        'orderId' => (string)$waymb['transactionID'],
        'platform' => 'WayMB',
        'paymentMethod' => $utmifyPaymentMethod,
        'status' => 'waiting_payment',
        'createdAt' => gmdate('Y-m-d\TH:i:s\Z'),
        'approvedDate' => null,
        'refundedAt' => null,
        'customer' => [
            'name' => $input['payer']['name'],
            'email' => $input['payer']['email'] ?? 'doador@salveochico.online',
            'phone' => $input['payer']['phone'],
            'document' => $input['payer']['document'],
            'country' => 'PT',
            'ip' => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'
        ],
        'products' => [[
            'id' => 'doacao-gofundme',
            'name' => 'Doacao GoFundMe',
            'planId' => null,
            'planName' => null,
            'quantity' => 1,
            'priceInCents' => $amountInCents
        ]],
        'trackingParameters' => [
            'src' => !empty($trackingParams['src']) ? $trackingParams['src'] : null,
            'sck' => !empty($trackingParams['sck']) ? $trackingParams['sck'] : null,
            'utm_source' => !empty($trackingParams['utm_source']) ? $trackingParams['utm_source'] : null,
            'utm_campaign' => !empty($trackingParams['utm_campaign']) ? $trackingParams['utm_campaign'] : null,
            'utm_medium' => !empty($trackingParams['utm_medium']) ? $trackingParams['utm_medium'] : null,
            'utm_content' => !empty($trackingParams['utm_content']) ? $trackingParams['utm_content'] : null,
            'utm_term' => !empty($trackingParams['utm_term']) ? $trackingParams['utm_term'] : null,
            'xcod' => !empty($trackingParams['xcod']) ? $trackingParams['xcod'] : null,
            'fbclid' => !empty($trackingParams['fbclid']) ? $trackingParams['fbclid'] : null,
            'gclid' => !empty($trackingParams['gclid']) ? $trackingParams['gclid'] : null,
            'ttclid' => !empty($trackingParams['ttclid']) ? $trackingParams['ttclid'] : null
        ],
        'commission' => [
            'totalPriceInCents' => $amountInCents,
            'gatewayFeeInCents' => 0,
            'userCommissionInCents' => $amountInCents,
            'currency' => 'EUR'
        ],
        'isTest' => false
    ];
    
    writeLog("🚀 [UTMIFY PENDENTE] Enviando para Utmify", [
        'url' => UTMIFY_API_URL,
        'token' => substr(UTMIFY_TOKEN, 0, 10) . '...',
        'data' => $utmifyData
    ]);
    
    $ch = curl_init(UTMIFY_API_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($utmifyData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json',
        'x-api-token: ' . UTMIFY_TOKEN
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    
    $utmifyResponse = curl_exec($ch);
    $utmifyHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $utmifyCurlError = curl_error($ch);
    $utmifyCurlInfo = curl_getinfo($ch);
    curl_close($ch);
    
    writeLog("📥 [UTMIFY PENDENTE] Resposta da Utmify", [
        'httpCode' => $utmifyHttpCode,
        'response' => $utmifyResponse,
        'curlError' => $utmifyCurlError ?: 'nenhum',
        'curlInfo' => [
            'total_time' => $utmifyCurlInfo['total_time'],
            'http_code' => $utmifyCurlInfo['http_code']
        ]
    ]);
    
    // Log se houve erro na Utmify (mas nao bloquear o pagamento)
    if ($utmifyHttpCode !== 200) {
        writeLog("⚠️ [UTMIFY PENDENTE] Erro ao enviar para Utmify (pagamento continua)", [
            'httpCode' => $utmifyHttpCode,
            'error' => $utmifyCurlError ?: $utmifyResponse
        ]);
    } else {
        writeLog("✅ [UTMIFY PENDENTE] Enviado com sucesso para Utmify");
    }
    
    // Retornar dados para o frontend
    echo json_encode([
        'success' => true,
        'data' => [
            'transactionID' => $waymb['transactionID'],
            'amount' => $waymb['amount'],
            'method' => $input['method'],
            'generatedMBWay' => $waymb['generatedMBWay'] ?? false,
            'referenceData' => $waymb['referenceData'] ?? null
        ]
    ]);
    
} catch (Exception $e) {
    writeLog("❌ Erro ao gerar pagamento", ['message' => $e->getMessage()]);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
