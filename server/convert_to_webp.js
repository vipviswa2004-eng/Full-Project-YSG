const fs = require('fs');
const path = require('path');
const sharp = require('../tmp_sharp/node_modules/sharp');

const directories = [
    '../frontend/public/occasions',
    '../frontend/public/categories',
    '../frontend/public'
];

async function convert(dir) {
    const fullDir = path.resolve(__dirname, dir);
    if (!fs.existsSync(fullDir)) return;
    const files = fs.readdirSync(fullDir);
    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
            const inputPath = path.join(fullDir, file);
            const outputPath = path.join(fullDir, path.basename(file, ext) + '.webp');
            console.log(`Converting ${file} to WebP...`);
            try {
                await sharp(inputPath)
                    .webp({ quality: 80 })
                    .toFile(outputPath);
                // fs.unlinkSync(inputPath); // I'll do this after checking or in a separate step
            } catch (err) {
                console.error(`Failed to convert ${file}:`, err.message);
            }
        }
    }
}

async function run() {
    for (const dir of directories) {
        await convert(dir);
    }
}

run();
