const fs = require('fs');
const path = require('path');

function updateCacheBuster(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Define the timestamp parameter
    const ts = new Date().getTime();

    // Regex to match protect.js with optional existing query params
    const protectRegex = /src="([^"]*?protect\.js)(\?[^"]*)?"/g;
    if (protectRegex.test(content)) {
        content = content.replace(protectRegex, `src="$1?v=${ts}"`);
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated cache buster in: ${filePath}`);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && file !== 'node_modules' && file !== '.git' && file !== '.vercel') {
            processDirectory(fullPath);
        } else if (stat.isFile() && file.endsWith('.html')) {
            updateCacheBuster(fullPath);
        }
    }
}

// Start in the current directory and the parent directory, but for safety let's just do CWD
const targetDir = __dirname;
console.log(`Scanning HTML files in ${targetDir} for protect.js cache busting...`);
processDirectory(targetDir);
console.log('Done.');
