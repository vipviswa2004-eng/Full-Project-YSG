const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI;

async function check() {
    try {
        await mongoose.connect(mongoUri);
        const products = await mongoose.connection.db.collection('products').find({}).toArray();
        const sections = await mongoose.connection.db.collection('sections').find({}).toArray();
        const categories = await mongoose.connection.db.collection('shop-categories').find({}).toArray();

        console.log(`Products count: ${products.length}`);
        console.log(`Sections count: ${sections.length}`);
        console.log(`Categories count: ${categories.length}`);

        const trendingCount = products.filter(p => p.isTrending).length;
        const bestsellerCount = products.filter(p => p.isBestseller).length;

        console.log(`Trending count: ${trendingCount}`);
        console.log(`Bestseller count: ${bestsellerCount}`);

        if (sections.length > 0) {
            console.log('Sections details:');
            sections.forEach(s => {
                console.log(`- Section: ${s.id || s._id}, Name: ${s.name}, CategoryIDs: ${s.categoryIds ? s.categoryIds.join(', ') : 'none'}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
