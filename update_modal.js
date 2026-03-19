const fs = require('fs');
const path = require('path');

const rootPrincipal = 'c:\\Users\\julia\\Downloads\\mariaalice (3)\\principal.html';
const targetDirectory = 'c:\\Users\\julia\\Downloads\\mariaalice (3)\\site_limpo';

const principalContent = fs.readFileSync(rootPrincipal, 'utf8');

// Extrai o HTML do Modal Pix
const modalStartTag = '<!-- PIX Modal -->';
const modalEndTag = '<div id="notifications"';

const modalStart = principalContent.indexOf(modalStartTag);
const modalEnd = principalContent.indexOf(modalEndTag, modalStart);
if (modalStart === -1 || modalEnd === -1) {
    console.error(`ERRO: Não encontrou tags do Modal no principal.html (start: ${modalStart}, end: ${modalEnd})`);
    process.exit(1);
}
const newModalHtml = principalContent.substring(modalStart, modalEnd);

// Extrai o trecho do JS modificado
const jsStartTag = 'let selectedModalAmount =';
const jsEndTag = '// --- Init Event ---';

const jsStart = principalContent.indexOf(jsStartTag);
const jsEnd = principalContent.indexOf(jsEndTag, jsStart);
if (jsStart === -1 || jsEnd === -1) {
    console.error(`ERRO: Não encontrou tags do JS no principal.html (start: ${jsStart}, end: ${jsEnd})`);
    process.exit(1);
}
const newJsBlock = principalContent.substring(jsStart, jsEnd);

console.log(`Extraído Modal com ${newModalHtml.length} caracteres`);
console.log(`Extraído JS com ${newJsBlock.length} caracteres`);

const files = fs.readdirSync(targetDirectory);
let updatedCount = 0;

files.forEach(file => {
    if (file.endsWith('.html') && (file.startsWith('campanha-') || ['davi.html', 'julia.html', 'miguel.html', 'joao.html', 'principal.html'].includes(file))) {
        const filePath = path.join(targetDirectory, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 1. Substituir Modal HTML
        const fileModalStart = content.indexOf(modalStartTag);
        const fileModalEnd = content.indexOf(modalEndTag, fileModalStart);
        
        if (fileModalStart !== -1 && fileModalEnd !== -1) {
            const beforeModal = content.substring(0, fileModalStart);
            const afterModal = content.substring(fileModalEnd);
            content = beforeModal + newModalHtml + afterModal;
        } else {
            console.log(`Aviso: Tags do Modal não encontradas em ${file}`);
        }
        
        // 2. Substituir bloco JS
        const fileJsStart = content.indexOf(jsStartTag);
        const fileJsEnd = content.indexOf(jsEndTag, fileJsStart);
        
        if (fileJsStart !== -1 && fileJsEnd !== -1) {
            const beforeJs = content.substring(0, fileJsStart);
            const afterJs = content.substring(fileJsEnd);
            content = beforeJs + newJsBlock + afterJs;
            
            fs.writeFileSync(filePath, content);
            updatedCount++;
        } else {
            console.log(`Aviso: Tags do JS não encontradas em ${file}`);
        }
    }
});

console.log(`\nAtualização concluída em ${updatedCount} arquivos.`);
