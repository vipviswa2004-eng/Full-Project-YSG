const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function createIndexes() {
    console.log("Connecting to Atlas...");
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 60000
        });
        console.log("✅ Connected.");

        console.log("Creating/Ensuring index on 'shopcategories.order'...");
        const result = await mongoose.connection.db.collection('shopcategories').createIndex({ order: 1 });
        console.log("Index Result:", result);

        console.log("✅ Index created successfully.");
        process.exit(0);

    } catch (e) {
        console.error("❌ Error creating index:", e);
        process.exit(1);
    }
}

createIndexes();
