const mongoose = require('mongoose');

const LOCAL_URI = "mongodb://127.0.0.1:27017/yathes_sign_galaxy";

async function verifyLocalData() {
    try {
        console.log("Connecting to LOCAL DB...");
        const conn = await mongoose.connect(LOCAL_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("✅ Custom Local Data Check:");

        const collections = ['sections', 'shopcategories', 'subcategories', 'products'];

        for (const col of collections) {
            const count = await conn.connection.db.collection(col).countDocuments();
            console.log(`- [${col.toUpperCase()}] Count: ${count}`);

            if (count > 0) {
                const sample = await conn.connection.db.collection(col).find().limit(3).toArray();
                console.log(`  Sample IDs: ${sample.map(d => d.id || d._id).join(', ')}`);
            }
        }
        process.exit(0);
    } catch (e) {
        console.error("❌ Error checking local:", e.message);
        process.exit(1);
    }
}

verifyLocalData();
