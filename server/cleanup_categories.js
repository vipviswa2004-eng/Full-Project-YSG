const mongoose = require('mongoose');
require('dotenv').config();

const LOCAL_URI = 'mongodb://localhost:27017/yathes_sign_galaxy';
const ATLAS_URI = process.env.MONGO_URI;

async function run() {
    try {
        console.log("Connecting...");
        const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
        console.log("Connected.");

        // 1. Get all local categories as the Source of Truth
        const localCats = await localConn.db.collection('shopcategories').find({}).toArray();
        console.log(`Local Truth: ${localCats.length} categories.`);

        // 2. Clean up Atlas: Remove all current categories to start fresh and avoid duplicates/weird names
        console.log("Clearing Atlas shopcategories for fresh sync...");
        await atlasConn.db.collection('shopcategories').deleteMany({});

        const { uploadImage } = require('./cloudinary');
        // 3. Sync from local to Atlas
        for (const cat of localCats) {
            console.log(`Syncing category: "${cat.name}" (Order: ${cat.order})`);

            // Clean names (trim spaces)
            cat.name = cat.name.trim();

            // Prepare for Atlas
            const { _id, ...doc } = cat;

            // Handle base64
            if (doc.image && doc.image.startsWith('data:')) {
                console.log(`  Uploading base64...`);
                try {
                    const result = await uploadImage(Buffer.from(doc.image.split(',')[1], 'base64'),
                        cat.name.replace(/\s+/g, '_').toLowerCase(), 'shop-categories');
                    doc.image = result.url;
                    console.log(`    URL: ${doc.image}`);
                } catch (e) {
                    console.log(`    Upload failed: ${e.message}`);
                }
            }

            // Ensure sectionId is consistent for legacy components
            if (doc.sectionIds && doc.sectionIds.length > 0) {
                doc.sectionId = doc.sectionIds[0];
            } else if (doc.sectionId) {
                doc.sectionIds = [doc.sectionId];
            }

            // If image is base64, usually we'd convert it, 
            // but my force_sync_cats already did that if it was run.
            // Let's check if we still have base64 in local.
            // (If so, this script will push base64, which we want to avoid)
            // But for restoration of missing ones, it's better than nothing.

            await atlasConn.db.collection('shopcategories').insertOne(doc);
        }

        console.log("FRESH SYNC COMPLETE.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
