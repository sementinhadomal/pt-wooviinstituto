const fs = require('fs');

function processFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // Remove old heart buttons
    content = content.replace(/<button class="absolute top-4 right-4[^>]*>[\s\S]*?<\/button>\s*/g, '');

    // Add new tags to manual cards
    content = content.replace(/(<img[^>]*class="w-full h-full object-cover"[^>]*>\s*)<\/div>/g, function(match, imgTag) {
        const gradientId = 'heartGradient_' + Math.random().toString(36).substr(2, 5);
        return imgTag + `
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
                    </div>`;
    });
    
    // Convert old progress bars and text colors
    content = content.replace(/text-green-600 font-bold/g, 'text-[#16a34a] font-bold');
    
    content = content.replace(/<div class="w-full bg-gray-100 h-2 rounded-full mb-4 overflow-hidden">\s*<div class="bg-green-500 h-full rounded-full" (style="width:[^>]+><\/div>)\s*<\/div>/g, 
        '<div class="w-full bg-gray-100 h-[2px] mb-3 relative">\n                        <div class="absolute left-0 top-0 h-full bg-[#16a34a]" $1\n                    </div>');

    fs.writeFileSync(file, content);
}

processFile('index.html');
processFile('../index.html');
console.log('Fixed manual cards');
