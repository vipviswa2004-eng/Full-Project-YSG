const mongoose = require('mongoose');
require('dotenv').config();

const LOCAL_URI = 'mongodb://localhost:27017/yathes_sign_galaxy';
const ATLAS_URI = process.env.MONGO_URI;

async function run() {
    try {
        console.log("Connecting...");
        const localConn = await mongoose.createConnection(LOCAL_URI, { serverSelectionTimeoutMS: 30000 }).asPromise();
        const atlasConn = await mongoose.createConnection(ATLAS_URI, { serverSelectionTimeoutMS: 60000 }).asPromise();
        console.log("Connected.");

        const products = await localConn.db.collection('products').find({}).toArray();
        console.log(`Syncing ${products.length} products to Atlas...`);

        await atlasConn.db.collection('products').deleteMany({});

        // Smaller batch, more robust
        const batchSize = 10;
        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            const docs = batch.map(doc => {
                const { _id, ...rest } = doc;
                return rest; // Let Atlas generate new _ids to avoid potential conflicts/formatting issues if local has weird types
            });
            await atlasConn.db.collection('products').insertMany(docs);
            process.stdout.write(`\rProgress: ${i + docs.length}/${products.length}  `);
        }
        console.log("\nProducts Done.");

        console.log("Syncing Subcategories...");
        const subs = await localConn.db.collection('subcategories').find({}).toArray();
        await atlasConn.db.collection('subcategories').deleteMany({});
        if (subs.length > 0) {
            const subDocs = subs.map(s => { const { _id, ...rest } = s; return rest; });
            await atlasConn.db.collection('subcategories').insertMany(subDocs);
        }

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

        console.log("\nDASHBOARD SYNC COMPLETE.");
        process.exit(0);
    } catch (err) {
        console.error("\nFAILED:", err);
        process.exit(1);
    }
}
run();
