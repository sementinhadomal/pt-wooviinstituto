const https = require('https');

https.get('https://institutomaosqueacolhem.com/', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        // Find all links to campaigns
        const regex = /href="([^"]*\/vaquinha\/[^"]+)"/g;
        let match;
        const links = new Set();
        while ((match = regex.exec(data)) !== null) {
            links.add(match[1]);
        }
        console.log("Campaign links found on homepage:");
        links.forEach(l => console.log(l));
        
        // Also find other pages
        const pageRegex = /href="([^"]*)"/g;
        const allLinks = new Set();
        while ((match = pageRegex.exec(data)) !== null) {
            allLinks.add(match[1]);
        }
        console.log("\nOther relevant links:");
        allLinks.forEach(l => {
            if(!l.includes('vaquinha') && l.startsWith('https://institutomaosqueacolhem.com/')) {
                console.log(l);
            }
        });
    });
}).on('error', (e) => {
    console.error(e);
});
