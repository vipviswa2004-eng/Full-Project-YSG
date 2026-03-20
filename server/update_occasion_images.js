const mongoose = require('mongoose');
const { SpecialOccasion, ShopOccasion } = require('./models');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function updateOccasions() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.");

        // Special Occasions
        await SpecialOccasion.findOneAndUpdate({ id: 'spec_mothers_day' }, { image: '/occasions/mothers_day.webp' });
        
        // Shop Occasions
        await ShopOccasion.findOneAndUpdate({ id: 'occ_birthday' }, { image: '/occasions/birthday.webp' });
        await ShopOccasion.findOneAndUpdate({ id: 'occ_anniversary' }, { image: '/occasions/wedding_anniversary.webp' });
        await ShopOccasion.findOneAndUpdate({ id: 'occ_love' }, { image: '/occasions/love_romance.webp' });
        await ShopOccasion.findOneAndUpdate({ id: 'occ_kids' }, { image: '/occasions/for_kids.webp' });

        // Shop Categories
        const { ShopCategory } = require('./models');
        await ShopCategory.findOneAndUpdate({ name: 'Acrylic' }, { image: '/categories/acrylic.webp' });

        console.log("Occasion images updated to local paths successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Failed to update occasions:", err);
        process.exit(1);
    }
}

updateOccasions();
