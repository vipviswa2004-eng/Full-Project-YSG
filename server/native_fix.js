const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;

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
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        const db = client.db('yathes_sign_galaxy');
        const catsCol = db.collection('shopcategories');

        const cats = await catsCol.find({}).toArray();
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
            }

            if (newImage && newImage !== cat.image) {
                const result = await catsCol.updateOne(
                    { _id: cat._id },
                    { $set: { image: newImage } }
                );
                console.log(`  Updated: ${result.modifiedCount} document(s)`);
                updated++;
            }
        }

        console.log(`\n✅ Updated ${updated} categories`);

        // Verify
        const photoFrame = await catsCol.findOne({ name: /Photo Frame/i });
        console.log('\n🔍 Verification - Photo Frame image:', photoFrame?.image);

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await client.close();
    }
};

run();
