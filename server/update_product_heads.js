const mongoose = require('mongoose');
require('dotenv').config();

const { Product } = require('./models');

async function updateProduct() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find the 3D Crystal Rectangle Portrait
        const product = await Product.findOne({ name: '3D Crystal Rectangle Portrait' });

        if (product) {
            console.log('\n=== Before Update ===');
            console.log('Name:', product.name);
            console.log('Additional Heads Config:', product.additionalHeadsConfig);

            // Update with additional heads config
            product.additionalHeadsConfig = {
                enabled: true,
                pricePerHead: 125,
                maxLimit: 1
            };

            await product.save();

            console.log('\n=== After Update ===');
            console.log('Additional Heads Config:', product.additionalHeadsConfig);

            // Verify by fetching again
            const updated = await Product.findOne({ name: '3D Crystal Rectangle Portrait' });
            console.log('\n=== Verification ===');
            console.log('Additional Heads Config:', updated.additionalHeadsConfig);
        } else {
            console.log('Product not found');
        }

        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('Error:', error);
    }
}

updateProduct();
