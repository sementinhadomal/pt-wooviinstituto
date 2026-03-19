const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const WOVI_TAG = `
                        <div class="absolute bottom-2 left-2 bg-[#16a34a] text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm z-50">
                            <span class="text-xs">🐢</span> Woovi Instituto
                        </div>`;

const BENEFICIARY_OLD = 'Doação Solidária';
const BENEFICIARY_NEW = 'Woovi instituição de pagamento ltda';

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Fix Beneficiary Name (simple string replace is safer for this)
    if (content.includes(BENEFICIARY_OLD)) {
        content = content.split(BENEFICIARY_OLD).join(BENEFICIARY_NEW);
        modified = true;
    }

    // 2. Fix Double Tags and styling using Cheerio
    const $ = cheerio.load(content, { decodeEntities: false });
    
    // Find all relative containers that might have the tag
    $('div.relative').each(function() {
        const div = $(this);
        const tags = div.find('div:contains("Woovi Instituto")');
        
        if (tags.length > 1) {
            // Keep only the first tag, remove others
            tags.slice(1).remove();
            modified = true;
        } else if (tags.length === 0) {
            // If it's a card and has no tag, add it
            const img = div.find('img');
            if (img.length > 0 && div.text().trim().length < 50) {
                div.append(WOVI_TAG);
                modified = true;
            }
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, $.html());
        console.log(`Final Polish applied: ${filePath}`);
    }
}

const rootDir = path.resolve(__dirname, '..');
const files = fs.readdirSync(rootDir);
files.forEach(file => {
    if (file.endsWith('.html')) {
        fixFile(path.join(rootDir, file));
    }
});
console.log('Final Polish complete.');
