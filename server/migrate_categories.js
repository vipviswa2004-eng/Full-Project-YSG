const mongoose = require('mongoose');
const { ShopCategory, SubCategory, Section } = require('./models');
require('dotenv').config();

const LOCAL_URI = 'mongodb://localhost:27017/yathes_sign_galaxy';
const ATLAS_URI = process.env.MONGO_URI;

console.log("Local URI:", LOCAL_URI);
console.log("Atlas URI:", ATLAS_URI);

async function migrate() {
    try {
        // 1. Fetch from Local
        console.log('Step 1: Connecting to Local DB...');
        await mongoose.connect(LOCAL_URI);
        console.log('Connected to Local.');

        const categories = await ShopCategory.find();
        const subCategories = await SubCategory.find();
        const sections = await Section.find();

        console.log(`Fetched Data from Local:`);
        console.log(`- Categories: ${categories.length}`);
        console.log(`- SubCategories: ${subCategories.length}`);
        console.log(`- Sections: ${sections.length}`);

        // Store raw objects
        const rawCategories = categories.map(d => d.toObject());
        const rawSubCategories = subCategories.map(d => d.toObject());
        const rawSections = sections.map(d => d.toObject());

        await mongoose.disconnect();
        console.log('Disconnected from Local.');

        // 2. Write to Atlas
        console.log('Step 2: Connecting to Atlas DB...');
        await mongoose.connect(ATLAS_URI);
        console.log('Connected to Atlas.');

        console.log('Migrating Sections...');
        for (const item of rawSections) {
            delete item._id; // Let Mongo generate new _id or handle it. Actually better to strip _id to avoid collision if strict.
            // But we match by 'id' field usually.
            await Section.findOneAndUpdate({ id: item.id }, item, { upsert: true, new: true });
        }

        console.log('Migrating Categories...');
        for (const item of rawCategories) {
            delete item._id;
            await ShopCategory.findOneAndUpdate({ id: item.id }, item, { upsert: true, new: true });
        }

        console.log('Migrating SubCategories...');
        for (const item of rawSubCategories) {
            delete item._id;
            await SubCategory.findOneAndUpdate({ id: item.id }, item, { upsert: true, new: true });
        }

        console.log('Migration successful!');
        process.exit(0);

    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

migrate();
