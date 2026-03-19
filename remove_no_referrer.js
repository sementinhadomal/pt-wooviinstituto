const fs = require('fs');
const path = require('path');

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // we probably only need to do root, but let's do all except node_modules
            if (file !== 'node_modules' && file !== '.git' && file !== 'site_limpo') {
                processDirectory(fullPath);
            }
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const target = '    <meta name="referrer" content="no-referrer">\n';
            const target2 = '<meta name="referrer" content="no-referrer">\n';
            const target3 = '<meta name="referrer" content="no-referrer">';
            
            if (content.includes(target)) {
                content = content.replace(new RegExp(target, 'g'), '');
                fs.writeFileSync(fullPath, content);
                console.log('Fixed', fullPath);
            } else if (content.includes(target2)) {
                content = content.replace(new RegExp(target2, 'g'), '');
                fs.writeFileSync(fullPath, content);
                console.log('Fixed', fullPath);
            } else if (content.includes(target3)) {
                content = content.replace(new RegExp(target3, 'g'), '');
                fs.writeFileSync(fullPath, content);
                console.log('Fixed', fullPath);
            }
        }
    });
}

processDirectory(__dirname);
console.log('All files processed.');
