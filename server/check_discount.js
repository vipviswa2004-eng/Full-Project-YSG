const mongoose = require('mongoose');

const MONGO_URI = "mongodb://localhost:27017/yathes_sign_galaxy";

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB");

        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
        const product = await Product.findOne({ name: '3D Crystal' });

        console.log('\n3D Crystal Product:');
        console.log('Name:', product?.name);
        console.log('Price:', product?.pdfPrice);
        console.log('Discount:', product?.discount);
        console.log('Status:', product?.status);
        console.log('\nFull product:', JSON.stringify(product, null, 2));

        mongoose.connection.close();
    })
    .catch(err => console.error("Error:", err));
