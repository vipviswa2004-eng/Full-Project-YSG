const mongoose = require('mongoose');
require('dotenv').config();
const { Product } = require('./models');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        // 1. Get IDs of products to enable
        // We'll update ~15 items to be Trending and ~15 to be Bestsellers
        // Random sample using aggregation
        const allProducts = await Product.find().select('_id').lean();

        if (allProducts.length === 0) {
            console.log("No products found.");
            process.exit(0);
        }

        // Shuffle
        const shuffled = allProducts.sort(() => 0.5 - Math.random());

        const trendingSet = shuffled.slice(0, 15).map(p => p._id);
        const bestsellerSet = shuffled.slice(15, 30).map(p => p._id);

        // Update trending
        await Product.updateMany(
            { _id: { $in: trendingSet } },
            { $set: { isTrending: true } }
        );

        // Update bestsellers
        await Product.updateMany(
            { _id: { $in: bestsellerSet } },
            { $set: { isBestseller: true } }
        );

        console.log("Updated 15 products to Trending and 15 to Bestsellers.");
        process.exit(0);
    })
    .catch(err => {
        console.log("Error");
        process.exit(1);
    });
