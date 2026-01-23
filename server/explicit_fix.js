const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;

const run = async () => {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('yathes_sign_galaxy');
        const col = db.collection('shopcategories');

        console.log('UPDATING ACRYLIC...');
        const res = await col.updateOne({ name: 'Acrylic' }, { $set: { image: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?q=80&w=400&fit=crop' } });
        console.log('Result:', res);

        const doc = await col.findOne({ name: 'Acrylic' });
        console.log('New doc image:', doc.image);
    } finally {
        await client.close();
    }
};

run();
