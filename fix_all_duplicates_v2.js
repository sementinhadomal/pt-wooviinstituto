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
    
    // Check for anchor duplication
    const parts = content.split(anchorText);
    if (parts.length > 2) {
        console.log(`[FOUND DUP] Fixing duplication in: ${filePath}`);
        
        const firstIndex = content.indexOf(anchorText);
        const secondIndex = content.indexOf(anchorText, firstIndex + anchorText.length);
        
        // Find the start of the section for the second occurrence
        // It's likely the <!-- Card 1 ... --> or a div starting a bit before.
        // Let's look for the start of the carousel or the section title.
        
        let sectionStart = content.lastIndexOf('<!-- Other Campaigns Section -->', secondIndex);
        if (sectionStart === -1 || sectionStart < firstIndex) {
            sectionStart = content.lastIndexOf('Outras histórias também precisam de você!', secondIndex);
        }
        if (sectionStart === -1 || sectionStart < firstIndex) {
            // If neither, look for the start of the div container
            sectionStart = content.lastIndexOf('<div class="mt-8 mb-4 px-2">', secondIndex);
        }
        if (sectionStart === -1 || sectionStart < firstIndex) {
            // Fallback: look for the card marker itself
            sectionStart = content.lastIndexOf('<!-- Card 1', secondIndex);
        }

        if (sectionStart === -1 || sectionStart < firstIndex) {
            console.log(`  Skipping ${filePath}: could not find a safe start for the second section.`);
            return;
        }

        // Find where this second block ends.
        let sectionEnd = content.indexOf('<!-- Reactions Section -->', secondIndex);
        if (sectionEnd === -1) sectionEnd = content.indexOf('<!-- Donations Section -->', secondIndex);
        if (sectionEnd === -1) sectionEnd = content.indexOf('<!-- style -->', secondIndex);
        if (sectionEnd === -1) sectionEnd = content.indexOf('<style>', secondIndex);
        if (sectionEnd === -1) sectionEnd = content.indexOf('<!-- Campaign information -->', secondIndex);
        
        if (sectionEnd !== -1 && sectionEnd > sectionStart) {
            const newContent = content.substring(0, sectionStart) + content.substring(sectionEnd);
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`  Successfully Fixed ${filePath}`);
        } else {
            console.log(`  Skipping ${filePath}: could not find a safe end for the second section.`);
        }
    }
}

console.log("Starting deep scan for duplicates using anchor...");
scanDirectory(baseDir);
console.log("Scan complete.");
