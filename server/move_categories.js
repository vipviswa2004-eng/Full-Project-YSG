const mongoose = require('mongoose');
const { ShopCategory, Section } = require('./models');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yathes_sign_galaxy";

mongoose.connect(MONGO_URI).then(async () => {
    console.log("Connected...");

    const corporateSection = await Section.findOne({ title: /Corporate/i });
    if (!corporateSection) {
        console.error("Corporate section not found!");
        process.exit(1);
    }
    console.log(`Corporate Section ID: ${corporateSection.id}`);

    // Categories to move or create
    const targetCategories = ['Trophies', 'Awards', 'Notebooks', 'Pens', 'Diaries', 'Office', 'Desk', 'Corporate'];

    for (const name of targetCategories) {
        // Find existing category matching name regex
        const cat = await ShopCategory.findOne({ name: new RegExp(name, 'i') });
        if (cat) {
            console.log(`Found category '${cat.name}' currently in section '${cat.sectionId}'`);
            cat.sectionId = corporateSection.id;
            // Ensure strictly one sectionId if using string, or update array if using sectionIds
            cat.sectionIds = [corporateSection.id];
            await cat.save();
            console.log(`Moved '${cat.name}' to Corporate Gifts.`);
        } else {
            // Create if not exists (optional, maybe user wants specific ones)
            // For now, let's create 'Corporate Combo' just to have something
            if (name === 'Corporate') {
                await ShopCategory.create({
                    id: 'cat_corp_combo',
                    name: 'Corporate Combos',
                    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80',
                    sectionId: corporateSection.id,
                    sectionIds: [corporateSection.id]
                });
                console.log("Created 'Corporate Combos' category.");
            }
        }
    }

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
