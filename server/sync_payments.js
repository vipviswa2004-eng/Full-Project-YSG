
const mongoose = require('mongoose');
require('dotenv').config();
const { Order, Transaction } = require('./models');

async function syncDeliveredCODOrders() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Find all COD orders that are Delivered but still Unpaid
        const deliveredCODOrders = await Order.find({
            status: 'Delivered',
            paymentMethod: 'COD',
            paymentStatus: 'Unpaid'
        });

        console.log(`🔍 Found ${deliveredCODOrders.length} delivered COD orders that are currently marked as Unpaid.`);

        for (const order of deliveredCODOrders) {
            // Update Order to Paid
            order.paymentStatus = 'Paid';
            await order.save();

            // Find and update the corresponding transaction
            const orderRef = order.orderId || order._id.toString();
            const transaction = await Transaction.findOneAndUpdate(
                { orderId: orderRef },
                { status: 'Success' }
            );

            if (transaction) {
                console.log(`✅ Fixed: Order ${order.orderId || order._id} and Transaction ${transaction.id} synced.`);
            } else {
                // If no transaction exists (unlikely in latest version but possible for old data)
                // We might want to create one, but based on user prompt, we just sync existing.
                console.log(`⚠️ Fixed Order ${order.orderId || order._id}, but no transaction was found to update.`);
            }
        }

        console.log("\n✨ Initial sync completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Sync failed:", err);
        process.exit(1);
    }
}

syncDeliveredCODOrders();
