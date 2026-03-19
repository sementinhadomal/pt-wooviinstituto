const fs = require('fs');
const path = require('path');

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'site_limpo') {
                processDirectory(fullPath);
            }
        } else if (file.endsWith('.html') || file.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const target = 'https://ongmaosqueacolhem.com';
            const target2 = 'https://ongmaosqueacolhem.com';
            const replacement = 'https://ongmaosqueacolhem.com';
            
            let changed = false;
            if (content.includes(target)) {
                content = content.replace(new RegExp(target, 'g'), replacement);
                changed = true;
            }
            if (content.includes(target2)) {
                content = content.replace(new RegExp(target2, 'g'), replacement);
                changed = true;
            }
            
            if(changed) {
                fs.writeFileSync(fullPath, content);
                console.log('Swapped domain in', fullPath);
            }
        }
    });
}

processDirectory(__dirname);
console.log('All files processed for ongmaosqueacolhem.com addition.');
