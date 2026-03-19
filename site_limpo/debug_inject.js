const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const file = 'campanha-124.html';
const html = fs.readFileSync(file, 'utf8');
const $ = cheerio.load(html);

console.log("Title:", $('title').text());
console.log("CustomVideo SRC:", $('#customVideo').attr('src'));
console.log("Img Object-Cover SRC:", $('img.object-cover').first().attr('src'));
