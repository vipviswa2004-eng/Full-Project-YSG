
const mongoose = require('mongoose');
const { Product } = require('./models'); // Ensure your models are exported correctly in a models.js or similar
require('dotenv').config();

// Configuration
const LOCAL_URI = "mongodb://localhost:27017/yathes_sign_galaxy"; // Your local DB
const ATLAS_URI = process.env.MONGO_URI; // Your Atlas DB from .env

if (!ATLAS_URI) {
    console.error("❌ Error: MONGO_URI is missing in .env file");
    process.exit(1);
}

const migrate = async () => {
    console.log("🚀 Starting Data Migration...");

    // 1. Fetch from Local
    console.log("1️⃣ Connecting to Local Database...");
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log("✅ Connected to Local.");

    // Define schema on the connection to read data
    // We use a loose schema or the actual schema if available. 
    // To be safe and generic, we can use 'collection' access directly.
    const localProducts = await localConn.collection('products').find({}).toArray();
    console.log(`📦 Found ${localProducts.length} products in Local Database.`);

    if (localProducts.length === 0) {
        console.log("⚠️ No products found to migrate. Exiting.");
        await localConn.close();
        return;
    }

    // 2. Upload to Atlas
    console.log("2️⃣ Connecting to Atlas Database...");
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log("✅ Connected to Atlas.");

    // Clean up _id to avoid duplicate key errors if IDs conflict, 
    // OR keep them to maintain consistency. Let's try upserting.
    const atlasCollection = atlasConn.collection('products');

    let successCount = 0;
    let errorCount = 0;

    for (const p of localProducts) {
        try {
            // Using updateOne with upsert: true ensures we don't create duplicates if run multiple times
            await atlasCollection.updateOne(
                { _id: p._id },
                { $set: p },
                { upsert: true }
            );
            successCount++;
        } catch (e) {
            console.error(`❌ Failed to migrate product ${p.name}:`, e.message);
            errorCount++;
        }
    }

    console.log(`\n🎉 Migration Complete!`);
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);

    // Close connections
    await localConn.close();
    await atlasConn.close();
    process.exit(0);
};

migrate().catch(err => {
    console.error("❌ Fatal Error:", err);
    process.exit(1);
});
