const mongoose = require('mongoose');
require('dotenv').config();

const LOCAL_URI = "mongodb://localhost:27017/yathes_sign_galaxy";
const ATLAS_URI = process.env.ATLAS_URI;

if (!ATLAS_URI) {
    console.error("❌ Error: ATLAS_URI is missing in .env file.");
    console.error("Please add ATLAS_URI='your_mongodb_atlas_connection_string' to your .env file.");
    process.exit(1);
}

const performMigration = async () => {
    console.log("🚀 Starting Full Migration: Local -> Atlas");
    console.log(`📂 Source: ${LOCAL_URI}`);
    console.log(`☁️  Destination: Atlas (HIDDEN)`);

    let localConn, atlasConn;

    try {
        // 1. Connect to both databases
        localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log("✅ Connected to Local DB");

        atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
        console.log("✅ Connected to Atlas DB");

        // 2. Get all collections from Local
        const collections = await localConn.db.listCollections().toArray();
        console.log(`📦 Found ${collections.length} collections to migrate.`);

        for (const col of collections) {
            const colName = col.name;
            if (colName.startsWith('system.')) continue; // Skip system collections

            console.log(`\n🔄 Processing collection: ${colName}`);

            const docs = await localConn.db.collection(colName).find({}).toArray();

            if (docs.length === 0) {
                console.log(`   ⚠️  Skipping (0 documents)`);
                continue;
            }

            console.log(`   📄 Read ${docs.length} documents from Local.`);

            // 3. WIPE Atlas Collection to ensure "Exact" copy
            // WARNING: This deletes data on Atlas.
            await atlasConn.db.collection(colName).deleteMany({});
            console.log(`   🗑️  Cleared existing data in Atlas '${colName}'.`);

            // 4. Insert into Atlas
            try {
                await atlasConn.db.collection(colName).insertMany(docs);
                console.log(`   ✅ Successfully migrated ${docs.length} documents.`);
            } catch (insertErr) {
                console.error(`   ❌ Error inserting into ${colName}:`, insertErr.message);
            }
        }

        console.log("\n🎉 Migration Finished Successfully!");

    } catch (err) {
        console.error("❌ Migration Failed:", err);
    } finally {
        if (localConn) await localConn.close();
        if (atlasConn) await atlasConn.close();
        process.exit(0);
    }
};

performMigration();
