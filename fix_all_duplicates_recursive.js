const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\julia\\Downloads\\mariaalice (3)';
const anchorText = 'Ajude o Bernardo a vencer essa luta';

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                scanDirectory(filePath);
            }
        } else if (file.endsWith('.html')) {
            processFile(filePath);
        }
    });
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check for anchor duplication and process until only 1 remains
    while (content.split(anchorText).length > 2) {
        console.log(`[LOOP DUP] Fixing one instance of duplication in: ${filePath}`);
        
        const firstIndex = content.indexOf(anchorText);
        const secondIndex = content.indexOf(anchorText, firstIndex + anchorText.length);
        
        let sectionStart = content.lastIndexOf('<!-- Other Campaigns Section -->', secondIndex);
        if (sectionStart === -1 || sectionStart < firstIndex) {
            sectionStart = content.lastIndexOf('Outras histórias também precisam de você!', secondIndex);
        }
        if (sectionStart === -1 || sectionStart < firstIndex) {
            sectionStart = content.lastIndexOf('<div class="mt-8 mb-4 px-2">', secondIndex);
        }
        if (sectionStart === -1 || sectionStart < firstIndex) {
            sectionStart = content.lastIndexOf('<!-- Card 1', secondIndex);
        }
        if (sectionStart === -1 || sectionStart < firstIndex) {
            // Fallback for index.html type grids
            // Look for the start of the card div. Usually it's something like <div class="bg-white rounded-2xl
            sectionStart = content.lastIndexOf('<div class="bg-white rounded-2xl', secondIndex);
        }

        if (sectionStart === -1 || sectionStart < firstIndex) {
            console.log(`  Skipping ${filePath}: could not find a safe start.`);
            break; 
        }

        let sectionEnd = content.indexOf('<!-- Reactions Section -->', secondIndex);
        if (sectionEnd === -1) sectionEnd = content.indexOf('<!-- Donations Section -->', secondIndex);
        if (sectionEnd === -1) sectionEnd = content.indexOf('<!-- style -->', secondIndex);
        if (sectionEnd === -1) sectionEnd = content.indexOf('<style>', secondIndex);
        if (sectionEnd === -1) sectionEnd = content.indexOf('<!-- Campaign information -->', secondIndex);
        if (sectionEnd === -1) {
            // Fallback for grids: look for the end of the div. 
            // This is trickier. Let's look for the NEXT card start or the end of the grid.
            sectionEnd = content.indexOf('<div class="bg-white rounded-2xl', secondIndex + anchorText.length);
            if (sectionEnd === -1) sectionEnd = content.indexOf('</main>', secondIndex);
        }
        
        if (sectionEnd !== -1 && sectionEnd > sectionStart) {
            content = content.substring(0, sectionStart) + content.substring(sectionEnd);
            modified = true;
        } else {
            console.log(`  Skipping ${filePath}: could not find a safe end.`);
            break;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  Finalized Fix for ${filePath}`);
    }
}

console.log("Starting deep recursive scan for duplicates...");
scanDirectory(baseDir);
console.log("Scan complete.");
