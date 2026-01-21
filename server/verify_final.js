
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const LOCAL_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yathes_sign_galaxy";
const API_URL = "http://localhost:5000/api/products";

const verify = async () => {
    try {
        const { data: webappProducts } = await axios.get(API_URL);

        await mongoose.connect(LOCAL_URI);
        const dbCount = await mongoose.connection.db.collection('products').countDocuments();
        const catCount = await mongoose.connection.db.collection('categories').countDocuments();
        const subCount = await mongoose.connection.db.collection('subcategories').countDocuments();

        console.log("---------------------------------------------------");
        console.log("SYNC VERIFICATION REPORT");
        console.log("---------------------------------------------------");
        console.log(`WebApp Products (Source) : ${webappProducts.length}`);
        console.log(`Local DB Products (Target): ${dbCount}`);
        console.log(`Local DB Categories       : ${catCount}`);
        console.log(`Local DB SubCategories    : ${subCount}`);
        console.log("---------------------------------------------------");

        if (webappProducts.length === dbCount) {
            console.log("✅ SUCCESS: Product counts match exactly.");
        } else {
            console.log("❌ WARNING: Mismatch in product counts.");
        }

        process.exit(0);
    } catch (err) {
        console.error("Verification Error:", err);
        process.exit(1);
    }
};

verify();
