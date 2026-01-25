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
                // For categories, we want to update the images in Atlas but preserve the Atlas IDs if possible
                // OR just overwrite. The user said "show all", often they mean "overwrite with local truth".
                // We'll update images for matching names/ids.
                for (const item of localData) {
                    // Skip if local image is base64 to avoid bloating again
                    if (item.image && item.image.startsWith('data:')) {
                        console.log(`  Skipping base64 image for ${item.name}`);
                        continue;
                    }
                    await atlasConn.db.collection(colName).updateOne(
                        { $or: [{ id: item.id }, { name: item.name }] },
                        { $set: { image: item.image || 'https://placehold.co/600x400?text=No+Image' } }
                    );
                }
                console.log(`  Updated category images in Atlas.`);
            } else {
                // For others, overwrite to ensure exact match
                console.log(`  Clearing Atlas ${colName}...`);
                await atlasConn.db.collection(colName).deleteMany({});
                if (localData.length > 0) {
                    await atlasConn.db.collection(colName).insertMany(localData);
                    console.log(`  Inserted ${localData.length} items into Atlas.`);
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
