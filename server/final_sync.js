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

        const products = await localConn.db.collection('products').find({}).toArray();
        console.log(`Syncing ${products.length} products to Atlas...`);

        // Clear existing
        await atlasConn.db.collection('products').deleteMany({});

        // Sync in batches of 25
        const batchSize = 25;
        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            await atlasConn.db.collection('products').insertMany(batch);
            console.log(`  Progress: ${i + batch.length}/${products.length}`);
        }

        console.log("Syncing 37 Subcategories...");
        const subs = await localConn.db.collection('subcategories').find({}).toArray();
        await atlasConn.db.collection('subcategories').deleteMany({});
        await atlasConn.db.collection('subcategories').insertMany(subs);

        console.log("Updating Category Images...");
        const cats = await localConn.db.collection('shopcategories').find({}).toArray();
        for (const cat of cats) {
            if (cat.image && !cat.image.startsWith('data:')) {
                await atlasConn.db.collection('shopcategories').updateOne(
                    { $or: [{ id: cat.id }, { name: cat.name }] },
                    { $set: { image: cat.image } }
                );
            }
        }

        console.log("DASHBOARD SYNC COMPLETE.");
        process.exit(0);
    } catch (err) {
        console.error("FAILED:", err);
        process.exit(1);
    }
}
run();
