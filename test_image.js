const fs = require('fs');
const cheerio = require('cheerio');

async function fetchHtml(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.text();
}

async function testExtraction() {
    const html = await fetchHtml('https://institutomaosqueacolhem.com/campanha?id=124');
    const $ = cheerio.load(html);
    
    let img = $('img').filter((i, el) => {
        const classAttr = $(el).attr('class') || '';
        return classAttr.includes('w-full') && classAttr.includes('object-cover');
    }).first().attr('src');
    
    if (!img) {
        img = $('img[alt="Imagem da campanha"]').first().attr('src');
    }
    console.log("Extracted Cover Image:", img);
}

testExtraction();
