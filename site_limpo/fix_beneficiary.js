const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const oldString = 'Doação Solidária';
    const newString = 'Woovi instituição de pagamento ltda';
    
    if (content.includes(oldString)) {
        const newContent = content.split(oldString).join(newString);
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated: ${filePath}`);
        return true;
    }
    return false;
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.vercel') {
                walkDir(filePath);
            }
        } else if (file.endsWith('.html')) {
            replaceInFile(filePath);
        }
    });
}

const targetDir = path.resolve(__dirname, '..');
console.log(`Starting beneficiary name update in: ${targetDir}`);
walkDir(targetDir);
console.log('Update complete!');
