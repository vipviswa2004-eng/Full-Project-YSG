const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;

const run = async () => {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('yathes_sign_galaxy');
        const col = db.collection('shopcategories');

        const cats = await col.find({}).toArray();
        for (const cat of cats) {
            console.log('Updating:', cat.name);
            const placeholder = `https://placehold.co/600x400/f3f4f6/374151?text=${encodeURIComponent(cat.name.trim())}`;
            await col.updateOne({ _id: cat._id }, { $set: { image: placeholder } });
        }
        console.log('Done');
    } finally {
        await client.close();
    }
};

run();
