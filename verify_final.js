const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\julia\\Downloads\\mariaalice (3)';
const anchorText = 'Ajude o Bernardo a vencer essa luta';

function scanDirectory(dir) {
    let affectedCount = 0;
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                affectedCount += scanDirectory(filePath);
            }
        } else if (file.endsWith('.html')) {
            const content = fs.readFileSync(filePath, 'utf8');
            const occurrences = content.split(anchorText).length - 1;
            if (occurrences > 1) {
                console.log(`Still Duplicated: ${filePath} (${occurrences} times)`);
                affectedCount++;
            }
        }
    });
    return affectedCount;
}

console.log("Final check for card duplication...");
const count = scanDirectory(baseDir);
console.log(`Total duplicated files remaining: ${count}`);
