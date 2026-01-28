
const mongoose = require('mongoose');
const { SpecialOccasion } = require('./models');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function fixValentineId() {
    try {
        await mongoose.connect(MONGO_URI);

        // Find the valentine occasion
        const valentine = await SpecialOccasion.findOne({ name: /valentine/i });

        if (valentine) {
            console.log('Found valentine occasion with ID:', valentine.id);

            if (valentine.id !== 'valentine') {
                // We can't easily change the _id in MongoDB if it's the primary key, 
                // but here 'id' seems to be a separate field in the schema (or the string version of _id).
                // Let's check the schema.

                // If 'id' is a field:
                valentine.id = 'valentine';
                await valentine.save();
                console.log('Updated ID to "valentine"');
            } else {
                console.log('ID is already "valentine"');
            }
        } else {
            console.log('Valentine occasion not found in DB.');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixValentineId();
