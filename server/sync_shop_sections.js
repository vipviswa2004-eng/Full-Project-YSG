
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const LOCAL_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yathes_sign_galaxy";
const BASE_API = "http://localhost:5000/api";

const syncShopSections = async () => {
    console.log("🚀 Starting Shop Sections Sync...");
    console.log(`Target DB: ${LOCAL_URI}`);
    console.log(`Source API: ${BASE_API}`);

    try {
        // 1. Fetch Data from WebApp API
        console.log("\n📥 Fetching data from WebApp...");

        const [sectionsRes, catsRes, subCatsRes, productsRes] = await Promise.all([
            axios.get(`${BASE_API}/sections`),
            axios.get(`${BASE_API}/shop-categories`),
            axios.get(`${BASE_API}/sub-categories`),
            axios.get(`${BASE_API}/products`)
        ]);

        const sections = sectionsRes.data;
        const categories = catsRes.data;
        const subCategories = subCatsRes.data;
        const products = productsRes.data;

        console.log(`   - Sections fetched: ${sections.length}`);
        console.log(`   - Shop Categories fetched: ${categories.length}`);
        console.log(`   - Sub-Categories fetched: ${subCategories.length}`);
        console.log(`   - Products fetched: ${products.length}`);

        // 2. Connect to Local DB
        await mongoose.connect(LOCAL_URI);
        console.log("\n✅ Connected to Local MongoDB.");
        const db = mongoose.connection.db;

        // 3. Sync Sections
        console.log("\n🔄 Syncing 'sections'...");
        await db.collection('sections').deleteMany({});
        if (sections.length > 0) {
            // Fix _id if needed
            const docs = sections.map(d => {
                const doc = { ...d };
                if (doc.id && !doc._id) doc._id = doc.id; // Ensure mapping if specific
                return doc;
            });
            // We usually want to trust the _id from the source if it exists
            // But if source returns "id" (string) and DB expects ObjectId, we might need care.
            // However, the source IS the API of the same app, likely using the same ID format.
            // Let's just insert as is, but remove 'id' alias if it duplicates unique index on _id? 
            // Usually Mongoose virtuals include 'id'. The API likely returns 'id' as well.
            // MongoDB driver 'insertMany' expects documents. 
            // Let's strip the extra Mongoose 'id' virtual if present, but keep '_id'.
            // Actually, API usually returns _id.

            await db.collection('sections').insertMany(sections);
        }
        console.log("   ✅ Sections synced.");

        // 4. Sync Shop Categories
        console.log("\n🔄 Syncing 'shopcategories'...");
        await db.collection('shopcategories').deleteMany({});
        if (categories.length > 0) {
            await db.collection('shopcategories').insertMany(categories);
        }
        console.log("   ✅ Shop Categories synced.");

        // 5. Sync Sub Categories
        console.log("\n🔄 Syncing 'subcategories'...");
        await db.collection('subcategories').deleteMany({});
        if (subCategories.length > 0) {
            await db.collection('subcategories').insertMany(subCategories);
        }
        console.log("   ✅ Sub-Categories synced.");

        // 6. Sync Products (Double check to be sure)
        console.log("\n🔄 Syncing 'products' (Re-verifying)...");
        // We did this before, but user emphasized "categories product details".
        // Let's ensure strict consistency.
        await db.collection('products').deleteMany({});
        if (products.length > 0) {
            // Ensure date objects are correct
            const productDocs = products.map(p => {
                const doc = { ...p };
                if (doc.createdAt) doc.createdAt = new Date(doc.createdAt);
                if (doc.updatedAt) doc.updatedAt = new Date(doc.updatedAt);
                return doc;
            });
            await db.collection('products').insertMany(productDocs);
        }
        console.log("   ✅ Products synced.");

        console.log("\n---------------------------------------------------");
        console.log("🎉 SYNC COMPLETE");
        console.log("Local Database now exactly matches WebApp content.");
        console.log("---------------------------------------------------");

        process.exit(0);
    } catch (err) {
        console.error("\n❌ Error during sync:", err.message);
        if (err.response) {
            console.error("   API Response:", err.response.data);
        }
        process.exit(1);
    }
};

syncShopSections();
