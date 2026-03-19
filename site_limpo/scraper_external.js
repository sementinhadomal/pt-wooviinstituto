const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeHome() {
    try {
        const response = await fetch('https://institutomaosqueacolhem.com/');
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const campaigns = new Set();
        const otherPages = new Set();

        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href) {
                if (href.includes('/vaquinhas/') || href.includes('/vaquinha/')) {
                    campaigns.add(href);
                } else if (href.startsWith('https://institutomaosqueacolhem.com/') && !href.includes('/vaquinhas/') && href !== 'https://institutomaosqueacolhem.com/') {
                    otherPages.add(href);
                }
            }
        });

        console.log("Found Campaigns:", Array.from(campaigns));
        console.log("Found Other Pages:", Array.from(otherPages));

    } catch(e) {
        console.error("Error fetching homepage:", e);
    }
}

scrapeHome();
