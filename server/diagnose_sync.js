
const mongoose = require('mongoose');
require('dotenv').config();
const { Order, Transaction } = require('./models');

async function diagnoseAndFixSync() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB\n");

        // Find all orders
        const allOrders = await Order.find().sort({ date: -1 }).limit(10);

        console.log("📊 Current Order Status vs Payment Status:\n");

        for (const order of allOrders) {
            const txn = await Transaction.findOne({
                orderId: order.orderId || order._id.toString()
            });

            console.log(`Order: ${order.orderId || order._id}`);
            console.log(`  Payment Method: ${order.paymentMethod}`);
            console.log(`  Order Status: ${order.status}`);
            console.log(`  Payment Status: ${order.paymentStatus}`);
            console.log(`  Transaction Status: ${txn ? txn.status : 'NOT FOUND'}`);

            // Check for mismatches in COD orders
            if (order.paymentMethod === 'COD') {
                const shouldBePaid = order.status === 'Delivered';
                const isPaid = order.paymentStatus === 'Paid';
                const txnSuccess = txn && txn.status === 'Success';

                if (shouldBePaid !== isPaid || shouldBePaid !== txnSuccess) {
                    console.log(`  ⚠️  MISMATCH DETECTED!`);
                    console.log(`  Expected: ${shouldBePaid ? 'Paid/Success' : 'Unpaid/Pending'}`);
                    console.log(`  Fixing...`);

                    // Fix the order
                    order.paymentStatus = shouldBePaid ? 'Paid' : 'Unpaid';
                    await order.save();

                    // Fix the transaction
                    if (txn) {
                        txn.status = shouldBePaid ? 'Success' : 'Pending';
                        await txn.save();
                        console.log(`  ✅ FIXED!`);
                    }
                } else {
                    console.log(`  ✓ Synced correctly`);
                }
            }
            console.log('');
        }

        console.log("\n🎉 Diagnostic complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
}

diagnoseAndFixSync();
