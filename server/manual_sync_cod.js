
const mongoose = require('mongoose');
require('dotenv').config();
const { Order, Transaction } = require('./models');

async function manualSyncDeliveredCOD() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB\n");

        // Find all delivered orders
        const deliveredOrders = await Order.find({ status: 'Delivered' });
        console.log(`📦 Found ${deliveredOrders.length} delivered orders total\n`);

        let updatedCount = 0;

        for (const order of deliveredOrders) {
            const isCOD = order.paymentMethod === 'COD';
            const isUnpaid = order.paymentStatus !== 'Paid';

            console.log(`Order: ${order.orderId || order._id}`);
            console.log(`  Payment Method: ${order.paymentMethod}`);
            console.log(`  Payment Status: ${order.paymentStatus}`);

            if (isCOD && isUnpaid) {
                console.log(`  ⚠️  NEEDS UPDATE - COD order delivered but not marked as Paid`);

                // Update order
                order.paymentStatus = 'Paid';
                await order.save();

                // Update transaction
                const txn = await Transaction.findOneAndUpdate(
                    { orderId: order.orderId || order._id.toString() },
                    { status: 'Success' },
                    { new: true }
                );

                if (txn) {
                    console.log(`  ✅ FIXED: Order and Transaction updated`);
                    updatedCount++;
                } else {
                    console.log(`  ⚠️  Order updated but no transaction found`);
                }
            } else {
                console.log(`  ✓ Already synced or not COD`);
            }
            console.log('');
        }

        console.log(`\n🎉 Sync complete! Updated ${updatedCount} orders.`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
}

manualSyncDeliveredCOD();
