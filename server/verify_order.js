const mongoose = require('mongoose');
const { Order } = require('./models');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/sign_galaxy";

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log("Connected to DB");
        try {
            const recentOrders = await Order.find().sort({ date: -1 }).limit(3);
            console.log("Recent 3 Orders:");
            recentOrders.forEach(o => {
                console.log(`ID: ${o.orderId}, Email: ${o.user ? o.user.email : 'N/A'}, Date: ${o.date}, Status: ${o.status}`);
                if (o.items && o.items.length > 0) {
                    console.log(` - Item 1 Custom Name: ${o.items[0].customName}`);
                    console.log(` - Item 1 Selected Vars: ${JSON.stringify(o.items[0].selectedVariations)}`);
                }
            });
        } catch (e) {
            console.error(e);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error(err));
