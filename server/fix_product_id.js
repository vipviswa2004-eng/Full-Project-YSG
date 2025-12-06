const mongoose = require('mongoose');

const MONGO_URI = "mongodb://localhost:27017/yathes_sign_galaxy";

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB");

        // We need to use the schema with { id: false } to update the id field correctly
        const ProductSchema = new mongoose.Schema({
            id: String,
            name: String
        }, { id: false, strict: false });

        const Product = mongoose.model('Product', ProductSchema);

        // Find the product named "3D" (or whatever it is now)
        const product = await Product.findOne({}); // Just get the first one since there's only one

        if (product) {
            console.log(`Found product: ${product.name} with ID: ${product.id} and _id: ${product._id}`);

            // Update the ID to the one from the screenshot
            const targetId = "NEW-1764694885836";

            // We use updateOne to bypass any mongoose document validation weirdness
            await Product.updateOne(
                { _id: product._id },
                { $set: { id: targetId } }
            );

            console.log(`Updated product ID to: ${targetId}`);

            // Verify
            const updated = await Product.findOne({ _id: product._id });
            console.log(`Verification - New ID: ${updated.id}`);
        } else {
            console.log("No product found to update.");
        }

        mongoose.connection.close();
    })
    .catch(err => console.error("Error:", err));
