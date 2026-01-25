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
        console.log(`Processing ${localCats.length} categories...`);

        for (const cat of localCats) {
            process.stdout.write(`Category: ${cat.name}... `);

            let targetImageUrl = cat.image;

            if (cat.image && cat.image.startsWith('data:')) {
                console.log(`(Base64 detected, uploading to Cloudinary)`);
                try {
                    const base64Data = cat.image.split(',')[1];
                    const buffer = Buffer.from(base64Data, 'base64');
                    const fileName = cat.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    const result = await uploadImage(buffer, fileName, 'shop-categories');
                    targetImageUrl = result.url;
                    console.log(`  ✅ Uploaded: ${targetImageUrl}`);
                } catch (err) {
                    console.log(`  ❌ Upload failed: ${err.message}`);
                    continue;
                }
            } else {
                console.log(`(URL detected)`);
            }

            // Update Atlas
            const res = await atlasConn.db.collection('shopcategories').updateOne(
                { $or: [{ id: cat.id }, { name: cat.name }] },
                { $set: { image: targetImageUrl } }
            );

            if (res.modifiedCount > 0) {
                console.log(`  ✅ Atlas Updated.`);
            } else if (res.matchedCount > 0) {
                console.log(`  ℹ️ Atlas already up to date.`);
            } else {
                console.log(`  ⚠️ Category not found in Atlas.`);
            }
        }

        console.log("\nIMAGE RESTORATION COMPLETE.");
        process.exit(0);
    } catch (err) {
        console.error("FAILED:", err);
        process.exit(1);
    }
}
run();
