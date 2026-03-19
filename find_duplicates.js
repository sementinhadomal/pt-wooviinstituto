const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\julia\\Downloads\\mariaalice (3)';
const searchString = 'Outras histórias também precisam de você!';

function findDuplicates(dir) {
    const files = fs.readdirSync(dir);
    let affectedFiles = [];

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory() && (file === 'site_limpo' || file === 'root')) {
             // We can recurse if needed, but let's focus on known directories
             affectedFiles = affectedFiles.concat(findDuplicates(fullPath));
        } else if (stats.isFile() && file.endsWith('.html')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const matches = content.split(searchString).length - 1;
            if (matches > 1) {
                affectedFiles.push({ path: fullPath, count: matches });
            }
        }
    }
    return affectedFiles;
}

// Check root and site_limpo
const rootFiles = findDuplicates(baseDir);
const siteLimpoFiles = findDuplicates(path.join(baseDir, 'site_limpo'));

const allAffected = rootFiles.concat(siteLimpoFiles);

console.log('Affected Files:', allAffected.length);
allAffected.forEach(f => console.log(`${f.count} matches: ${f.path}`));
