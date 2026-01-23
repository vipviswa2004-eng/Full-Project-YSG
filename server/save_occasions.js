const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');

const mongoUri = process.env.MONGO_URI;

async function check() {
    try {
        await mongoose.connect(mongoUri);
        const special = await mongoose.connection.db.collection('specialoccasions').find({}).toArray();
        const shopOcc = await mongoose.connection.db.collection('shopoccasions').find({}).toArray();
        const shopRec = await mongoose.connection.db.collection('shoprecipients').find({}).toArray();

        const report = {
            special: special,
            shopOcc: shopOcc,
            shopRec: shopRec
        };

        fs.writeFileSync('occasions_report.json', JSON.stringify(report, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
