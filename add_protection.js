const fs = require('fs');
const path = require('path');

const rootPath = 'c:/Users/julia/Downloads/mariaalice (3)';
const siteLimpoPath = path.join(rootPath, 'site_limpo');

const protectScript = `    <script src="js/protect.js" defer></script>`;

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
    let count = 0;
    files.forEach(file => {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        // Avoid adding twice
        if (content.includes('protect.js')) return;
        // Inject before </head>
        if (content.includes('</head>')) {
            content = content.replace('</head>', protectScript + '\n</head>');
            fs.writeFileSync(filePath, content);
            count++;
        }
    });
    console.log(`Protect script adicionado em ${count} arquivos em ${dir}.`);
}

processDirectory(rootPath);
processDirectory(siteLimpoPath);
