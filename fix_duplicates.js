const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\julia\\Downloads\\mariaalice (3)';
const searchString = 'Outras histórias também precisam de você!';
const sectionStart = '<!-- Other Campaigns Section -->';

const filesToFix = [path.join(baseDir, 'joao.html'),
    path.join(baseDir, 'miguel.html'),
    path.join(baseDir, 'site_limpo', 'joao.html'),
    path.join(baseDir, 'site_limpo', 'miguel.html')
];

filesToFix.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // We want to find the SECOND occurrence of the section
    // In these files, the block is defined by <!-- Other Campaigns Section -->
    const parts = content.split(sectionStart);
    
    if (parts.length > 2) {
        console.log(`Fixing duplicates in: ${filePath}`);
        
        // Keep everything up to the second occurrence
        // In miguel.html, the second instance has slightly different spacing or contents
        // Parts[0] = before 1st
        // Parts[1] = between 1st and 2nd
        // Parts[2] = after 2nd (including the content of the 2nd section before the NEXT <!-- ... -->)
        
        // Actually, a safer way might be to look for the title string
        const titleParts = content.split(searchString);
        if (titleParts.length > 2) {
            // Find the index of the second occurrence of searchString
            const firstIndex = content.indexOf(searchString);
            const secondIndex = content.indexOf(searchString, firstIndex + searchString.length);
            
            // Now find the start of the section containing this second occurrence
            // It's likely the <!-- Other Campaigns Section --> just before it
            const sectionStartIndex = content.lastIndexOf(sectionStart, secondIndex);
            
            // Find where this section ends. Usually it ends before the next major section or </div>
            // In the files viewed, it seems to end with a </div><!-- Reactions Section --> or similar
            // Let's find the closing tag for the flex container or similar.
            // Actually, let's just remove from the second sectionStart to the next <!-- slide --> or footer
            
            let nextSectionIndex = content.indexOf('<!--', sectionStartIndex + sectionStart.length);
            if (nextSectionIndex === -1) nextSectionIndex = content.length;
            
            const newContent = content.substring(0, sectionStartIndex) + content.substring(nextSectionIndex);
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Successfully removed duplicate section in ${filePath}`);
        }
    } else {
        console.log(`No duplicate section found in: ${filePath}`);
    }
});
