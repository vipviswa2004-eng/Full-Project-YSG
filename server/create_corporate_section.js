const mongoose = require('mongoose');
const { Section } = require('./models');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yathes_sign_galaxy";

mongoose.connect(MONGO_URI).then(async () => {
    console.log("Connected to DB...");

    // 1. Ensure 'Personalised' is order 1
    await Section.findOneAndUpdate(
        { title: /Personal/i },
        { order: 1 }
    );
    console.log("Updated Personalised order to 1");

    // 2. Create or Update 'Corporate Gifts'
    let corporate = await Section.findOne({ title: /Corporate/i });
    if (!corporate) {
        corporate = await Section.create({
            id: 'sec_corporate',
            title: 'Corporate Gifts',
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=150&auto=format&fit=crop',
            order: 2
        });
        console.log("Created Corporate Gifts section.");
    } else {
        corporate.order = 2;
        await corporate.save();
        console.log("Updated Corporate Gifts order to 2.");
    }

    // 3. Verify
    const sections = await Section.find().sort({ order: 1 });
    console.log("Current Sections:", sections.map(s => `${s.title} (${s.order})`));

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
