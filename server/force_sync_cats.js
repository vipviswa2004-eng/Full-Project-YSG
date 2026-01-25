const mongoose = require('mongoose');
const { uploadImage } = require('./cloudinary');
require('dotenv').config();

const LOCAL_URI = 'mongodb://localhost:27017/yathes_sign_galaxy';
const ATLAS_URI = process.env.MONGO_URI;

async function run() {
    try {
        console.log("Connecting...");
        const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
        console.log("Connected.");

        const localCats = await localConn.db.collection('shopcategories').find({}).toArray();
        console.log(`Force syncing ${localCats.length} categories...`);

        for (const cat of localCats) {
            console.log(`Syncing: ${cat.name}`);
            let targetImage = cat.image;

            if (targetImage && targetImage.startsWith('data:')) {
                console.log(`  Uploading base64...`);
                try {
                    const result = await uploadImage(Buffer.from(targetImage.split(',')[1], 'base64'),
                        cat.name.replace(/\s+/g, '_').toLowerCase(), 'shop-categories');
                    targetImage = result.url;
                    console.log(`    URL: ${targetImage}`);
                } catch (e) {
                    console.log(`    Upload failed: ${e.message}`);
                }
            }

            // Clean document: replace local _id with new one or keep custom id
            const { _id, ...doc } = cat;
            doc.image = targetImage;

            // Upsert in Atlas based on 'name'
            await atlasConn.db.collection('shopcategories').updateOne(
                { name: cat.name },
                { $set: doc },
                { upsert: true }
            );
        }

        console.log("Sync Done.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
