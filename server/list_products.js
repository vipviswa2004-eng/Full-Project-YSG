require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Use env var or fallback
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yathes_sign_galaxy";

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB");

        const Product = mongoose.model('Product', new mongoose.Schema({
            name: String,
            pdfPrice: Number,
            stock: Number,
            status: String
        }, { strict: false }));

        const products = await Product.find({}).sort({ _id: -1 });

        const dumpPath = path.join(__dirname, '../frontend/public/products_dump.txt');
        const stream = fs.createWriteStream(dumpPath);

        console.log(`Dumping ${products.length} products to ${dumpPath}...`);

        products.forEach(p => {
            stream.write(`\n--- PRODUCT ${p._id} ---\n`);
            stream.write(`Name: '${p.name}'\n`);
            stream.write(`Price: ${p.pdfPrice} (${typeof p.pdfPrice})\n`);
            stream.write(`Stock: ${p.stock}\n`);
            stream.write(`Status: ${p.status}\n`);

            if (!p.name || p.name.trim() === '' || p.pdfPrice === undefined || p.pdfPrice === null) {
                console.log(`FOUND BAD PRODUCT: ${p._id}`);
            }
        });
        stream.end();

        mongoose.connection.close();
    })
    .catch(err => console.error("Error:", err));
