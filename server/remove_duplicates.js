
const mongoose = require('mongoose');
require('dotenv').config();

const LOCAL_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yathes_sign_galaxy";

const cleanDuplicates = async () => {
    try {
        await mongoose.connect(LOCAL_URI);
        const db = mongoose.connection.db;
        const collection = db.collection('products');

        const total = await collection.countDocuments();
        console.log(`Current Total Products: ${total}`);

        // 1. Check for duplicates by 'id'
        const duplicatesById = await collection.aggregate([
            { $group: { _id: "$id", count: { $sum: 1 }, docIds: { $push: "$_id" } } },
            { $match: { count: { $gt: 1 } } }
        ]).toArray();

        if (duplicatesById.length > 0) {
            console.log(`\nFound ${duplicatesById.length} sets of duplicates by 'id'. Cleaning...`);
            let removedCount = 0;

            for (const dup of duplicatesById) {
                // Keep the first one, delete the rest
                const [keep, ...remove] = dup.docIds;
                await collection.deleteMany({ _id: { $in: remove } });
                removedCount += remove.length;
                console.log(` - Fixed ID '${dup._id}': Removed ${remove.length} duplicates.`);
            }
            console.log(`\nRemoved ${removedCount} duplicate documents by ID.`);
        } else {
            console.log("\nNo duplicates found by 'id'. Checking by 'name'...");

            // 2. Check by Name if ID didn't find any
            const duplicatesByName = await collection.aggregate([
                { $group: { _id: "$name", count: { $sum: 1 }, docIds: { $push: "$_id" } } },
                { $match: { count: { $gt: 1 } } }
            ]).toArray();

            if (duplicatesByName.length > 0) {
                console.log(`\nFound ${duplicatesByName.length} sets of duplicates by 'name'. Cleaning...`);
                let removedCount = 0;
                for (const dup of duplicatesByName) {
                    const [keep, ...remove] = dup.docIds;
                    await collection.deleteMany({ _id: { $in: remove } });
                    removedCount += remove.length;
                    console.log(` - Fixed Name '${dup._id}': Removed ${remove.length} duplicates.`);
                }
                console.log(`\nRemoved ${removedCount} duplicate documents by Name.`);
            } else {
                console.log("\nNo duplicates found by 'name' either.");
            }
        }

        const finalCount = await collection.countDocuments();
        console.log(`\nFinal Total Products: ${finalCount}`);

        if (finalCount === 270) {
            console.log("✅ SUCCESS: Product count is exactly 270.");
        } else {
            console.log(`⚠️ TARGET MISSED: Expected 270, got ${finalCount}.`);
        }

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

cleanDuplicates();
