const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Product, ShopCategory, SubCategory } = require('./models');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yathes_sign_galaxy";
const DOMAIN = 'https://signgalaxy.com';

async function generateSitemap() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for Sitemap generation");

        const products = await Product.find({ status: 'Active' });
        const categories = await ShopCategory.find();
        const subCategories = await SubCategory.find();

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${DOMAIN}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${DOMAIN}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${DOMAIN}/customize</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${DOMAIN}/corporate</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${DOMAIN}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${DOMAIN}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Categories -->
  ${categories.map(cat => `
  <url>
    <loc>${DOMAIN}/products?category=${encodeURIComponent(cat.name)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}

  <!-- SubCategories -->
  ${subCategories.map(sub => `
  <url>
    <loc>${DOMAIN}/products?subCategory=${encodeURIComponent(sub.name)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}

  <!-- Products -->
  ${products.map(p => `
  <url>
    <loc>${DOMAIN}/product/${p.id || p._id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join('')}
</urlset>`;

        const sitemapPath = path.join(__dirname, '..', 'frontend', 'public', 'sitemap.xml');
        fs.writeFileSync(sitemapPath, sitemap);
        console.log(`✅ Sitemap generated successfully at ${sitemapPath}`);
        console.log(`Total URLs: ${6 + categories.length + subCategories.length + products.length}`);

    } catch (err) {
        console.error("Error generating sitemap:", err);
    } finally {
        await mongoose.disconnect();
    }
}

generateSitemap();
