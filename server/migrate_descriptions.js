
require('dotenv').config();
const mongoose = require('mongoose');
const { Product } = require('./models');

// Content Generators
const getContent = (product) => {
    const cat = (product.category || '').toLowerCase();
    const nm = (product.name || '').toLowerCase();

    // 1. T-Shirts / Apparel
    if (cat.includes('t-shirt') || nm.includes('t-shirt') || cat.includes('apparel')) {
        return {
            description: [
                "Premium Quality Fabric: Soft, breathable cotton-rich blend for all-day comfort.",
                "High-Definition Digital Printing: Vibrant colors with long-lasting print durability.",
                "Comfortable Fit: Precision-cut for a modern, relaxed silhouette.",
                "Perfect Personalized Gift: Ideal for special occasions, team wear, or personal keepsakes."
            ],
            instructions: [
                "Fabric Care: Machine wash cold with similar colors, inside out.",
                "Ironing: Do not iron directly on the printed area; iron on the reverse side.",
                "Detergent: Use mild detergent only; do not bleach or dry clean.",
                "Drying: Tumble dry low or hang dry in shade to maintain print quality."
            ]
        };
    }

    // 2. Crystal / Glass
    if (cat.includes('crystal') || cat.includes('glass') || nm.includes('crystal')) {
        return {
            description: [
                "Optical Grade K9 Crystal: High-purity crystal with exceptional clarity and brilliance.",
                "Advanced 3D Laser Engraving: Intricate designs etched deep inside for a lifetime of beauty.",
                "Polished Edges: Smooth, bevelled finishes that catch and reflect light elegantly.",
                "Premium Keepsake: A sophisticated decor piece for home or executive office spaces."
            ],
            instructions: [
                "Handling: Handle with care to avoid chipping or surface scratches.",
                "Cleaning: Gently wipe with a soft, lint-free microfiber cloth for a streak-free shine.",
                "Lighting Notes: Place on an LED light base (if available) to bring out the 3D details.",
                "Avoid: Keep away from direct heat and harsh chemical cleaners."
            ]
        };
    }

    // 3. Mugs
    if (cat.includes('mug') || nm.includes('mug')) {
        return {
            description: [
                "High-Grade Ceramic: Durable material with a smooth, glossy premium finish.",
                "Vibrant Sublimation Print: Full-color wrap-around graphics that won't fade.",
                "Ergonomic Handle: Designed for a comfortable grip while enjoying hot or cold beverages.",
                "Everyday Utility: Dishwasher-friendly (standard white) and microwave safe."
            ],
            instructions: [
                "Washing: Gentle hand wash with a soft sponge is recommended for longest print life.",
                "Scrubbing: Avoid using metallic scrubbers or abrasive pads on the printed design.",
                "Heat: Durable for boiling liquids; avoid sudden extreme temperature changes.",
                "Storage: Store in a dry place to maintain the outer glossy coating."
            ]
        };
    }

    // 4. Lamps / Light
    if (cat.includes('lamp') || nm.includes('lamp') || cat.includes('light')) {
        return {
            description: [
                "Ambient Illumination: Low-energy LED light source providing a warm, comforting glow.",
                "Custom Acrylic Panel: High-transparency acrylic with precision-etched personalized detail.",
                "Sleek Support Base: Modern, sturdy base design with integrated power controls.",
                "Versatile Decor: Ideal as a bedroom night light, nursery lamp, or personalized desk accessory."
            ],
            instructions: [
                "Power Safety: Use only the provided USB cable or recommended 5V adapter.",
                "Surface Cleaning: Use a dry, soft cloth to remove fingerprints from the acrylic panel.",
                "Usage: Do not leave the lamp powered on continuously for more than 24 hours.",
                "Handling: Do not touch the internal LED components or electrical parts."
            ]
        };
    }

    // 5. Wood / Frames / MDF
    if (cat.includes('wood') || cat.includes('mdf') || cat.includes('frame') || nm.includes('frame')) {
        return {
            description: [
                "Quality Craftsmanship: Made from high-density MDF or natural wood with a refined finish.",
                "High-Resolution Print/Engraving: Sharp details with UV-resistant inks or laser precision.",
                "Easy Display: Designed for quick wall mounting or stable tabletop placement.",
                "Timeless Aesthetic: Neutral wood tones that complement any interior decor style."
            ],
            instructions: [
                "Dusting: Regularly wipe with a soft, dry cloth to prevent dust buildup.",
                "Moisture Protection: Keep in a dry, well-ventilated area; avoid damp environment.",
                "Sunlight Exposure: Avoid prolonged direct sunlight to prevent natural wood fading.",
                "Maintenance: Do not use wet wipes or water-based cleaners on engraved areas."
            ]
        };
    }

    // Fallback
    return {
        description: [
            "Premium quality personalized gift.",
            "Expertly crafted for your special moments.",
            "Made with high-quality materials to ensure durability.",
            "A perfect addition to your home or a thoughtful gift."
        ],
        instructions: [
            "Handle with care to maintain the product's finish and longevity.",
            "Clean with a soft, dry cloth to remove dust and fingerprints.",
            "Keep in a cool, dry place away from direct moisture or humidity.",
            "Avoid exposure to harsh chemicals or abrasive cleaning agents."
        ]
    };
};

// Delivery Content (Common)
const deliveryContent = [
    "Shipping: Delivery in 5-7 business days across India.",
    "Processing: Delivery time depends on location and courier partner.",
    "Returns: 7-day replacement policy for damaged items."
].join('\n');

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for migration...");

        const products = await Product.find({});
        console.log(`Found ${products.length} products. Checking for missing descriptions...`);

        let updatedCount = 0;

        for (const p of products) {
            let needsUpdate = false;

            // Generate content
            const content = getContent(p);
            const descText = content.description.join('\n');
            const instrText = content.instructions.join('\n');

            // 1. Update basic description if missing
            if (!p.description || p.description.trim() === '') {
                p.description = descText;
                needsUpdate = true;
            }

            // 2. Update aboutSections if missing
            if (!p.aboutSections || p.aboutSections.length === 0) {
                p.aboutSections = [
                    {
                        id: 'description',
                        title: 'Description',
                        content: descText,
                        isHidden: false
                    },
                    {
                        id: 'instructions',
                        title: 'Instructions',
                        content: instrText,
                        isHidden: false
                    },
                    {
                        id: 'delivery',
                        title: 'Delivery Info',
                        content: deliveryContent,
                        isHidden: false
                    }
                ];
                needsUpdate = true;
            }

            if (needsUpdate) {
                await p.save();
                updatedCount++;
                if (updatedCount % 10 === 0) process.stdout.write('.');
            }
        }

        console.log(`\nMigration Complete. Updated ${updatedCount} products.`);
        process.exit(0);

    } catch (error) {
        console.error("Migration Failed:", error);
        process.exit(1);
    }
};

migrate();
