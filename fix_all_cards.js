const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const WOVI_TAG = `
                        <div class="absolute bottom-2 left-2 bg-[#16a34a] text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                            <span class="text-xs">🐢</span> Woovi Instituto
                        </div>`;

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content, { decodeEntities: false });
    let modified = false;

    // Fix relative image containers (h-44 or h-48)
    $('div.relative').each(function() {
        const div = $(this);
        const hasImg = div.find('img').length > 0;
        const hasWoovi = div.html().includes('Woovi Instituto');
        
        // Target containers that look like campaign cards
        const isCardImg = div.hasClass('h-44') || div.hasClass('h-48') || div.parent().hasClass('flex-shrink-0');

        if (hasImg && isCardImg && !hasWoovi) {
            div.append(WOVI_TAG);
            
            // Also ensure it has the purple heart if it's a card
            if (!div.html().includes('heartGradient')) {
                const gradientId = 'heartGradient_' + Math.random().toString(36).substr(2, 5);
                div.append(`
                        <div class="absolute top-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#${gradientId})"/>
                                <defs>
                                    <linearGradient id="${gradientId}" x1="2" y1="3" x2="22" y2="21.35" gradientUnits="userSpaceOnUse">
                                        <stop stop-color="#E9D5FF"/>
                                        <stop offset="1" stop-color="#A855F7"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>`);
            }
            modified = true;
        }
    });

    // Fix progress bars and text colors if not already green
    if (content.includes('bg-green-500') || content.includes('text-green-600')) {
        $('.bg-green-500').removeClass('bg-green-500').addClass('bg-[#16a34a]');
        $('.text-green-600').removeClass('text-green-600').addClass('text-[#16a34a]');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, $.html());
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
            if (file !== 'node_modules') walkDir(filePath);
        } else if (file.endsWith('.html')) {
            if (fixFile(filePath)) {
                console.log(`Fixed: ${filePath}`);
            }
        }
    });
}

const targetDir = path.resolve(__dirname, '..');
console.log(`Starting fix in: ${targetDir}`);
walkDir(targetDir);
console.log('Fix complete!');
