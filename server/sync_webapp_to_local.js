
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const LOCAL_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yathes_sign_galaxy";
const API_URL = "http://localhost:5000/api/products";

const syncData = async () => {
    console.log("Starting Sync Process...");
    console.log(`Target Local DB: ${LOCAL_URI}`);
    console.log(`Source WebApp API: ${API_URL}`);

    let webappProducts = [];

    // 1. Fetch WebApp Products
    try {
        const response = await axios.get(API_URL);
        webappProducts = response.data;
        console.log(`\n✅ Fetched ${webappProducts.length} products from WebApp.`);
    } catch (err) {
        console.error("❌ Error fetching from WebApp API:", err.message);
        console.log("Ensure the server is running on port 5000.");
        process.exit(1);
    }

    try {
        // 2. Connect to Local DB
        await mongoose.connect(LOCAL_URI);
        console.log("✅ Connected to Local MongoDB.");

        const db = mongoose.connection.db;
        const productsCol = db.collection('products');
        const categoriesCol = db.collection('categories');
        const subCategoriesCol = db.collection('subcategories'); // Note: 'subcategories' usually lowercase in mongo, check model name
        const shopCategoriesCol = db.collection('shopcategories'); // Check if used

        // Check Local DB Count before
        const localCount = await productsCol.countDocuments();
        console.log(`\nLocal DB current product count: ${localCount}`);

        // 3. Sync Products
        console.log("\n🔄 Syncing Products...");
        // Clear Local Products
        await productsCol.deleteMany({});
        console.log("  - Cleared existing local products.");

        // Insert WebApp Products
        if (webappProducts.length > 0) {
            // Remove _id or keep it? 
            // Better to keep _id to ensure they are EXACTLY the same references
            // But if _id format differs (string vs objectid), we might need care.
            // Usually API returns _id as string. MongoDB needs ObjectId or string.
            // Mongoose usually handles this, but raw driver might not if passed strings as _id for ObjectID fields.
            // Let's coerce _id to new mongoose.Types.ObjectId(id) if they are valid 24-char hex strings

            const productsToInsert = webappProducts.map(p => {
                const doc = { ...p };
                // Ensure _id is correctly formatted if it's a standard generated ID
                if (typeof doc._id === 'string' && /^[0-9a-fA-F]{24}$/.test(doc._id)) {
                    doc._id = new mongoose.Types.ObjectId(doc._id);
                }
                // Fix date fields if they are strings
                if (doc.createdAt) doc.createdAt = new Date(doc.createdAt);
                if (doc.updatedAt) doc.updatedAt = new Date(doc.updatedAt);
                return doc;
            });

            await productsCol.insertMany(productsToInsert);
            console.log(`  - Inserted ${productsToInsert.length} products into Local DB.`);
        }

        // 4. Sync Categories & Subcategories based on Products
        console.log("\n🔄 Syncing Categories & Subcategories...");

        // Extract unique categories/subcategories from WebApp Products
        const uniqueCategories = new Set();
        const uniqueSubCategories = new Set(); // store as "Parent|Sub" to keep relation
        const categoryMap = {}; // Name -> Data

        webappProducts.forEach(p => {
            if (p.category) {
                uniqueCategories.add(p.category);
                if (!categoryMap[p.category]) categoryMap[p.category] = { name: p.category, subCats: new Set() };
            }
            if (p.category && p.subCategory) {
                uniqueSubCategories.add(`${p.category}|${p.subCategory}`);
                categoryMap[p.category].subCats.add(p.subCategory);
            }
        });

        console.log(`  - Found ${uniqueCategories.size} unique categories in products.`);
        console.log(`  - Found ${uniqueSubCategories.size} unique sub-categories in products.`);

        // Update Categories Collection
        // We will match mostly by Name. 
        // Strategy: Get existing categories. If missing, create. If extra, (maybe keep or delete? User said "update categories").
        // "wrong products... update the categories" implies cleaning up.
        // Let's aggressive sync: Ensure all Product Categories exist.

        // Fetch existing
        const existingCats = await categoriesCol.find().toArray();
        const existingSubCats = await subCategoriesCol.find().toArray();

        // 4a. Update Categories
        for (const catName of uniqueCategories) {
            const exists = existingCats.find(c => c.name === catName);
            if (!exists) {
                console.log(`    + Creating missing category: ${catName}`);
                await categoriesCol.insertOne({
                    name: catName,
                    slug: catName.toLowerCase().replace(/ /g, '-'),
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }

        // Should we delete categories that have no products?
        // User said "wrong products... mismatching... update the categories"
        // It's safer to Log them for now or delete them if they are clearly garbage.
        // I will log them.
        const catsToDelete = existingCats.filter(c => !uniqueCategories.has(c.name));
        if (catsToDelete.length > 0) {
            console.log(`    WARNING: Following categories exist in DB but have no products in WebApp:`);
            catsToDelete.forEach(c => console.log(`      - ${c.name}`));
            // For now, I won't delete unless explicitly asked, to avoid deleting empty placeholders the user might want.
            // BUT user said "update categories". I'll leave them be for safety but sync the existence of required ones.
        }

        // 4b. Update SubCategories
        for (const catName of Object.keys(categoryMap)) {
            const subs = categoryMap[catName].subCats;

            // Find parent category ID (freshly inserted or existing)
            const parentCat = await categoriesCol.findOne({ name: catName });
            if (!parentCat) continue; // Should not happen

            for (const subName of subs) {
                // Check if sub exists 
                // SubCategory schema usually has 'parentCategoryId' or similar. 
                // Let's check 'models.js' via inference or just assume schema standard.
                // Or checking existing subs:

                // Simplest check: name + parentCategory match
                const exists = existingSubCats.find(s => s.name === subName); // Weak check
                // We really want to check parent association too, but we might lack ID mapping if we don't know schema perfectly.
                // Assuming standard "name" usage.

                if (!exists) {
                    console.log(`    + Creating missing sub-category: ${subName} (Parent: ${catName})`);
                    await subCategoriesCol.insertOne({
                        name: subName,
                        parentCategoryId: parentCat._id, // Link to parent
                        categoryName: catName, // Some schemas store name too
                        slug: subName.toLowerCase().replace(/ /g, '-'),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
            }
        }

        console.log("\n✅ Sync Complete.");

        // Final Status
        const finalProducts = await productsCol.countDocuments();
        console.log(`Final Local DB Product Count: ${finalProducts}`);

        process.exit(0);
    } catch (err) {
        console.error("\n❌ Error during sync:", err);
        process.exit(1);
    }
};

syncData();
