import { Product, Shape, VariationOption } from '../types';

// Helper to determine shape cost
export const getShapeCost = (shape: Shape) => {
  if ([Shape.RECTANGLE, Shape.SQUARE, Shape.ROUND].includes(shape)) {
    return 400;
  }
  return 1000;
};

export const products: Product[] = [
  { id: '1001', code: '1001', name: '3D Crystal Portrait', category: '3D & 2D Crystal', pdfPrice: 700, shape: Shape.RECTANGLE, size: '6x4x4 cm', image: 'https://picsum.photos/400/400?random=1001', description: 'High-quality 3D laser engraved crystal. Additional image price ₹100 per head.', allowsExtraHeads: true, stock: 50, sku: 'CRY-1001', status: 'Active' },
  { id: '1033', code: '1033', name: 'Color 3D Printing', category: 'Color 3D Crystals', pdfPrice: 2000, shape: Shape.RECTANGLE, size: '9x14.5 cm', image: 'https://picsum.photos/400/400?random=1033', description: 'Vibrant full-color 3D printed crystal.', stock: 30, sku: 'COL-1033', status: 'Active' },
  { id: '1053', code: '1053', name: 'Apple Shape Crystal Light', category: '2D Crystal Glass Lighting Gifts', pdfPrice: 2200, shape: Shape.OTHER, size: '5x6.5 in', image: 'https://picsum.photos/400/400?random=1053', description: 'Illuminated 2D crystal.', stock: 25, sku: 'LGT-1053', status: 'Active' },
  { id: '1071', code: '1071', name: 'Glass Crystal Frame', category: 'Glass Crystal Engraving Frame', pdfPrice: 3600, shape: Shape.RECTANGLE, size: '13x9.7 in', image: 'https://picsum.photos/400/400?random=1071', description: 'Large glass crystal engraving frame.', stock: 15, sku: 'FRM-1071', status: 'Active' },
  { id: '1074', code: '1074', name: 'Wood Engraving Heart', category: 'Wood Engraving & Color Printing Gift', pdfPrice: 1000, shape: Shape.HEART, size: '7x6 in', image: 'https://picsum.photos/400/400?random=1074', description: 'Engraved wooden heart.', stock: 100, sku: 'WD-1074', status: 'Active' },
  { id: '1122', code: '1122', name: 'Mens Wallet', category: 'Wallets', pdfPrice: 550, shape: Shape.RECTANGLE, size: 'Standard', image: 'https://picsum.photos/400/400?random=1122', description: 'Personalized wallet.', stock: 200, sku: 'WAL-1122', status: 'Active' },
  { id: '1135', code: '1135', name: 'Acrylic Photo Clock', category: 'Wall Clocks', pdfPrice: 1100, shape: Shape.ROUND, size: '12 in', image: 'https://picsum.photos/400/400?random=1135', description: 'Customized acrylic wall clock.', stock: 40, sku: 'CLK-1135', status: 'Active' },
  { id: '1153', code: '1153', name: 'Acrylic Cutout', category: 'Acrylic Cut Out', pdfPrice: 1300, shape: Shape.OTHER, size: '12x8 in', image: 'https://picsum.photos/400/400?random=1153', description: 'Full body photo cutout.', stock: 60, sku: 'CUT-1153', status: 'Active' },
  { id: '1157', code: '1157', name: 'Frameless Acrylic', category: 'Acrylic Photo Frames', pdfPrice: 400, shape: Shape.RECTANGLE, size: '6x4 in', image: 'https://picsum.photos/400/400?random=1157', description: 'Glossy frameless acrylic print.', stock: 150, sku: 'ACR-1157', status: 'Active' },
  { id: '1172', code: '1172', name: 'Neon Heart Light', category: 'Neon Light Gifts', pdfPrice: 1500, shape: Shape.HEART, size: '8 in', image: 'https://picsum.photos/400/400?random=1172', description: 'Neon LED glow lamp.', stock: 20, sku: 'NEO-1172', status: 'Active' },
  { id: '1200', code: '1200', name: 'Acrylic Love Lamp', category: 'Acrylic Lamp Gifts Engraving & Color Printing', pdfPrice: 1200, shape: Shape.HEART, size: '8 in', image: 'https://picsum.photos/400/400?random=1200', description: 'Engraved acrylic lamp.', stock: 45, sku: 'LMP-1200', status: 'Active' },
  { id: '1219', code: '1219', name: 'Caricature Stand', category: 'Caricature', pdfPrice: 700, shape: Shape.OTHER, size: '6.7x7.6 in', image: 'https://picsum.photos/400/400?random=1219', description: 'Fun caricature cutout.', stock: 60, sku: 'CAR-1219', status: 'Active' },
  { id: '1262', code: '1262', name: 'Moon Lamp', category: 'Moon Lamp', pdfPrice: 1750, shape: Shape.ROUND, size: '15 cm', image: 'https://picsum.photos/400/400?random=1262', description: '3D printed moon lamp.', stock: 35, sku: 'MUN-1262', status: 'Active' },
  { id: '1264', code: '1264', name: 'Photo Magnet', category: 'Fridge Magnet', pdfPrice: 350, shape: Shape.ROUND, size: '3.5 in', image: 'https://picsum.photos/400/400?random=1264', description: 'Acrylic photo magnet.', stock: 300, sku: 'MAG-1264', status: 'Active' },
  { id: '1275', code: '1275', name: 'Plug Night Lamp', category: 'Plug Night Lamp', pdfPrice: 600, shape: Shape.RECTANGLE, size: '10x10 cm', image: 'https://picsum.photos/400/400?random=1275', description: 'Plug-in night lamp.', stock: 80, sku: 'PLG-1275', status: 'Active' },
  { id: '1289', code: '1289', name: 'Emoji Pillow', category: 'Pillows', pdfPrice: 680, shape: Shape.ROUND, size: '15 in', image: 'https://picsum.photos/400/400?random=1289', description: 'Soft fur pillow.', stock: 45, sku: 'PIL-1289', status: 'Active' },
  { id: '1312', code: '1312', name: 'Custom Mug', category: 'Mugs', pdfPrice: 500, shape: Shape.ROUND, size: '350 ml', image: 'https://picsum.photos/400/400?random=1312', description: 'Ceramic mug.', stock: 500, sku: 'MUG-1312', status: 'Active' },
  { id: '1335', code: '1335', name: 'Printed T-Shirt', category: 'T-Shirts', pdfPrice: 800, shape: Shape.OTHER, size: 'L', image: 'https://picsum.photos/400/400?random=1335', description: 'Cotton t-shirt.', stock: 100, sku: 'TSH-1335', status: 'Active' },
  { id: '1340', code: '1340', name: 'MDF Table Frame', category: 'MDF Table Frames', pdfPrice: 600, shape: Shape.RECTANGLE, size: '8x6 in', image: 'https://picsum.photos/400/400?random=1340', description: 'Wooden frame.', stock: 70, sku: 'MDF-1340', status: 'Active' },
  { id: '1377', code: '1377', name: 'MDF Wall Frame', category: 'MDF Wall Frames', pdfPrice: 1400, shape: Shape.ROUND, size: '14 in', image: 'https://picsum.photos/400/400?random=1377', description: 'Wall collage.', stock: 40, sku: 'MDF-1377', status: 'Active' },
  { id: '1406', code: '1406', name: 'Shadow Wall Frame', category: 'MDF Shadow Wall Frame', pdfPrice: 1300, shape: Shape.HEART, size: '12 in', image: 'https://picsum.photos/400/400?random=1406', description: 'Shadow box frame.', stock: 30, sku: 'SHD-1406', status: 'Active' },
  { id: '1412', code: '1412', name: 'Car Idol', category: 'Car Idol', pdfPrice: 1900, shape: Shape.RECTANGLE, size: 'Standard', image: 'https://picsum.photos/400/400?random=1412', description: 'Crystal idol.', stock: 50, sku: 'IDL-1412', status: 'Active' },
  { id: '1436', code: '1436', name: 'Metal Pen', category: 'Pen Gift', pdfPrice: 140, shape: Shape.OTHER, size: 'Standard', image: 'https://picsum.photos/400/400?random=1436', description: 'Engraved pen.', stock: 500, sku: 'PEN-1436', status: 'Active' },
  { id: '1441', code: '1441', name: 'Steel Bottle', category: 'Water Bottle', pdfPrice: 750, shape: Shape.ROUND, size: '1000 ml', image: 'https://picsum.photos/400/400?random=1441', description: 'Custom bottle.', stock: 100, sku: 'BOT-1441', status: 'Active' },
  { id: '1445', code: '1445', name: 'Canvas Print', category: 'Canvas Photo Frames', pdfPrice: 1250, shape: Shape.RECTANGLE, size: '12x8 in', image: 'https://picsum.photos/400/400?random=1445', description: 'Canvas frame.', stock: 60, sku: 'CNV-1445', status: 'Active' },
  { id: '1460', code: '1460', name: 'Lighting Wall Frame', category: 'Lighting Wall Photo Frames', pdfPrice: 900, shape: Shape.RECTANGLE, size: 'A4', image: 'https://picsum.photos/400/400?random=1460', description: 'Backlit frame.', stock: 40, sku: 'LFR-1460', status: 'Active' },
  { id: '1492', code: '1492', name: 'Crystal Keychain', category: 'Key Chains', pdfPrice: 400, shape: Shape.RECTANGLE, size: '3x3 cm', image: 'https://picsum.photos/400/400?random=1492', description: 'Key chain.', stock: 300, sku: 'KEY-1492', status: 'Active' },
  { id: '1524', code: '1524', name: 'Light Box', category: 'Acrylic Light Box', pdfPrice: 880, shape: Shape.SQUARE, size: '3x3 in', image: 'https://picsum.photos/400/400?random=1524', description: 'Rotating light box.', stock: 25, sku: 'BOX-1524', status: 'Active' },
  { id: '1531', code: '1531', name: 'Cake Topper', category: 'Cake Topper', pdfPrice: 600, shape: Shape.OTHER, size: 'Standard', image: 'https://picsum.photos/400/400?random=1531', description: 'Cake decoration.', stock: 100, sku: 'TOP-1531', status: 'Active' },
  { id: '1537', code: '1537', name: 'Table Calendar', category: 'Table Top Calendar', pdfPrice: 860, shape: Shape.RECTANGLE, size: '6x8 in', image: 'https://picsum.photos/400/400?random=1537', description: 'Desk calendar.', stock: 50, sku: 'CAL-1537', status: 'Active' },
  { id: '1538', code: '1538', name: 'Glass Trophy', category: 'Crystal and Glass Trophy', pdfPrice: 1600, shape: Shape.OTHER, size: '7.5 in', image: 'https://picsum.photos/400/400?random=1538', description: 'Glass award.', stock: 30, sku: 'TRP-1538', status: 'Active' },
  { id: '1554', code: '1554', name: 'Acrylic Trophy', category: 'Acrylic Trophy', pdfPrice: 1100, shape: Shape.OTHER, size: '7.5 in', image: 'https://picsum.photos/400/400?random=1554', description: 'Acrylic award.', stock: 40, sku: 'TRP-1554', status: 'Active' },
  { id: '1571', code: '1571', name: 'MDF Trophy', category: 'MDF Trophy', pdfPrice: 1000, shape: Shape.RECTANGLE, size: '7.25 in', image: 'https://picsum.photos/400/400?random=1571', description: 'Wooden plaque.', stock: 60, sku: 'TRP-1571', status: 'Active' },
  { id: '1584', code: '1584', name: 'Mobile Case', category: 'Mobile Case', pdfPrice: 300, shape: Shape.RECTANGLE, size: 'Various', image: 'https://picsum.photos/400/400?random=1584', description: 'Phone cover.', stock: 500, sku: 'MOB-1584', status: 'Active' },
  { id: '1586', code: '1586', name: 'Pooja Gift', category: '5 God Pooja Room Gift', pdfPrice: 1795, shape: Shape.RECTANGLE, size: '6.75 in', image: 'https://picsum.photos/400/400?random=1586', description: 'Crystal gods.', stock: 20, sku: 'GOD-1586', status: 'Active' },
  { id: '1588', code: '1588', name: 'Resin Art', category: 'Resin Art Gift', pdfPrice: 1300, shape: Shape.HEART, size: '6x6 in', image: 'https://picsum.photos/400/400?random=1588', description: 'Resin frame.', stock: 15, sku: 'RES-1588', status: 'Active' },
  { id: '1592', code: '1592', name: 'Thumb Impression', category: 'Couple Thump Impression Gift', pdfPrice: 1300, shape: Shape.RECTANGLE, size: '12x8 in', image: 'https://picsum.photos/400/400?random=1592', description: 'Thumb frame.', stock: 20, sku: 'THM-1592', status: 'Active' },
  { id: '1594', code: '1594', name: 'Wooden Table Top', category: 'New Wooden Table Top Engraving and Color Printing Gift', pdfPrice: 1200, shape: Shape.HEART, size: '5x5 in', image: 'https://picsum.photos/400/400?random=1594', description: 'Wood slice.', stock: 35, sku: 'WD-1594', status: 'Active' },
  { id: '1606', code: '1606', name: 'God Illusion', category: 'Acrylic Illusion Gods', pdfPrice: 1000, shape: Shape.OTHER, size: '5 in', image: 'https://picsum.photos/400/400?random=1606', description: 'Illusion lamp.', stock: 50, sku: 'GOD-1606', status: 'Active' },
  { id: '100', code: '100', name: 'Door Glass Engraving', category: 'Door Glass Engraving', pdfPrice: 2500, shape: Shape.CUSTOM, customShapeCost: 1500, size: 'Custom', image: 'https://picsum.photos/400/400?random=100', description: 'Custom glass work.', stock: 10, sku: 'GLS-100', status: 'Active' },
  { id: '101', code: '101', name: 'CNC Jally', category: 'CNC Jally Work', pdfPrice: 1800, shape: Shape.RECTANGLE, size: 'Sq ft', image: 'https://picsum.photos/400/400?random=101', description: 'CNC cutting.', stock: 100, sku: 'CNC-101', status: 'Active' },
  { id: '102', code: '102', name: 'Sign Board', category: 'Sign Board', pdfPrice: 3000, shape: Shape.RECTANGLE, size: 'Custom', image: 'https://picsum.photos/400/400?random=102', description: 'LED Signage.', stock: 50, sku: 'SGN-102', status: 'Active' },
  { id: '103', code: '103', name: 'Wooden Door', category: 'Wooden Door Engraving', pdfPrice: 5000, shape: Shape.RECTANGLE, size: 'Door Size', image: 'https://picsum.photos/400/600?random=103', description: 'Door carving.', stock: 5, sku: 'DOR-103', status: 'Active' }
];

