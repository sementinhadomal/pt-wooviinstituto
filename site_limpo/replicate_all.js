const fs = require('fs');
const cheerio = require('cheerio');

async function fetchHtml(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.text();
}

function processExternalValues($) {
    // Look for h1 that contains text-3xl
    let title = $('h1').filter((i, el) => $(el).attr('class') && $(el).attr('class').includes('text-3xl')).first().text().trim();
    if (!title) {
        title = $('title').text().trim() || `Campanha`;
    }
    
    // Look for image
    const coverImage = $('img.w-full.object-cover').first().attr('src') || '';
    
    // Values
    const valueRaisedNode = $('h2.text-2xl.font-bold').first();
    let raisedText = valueRaisedNode.text().trim();
    let raised = "0,00";
    if (raisedText.includes("€")) {
        raised = raisedText.split("€")[1].trim().replace(/&nbsp;/g, '').replace(/\s/g,'');
    }
    
    const valueGoalNode = valueRaisedNode.next('p.text-gray-500');
    let goalText = valueGoalNode.text().trim() || "";
    let goal = "0,00";
    if (goalText.includes("€")) {
        goal = goalText.split("€")[1].trim().replace(/&nbsp;/g, '').replace(/\s/g,'');
    }
    
    const historyContainer = $('.prose.max-w-none').first().html();
    const storyContent = historyContainer ? historyContainer.trim() : '<p>História não encontrada.</p>';
    
    return { title, coverImage, raised, goal, storyContent };
}

async function scrapeAndGenerate() {
    console.log("Starting replication process...");
    
    const templateHtml = fs.readFileSync('joao.html', 'utf8');
    
    const homeHtml = await fetchHtml('https://institutomaosqueacolhem.com/');
    const $home = cheerio.load(homeHtml);
    const campaignIds = new Set();
    
    $home('a').each((i, el) => {
        const href = $home(el).attr('href');
        if (href && href.includes('campanha?id=')) {
            const id = href.split('id=')[1].split('&')[0];
            if(id) campaignIds.add(id);
        }
    });

    const idsArray = Array.from(campaignIds);
    console.log(`Found ${idsArray.length} campaigns to replicate.`);

    let generatedCount = 0;

    for (let i = 0; i < idsArray.length; i++) {
        const id = idsArray[i];
        const fileName = `campanha-${id}.html`;
        
        try {
            const campHtml = await fetchHtml(`https://institutomaosqueacolhem.com/campanha?id=${id}`);
            const $ext = cheerio.load(campHtml);
            
            const data = processExternalValues($ext);
            
            if (!data.title || data.title.includes('Instituto Mãos')) {
                const altTitle = $ext('h1').first().text().trim();
                if (altTitle) data.title = altTitle;
                else data.title = `Campanha ${id}`;
            }

            const $tpl = cheerio.load(templateHtml, { decodeEntities: false });
            
            $tpl('title').text(data.title);
            
            // Fix: The template uses <img id="customVideo"> for the main campaign image
            $tpl('#customVideo').attr('src', data.coverImage);
            
            $tpl('h1.text-2xl.font-bold').text(data.title);
            $tpl('h1.text-3xl.md\\:text-4xl').text(data.title);
            $tpl('h2.text-3xl.font-bold').text(data.title);
            
            $tpl('#campaign-title-desktop').text(data.title);
            
            $tpl('#value-raised-desktop').text(`€ ${data.raised}`);
            $tpl('#value-goal-desktop').text(`meta € ${data.goal}`);
            $tpl('#sticky-value-raised').text(`€ ${data.raised} arrecadados`);
            
            $tpl('#campaign-id-desktop').text(id);
            $tpl('#campaign-description').html(data.storyContent);
            
            let finalHtml = $tpl.html();
            finalHtml = finalHtml.replace(/id: "160"/g, `id: "${id}"`);
            finalHtml = finalHtml.replace(/valueRaised: "[^"]+"/g, `valueRaised: "${data.raised}"`);
            finalHtml = finalHtml.replace(/valueGoal: "[^"]+"/g, `valueGoal: "${data.goal}"`);
            finalHtml = finalHtml.replace(/title: "[^"]+"/g, `title: "${data.title}"`);
            
            // Clean up exact string matching replacing for Joao specific things
            // Just to be safe, replace Joao entirely if it's there
            // finalHtml = finalHtml.replace(/João/g, data.title.split(' ')[2] || 'Beneficiário'); // risky, let's omit.
            
            fs.writeFileSync(fileName, finalHtml);
            generatedCount++;
            
            if (generatedCount % 10 === 0) {
                console.log(`Generated ${generatedCount} files...`);
            }
            
        } catch(e) {
            console.error(`Failed to process ${id}:`, e);
        }
    }
    
    console.log(`Replication complete! Generated ${generatedCount} campaigns.`);
}

scrapeAndGenerate();
