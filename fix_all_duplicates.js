const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\julia\\Downloads\\mariaalice (3)';
const markers = ['<!-- Other Campaigns Section -->',
    '<!-- Card 1 - bernardo -->',
    '<!-- Card 1 - Bernardo -->',
    'Outras histórias também precisam de você!'
];

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
    let hasDuplicate = false;
    let modified = false;

    // 1. Fix double "Other Campaigns Section" title
    const sectionMarker = '<!-- Other Campaigns Section -->';
    const sectionParts = content.split(sectionMarker);
    if (sectionParts.length > 2) {
        console.log(`[TITLE DUP] Fixing title duplication in: ${filePath}`);
        // Keep everything up to the second occurrence, but we need to be careful.
        // Usually, the second occurrence starts the whole block again.
        const firstIndex = content.indexOf(sectionMarker);
        const secondIndex = content.indexOf(sectionMarker, firstIndex + 1);
        
        // Remove from secondIndex to the next major section or EOF if it's the very end
        // But better: just remove the block starting at secondIndex
        // In most cases, these blocks are identical.
        
        // Let's find where the first block ends.
        // It ends at line 1254 in joao.html which is followed by a style tag or similar.
    }

    // 2. Fix double card blocks (more common)
    const cardMarker = '<!-- Card 1 - bernardo -->';
    const cardMarkerAlt = '<!-- Card 1 - Bernardo -->';
    
    let markerToUse = content.includes(cardMarker) ? cardMarker : (content.includes(cardMarkerAlt) ? cardMarkerAlt : null);
    
    if (markerToUse) {
        const parts = content.split(markerToUse);
        if (parts.length > 2) {
            console.log(`[CARD DUP] Fixing card duplication in: ${filePath} (${parts.length - 1} instances found)`);
            
            // Logic: Keep everything before the second occurrence of markerToUse.
            // But what if there's content AFTER the second block that we need?
            // Usually, the cards are at the end of the campaign div, before Reactions or Footer.
            
            const firstIndex = content.indexOf(markerToUse);
            const secondIndex = content.indexOf(markerToUse, firstIndex + markerToUse.length);
            
            // We want to remove the block that contains the second occurrence.
            // The block usually starts with a <div class="mt-8 mb-4 px-2"> or just the marker.
            
            // Let's find the start of the section containing the second marker.
            // Look for <!-- Other Campaigns Section --> or a div start
            let sectionStart = content.lastIndexOf('<!-- Other Campaigns Section -->', secondIndex);
            if (sectionStart === -1 || sectionStart < firstIndex) {
                // If no section comment, look for the div that starts the carousel
                sectionStart = content.lastIndexOf('<div class="mt-8 mb-4 px-2">', secondIndex);
            }
            if (sectionStart === -1 || sectionStart < firstIndex) {
                // Fallback to just before the marker
                sectionStart = secondIndex - 20; // safe enough?
            }

            // Find where this second block ends. 
            // Usually it ends with a </div> followed by <!-- Reactions Section --> or <!-- Donations Section --> or <!-- style -->
            let sectionEnd = content.indexOf('<!-- Reactions Section -->', secondIndex);
            if (sectionEnd === -1) sectionEnd = content.indexOf('<!-- Donations Section -->', secondIndex);
            if (sectionEnd === -1) sectionEnd = content.indexOf('<!-- style -->', secondIndex);
            if (sectionEnd === -1) sectionEnd = content.indexOf('<style>', secondIndex);
            if (sectionEnd === -1) sectionEnd = content.indexOf('<!-- Campaign information -->', secondIndex);
            
            if (sectionEnd !== -1 && sectionEnd > sectionStart) {
                const newContent = content.substring(0, sectionStart) + content.substring(sectionEnd);
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`Successfully Fixed ${filePath}`);
            } else {
                console.log(`Could not find end of section for ${filePath}. Skipping safety first.`);
            }
        }
    }
}

console.log("Starting deep scan for duplicates...");
scanDirectory(baseDir);
console.log("Scan complete.");
