const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = "http://localhost:5000/api";
const MONGO_URI = process.env.MONGO_URI;

const check = async () => {
    console.log("\n🏥 STARTING HEALTH CHECK...");

    // 1. Database Connection
    try {
        console.log("----------------------------------------");
        console.log("1. Checking MongoDB Connection...");
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("   ✅ MongoDB Connected.");
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`   ✅ Collections Found: ${collections.length}`);
    } catch (e) {
        console.error("   ❌ MongoDB Connection FAILED:", e.message);
    } finally {
        await mongoose.disconnect();
    }

    // 2. Server API status
    try {
        console.log("----------------------------------------");
        console.log("2. Checking Server API (Localhost)...");

        // Check Categories
        try {
            const start = Date.now();
            const cats = await axios.get(`${API_URL}/shop-categories`);
            console.log(`   ✅ /api/shop-categories: ${cats.data.length} items (${Date.now() - start}ms)`);
        } catch (e) {
            console.error(`   ❌ /api/shop-categories FAILED: ${e.message}`);
        }

        // Check Products (Limit 1)
        try {
            const start = Date.now();
            const prods = await axios.get(`${API_URL}/products?limit=1`);
            console.log(`   ✅ /api/products: ${prods.data.length} items (${Date.now() - start}ms)`);
        } catch (e) {
            console.error(`   ❌ /api/products FAILED: ${e.message}`);
        }

        // Check Sections
        try {
            const start = Date.now();
            const secs = await axios.get(`${API_URL}/sections`);
            console.log(`   ✅ /api/sections: ${secs.data.length} items (${Date.now() - start}ms)`);
        } catch (e) {
            console.error(`   ❌ /api/sections FAILED: ${e.message}`);
        }

    } catch (e) {
        console.error("   ❌ Server Check Critical Failure:", e.message);
    }
    console.log("----------------------------------------");
    console.log("🏁 HEALTH CHECK COMPLETE.\n");
};

check();
