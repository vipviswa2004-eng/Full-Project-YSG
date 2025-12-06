const mongoose = require('mongoose');
require('dotenv').config();

const { Product } = require('./models');

async function checkProduct() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        // Find the 3D Crystal Rectangle Portrait
        const product = await Product.findOne({ name: '3D Crystal Rectangle Portrait' });

        if (product) {
            console.log('=== Product Details ===');
            console.log('Name:', product.name);
            console.log('Price:', product.pdfPrice);
            console.log('Discount:', product.discount);
            console.log('\nAdditional Heads Config:');
            console.log(JSON.stringify(product.additionalHeadsConfig, null, 2));

            console.log('\n=== Full Product Object (as JSON) ===');
            console.log(JSON.stringify(product.toObject(), null, 2));
        } else {
            console.log('Product not found');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkProduct();
