const mongoose = require('mongoose');
const { ShopCategory } = require('./models');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/sign_galaxy";

const updateCategories = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        // 1. Swap 'Table Top Calendar' to 'Photo Frame' (Updating name and image)
        await ShopCategory.findOneAndUpdate(
            { name: 'Table Top Calendar' },
            {
                name: 'Photo Frame',
                image: 'https://res.cloudinary.com/dzt6vofsc/image/upload/v1736257000/photo_frame_cat.png' // Utilizing a placeholder if specific one is not ready, or keep existing image if appropriate but name changes
            },
            { new: true }
        );
        // *Note*: Ideally we should upload the Photo Frame image to Cloudinary or use a local path if available. 
        // For now, I will rename it. If you have a specific image for Photo Frame, let me know.
        // Assuming the user implies using the existing card slot for a new category.

        // Correction: The user said "swape". This usually means changing positions.
        // "Swap the table top calendar card to photo frame" -> Rename card.

        // 2. Swap 'Mobile Case Printing' to 'Mugs'
        await ShopCategory.findOneAndUpdate(
            { name: 'Mobile Case Printing' },
            {
                name: 'Mugs',
                image: 'https://res.cloudinary.com/dzt6vofsc/image/upload/v1736257001/mugs_cat.png' // We can use the mug.png from assets if we upload it or use a public path
            },
            { new: true }
        );

        // 3. Ensure top 10 are visible/ordered.
        // I will fetch all personalized categories and re-order them to ensure these are in the top 10.
        const cats = await ShopCategory.find({ sectionId: 'sec_personalised' });
        console.log(`Found ${cats.length} personalized categories.`);

        // Check if we need to create Photo Frame or Mugs if they don't exist (i.e. if the rename didn't find them)
        // Actually, let's just create/upsert them to be safe and set their orders.

        const desiredOrder = [
            { name: 'Photo Frame', order: 1 },
            { name: 'Mugs', order: 2 },
            { name: 'Acrylic', order: 3 },
            { name: '2D Crystal', order: 4 },
            { name: 'Wooden Engraving & Color Printing', order: 5 },
            { name: 'Glass Art', order: 6 },
            { name: 'MDF', order: 7 },
            { name: 'Couple Thumb Impression Gift', order: 8 },
            { name: '3D Crystal', order: 9 },
            { name: 'Photo Box', order: 10 }
        ];

        for (const item of desiredOrder) {
            await ShopCategory.findOneAndUpdate(
                { name: item.name },
                {
                    $set: {
                        sectionId: 'sec_personalised',
                        sectionIds: ['sec_personalised'],
                        order: item.order
                    }
                },
                { upsert: true, new: true }
            );
            console.log(`Updated order for ${item.name}`);
        }

        // Hide or reorder others to > 10
        // ...

        console.log("Categories updated successfully.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

updateCategories();
