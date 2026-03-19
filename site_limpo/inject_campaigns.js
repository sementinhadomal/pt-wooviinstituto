const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

function run() {
    const dir = __dirname;
    const files = fs.readdirSync(dir).filter(f => f.startsWith('campanha-') && f.endsWith('.html'));
    
    console.log(`Found ${files.length} campaigns to inject.`);
    
    let generatedCards = '';
    
    files.forEach(file => {
        try {
            const html = fs.readFileSync(path.join(dir, file), 'utf8');
            const $ = cheerio.load(html);
            
            const title = $('title').text().replace('Woovi Instituto | ', '').trim();
            // IMPORTANT: Get image from the FIXED #customVideo ID
            let coverImg = $('#customVideo').attr('src') || $('img.object-cover').first().attr('src') || '';
            
            let raisedStr = $('#value-raised-desktop').text().replace('€', '').trim();
            let goalStr = $('#value-goal-desktop').text().replace('meta', '').replace('€', '').trim();
            
            let rVal = parseFloat(raisedStr.replace(/\./g, '').replace(',', '.')) || 0;
            let gVal = parseFloat(goalStr.replace(/\./g, '').replace(',', '.')) || 1;
            
            let percent = Math.min(100, Math.round((rVal / gVal) * 100));
            if (isNaN(percent)) percent = 0;
            
            if (title.includes('Moved Permanently')) return;
            if (!coverImg || coverImg === '') coverImg = 'images/logo-woovi.png';
            
            const gradientId = `heartGradient_${Math.random().toString(36).substr(2, 9)}`;
            const cardHtml = `
            <div class="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition">
                <a href="${file}" class="block">
                    <div class="relative h-48">
                        <img src="${coverImg}" alt="${title}" class="w-full h-full object-cover">
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
                    </div>
                </a>
                <div class="p-6">
                    <h3 class="text-lg font-bold text-gray-900 mb-2 leading-tight">
                        <a href="${file}" class="hover:text-green-600">${title}</a>
                    </h3>
                    <div class="flex items-center text-sm mb-4">
                        <span class="text-[#16a34a] font-bold">€ ${raisedStr}</span>
                        <span class="text-gray-400 mx-2">de</span>
                        <span class="text-gray-500 italic">€ ${goalStr}</span>
                    </div>
                    <div class="w-full bg-gray-100 h-[2px] mb-3 relative">
                        <div class="absolute left-0 top-0 h-full bg-[#16a34a]" style="width: ${percent}%"></div>
                    </div>
                </div>
            </div>`;
            
            generatedCards += cardHtml;
        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    });
    
    // Clean injection into index.html
    let indexHtml = fs.readFileSync('index.html', 'utf8');
    const $index = cheerio.load(indexHtml, { decodeEntities: false });
    
    // Remove ALL previous "Todas as Campanhas" sections
    $index('div.mt-20').each((i, el) => {
        if ($index(el).find('h2').text().includes('Todas as Campanhas')) {
            $index(el).remove();
        }
    });

    // Create the new clean section
    const newSectionHtml = `
    <div class="mt-20 pb-20" id="all-campaigns-section">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Todas as Campanhas</h2>
        <p class="text-gray-500 mb-8">Conheça todas as histórias e ajude quem precisa.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${generatedCards}
        </div>
    </div>`;
    
    // Append it before footer or at the end of main
    const main = $index('main');
    if (main.length) {
        main.append(newSectionHtml);
        fs.writeFileSync('index.html', $index.html());
        console.log('Successfully cleaned and injected all campaigns into index.html');
    } else {
        console.error('Could not find <main> in index.html');
    }
}

run();
