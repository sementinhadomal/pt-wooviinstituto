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
define('WAYMB_CLIENT_ID', 'Jlengenha3_b907f7dc');
define('WAYMB_CLIENT_SECRET', '453669b7-a420-44de-9799-be8ad1b97f80');
define('WAYMB_ACCOUNT_EMAIL', 'thaisrafipv@gmail.com');

// Detecção dinâmica de URL base
$protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? "https" : "http";
$host = $_SERVER['HTTP_HOST'] ?? 'wooviinstituto.vercel.app';
$baseUrl = $protocol . "://" . $host;

// URLs de callback (na raiz do site)
define('WAYMB_CALLBACK_URL', $baseUrl . '/webhook-waymb.php');
define('WAYMB_SUCCESS_URL', $baseUrl . '/sucesso.html');
define('WAYMB_FAILED_URL', $baseUrl . '/falha.html');

// Configurações da Utmify
define('UTMIFY_API_URL', 'https://api.utmify.com.br/api-credentials/orders');
define('UTMIFY_TOKEN', '0lKSflT43vDr1pslWpNNEnLDpjisNrE3lVHb');
?>
