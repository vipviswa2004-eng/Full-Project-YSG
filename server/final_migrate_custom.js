const mongoose = require('mongoose');
require('dotenv').config();

const LOCAL_URI = "mongodb://127.0.0.1:27017/yathes_sign_galaxy";
const ATLAS_URI = process.env.MONGO_URI;

const COLLECTIONS = ['sections', 'shopcategories', 'subcategories', 'products'];

async function migrateCustom() {
    console.log("START_MIGRATION");
    let localData = {};

    try {
        // 1. READ LOCAL
        const localConn = await mongoose.createConnection(LOCAL_URI, { serverSelectionTimeoutMS: 5000 }).asPromise();
        console.log("CONNECTED_LOCAL");

        for (const col of COLLECTIONS) {
            const items = await localConn.collection(col).find({}).toArray();
            localData[col] = items;
            console.log(`READ_LOCAL|${col}|COUNT:${items.length}`);
        }
        await localConn.close();

        // 2. WRITE ATLAS
        const atlasConn = await mongoose.createConnection(ATLAS_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 60000,
            connectTimeoutMS: 30000
        }).asPromise();
        console.log("CONNECTED_ATLAS");

        for (const col of COLLECTIONS) {
            const items = localData[col];
            if (items.length > 0) {
                // DELETE EXISTING (CLEAR SEED)
                await atlasConn.collection(col).deleteMany({});
                // INSERT LOCAL CUSTOM DATA
                await atlasConn.collection(col).insertMany(items);
                console.log(`WROTE_ATLAS|${col}|COUNT:${items.length}`);
            } else {
                console.log(`SKIPPING_ATLAS|${col}|EMPTY`);
            }
        }
        await atlasConn.close();
        console.log("MIGRATION_COMPLETE");
        process.exit(0);

    } catch (e) {
        console.error("ERROR:" + e.message);
        process.exit(1);
    }
}

migrateCustom();
