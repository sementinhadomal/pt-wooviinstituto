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
            const target = 'https://www.institutomaosqueacolhem.com.br/vaquinhas';
            const replacement = 'https://www.institutomaosqueacolhem.com.br/vaquinhas';
            
            // Also fix the root domain references just in case
            const target2 = 'https://www.institutomaosqueacolhem.com.br';
            const replacement2 = 'https://www.institutomaosqueacolhem.com.br';
            
            if (content.includes(target) || content.includes(target2)) {
                content = content.replace(new RegExp(target, 'g'), replacement);
                
                // Only replace target2 if it's not already www (target2 replacement might create www.www if we aren't careful, so let's use a regex)
                content = content.replace(/https:\/\/institutomaosqueacolhem\.com\.br(?![\w])/g, replacement2);
                
                fs.writeFileSync(fullPath, content);
                console.log('Fixed URLs in', fullPath);
            }
        }
    });
}

processDirectory(__dirname);
console.log('All files processed for www addition.');
