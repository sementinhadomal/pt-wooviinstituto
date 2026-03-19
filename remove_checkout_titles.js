const fs = require('fs');
const path = require('path');

const directory = 'c:\\Users\\julia\\Downloads\\mariaalice_euro';

const files = fs.readdirSync(directory).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(directory, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Hide modal title (WayMB version)
    // <h2 id="modal-campaign-title" class="text-lg font-black text-[#1e293b] leading-tight mb-2">...</h2>
    const modalTitleRegex = /(<h2\s+id="modal-campaign-title"\s+class=")(text-lg font-black text-\[#1e293b\] leading-tight mb-2)(">.*?<\/h2>)/g;
    if (modalTitleRegex.test(content)) {
        content = content.replace(modalTitleRegex, '$1hidden $2$3');
        // Clear contents to be sure
        content = content.replace(/(<h2\s+id="modal-campaign-title"[^>]*>).*?<\/h2>/g, '$1</h2>');
        changed = true;
    }

    // 2. Disable JS title insertion
    const jsTitleLine = /if\s*\(mTitle\)\s*mTitle\.innerText\s*=\s*data\.title;/g;
    if (jsTitleLine.test(content)) {
        content = content.replace(jsTitleLine, '// if (mTitle) mTitle.innerText = data.title;');
        changed = true;
    }

    // 3. Hide sidebar title (PIX version like temp_camp124.html)
    // <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">...</h1>
    // Only if inside section-donation or col-right
    if (file === 'temp_camp124.html' || file.startsWith('campanha-')) {
        const sidebarTitleRegex = /(<div id="section-donation"[^>]*>[\s\S]*?)<h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">.*?<\/h1>/g;
        if (sidebarTitleRegex.test(content)) {
            content = content.replace(sidebarTitleRegex, '$1<h1 class="hidden text-3xl md:text-4xl font-bold text-gray-900 mb-4"></h1>');
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
