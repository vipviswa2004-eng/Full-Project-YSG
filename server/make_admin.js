const mongoose = require('mongoose');
const { User } = require('./models');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/sign_galaxy";

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log("Connected to DB");
        try {
            const email = "viswakumar2004@gmail.com";
            const user = await User.findOne({ email });
            if (user) {
                console.log(`Found user: ${user.email}, Is Admin: ${user.isAdmin}`);
                user.isAdmin = true;
                // Also ensure role is Super Admin if that schema exists
                if (!user.role) user.role = 'Super Admin';

                await user.save();
                console.log(`Updated user ${email} to Admin.`);
            } else {
                console.log(`User ${email} not found.`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error(err));
