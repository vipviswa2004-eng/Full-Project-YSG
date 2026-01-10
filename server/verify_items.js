const mongoose = require('mongoose');
const { Order } = require('./models');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/sign_galaxy";

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log("Connected to DB");
        try {
            const latestOrder = await Order.findOne().sort({ date: -1 });
            if (latestOrder) {
                console.log("Latest Order Items:", JSON.stringify(latestOrder.items, null, 2));
            } else {
                console.log("No orders found.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error(err));
