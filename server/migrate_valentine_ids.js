
const mongoose = require('mongoose');
const { ShopCategory } = require('./models');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function migrateValentineIds() {
    try {
        await mongoose.connect(MONGO_URI);

        const oldId = 'occ_1769450166774';
        const newId = 'valentine';

        const result = await ShopCategory.updateMany(
            { specialOccasionIds: oldId },
            { $set: { "specialOccasionIds.$[elem]": newId } },
            { arrayFilters: [{ "elem": oldId }] }
        );

        console.log(`Updated ${result.modifiedCount} categories from ${oldId} to ${newId}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

migrateValentineIds();
