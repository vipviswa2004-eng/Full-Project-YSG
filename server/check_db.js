const mongoose = require('mongoose');
const { Product, User } = require('./models');

const MONGO_URI = "mongodb://localhost:27017/yathes_sign_galaxy";

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log("Connected to DB");

        const productCount = await Product.countDocuments();
        console.log(`Product Count: ${productCount}`);

        if (productCount > 0) {
            const products = await Product.find().limit(3);
            console.log("First 3 products:", JSON.stringify(products, null, 2));
        } else {
            console.log("No products found in DB.");
        }

        const userCount = await User.countDocuments();
        console.log(`User Count: ${userCount}`);

        process.exit();
    })
    .catch(err => {
        console.error("Error:", err);
        process.exit(1);
    });
