const mongoose = require('mongoose');
const { Product } = require('./models');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://viswakumar2004_db_user:yathes2026@cluster0.5r4mxg9.mongodb.net/yathes_sign_galaxy?retryWrites=true&w=majority&appName=Cluster0";

const RULES = [
    // Occasions
    { tag: 'Birthday', keywords: ['Birthday', 'Bday', 'Year'] },
    { tag: 'Wedding & Anniversary', keywords: ['Wedding', 'Anniversary', 'Marriage', 'Engagement', 'Bride', 'Groom', 'Spouse', 'Wifey', 'Hubby'] },
    { tag: 'Love & Romance', keywords: ['Love', 'Valentine', 'Romance', 'Heart', 'Date', 'Soulmate'] },
    { tag: 'For Kids', keywords: ['Kid', 'Child', 'Baby', 'School', 'Toy', 'Boy', 'Girl', 'Son', 'Daughter', 'Born'] },

    // Recipients
    { tag: 'Him', keywords: ['Him', 'Husband', 'Boyfriend', 'Dad', 'Father', 'Brother', 'Men', 'Man', 'Grandfather', 'Papa', 'Appa', 'Thatha', 'Hubby'] },
    { tag: 'Her', keywords: ['Her', 'Wife', 'Girlfriend', 'Mom', 'Mother', 'Sister', 'Woman', 'Women', 'Lady', 'Grandmother', 'Amma', 'Pati', 'Wifey'] },
    { tag: 'Couples', keywords: ['Couple', 'Pair', 'Husband & Wife', 'Mr & Mrs', 'Together', 'Wedding'] },
    { tag: 'Kids', keywords: ['Kid', 'Child', 'Baby', 'School', 'Toy', 'Boy', 'Girl', 'Son', 'Daughter'] },
    { tag: 'Parents', keywords: ['Parent', 'Mom & Dad', 'Father & Mother', 'Anniversary', 'Amma & Appa'] }
];

async function autoTagProducts() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const products = await Product.find({});
        console.log(`Found ${products.length} products to analyze.`);

        let updatedCount = 0;

        for (const p of products) {
            const nameLower = (p.name || '').toLowerCase();
            const currentOccasions = new Set(p.occasions || []);
            let modified = false;

            RULES.forEach(rule => {
                const match = rule.keywords.some(k => nameLower.includes(k.toLowerCase()));
                if (match) {
                    if (!currentOccasions.has(rule.tag)) {
                        currentOccasions.add(rule.tag);
                        modified = true;
                    }
                }
            });

            if (modified) {
                p.occasions = Array.from(currentOccasions);
                await p.save();
                updatedCount++;
                if (updatedCount % 10 === 0) process.stdout.write('.');
            }
        }

        console.log(`\n\nAuto-tagging complete. Updated ${updatedCount} products.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

autoTagProducts();
