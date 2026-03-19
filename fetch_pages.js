const fs = require('fs');
const https = require('https');

function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function processPage(html) {
    let result = html;
    
    // Replace names
    result = result.replace(/Projeto Mãos Que Acolhem/gi, "Woovi Instituto");
    result = result.replace(/Instituto Mãos Que Acolhem/gi, "Woovi Instituto");
    result = result.replace(/Instituto Mãos do Bem/gi, "Woovi Instituto");
    result = result.replace(/Esperança Do Bem/gi, "Woovi Instituto");
    
    // Replace logo
    result = result.replace(/https:\/\/institutomaosqueacolhem\.com\/logo-maos3\.png/g, "images/logo-woovi.png");
    
    // Add our css if necessary? It should use its own inline css that comes with the page.
    
    return result;
}

async function run() {
    try {
        console.log("Fetching /sobre...");
        let sobreHtml = await fetchHtml('https://institutomaosqueacolhem.com/sobre');
        sobreHtml = processPage(sobreHtml);
        fs.writeFileSync('sobre.html', sobreHtml);
        
        console.log("Fetching /criar...");
        let criarHtml = await fetchHtml('https://institutomaosqueacolhem.com/criar');
        criarHtml = processPage(criarHtml);
        fs.writeFileSync('criar.html', criarHtml);
        
        console.log("Pages saved!");
    } catch(e) {
        console.error(e);
    }
}
run();
