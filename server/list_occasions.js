
const mongoose = require('mongoose');
const { SpecialOccasion } = require('./models');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function listOccasions() {
    try {
        await mongoose.connect(MONGO_URI);
        const occasions = await SpecialOccasion.find();
        console.log('--- Special Occasions ---');
        occasions.forEach(o => {
            console.log(`ID: ${o.id}, Name: ${o.name}`);
        });
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

listOccasions();
