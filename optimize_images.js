const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/julia/Downloads/mariaalice (3)/site_limpo';

function optimizeFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const baseName = path.basename(filePath);
    
    // Counter to skip the first few images (like logos)
    let count = 0;
    
    // Replace <img tags
    content = content.replace(/<img\s+(?!loading=)/g, (match) => {
        count++;
        // Skip the logo (first image)
        if (count === 1) return match;
        
        // Skip main banner in campaign pages (usually second or third image)
        if (baseName !== 'index.html' && count === 2) return match;
        
        return match.replace('<img ', '<img loading="lazy" decoding="async" ');
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`Optimized ${baseName}`);
}

const files = fs.readdirSync(dir);
files.forEach(file => {
    if (file.endsWith('.html')) {
        optimizeFile(path.join(dir, file));
    }
});
