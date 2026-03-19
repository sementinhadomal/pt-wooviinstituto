<?php
error_reporting(0);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require_once __DIR__ . '/config-ativushub.php';

try {
    $input_raw = file_get_contents('php://input');
    $input = json_decode($input_raw, true);
    
    $amount = floatval($input['amount'] ?? 5);
    if ($amount <= 2) $amount = 5; // API safety

    $recurring = isset($input['recurring']) && $input['recurring'] === true;
    $tracking = $input['tracking'] ?? [];

    $paymentData = [
        "amount" => $amount,
        "id_seller" => ATIVUSHUB_ID_SELLER,
        "customer" => [
            "name" => 'Doador Maria Alice',
            "email" => 'doador@salveamaria-alice.online',
            "cpf" => '84942918073',
            "phone" => '11999999999',
            "address" => ["street" => "Rua Principal", "streetNumber" => "100", "complement" => "Casa", "zipCode" => "01001000", "neighborhood" => "Centro", "city" => "São Paulo", "state" => "SP", "country" => "br"]
        ],
        "items" => [["title" => "Doacao Maria Alice" . ($recurring ? " (Mensal)" : ""), "quantity" => 1, "unitPrice" => $amount, "tangible" => false]],
        "recurring" => $recurring, // Sending to gateway if supported
        "postbackUrl" => ATIVUSHUB_CALLBACK_URL,
        "callback_url" => ATIVUSHUB_CALLBACK_URL,
        "url_postback" => ATIVUSHUB_CALLBACK_URL,
        "ip" => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
        "metadata" => array_merge($tracking, ['recurring' => $recurring])
    ];

    $ch = curl_init(ATIVUSHUB_API_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paymentData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Basic ' . base64_encode(ATIVUSHUB_API_KEY . ':'),
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $gatewayResp = json_decode($response, true);
    
    // Clear any previous output buffers just in case
    while (ob_get_level()) { ob_end_clean(); }

    if (!$gatewayResp || !isset($gatewayResp['status']) || $gatewayResp['status'] !== 'success') {
        $msg = $gatewayResp['message'] ?? 'Erro desconhecido na API AtivusHub';
        $debug = [
            'http_code' => $httpCode,
            'raw_response' => $response,
            'decoded' => $gatewayResp
        ];
        echo json_encode(['success' => false, 'error' => $msg, 'debug' => $debug]);
        exit;
    }

    $transactionId = $gatewayResp['idTransaction'];

    // --- NOTIFICAÇÃO MANUAL UTMIFY (PENDENTE) ---
    // Como o gateway pode demorar ou não enviar webhook de 'pending', notificamos manualmente
    $nowIso = gmdate('Y-m-d\TH:i:s\Z');
    $utmifyData = [
        'orderId'       => (string)$transactionId,
        'platform'      => 'AtivusHub',
        'paymentMethod' => 'pix',
        'status'        => 'waiting_payment',
        'createdAt'     => $nowIso,
        'approvedDate'  => null,
        'refundedAt'    => null,
        'customer' => [
            'name'     => $paymentData['customer']['name'],
            'email'    => $paymentData['customer']['email'],
            'phone'    => $paymentData['customer']['phone'],
            'document' => $paymentData['customer']['cpf'],
            'country'  => 'BR',
            'ip'       => $paymentData['ip']
        ],
        'products' => [[
            'id'        => 'doacao-maria-alice',
            'name'      => $tracking['product_name'] ?? 'Doação Maria Alice',
            'planId'    => null,
            'planName'  => null,
            'quantity'  => 1,
            'priceInCents' => intval($amount * 100)
        ]],
        'trackingParameters' => [
            'src'          => $tracking['src']          ?? null,
            'sck'          => $tracking['sck']          ?? null,
            'utm_source'   => $tracking['utm_source']   ?? null,
            'utm_campaign' => $tracking['utm_campaign'] ?? null,
            'utm_medium'   => $tracking['utm_medium']   ?? null,
            'utm_content'  => $tracking['utm_content']  ?? null,
            'utm_term'     => $tracking['utm_term']     ?? null,
            'fbclid'       => $tracking['fbclid']       ?? null,
            'gclid'        => $tracking['gclid']        ?? null,
        ],
        'commission' => [
            'totalPriceInCents'      => intval($amount * 100),
            'gatewayFeeInCents'      => 0,
            'userCommissionInCents'  => intval($amount * 100),
            'currency'               => 'BRL'
        ],
        'isTest' => false
    ];

    $ch2 = curl_init(UTMIFY_API_URL);
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch2, CURLOPT_POST, true);
    curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($utmifyData));
    curl_setopt($ch2, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'x-api-token: ' . UTMIFY_TOKEN
    ]);
    curl_setopt($ch2, CURLOPT_TIMEOUT, 10);
    curl_exec($ch2);
    curl_close($ch2);
    // --------------------------------------------

    // --- SALVAR STATUS PARA POLLING DO FRONTEND ---
    $statusFile = __DIR__ . '/status/' . $transactionId . '.json';
    file_put_contents($statusFile, json_encode([
        'status' => 'waiting_payment',
        'updated_at' => date('Y-m-d H:i:s')
    ]));
    // ----------------------------------------------

    echo json_encode([
        'success' => true,
        'data' => [
            'transactionID' => $transactionId,
            'amount' => $amount,
            'qr_code_base64' => $gatewayResp['paymentCodeBase64'] ?? '',
            'pix_code' => $gatewayResp['paymentCode'] ?? ''
        ]
    ]);

} catch (Exception $e) {
    while (ob_get_level()) { ob_end_clean(); }
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
