require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI).then(async () => {
    // console.log("Connected");
    const cols = await mongoose.connection.db.listCollections().toArray();
    console.log("---COLLECTIONS---");
    cols.forEach(c => console.log(c.name));
    console.log("---END---");
    process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
