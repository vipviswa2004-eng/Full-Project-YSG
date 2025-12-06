require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected to MongoDB');

    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const products = await Product.find({}, 'name category').limit(10);

    console.log('\n=== Products with categories ===');
    products.forEach(p => {
        console.log(`- ${p.name}: category="${p.category}"`);
    });

    console.log('\n=== Looking for "3D Crystals" ===');
    const crystalProducts = await Product.find({ category: '3D Crystals' });
    console.log(`Found ${crystalProducts.length} products with category "3D Crystals"`);

    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
