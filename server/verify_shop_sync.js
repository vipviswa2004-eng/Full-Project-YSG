
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const LOCAL_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yathes_sign_galaxy";
const BASE_API = "http://localhost:5000/api";

const verifySync = async () => {
    try {
        console.log("---------------------------------------------------");
        console.log("🔍 VERIFYING SYNC INTEGRITY...");
        console.log("---------------------------------------------------");

        // Fetch Source (WebApp) counts
        const [pRes, sRes, cRes, scRes] = await Promise.all([
            axios.get(`${BASE_API}/products`),
            axios.get(`${BASE_API}/sections`),
            axios.get(`${BASE_API}/shop-categories`),
            axios.get(`${BASE_API}/sub-categories`)
        ]);

        const webCounts = {
            products: pRes.data.length,
            sections: sRes.data.length,
            categories: cRes.data.length,
            subCategories: scRes.data.length
        };

        // Fetch Target (Local DB) counts
        await mongoose.connect(LOCAL_URI);
        const db = mongoose.connection.db;

        const dbCounts = {
            products: await db.collection('products').countDocuments(),
            sections: await db.collection('sections').countDocuments(),
            categories: await db.collection('shopcategories').countDocuments(),
            subCategories: await db.collection('subcategories').countDocuments()
        };

        // Comparison
        console.log(`TYPE             | WEBAPP (Source) | LOCAL DB (Target) | STATUS`);
        console.log(`-----------------|-----------------|-------------------|-------`);
        console.log(`Products         | ${String(webCounts.products).padEnd(15)} | ${String(dbCounts.products).padEnd(17)} | ${webCounts.products === dbCounts.products ? '✅ OK' : '❌ FAIL'}`);
        console.log(`Sections         | ${String(webCounts.sections).padEnd(15)} | ${String(dbCounts.sections).padEnd(17)} | ${webCounts.sections === dbCounts.sections ? '✅ OK' : '❌ FAIL'}`);
        console.log(`Shop Categories  | ${String(webCounts.categories).padEnd(15)} | ${String(dbCounts.categories).padEnd(17)} | ${webCounts.categories === dbCounts.categories ? '✅ OK' : '❌ FAIL'}`);
        console.log(`Sub Categories   | ${String(webCounts.subCategories).padEnd(15)} | ${String(dbCounts.subCategories).padEnd(17)} | ${webCounts.subCategories === dbCounts.subCategories ? '✅ OK' : '❌ FAIL'}`);
        console.log("---------------------------------------------------");

        if (
            webCounts.products === dbCounts.products &&
            webCounts.sections === dbCounts.sections &&
            webCounts.categories === dbCounts.categories &&
            webCounts.subCategories === dbCounts.subCategories
        ) {
            console.log("\n✅ VERIFICATION SUCCESSFUL: Sync is perfect.");
        } else {
            console.log("\n❌ VERIFICATION FAILED: Mismatches detected.");
        }

        process.exit(0);

    } catch (err) {
        console.error("Verification Error:", err.message);
        process.exit(1);
    }
};

verifySync();
