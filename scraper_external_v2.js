const cheerio = require('cheerio');

async function scrapeHome() {
    try {
        const response = await fetch('https://institutomaosqueacolhem.com/');
        const html = await response.text();
        const $ = cheerio.load(html);

        console.log("All Links found:");
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href) {
                console.log(href);
            }
        });

    } catch(e) {
        console.error("Error fetching homepage:", e);
    }
}

scrapeHome();
