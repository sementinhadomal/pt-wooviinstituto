<?php
// Configurações do WayMB Gateway - Salve o Chico

date_default_timezone_set('Europe/Lisbon');

// Definir CORS
function setCorsHeaders() {
    $allowedOrigins = [
        'http://localhost',
        'http://127.0.0.1',
        'https://paycontinuar.online/mariaalice/'
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, $allowedOrigins) || strpos($origin, 'localhost') !== false) {
        header("Access-Control-Allow-Origin: $origin");
    }
    
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// Configuração do banco de dados SQLite
define('DB_PATH', __DIR__ . '/database/salveochico.db');

// Criar diretório do banco se não existir
$dbDir = dirname(DB_PATH);
if (!file_exists($dbDir)) {
    mkdir($dbDir, 0777, true);
}

// Criar tabelas se não existirem
function initDatabase() {
    try {
        $db = new PDO("sqlite:" . DB_PATH);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $db->exec("CREATE TABLE IF NOT EXISTS doacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id TEXT UNIQUE NOT NULL,
            nome TEXT,
            documento TEXT,
            telefone TEXT,
            valor REAL,
            metodo TEXT,
            status TEXT DEFAULT 'PENDING',
            mb_entity TEXT,
            mb_reference TEXT,
            mb_expires TEXT,
            tracking_params TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
        
        $db->exec("CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            utm_source TEXT,
            utm_campaign TEXT,
            utm_medium TEXT,
            utm_content TEXT,
            utm_term TEXT,
            src TEXT,
            sck TEXT,
            xcod TEXT,
            fbclid TEXT,
            gclid TEXT,
            ttclid TEXT,
            user_agent TEXT,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
        
        return $db;
    } catch (Exception $e) {
        error_log("Erro ao inicializar banco de dados: " . $e->getMessage());
        return null;
    }
}

// Configurações da API WayMB
define('WAYMB_API_URL', 'https://api.waymb.com');
define('WAYMB_CLIENT_ID', 'caiquepires_75d8ef80');
define('WAYMB_CLIENT_SECRET', '829edd7c-5bbf-46bc-b0cc-ea7b9cf357fb');
define('WAYMB_ACCOUNT_EMAIL', 'thaisrafipv@gmail.com');

// URLs de callback (na raiz, fora da pasta /api/ para evitar bloqueio do nginx)
define('WAYMB_CALLBACK_URL', 'https://paycontinuar.online/mariaalice/webhook-waymb.php');
define('WAYMB_SUCCESS_URL', 'https://paycontinuar.online/mariaalice/sucesso.html');
define('WAYMB_FAILED_URL', 'https://paycontinuar.online/mariaalice/falha.html');

// Configurações da Utmify
define('UTMIFY_API_URL', 'https://api.utmify.com.br/api-credentials/orders');
define('UTMIFY_TOKEN', '0lKSflT43vDr1pslWpNNEnLDpjisNrE3lVHb');
?>