export const calculatePrice = (
  product: Product,
  extraHeads: number = 0,
  selectedVariations: Record<string, VariationOption> = {}
) => {
  // --- DEFAULT VARIATION DETECTION ---
  // If no variations are explicitly selected (e.g. on Shop page cards),
  // automatically use any options marked as isDefault by the admin.
  let effectiveVariations = selectedVariations;
  if (Object.keys(selectedVariations).length === 0 && product.variations) {
    const defaults: Record<string, VariationOption> = {};
    product.variations.forEach(v => {
      const def = v.options.find(o => o.isDefault);
      if (def) defaults[v.id] = def;
    });
    effectiveVariations = defaults;
  }

  // Use product.mrp/finalPrice as base if available, otherwise fallback to pdfPrice
  let baseMRP = Number(product.mrp || product.pdfPrice || 0);
  let baseFinal = Number(product.finalPrice || (product.pdfPrice ? Math.round(product.pdfPrice * (1 - (product.discount || 0) / 100)) : 0));

  // --- RUNTIME FIX: Ensure Base Final is X9 (Skip if Manual) ---
  if (baseFinal > 0 && !product.isManualDiscount) {
    if ((baseFinal + 1) % 10 !== 0) {
      // Force to X9
      const normalizedFinal = Math.round(baseFinal / 10) * 10 - 1;
      baseFinal = normalizedFinal > 0 ? normalizedFinal : 9;
    }
  }

  // --- RUNTIME FIX: Ensure Base MRP is X99 AND Diff >= 1000 (Skip if Manual, UNLESS it's a Combo) ---
  // If MRP does not end in 99 OR is less than 1.2x Final Price OR Diff < 1000, force recalculate
  // For Combos, we ALWAYS want to show a "Worth" price, so we force this check.
  if (baseFinal > 0 && (!product.isManualDiscount || product.isComboOffer)) {
    const isPremium = (baseMRP + 1) % 100 === 0 && baseMRP > baseFinal * 1.15 && (baseMRP - baseFinal >= 1000);
    if (!isPremium) {
      // Recalculate Logic: Target 1.6x, round to X99
      let target = baseFinal * 1.6;
      let minDiffMRP = baseFinal + 1000;

      let absMin = Math.max(Math.ceil(baseFinal * 1.35), minDiffMRP);

      let base = Math.floor(absMin / 100) * 100;

      let candidates = [
        base - 100 + 99,
        base + 99,
        base + 100 + 99,
        base + 200 + 99
      ];
      candidates = candidates.filter(c => c >= absMin);

      if (candidates.length > 0) {
        // Find closest
        baseMRP = candidates.reduce((prev, curr) =>
          Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
        );
      } else {
        // Fallback
        let approx = Math.ceil(baseFinal * 1.5);
        let fbBase = Math.floor(approx / 100) * 100;
        let fbMRP = fbBase + 99;
        if (fbMRP < absMin) fbMRP = Math.floor(absMin / 100) * 100 + 99;
        if (fbMRP < absMin) fbMRP += 100;
        baseMRP = fbMRP;
      }
    }
  }

  let variationsMRP = 0;
  let variationsFinal = 0;
  let hasAbsoluteVariation = false;

  // Track if any selected variation provides an absolute base price (like "Size")
  Object.values(effectiveVariations).forEach(option => {
    if (option.finalPrice !== undefined && option.mrp !== undefined) {
      let optFinal = Number(option.finalPrice);
      let optMRP = Number(option.mrp);

      // --- RUNTIME FIX: Ensure Variation Final is X9 (Skip if Manual) ---
      if (optFinal > 0 && !option.isManualDiscount) {
        if ((optFinal + 1) % 10 !== 0) {
          const normalizedOptFinal = Math.round(optFinal / 10) * 10 - 1;
          optFinal = normalizedOptFinal > 0 ? normalizedOptFinal : 9;
        }
      }

      // --- RUNTIME FIX: Ensure Variation MRP is X99 AND Diff >= 1000 (Skip if Manual, UNLESS it's a Combo) ---
      if (optFinal > 0 && (!option.isManualDiscount || product.isComboOffer)) {
        const isOptPremium = (optMRP + 1) % 100 === 0 && optMRP > optFinal * 1.15 && (optMRP - optFinal >= 1000);
        if (!isOptPremium) {
          let target = optFinal * 1.6;
          let minDiffMRP = optFinal + 1000;
          let absMin = Math.max(Math.ceil(optFinal * 1.35), minDiffMRP);

          let base = Math.floor(absMin / 100) * 100;
          let candidates = [base - 100 + 99, base + 99, base + 100 + 99];

          candidates = candidates.filter(c => c >= absMin);

          if (candidates.length > 0) {
            optMRP = candidates.reduce((prev, curr) => Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev);
          } else {
            let approx = Math.ceil(optFinal * 1.5);
            let fbBase = Math.floor(approx / 100) * 100;
            let fbMRP = fbBase + 99;
            if (fbMRP < absMin) fbMRP = Math.floor(absMin / 100) * 100 + 99;
            if (fbMRP < absMin) fbMRP += 100;
            optMRP = fbMRP;
          }
        }
      }

      variationsMRP += optMRP;
      variationsFinal += optFinal;
      hasAbsoluteVariation = true;
    } else {
      // Fallback to priceAdjustment
      const adj = Number(option.priceAdjustment || 0);
      variationsMRP += adj;
      variationsFinal += adj;
    }
  });

  // If we have an absolute variation (like Size), it replaces the base product price
  if (hasAbsoluteVariation) {
    baseMRP = 0;
    baseFinal = 0;
  }

  // Additional heads cost
  const pricePerHead = product.additionalHeadsConfig?.pricePerHead || 125;
  const headCost = extraHeads * pricePerHead;

  const totalMRP = baseMRP + variationsMRP + headCost;
  const totalFinal = baseFinal + variationsFinal + headCost;

  return {
    original: Math.round(totalMRP),
    final: Math.round(totalFinal),
    breakdown: {
      base: baseFinal,
      mrp: baseMRP,
      variations: variationsFinal,
      heads: headCost
    }
  };
};