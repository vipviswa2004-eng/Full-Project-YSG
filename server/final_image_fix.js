const mongoose = require('mongoose');
require('dotenv').config();
const { ShopCategory, SubCategory } = require('./models');

const CAT_IMAGE_MAP = {
    'PHOTO FRAME': '/categories/photo_frame.png',
    '3D CRYSTAL': '/categories/3d_crystal.png',
    'MUGS': '/categories/mugs.png',
    'NEON LIGHTS': '/categories/neon_lights.png',
    'PILLOWS': '/categories/pillows.png',
    'WALLETS': '/categories/wallets.png',
    'WOODEN ENGRAVING & COLOR PRINTING': '/categories/wooden_engraving.png'
};

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Fix Categories
        const cats = await ShopCategory.find();
        console.log(`\n📦 Processing ${cats.length} categories...`);
        let updated = 0;

        for (const cat of cats) {
            const normalizedName = cat.name.trim().toUpperCase();
            let newImage = null;

            if (CAT_IMAGE_MAP[normalizedName]) {
                newImage = CAT_IMAGE_MAP[normalizedName];
                console.log(`✓ MATCHED: "${cat.name}" -> ${newImage}`);
            } else if (!cat.image || cat.image === "" || cat.image.includes('placehold.co')) {
                newImage = `https://placehold.co/600x400/f3f4f6/374151?text=${encodeURIComponent(cat.name.trim())}`;
                console.log(`  Placeholder: "${cat.name}"`);
            }

            if (newImage && newImage !== cat.image) {
                await ShopCategory.updateOne({ _id: cat._id }, { $set: { image: newImage } });
                updated++;
            }
        }

        console.log(`\n✅ Updated ${updated} categories`);

        // Fix Subcategories
        const subs = await SubCategory.find();
        console.log(`\n📦 Processing ${subs.length} subcategories...`);
        let updatedSubs = 0;

        for (const sub of subs) {
            if (!sub.image || sub.image === "" || sub.image.includes('placehold.co')) {
                const placeholder = `https://placehold.co/400x300/f8fafc/64748b?text=${encodeURIComponent(sub.name.trim())}`;
                await SubCategory.updateOne({ _id: sub._id }, { $set: { image: placeholder } });
                updatedSubs++;
            }
        }

        console.log(`✅ Updated ${updatedSubs} subcategories`);
        console.log('\n🎉 All done!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

run();
