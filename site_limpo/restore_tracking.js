const fs = require('fs');
const path = require('path');

const siteLimpoPath = 'c:/Users/julia/Downloads/mariaalice (3)/site_limpo';
const files = fs.readdirSync(siteLimpoPath).filter(f => f.endsWith('.html'));

const trackingScriptsHead1 = `    <script async="" src="js/fbevents.js"></script>
    <script src="js/latest.js" data-utmify-prevent-xcod-sck="" data-utmify-ignore-iframe="" data-utmify-prevent-subids="" async="" defer=""></script>
    <script src="https://cdn.tailwindcss.com/"></script>`;

const trackingScriptsHead2 = `    <script>
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=true;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '1574873043554006');
        fbq('track', 'PageView');
    </script>
    <noscript><img loading="lazy" decoding="async" height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1574873043554006&ev=PageView&noscript=1"></noscript>
    
    <script>
        window.pixelId = "697185be2058fdd08c7d7436";
        var a = document.createElement("script");
        a.setAttribute("async", "");
        a.setAttribute("defer", "");
        a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
        document.head.appendChild(a);
    </script>
    <script async="" defer="" src="js/pixel.js"></script>
</head>`;

files.forEach(file => {
    const filePath = path.join(siteLimpoPath, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Restore scripts in head
    if (content.includes('<script async="" src="js/fbevents.js"></script><script src="https://cdn.tailwindcss.com/"></script>')) {
        content = content.replace('<script async="" src="js/fbevents.js"></script><script src="https://cdn.tailwindcss.com/"></script>', trackingScriptsHead1);
    } else if (content.includes('<script async="" src="js/fbevents.js"></script> <script src="https://cdn.tailwindcss.com/"></script>')) {
        content = content.replace('<script async="" src="js/fbevents.js"></script> <script src="https://cdn.tailwindcss.com/"></script>', trackingScriptsHead1);
    }

    if (content.includes('</head>') && !content.includes('window.pixelId')) {
        content = content.replace('</head>', trackingScriptsHead2);
    }

    fs.writeFileSync(filePath, content);
});

console.log(`Atualizadas ${files.length} páginas.`);
