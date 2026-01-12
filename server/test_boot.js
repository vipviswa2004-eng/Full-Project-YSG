
require('dotenv').config();
const mongoose = require('mongoose');
const { Product } = require('./models');
console.log("Models loaded");
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/sign_galaxy";
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("DB Connected");
        process.exit(0);
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
