<?php
// Configurações do AtivusHub Gateway
date_default_timezone_set('America/Sao_Paulo');

// Configurações da API AtivusHub
define('ATIVUSHUB_API_URL', 'https://api.ativushub.com.br/v1/gateway/api/');
define('ATIVUSHUB_API_KEY', 'ade87e3d1859b5e5af1cd87dddd4bcad8881fa415b23ee0cc78b50a771c33819'); 
define('ATIVUSHUB_ID_SELLER', 'mariaalice_checkout');

// URLs de callback
define('ATIVUSHUB_CALLBACK_URL', 'https://wooviinstituto.vercel.app/api/webhook-ativushub.php');

// Utmify (Optional)
define('UTMIFY_API_URL', 'https://api.utmify.com.br/api-credentials/orders');
define('UTMIFY_TOKEN', 'Ww0pFiTuRIC1AQcRt6PGmdgEO5jHlhVWcp4J');
