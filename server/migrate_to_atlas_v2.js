const mongoose = require('mongoose');
require('dotenv').config();

const LOCAL_URI = 'mongodb://localhost:27017/yathes_sign_galaxy';
const ATLAS_URI = process.env.MONGO_URI;

async function migrate() {
    try {
        console.log("Connecting to Local DB...");
        const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log("Connecting to Atlas DB...");
        const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();

        // Collections
        const collections = ['shopcategories', 'subcategories', 'products', 'sections'];

        for (const colName of collections) {
            console.log(`\nSyncing collection: ${colName}...`);
            const localData = await localConn.db.collection(colName).find({}).toArray();
            console.log(`  Found ${localData.length} items in local.`);

            if (colName === 'shopcategories') {
                console.log(`  Updating category images...`);
                for (const item of localData) {
                    if (item.image && item.image.startsWith('data:')) continue;
                    await atlasConn.db.collection(colName).updateOne(
                        { $or: [{ id: item.id }, { name: item.name }] },
                        { $set: { image: item.image || 'https://placehold.co/600x400?text=No+Image' } }
                    );
                }
            } else {
                console.log(`  Clearing Atlas ${colName}...`);
                await atlasConn.db.collection(colName).deleteMany({});
                if (localData.length > 0) {
                    // Chunk products to avoid large payload errors
                    const chunkSize = 50;
                    for (let i = 0; i < localData.length; i += chunkSize) {
                        const chunk = localData.slice(i, i + chunkSize);
                        await atlasConn.db.collection(colName).insertMany(chunk);
                        console.log(`  Inserted chunk ${i / chunkSize + 1} (${chunk.length} items)`);
                    }
                }
            }
        }

        console.log("\nMigration Complete!");
        process.exit(0);
    } catch (e) {
        console.error("Migration Failed:", e);
        process.exit(1);
    }
}

migrate();
