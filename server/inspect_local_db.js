const mongoose = require('mongoose');

const LOCAL_URI = "mongodb://localhost:27017/yathes_sign_galaxy";

mongoose.connect(LOCAL_URI)
    .then(async () => {
        console.log("Connected to Local DB");
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections found:");
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} documents`);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
