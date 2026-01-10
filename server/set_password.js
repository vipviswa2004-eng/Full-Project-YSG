const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./models');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yathes_sign_galaxy";

async function setPassword(email, plainPassword) {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB Connected");

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found!`);
            process.exit(1);
        }

        console.log(`Found user: ${user.email}`);

        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        user.password = hashedPassword;

        await user.save();
        console.log(`✅ Password set successfully for ${email}`);
        console.log(`You can now login with:`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${plainPassword}`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

// Run for the user in the screenshot
setPassword('signgalaxy31@gmail.com', 'password123');
