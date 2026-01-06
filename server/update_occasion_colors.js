const mongoose = require('mongoose');
const { SpecialOccasion } = require('./models');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yathes_sign_galaxy";

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error(err));

const OCCASIONS_UPDATE = [
    {
        name: 'Birthday',
        color: 'from-pink-500 to-rose-500' // Matches the image pinkish/red
    },
    {
        name: 'Wedding & Anniversary',
        color: 'from-rosy-brown-500 to-red-400' // Adjusting to match image gradient roughly (usually a soft red/pink)
        // Wait, the user image shows:
        // Birthday: Pink
        // Wedding: Reddish/Pink
        // Love: Purple
        // Kids: Yellow/Orange
        // I will use standard tailwind classes that approximate this.
    },
    {
        name: 'Love & Romance',
        color: 'from-purple-500 to-indigo-500'
    },
    {
        name: 'For Kids',
        color: 'from-yellow-400 to-orange-500'
    }
];

// Refined colors based on "exactly like image" request
// Birthday: Strong pink/rose
// Wedding: Muted red/brown/pink
// Love: Deep purple/blue
// Kids: Sunny yellow/orange

const UPDATES = [
    { name: 'Birthday', color: 'from-pink-500 to-rose-500' },
    { name: 'Wedding & Anniversary', color: 'from-red-400 to-pink-600' },
    { name: 'Love & Romance', color: 'from-violet-600 to-indigo-600' },
    { name: 'For Kids', color: 'from-yellow-400 to-orange-500' }
];


async function updateOccasionColors() {
    try {
        for (const update of UPDATES) {
            const result = await SpecialOccasion.findOneAndUpdate(
                { name: update.name },
                { color: update.color },
                { new: true }
            );
            if (result) {
                console.log(`Updated color for ${update.name}`);
            } else {
                console.log(`Could not find ${update.name} to update color`);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

updateOccasionColors();
