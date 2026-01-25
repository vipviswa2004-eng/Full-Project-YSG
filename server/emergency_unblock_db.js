require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 60000,
            socketTimeoutMS: 120000
        });
        console.log("Connected to Atlas");

        const db = mongoose.connection.db;
        const placeholder = 'https://placehold.co/600x400?text=Fixing+Image';

        console.log("Cleaning up ShopCategories...");
        const catRes = await db.collection('shopcategories').updateMany(
            { image: { $regex: /^data:image/ } },
            { $set: { image: placeholder } }
        );
        console.log(`  ShopCategories fixed: ${catRes.modifiedCount}`);

        console.log("Cleaning up SubCategories...");
        const subRes = await db.collection('subcategories').updateMany(
            { image: { $regex: /^data:image/ } },
            { $set: { image: placeholder } }
        );
        console.log(`  SubCategories fixed: ${subRes.modifiedCount}`);

        console.log("Cleaning up Products (Main Image)...");
        const prodRes = await db.collection('products').updateMany(
            { image: { $regex: /^data:image/ } },
            { $set: { image: placeholder } }
        );
        console.log(`  Products fixed: ${prodRes.modifiedCount}`);

        console.log("Cleanup finished! The database should now be responsive.");
        process.exit(0);
    } catch (e) {
        console.error("Fatal Error:", e);
        process.exit(1);
    }
}
run();
