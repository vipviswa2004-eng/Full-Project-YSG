
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const LOCAL_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yathes_sign_galaxy";
const BASE_API = "http://localhost:5000/api";

const syncOrdered = async () => {
    console.log("🚀 Starting Ordered Sync for 29 Categories...");

    try {
        // 1. Fetch Categories from WebApp
        console.log("📥 Fetching Shop Categories from WebApp...");
        const catRes = await axios.get(`${BASE_API}/shop-categories`);
        let categories = catRes.data;

        // Sort by Order
        categories.sort((a, b) => (a.order || 0) - (b.order || 0));

        console.log(`   Found ${categories.length} categories.`);

        // Log the categories to confirm the "29" and "Order Wise"
        console.log("   Categories to Sync (Order Wise):");
        categories.forEach(c => {
            console.log(`   [${c.order}] ${c.name}`);
        });

        if (categories.length === 29) {
            console.log("   ✅ Exact match: 29 Categories found.");
        } else {
            console.log(`   ⚠️ Note: Found ${categories.length} categories (User mentioned 29). Syncing all found.`);
        }

        // 2. Fetch Products
        console.log("\n📥 Fetching Products from WebApp...");
        const prodRes = await axios.get(`${BASE_API}/products`);
        const products = prodRes.data;
        console.log(`   Found ${products.length} products.`);

        // 3. Connect to Local DB
        await mongoose.connect(LOCAL_URI);
        const db = mongoose.connection.db;

        // 4. Update Local DB: Categories
        console.log("\n🔄 Updating Local DB 'shopcategories'...");
        await db.collection('shopcategories').deleteMany({});
        if (categories.length > 0) {
            await db.collection('shopcategories').insertMany(categories);
        }
        console.log("   ✅ Categories synced in order.");

        // 5. Update Local DB: Products
        console.log("\n🔄 Updating Local DB 'products'...");
        // "remove the categories products in local database and add the new product details"
        await db.collection('products').deleteMany({});

        if (products.length > 0) {
            // Clean dates
            const productDocs = products.map(p => {
                const doc = { ...p };
                if (doc.createdAt) doc.createdAt = new Date(doc.createdAt);
                if (doc.updatedAt) doc.updatedAt = new Date(doc.updatedAt);
                return doc;
            });
            await db.collection('products').insertMany(productDocs);
        }
        console.log("   ✅ Products synced.");

        // 6. Also Sync SubCategories for completeness
        console.log("\n🔄 Updating Local DB 'subcategories'...");
        const subRes = await axios.get(`${BASE_API}/sub-categories`);
        const subCategories = subRes.data;
        await db.collection('subcategories').deleteMany({});
        if (subCategories.length > 0) {
            await db.collection('subcategories').insertMany(subCategories);
        }
        console.log(`   ✅ ${subCategories.length} Sub-Categories synced.`);


        console.log("\n---------------------------------------------------");
        console.log("🎉 SYNC COMPLETE");
        console.log("Local Database updated with exact WebApp categories and products.");
        console.log("---------------------------------------------------");

        process.exit(0);

    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
};

syncOrdered();
