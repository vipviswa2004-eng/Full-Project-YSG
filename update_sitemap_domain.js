const fs = require('fs');
const path = require('path');

const sitemapPath = path.join(__dirname, 'frontend/public/sitemap.xml');

try {
    let content = fs.readFileSync(sitemapPath, 'utf8');
    const updatedContent = content.replace(/signgalaxy\.com/g, 'ucgoc.com');
    fs.writeFileSync(sitemapPath, updatedContent, 'utf8');
    console.log('Successfully updated sitemap.xml');
} catch (err) {
    console.error('Error updating sitemap:', err);
}
