const { GoogleGenAI } = require('@google/genai');
const mongoose = require('mongoose');
const { Product } = require('./models');
const fs = require('fs');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function expandDescriptions() {
  const logStream = fs.createWriteStream('expand_log.txt', { flags: 'a' });
  const log = (msg) => {
    const time = new Date().toLocaleTimeString();
    console.log(`[${time}] ${msg}`);
    logStream.write(`[${time}] ${msg}\n`);
  };

  try {
    const data = JSON.parse(fs.readFileSync('poor_descriptions.json', 'utf8'));
    const allPoorProducts = [...data.missingProducts, ...data.poorProducts];
    
    await mongoose.connect(process.env.MONGO_URI);
    log('Connected to MongoDB');
    log(`Starting expansion for ${allPoorProducts.length} products. (Using 20s delay for safety)`);

    const modelName = 'gemini-2.5-flash';

    for (let i = 0; i < allPoorProducts.length; i++) {
      const p = allPoorProducts[i];
      
      const current = await Product.findOne({ id: p.id });
      const points = (current?.description || '').split(/\r?\n|•/).filter(l => l.trim().length > 5);
      
      if (points.length >= 4) {
        log(`[${i+1}/${allPoorProducts.length}] Skipping ${p.name} (Already has ${points.length} points)`);
        continue;
      }

      log(`[${i+1}/${allPoorProducts.length}] Processing: ${p.name} (${p.id})`);

      const prompt = `
        Product: ${p.name}
        Category: ${p.category}
        Existing: ${p.currentDescription || 'None'}
        
        Generate exactly 6 bullet points (using • symbol) for a professional personalized gift description.
        Points should cover Quality, Personalization, Occasions, Durability, Gift-readiness, and Special features.
        Keep any light color options mentioned. Return ONLY bullets.
      `;

      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt
        });

        if (response.text) {
          const newDesc = response.text.trim();
          if (newDesc.length > 20) {
            await Product.updateOne({ id: p.id }, { description: newDesc });
            log(`   OK Updated successfully.`);
          }
        }
      } catch (err) {
        if (err.message.includes('Resource has been exhausted') || err.message.includes('429')) {
          log('   RATE LIMIT HIT! Waiting 90 seconds...');
          await new Promise(resolve => setTimeout(resolve, 90000));
          i--;
          continue;
        } else {
          log(`   Error for ${p.id}: ${err.message}`);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 20000));
    }

    log('Success! All product descriptions expanded.');
    await mongoose.disconnect();
  } catch (err) {
    log(`Fatal ERROR: ${err.message}`);
  } finally {
    logStream.end();
  }
}

expandDescriptions();
