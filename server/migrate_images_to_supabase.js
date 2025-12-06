const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { Product } = require('./models');
const { uploadImage } = require('./supabase');

/**
 * Migrate local images to Supabase
 * This script will:
 * 1. Find all products with local image URLs
 * 2. Upload those images to Supabase
 * 3. Update the product records with new Supabase URLs
 */
async function migrateImagesToSupabase() {
    try {
        // Check if Supabase is configured
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            console.error('❌ Supabase credentials not found in .env file');
            console.log('\nPlease add the following to your .env file:');
            console.log('SUPABASE_URL=your_supabase_project_url');
            console.log('SUPABASE_ANON_KEY=your_supabase_anon_key');
            return;
        }

        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const products = await Product.find();
        console.log(`Found ${products.length} products\n`);

        let uploadedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const product of products) {
            console.log(`\n📦 Processing: ${product.name}`);

            // Process main image
            if (product.image && product.image.includes('localhost')) {
                try {
                    const imagePath = product.image.replace('http://localhost:5000/', '');
                    const localPath = path.join(__dirname, imagePath);

                    if (fs.existsSync(localPath)) {
                        const imageBuffer = fs.readFileSync(localPath);
                        const fileName = path.basename(localPath);

                        console.log(`  📤 Uploading main image: ${fileName}`);
                        const result = await uploadImage(imageBuffer, fileName, 'product-images');

                        product.image = result.url;
                        uploadedCount++;
                        console.log(`  ✅ Uploaded to: ${result.url}`);
                    } else {
                        console.log(`  ⚠️ Local file not found: ${localPath}`);
                        skippedCount++;
                    }
                } catch (error) {
                    console.error(`  ❌ Error uploading main image:`, error.message);
                    errorCount++;
                }
            }

            // Process gallery images
            if (product.gallery && product.gallery.length > 0) {
                const newGallery = [];

                for (const galleryUrl of product.gallery) {
                    if (galleryUrl.includes('localhost')) {
                        try {
                            const imagePath = galleryUrl.replace('http://localhost:5000/', '');
                            const localPath = path.join(__dirname, imagePath);

                            if (fs.existsSync(localPath)) {
                                const imageBuffer = fs.readFileSync(localPath);
                                const fileName = path.basename(localPath);

                                console.log(`  📤 Uploading gallery image: ${fileName}`);
                                const result = await uploadImage(imageBuffer, fileName, 'product-images');

                                newGallery.push(result.url);
                                uploadedCount++;
                                console.log(`  ✅ Uploaded to: ${result.url}`);
                            } else {
                                console.log(`  ⚠️ Local file not found: ${localPath}`);
                                newGallery.push(galleryUrl);
                                skippedCount++;
                            }
                        } catch (error) {
                            console.error(`  ❌ Error uploading gallery image:`, error.message);
                            newGallery.push(galleryUrl);
                            errorCount++;
                        }
                    } else {
                        newGallery.push(galleryUrl);
                    }
                }

                product.gallery = newGallery;
            }

            // Save updated product
            await product.save();
            console.log(`  💾 Product updated in database`);
        }

        console.log('\n' + '='.repeat(50));
        console.log('📊 Migration Summary:');
        console.log('='.repeat(50));
        console.log(`✅ Successfully uploaded: ${uploadedCount} images`);
        console.log(`⚠️ Skipped: ${skippedCount} images`);
        console.log(`❌ Errors: ${errorCount} images`);
        console.log('='.repeat(50));

        await mongoose.disconnect();
        console.log('\n✅ Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

// Run the migration
migrateImagesToSupabase();
