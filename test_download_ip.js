const https = require('https');
const fs = require('fs');

const options = {
    hostname: '212.85.6.244',
    port: 443,
    path: '/vaquinhas/131/vaquinha_131_1768353395.png',
    method: 'GET',
    headers: {
        'Host': 'institutomaosqueacolhem.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    rejectUnauthorized: false // Ignore SSL cert mismatches since we're using IP
};

console.log('Attempting to download via IP + Host header...');

const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    if (res.statusCode === 200 && res.headers['content-type'].includes('image')) {
        const fileStream = fs.createWriteStream('test_download.png');
        res.pipe(fileStream);
        fileStream.on('finish', () => {
            fileStream.close();
            console.log('Download SUCCESS!');
        });
    } else {
        console.log('Failed to download image. Status or Content-Type mismatch.');
    }
});

req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
});

req.end();
