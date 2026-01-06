const mongoose = require('mongoose');
const { Section, ShopCategory } = require('./models');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yathes_sign_galaxy";

mongoose.connect(MONGO_URI)
    .then(async () => {
        // Find the section that has "Trophies"
        const trophyCat = await ShopCategory.findOne({ name: /Trophies/i });

        if (!trophyCat) {
            console.log("Could not find 'Trophies' category to identify the section.");
            process.exit(1);
        }

        console.log(`Found 'Trophies' in Section ID: ${trophyCat.sectionId}`);

        // Define new categories to add
        const newCats = [
            {
                id: `cat_notebooks_${Date.now()}`,
                sectionId: trophyCat.sectionId,
                name: 'Notebooks',
                image: 'https://m.media-amazon.com/images/I/71F3npeH5WL._AC_SL1500_.jpg', // Generic placeholder
                order: 100 // High order to append
            },
            {
                id: `cat_laptop_sleeves_${Date.now()}`,
                sectionId: trophyCat.sectionId,
                name: 'Laptop Sleeves',
                image: 'https://m.media-amazon.com/images/I/71c-O3-B-LL._AC_SL1500_.jpg',
                order: 101
            }
        ];

        for (const cat of newCats) {
            // Check if exists to avoid dupes
            const exists = await ShopCategory.findOne({ name: cat.name, sectionId: cat.sectionId });
            if (!exists) {
                await ShopCategory.create(cat);
                console.log(`Added category: ${cat.name}`);
            } else {
                console.log(`Category ${cat.name} already exists.`);
            }
        }

        console.log("Done adding categories.");
        mongoose.disconnect();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
