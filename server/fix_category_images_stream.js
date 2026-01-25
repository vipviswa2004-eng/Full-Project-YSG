const mongoose = require('mongoose');
const { uploadImage } = require('./cloudinary');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 60000,
            socketTimeoutMS: 120000
        });
        console.log("Connected to Atlas");

        const db = mongoose.connection.db;
        const cursor = db.collection('shopcategories').find({}, { projection: { _id: 1, name: 1, image: 1 } });

        console.log("Starting streaming cleanup...");

        while (await cursor.hasNext()) {
            const cat = await cursor.next();
            process.stdout.write(`Processing: ${cat.name}... `);

            if (cat.image && (cat.image.startsWith('data:') || cat.image.length > 5000)) {
                try {
                    let imageData = cat.image;
                    let fileName = cat.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

                    if (imageData.startsWith('data:')) {
                        const base64Data = imageData.split(',')[1];
                        const buffer = Buffer.from(base64Data, 'base64');
                        const result = await uploadImage(buffer, fileName, 'shop-categories');
                        await db.collection('shopcategories').updateOne({ _id: cat._id }, { $set: { image: result.url } });
                        console.log(`✅ Fixed (Cloudinary: ${result.url})`);
                    } else if (imageData.length > 5000) {
                        console.log(`⚠️ Skip: long string but not data URL`);
                    }
                } catch (err) {
                    console.log(`❌ Error: ${err.message}`);
                }
            } else {
                console.log(`✅ Skip: already clean`);
            }
        }

        console.log("All done!");
        process.exit(0);
    } catch (e) {
        console.error("Fatal Error:", e);
        process.exit(1);
    }
}
run();
