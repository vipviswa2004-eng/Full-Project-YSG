const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const cats = await mongoose.connection.db.collection('shopcategories').find({
        $or: [
            { sectionIds: { $exists: false } },
            { sectionIds: { $size: 0 } },
            { sectionIds: null }
        ]
    }).toArray();

    console.log(`Found ${cats.length} categories with missing/empty sectionIds:`);
    cats.forEach(c => console.log(`- ${c.name} (sectionId: ${c.sectionId})`));

    if (cats.length > 0) {
        console.log("Fixing them...");
        for (const cat of cats) {
            if (cat.sectionId) {
                await mongoose.connection.db.collection('shopcategories').updateOne(
                    { _id: cat._id },
                    { $set: { sectionIds: [cat.sectionId] } }
                );
            }
        }
        console.log("Fixed.");
    }
    process.exit(0);
}
run();
