const fs = require('fs');
const path = require('path');

const directories = [
    '../frontend/public/occasions',
    '../frontend/public/categories'
];

function cleanup(dir) {
    const fullDir = path.resolve(__dirname, dir);
    if (!fs.existsSync(fullDir)) return;
    const files = fs.readdirSync(fullDir);
    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
            const webpFile = path.join(fullDir, path.basename(file, ext) + '.webp');
            if (fs.existsSync(webpFile)) {
                console.log(`Deleting original file: ${file}`);
                fs.unlinkSync(path.join(fullDir, file));
            }
        }
    }
}

directories.forEach(cleanup);
