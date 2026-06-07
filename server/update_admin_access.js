require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models');

async function updateAdmins() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");

        const removeResult = await User.findOneAndUpdate(
            { email: 'signgalaxy31@gmail.com' },
            { $set: { isAdmin: false } },
            { new: true }
        );
        console.log("Remove admin access result:", removeResult ? removeResult.email + " isAdmin: " + removeResult.isAdmin : "User not found");

        const addResult = await User.findOneAndUpdate(
            { email: 'jr10102112@gmail.com' },
            { $set: { isAdmin: true } },
            { new: true }
        );
        console.log("Add admin access result:", addResult ? addResult.email + " isAdmin: " + addResult.isAdmin : "User not found");

        mongoose.disconnect();
    } catch (e) {
        console.error("Error:", e);
        mongoose.disconnect();
    }
}

updateAdmins();
