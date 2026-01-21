
const mongoose = require('mongoose');
require('dotenv').config();

const LOCAL_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yathes_sign_galaxy";

const checkCollections = async () => {
    try {
        await mongoose.connect(LOCAL_URI);
        const db = mongoose.connection.db;

        const categories = await db.collection('categories').find().toArray();
        const shopCategories = await db.collection('shopcategories').find().toArray();

        console.log("---------------------------------------------------");
        console.log("COLLECTION ANALYSIS");
        console.log("---------------------------------------------------");
        console.log(`'categories' Collection (Count: ${categories.length})`);
        console.log(`'shopcategories' Collection (Count: ${shopCategories.length}) -> RECENTLY SYNCED`);

        console.log("\nSample 'categories':");
        categories.slice(0, 3).forEach(c => console.log(` - [${c.id}] ${c.name} (SubCats: ${c.subCategories?.length || 0})`));

        console.log("\nSample 'shopcategories':");
        shopCategories.slice(0, 3).forEach(c => console.log(` - [${c.id}] ${c.name} (Order: ${c.order})`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkCollections();
