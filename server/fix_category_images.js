const mongoose = require('mongoose');
const { uploadImage } = require('./cloudinary');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 60000
        });
        console.log("Connected to Atlas");

        const db = mongoose.connection.db;
        const categories = await db.collection('shopcategories').find({}, { projection: { _id: 1, name: 1, image: 1 } }).toArray();
        console.log(`Processing ${categories.length} categories...`);

        for (const cat of categories) {
            if (cat.image && (cat.image.startsWith('data:') || cat.image.length > 5000)) {
                console.log(`Converting image for Category: ${cat.name}...`);
                try {
                    // Extract base64 or long string
                    let imageData = cat.image;
                    let fileName = cat.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

                    if (imageData.startsWith('data:')) {
                        // Extract buffer from base64
                        const base64Data = imageData.split(',')[1];
                        const buffer = Buffer.from(base64Data, 'base64');
                        const result = await uploadImage(buffer, fileName, 'shop-categories');
                        console.log(`✅ Uploaded to Cloudinary: ${result.url}`);
                        await db.collection('shopcategories').updateOne({ _id: cat._id }, { $set: { image: result.url } });
                    } else {
                        console.log(`⚠️ Image for ${cat.name} is long but not data URL. Skipping for safety.`);
                    }
                } catch (err) {
                    console.error(`❌ Failed to convert ${cat.name}:`, err.message);
                }
            } else {
                console.log(`Skipping Category: ${cat.name} (already clean or small)`);
            }
        }

        console.log("Cleanup complete!");
        process.exit(0);
    } catch (e) {
        console.error("Fatal Error:", e);
        process.exit(1);
    }
}

run();
