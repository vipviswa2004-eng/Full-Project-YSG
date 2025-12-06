const mongoose = require('mongoose');
require('dotenv').config();

const { Product } = require('./models');

async function testAdditionalHeads() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the 3D Crystal Rectangle Portrait
        const product = await Product.findOne({ name: '3D Crystal Rectangle Portrait' });

        if (product) {
            console.log('\n=== Product Found ===');
            console.log('Name:', product.name);
            console.log('Price:', product.pdfPrice);
            console.log('Discount:', product.discount);
            console.log('\nAdditional Heads Config:');
            console.log(JSON.stringify(product.additionalHeadsConfig, null, 2));
        } else {
            console.log('Product not found');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

testAdditionalHeads();
