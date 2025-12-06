const mongoose = require('mongoose');
const { Section, ShopCategory } = require('./models');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yathes_sign_galaxy";

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error(err));

const seedShopData = async () => {
    try {
        await Section.deleteMany({});
        await ShopCategory.deleteMany({});

        console.log("Cleared old shop data.");

        // 1. Create Sections
        const sections = [
            { id: 'sec_personalised', title: 'Personalised', order: 1 },
            { id: 'sec_mini_you', title: 'Mini You Series', order: 2 },
            { id: 'sec_home_decor', title: 'Home & Decor', order: 3 },
        ];

        const createdSections = await Section.insertMany(sections);
        console.log(`Seeded ${createdSections.length} sections.`);

        // 2. Create Shop Categories
        const shopCategories = [
            // Personalised Section
            { id: 'cat_3d_crystals', sectionId: 'sec_personalised', name: '3D Crystals', image: 'https://m.media-amazon.com/images/I/61+7+q+X+L._AC_SL1500_.jpg', order: 1 },
            { id: 'cat_wood_art', sectionId: 'sec_personalised', name: 'Wood Art', image: 'https://m.media-amazon.com/images/I/71w+q+X+L._AC_SL1500_.jpg', order: 2 },
            { id: 'cat_neon_lights', sectionId: 'sec_personalised', name: 'Neon Lights', image: 'https://m.media-amazon.com/images/I/71XYZ+q+X+L._AC_SL1500_.jpg', order: 3 },
            { id: 'cat_wallets', sectionId: 'sec_personalised', name: 'Wallets', image: 'https://m.media-amazon.com/images/I/71ABC+q+X+L._AC_SL1500_.jpg', order: 4 },
            { id: 'cat_pillows', sectionId: 'sec_personalised', name: 'Pillows', image: 'https://m.media-amazon.com/images/I/71DEF+q+X+L._AC_SL1500_.jpg', order: 5 },
            { id: 'cat_mugs', sectionId: 'sec_personalised', name: 'Mugs', image: 'https://m.media-amazon.com/images/I/71GHI+q+X+L._AC_SL1500_.jpg', order: 6 },
            { id: 'cat_clocks', sectionId: 'sec_personalised', name: 'Clocks', image: 'https://m.media-amazon.com/images/I/71JKL+q+X+L._AC_SL1500_.jpg', order: 7 },

            // Mini You Series
            { id: 'cat_mini_me', sectionId: 'sec_mini_you', name: 'Mini Me Figurines', image: 'https://m.media-amazon.com/images/I/71MNO+q+X+L._AC_SL1500_.jpg', order: 1 },
            { id: 'cat_couple_figurines', sectionId: 'sec_mini_you', name: 'Couple Figurines', image: 'https://m.media-amazon.com/images/I/71PQR+q+X+L._AC_SL1500_.jpg', order: 2 },
            { id: 'cat_family_set', sectionId: 'sec_mini_you', name: 'Family Set', image: 'https://m.media-amazon.com/images/I/71STU+q+X+L._AC_SL1500_.jpg', order: 3 },

            // Home & Decor
            { id: 'cat_wall_art', sectionId: 'sec_home_decor', name: 'Wall Art', image: 'https://m.media-amazon.com/images/I/71VWX+q+X+L._AC_SL1500_.jpg', order: 1 },
            { id: 'cat_table_decor', sectionId: 'sec_home_decor', name: 'Table Decor', image: 'https://m.media-amazon.com/images/I/71YZA+q+X+L._AC_SL1500_.jpg', order: 2 },
            { id: 'cat_lamps', sectionId: 'sec_home_decor', name: 'Lamps', image: 'https://m.media-amazon.com/images/I/71BCD+q+X+L._AC_SL1500_.jpg', order: 3 },
        ];

        await ShopCategory.insertMany(shopCategories);
        console.log(`Seeded ${shopCategories.length} shop categories.`);

        console.log("Shop data seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedShopData();
