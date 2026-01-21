
const mongoose = require('mongoose');

const LOCAL_URI = "mongodb://localhost:27017";

const listDbs = async () => {
    console.log("Connecting to Local MongoDB...");
    try {
        const conn = await mongoose.createConnection(LOCAL_URI).asPromise();
        const admin = conn.db.admin();
        const result = await admin.listDatabases();

        console.log("Databases found:");
        for (const dbInfo of result.databases) {
            console.log(`- ${dbInfo.name}`);
            // List collections for each db to be sure
            if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;

            const dbConn = await mongoose.createConnection(`${LOCAL_URI}/${dbInfo.name}`).asPromise();
            const collections = await dbConn.db.listCollections().toArray();
            console.log(`  Collections: ${collections.map(c => c.name).join(', ')}`);

            if (collections.find(c => c.name === 'products')) {
                const count = await dbConn.db.collection('products').countDocuments();
                console.log(`  -> Found 'products' collection with ${count} documents!`);
            }
            await dbConn.close();
        }

        await conn.close();
    } catch (err) {
        console.error("Error:", err);
    }
};

listDbs();
