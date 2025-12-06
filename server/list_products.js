const mongoose = require('mongoose');

const MONGO_URI = "mongodb://localhost:27017/yathes_sign_galaxy";

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB");

        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
        const products = await Product.find({});

        console.log(`Found ${products.length} products.`);
        products.forEach(p => {
            console.log(`\n-------------------`);
            console.log(`Name: ${p.name}`);
            console.log(`id (field): ${p.id}`);
            console.log(`_id (mongo): ${p._id}`);
        });

        mongoose.connection.close();
    })
    .catch(err => console.error("Error:", err));
