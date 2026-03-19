const fs = require('fs');
const cheerio = require('cheerio');

function fixCards(file) {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(html, { decodeEntities: false });

    // Target the specific cards in the "Mais amadas" and "Em destaque" sections before the "Todas as Campanhas" section
    // We can select them by grabbing all 'div.relative.h-48' that DON'T have a '.bg-[#16a34a]' tag yet.
    
    // First, let's remove existing heart buttons everywhere in these sections
    $('button.absolute.top-4.right-4').remove();

    $('div.relative.h-48').each(function() {
        // If this card already has the Woovi tag, skip it
        if ($(this).html().includes('Woovi Instituto')) return;
        
        const gradientId = 'heartGradient_' + Math.random().toString(36).substr(2, 5);
        
        // Append the heart and the tag
        $(this).append(`
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
                        </div>
                        <div class="absolute bottom-2 left-2 bg-[#16a34a] text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                            <span class="text-xs">🐢</span> Woovi Instituto
                        </div>
        `);
    });

    // Replace thick progress bars with thin green ones
    $('.w-full.bg-gray-100.h-2.rounded-full.mb-4.overflow-hidden').each(function() {
        const innerDiv = $(this).find('.bg-green-500');
        if (innerDiv.length > 0) {
            const width = innerDiv.attr('style'); // e.g., 'width: 58%'
            $(this).replaceWith(`
                <div class="w-full bg-gray-100 h-[2px] mb-3 relative">
                    <div class="absolute left-0 top-0 h-full bg-[#16a34a]" style="${width}"></div>
                </div>
            `);
        }
    });

    // Replace text colors
    $('.text-green-600.font-bold').removeClass('text-green-600').addClass('text-[#16a34a]');

    fs.writeFileSync(file, $.html());
}

fixCards('index.html');
fixCards('../index.html');
console.log('Cheerio fixing done!');
