// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Product, User, Order, Review, Category, Shape, Size, Section, ShopCategory, SubCategory, Seller, Transaction, ReturnRequest, Coupon, SpecialOccasion, ShopOccasion, ShopRecipient, GiftGenieQuery, WhatsAppLead } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
console.log("---------------------------------------------------");
console.log("DEBUG: process.env.MONGO_URI:", process.env.MONGO_URI ? "DEFINED" : "UNDEFINED");
console.log("DEBUG: Connecting to:", MONGO_URI);
console.log("---------------------------------------------------");

// Seed Shop Recipients
const seedRecipients = async () => {
  try {
    console.log("Seeding/Updating default Shop Recipients...");
    const defaults = [
      { id: 'rec_him', name: 'For Him', link: '/products?recipient=Him', order: 1, image: '/recipients/recipient_him.png' },
      { id: 'rec_her', name: 'For Her', link: '/products?recipient=Her', order: 2, image: '/recipients/recipient_her.png' },
      { id: 'rec_couples', name: 'For Couples', link: '/products?recipient=Couples', order: 3, image: '/recipients/recipient_couples.png' },
      { id: 'rec_kids', name: 'For Kids', link: '/products?recipient=Kids', order: 4, image: '/recipients/recipient_kids.png' },
      { id: 'rec_parents', name: 'For Parents', link: '/products?recipient=Parents', order: 5, image: '/recipients/recipient_parents.png' }
    ];

    for (const rec of defaults) {
      await ShopRecipient.findOneAndUpdate({ id: rec.id }, rec, { upsert: true, new: true });
    }
    console.log("Default Shop Recipients seeded/updated.");
  } catch (err) {
    console.error("Error seeding recipients:", err);
  }
};

// -------- MIDDLEWARE --------
const corsOptions = {
  origin: true, // Allow all origins (reflects request origin) to fix CORS issues in dev
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Cache-Control"]
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));




// Cloudinary is used for all image uploads. No local storage used.

// ---------- MULTER UPLOAD ----------
const multer = require('multer');
const path = require('path');
const { uploadImage } = require('./cloudinary');

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for Cloudinary
  }
});

app.post('/api/upload', upload.single('image'), async (req, res) => {
  console.log('📤 [UPLOAD] Request received');
  console.log('📤 [UPLOAD] File present:', !!req.file);
  console.log('📤 [UPLOAD] File details:', req.file ? {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : 'No file');

  try {
    if (!req.file) {
      console.error('❌ [UPLOAD] No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if Cloudinary is configured
    const cloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
    console.log('📤 [UPLOAD] Cloudinary configured:', cloudinaryConfigured);

    if (cloudinaryConfigured) {
      console.log('📤 [UPLOAD] Starting Cloudinary upload...');
      // Upload to Cloudinary
      const result = await uploadImage(
        req.file.buffer,
        req.file.originalname,
        'product-images'
      );

      console.log('✅ [UPLOAD] Success! URL:', result.url);
      res.json({ url: result.url, public_id: result.public_id });
    } else {
      console.error('❌ [UPLOAD] Cloudinary configuration missing');
      console.error('❌ [UPLOAD] CLOUD_NAME:', !!process.env.CLOUDINARY_CLOUD_NAME);
      console.error('❌ [UPLOAD] API_KEY:', !!process.env.CLOUDINARY_API_KEY);
      console.error('❌ [UPLOAD] API_SECRET:', !!process.env.CLOUDINARY_API_SECRET);
      res.status(500).json({ error: 'Cloudinary configuration missing on server.' });
    }
  } catch (error) {
    console.error('❌ [UPLOAD] Error:', error.message);
    console.error('❌ [UPLOAD] Stack:', error.stack);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});


// Session (IMPORTANT: cookie settings updated)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,        // only true on https
      httpOnly: false,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ---------- GOOGLE STRATEGY ----------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if a normal email-based user exists
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            user.googleId = profile.id;
          } else {
            user = new User({
              googleId: profile.id,
              displayName: profile.displayName,
              email: profile.emails[0].value,
              image: profile.photos[0].value,
              isAdmin:
                profile.emails[0].value === "signgalaxy31@gmail.com" ||
                profile.emails[0].value === "viswakumar2004@gmail.com",
            });
          }

          await user.save();
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ---------- DATABASE ----------
// ---------- DATABASE ----------
// Connection logic moved to app.listen
// mongoose
//   .connect(MONGO_URI)
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.error("MongoDB Error:", err));

// ---------- AUTH ROUTES ----------
// Test endpoint to verify server is working
app.get("/auth/test", (req, res) => {
  console.log("✅ Test endpoint hit!");
  res.send("Server is working! OAuth should work too.");
});

// ---------- IN-MEMORY CACHE ----------
const memoryCache = {
  data: {},
  expiry: {},
  get: function (key) {
    if (this.data[key] && this.expiry[key] > Date.now()) {
      return this.data[key];
    }
    return null;
  },
  set: function (key, value, durationInSeconds = 600) { // Default 10 mins
    this.data[key] = value;
    this.expiry[key] = Date.now() + durationInSeconds * 1000;
  },
  clear: function (key) {
    delete this.data[key];
    delete this.expiry[key];
  }
};

// ---------- APP VERSION CHECK (DEPLOY & RELOAD) ----------
// Generated once when the server process starts. 
// "Deploy" = git pull + restart, so this timestamp acts as the build ID.
const APP_VERSION = Date.now().toString();

app.get('/api/app-version', (req, res) => {
  res.json({ version: APP_VERSION });
});

// ---------- SITEMAP ----------
app.get('/sitemap.xml', async (req, res) => {
  const DOMAIN = 'https://ucgoc.com';
  try {
    const products = await Product.find({ status: 'Active' });
    const categories = await ShopCategory.find();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', freq: 'daily' },
      { url: '/shop', priority: '0.9', freq: 'daily' },
      { url: '/customize', priority: '0.8', freq: 'weekly' },
      { url: '/corporate', priority: '0.7', freq: 'monthly' },
      { url: '/contact', priority: '0.6', freq: 'monthly' },
      { url: '/about', priority: '0.6', freq: 'monthly' }
    ];

    staticPages.forEach(page => {
      xml += `<url><loc>${DOMAIN}${page.url}</loc><changefreq>${page.freq}</changefreq><priority>${page.priority}</priority></url>`;
    });

    // Dynamic Categories
    categories.forEach(c => {
      xml += `<url><loc>${DOMAIN}/shop?category=${encodeURIComponent(c.name)}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
    });

    // Dynamic Products
    products.forEach(p => {
      xml += `<url><loc>${DOMAIN}/product/${p.id || p._id}</loc><lastmod>${new Date().toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (e) {
    console.error("Sitemap Generation Error:", e);
    res.status(500).send("Error generating sitemap");
  }
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: 'offline',
    prompt: 'consent'
  })
);

app.get(
  "/auth/google/callback",
  (req, res, next) => {
    console.log("🔵 Google callback received");
    passport.authenticate("google", (err, user, info) => {
      if (err) {
        console.error("❌ Google Auth Error:", err);
        return res.redirect(`${process.env.CLIENT_URL}?error=auth_failed`);
      }
      if (!user) {
        console.error("❌ Google Auth Failed: No user returned");
        console.log("Info:", info);
        return res.redirect(`${process.env.CLIENT_URL}?error=no_user`);
      }

      console.log("✅ User authenticated:", user.email);

      req.logIn(user, (err) => {
        if (err) {
          console.error("❌ Login Error:", err);
          return next(err);
        }

        console.log("✅ Session created for:", user.email);
        console.log("📦 Session ID:", req.sessionID);
        console.log("👤 User in session:", req.user ? req.user.email : 'No user');

        // Redirect with success flag to trigger frontend refresh
        return res.redirect(`${process.env.CLIENT_URL}?login=success`);
      });
    })(req, res, next);
  }
);

app.get("/api/current_user", (req, res) => {
  console.log("🔍 Checking current user...");
  console.log("📦 Session ID:", req.sessionID);
  console.log("👤 User in session:", req.user ? req.user.email : 'No user in session');
  res.json(req.user || null);
});

app.get("/api/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect(`${process.env.CLIENT_URL}`);
    });
  });
});

// ---------- ORDERS ----------
// Get All Orders (Admin)
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders.map(o => ({ ...o.toObject(), id: o._id })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get My Orders (User)
app.get("/api/my-orders", async (req, res) => {
  try {
    const email = req.user ? req.user.email : req.query.email;
    if (!email) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const orders = await Order.find({ "user.email": email }).sort({ date: -1 });
    res.json(orders.map(o => ({ ...o.toObject(), id: o._id })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create Order (Checkout)
app.post("/api/orders", async (req, res) => {
  try {
    const orderData = req.body;
    const order = new Order(orderData);
    await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update Order Status
app.put("/api/orders/:id", async (req, res) => {
  try {
    const updateData = req.body;

    // Automatically set deliveredAt if status is changed to Delivered
    if (updateData.status === 'Delivered') {
      updateData.deliveredAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- PRODUCTS ----------
const compression = require('compression');

// In-memory Cache
let productCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 Minutes

// Enable Gzip Compression
app.use(compression());

// ---------- PRODUCTS ----------
app.get("/api/products", async (req, res) => {
  console.log("📥 GET /api/products requested");
  try {
    // res.set("Cache-Control", "public, max-age=300"); // Disabled for real-time updates
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");

    // Server-Side In-Memory Cache
    if (productCache && (Date.now() - lastCacheTime < CACHE_DURATION)) {
      console.log("✅ Serving Products from Cache");
      return res.json(productCache);
    }

    console.log("...Fetching Products from DB...");
    const products = await Product.find()
      .limit(5000) // Increase limit to cover full catalog (2000+)
      .select('id name pdfPrice mrp finalPrice isManualDiscount image gallery variations discount category subCategoryId shopCategoryId shopCategoryIds sectionId description isTrending isBestseller isComboOffer status rating reviewsCount occasions')
      .lean()
      .maxTimeMS(10000); // 10s timeout

    console.log(`✅ Fetched ${products.length} products`);

    // Update Cache
    productCache = products;
    lastCacheTime = Date.now();

    res.json(products);
  } catch (e) {
    console.error("❌ GET /api/products Error:", e);

    // Fallback: If DB fails, return empty array to prevent frontend crash
    // but typically we want the error. frontend is handled now though.
    res.status(500).json({ error: e.message });
  }
});

// Helper for Premium Pricing (Must match Frontend & Migration Logic)
const enforcePremiumPricing = (productData) => {
  const calculatePremiumPricing = (rawFinalPrice) => {
    if (!rawFinalPrice || rawFinalPrice <= 0) return { final: rawFinalPrice, mrp: 0, discount: 0 };

    // 1. Enforce Final
    let final = Math.round(rawFinalPrice / 10) * 10 - 1;
    if (final <= 0) final = 9;

    // 2. Enforce MRP with 1000 min diff
    let targetMRP = final * 1.6;
    const MIN_DIFF = 1000;
    const minMRPByDiff = final + MIN_DIFF;
    const minMRPByRatio = Math.ceil(final * 1.35);
    const absoluteMinMRP = Math.max(minMRPByDiff, minMRPByRatio);

    let base = Math.floor(absoluteMinMRP / 100) * 100;
    let candidates = [base - 100 + 99, base + 99, base + 100 + 99, base + 200 + 99];

    candidates = candidates.filter(c => c >= absoluteMinMRP);

    let bestMRP = 0;
    if (candidates.length > 0) {
      bestMRP = candidates.reduce((prev, curr) => (Math.abs(curr - targetMRP) < Math.abs(prev - targetMRP) ? curr : prev));
    } else {
      let approxBase = Math.floor(absoluteMinMRP / 100) * 100;
      bestMRP = approxBase + 99;
      if (bestMRP < absoluteMinMRP) bestMRP += 100;
    }

    let discount = Math.round(((bestMRP - final) / bestMRP) * 100);
    return { final, mrp: bestMRP, discount };
  };

  // 1. Base Product
  if (productData.finalPrice > 0 && !productData.isManualDiscount) {
    const { final, mrp, discount } = calculatePremiumPricing(productData.finalPrice);
    productData.finalPrice = final;
    productData.mrp = mrp;
    productData.discount = discount;
  }

  // 2. Variations
  if (productData.variations && Array.isArray(productData.variations)) {
    productData.variations.forEach(v => {
      if (v.options && Array.isArray(v.options)) {
        v.options.forEach(o => {
          if (o.finalPrice > 0 && !o.isManualDiscount) {
            const { final, mrp, discount } = calculatePremiumPricing(o.finalPrice);
            o.finalPrice = final;
            o.mrp = mrp;
            o.discount = discount;
            o.priceAdjustment = mrp;
          } else if (o.isManualDiscount) {
            // Ensure priceAdjustment is synced with mrp even in manual mode
            o.priceAdjustment = o.mrp || 0;
          }
        });
      }
    });
  }
  return productData;
};

// Create/Update Product (Admin)
app.post("/api/products", async (req, res) => {
  try {
    let productData = req.body;
    console.log(`📥 [POST] Received create/upsert:`, {
      name: productData.name,
      isComboOffer: productData.isComboOffer,
      shopCategoryIds: productData.shopCategoryIds,
      subCategoryId: productData.subCategoryId,
      isUpdate: !!productData._id
    });

    // ENFORCE PRICING RULES
    productData = enforcePremiumPricing(productData);

    if (productData._id) {
      // Update existing product
      const updated = await Product.findByIdAndUpdate(
        productData._id,
        { $set: productData }, // Use $set to be safe
        { new: true, upsert: true }
      );
      console.log('✅ Updated product successfully. isComboOffer:', updated.isComboOffer);
      productCache = null;
      res.json(updated);
    } else {
      // Create new product
      const product = new Product(productData);
      await product.save();
      console.log('✅ Created product successfully. isComboOffer:', product.isComboOffer);
      productCache = null;
      res.json(product);
    }
  } catch (e) {
    console.error('❌ POST /api/products Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Update Product (Admin)
app.put("/api/products/:id", async (req, res) => {
  try {
    let productData = req.body;
    console.log(`📥 [PUT] Received update for ${req.params.id}:`, {
      name: productData.name,
      isComboOffer: productData.isComboOffer,
      shopCategoryIds: productData.shopCategoryIds,
      subCategoryId: productData.subCategoryId
    });

    // ENFORCE PRICING RULES
    productData = enforcePremiumPricing(productData);

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: productData },
      { new: true }
    );

    console.log(`✅ [PUT] Updated successfully. isComboOffer:`, updated ? updated.isComboOffer : 'null');
    productCache = null;
    res.json(updated);
  } catch (e) {
    console.error('❌ PUT /api/products Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Diagnostic endpoint
app.get("/api/debug/combo-offers", async (req, res) => {
  try {
    const combos = await Product.find({ isComboOffer: true }).select('name isComboOffer status');
    res.json({ count: combos.length, products: combos });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete Product (Admin)
app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



// Activate All Products (Admin)
app.post("/api/products/activate-all", async (req, res) => {
  try {
    const result = await Product.updateMany({}, { status: 'Active' });
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- USER CART & WISHLIST ----------
// Get user's cart and wishlist
app.get("/api/user/:email", async (req, res) => {
  try {
    let user = await User.findOne({ email: req.params.email });
    if (!user) {
      user = new User({ email: req.params.email, cart: [], wishlist: [] });
      await user.save();
    }
    res.json({
      cart: user.cart || [],
      wishlist: user.wishlist || [],
      isAdmin: user.isAdmin,
      phone: user.phone
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update user's cart
app.post("/api/cart", async (req, res) => {
  console.log("📥 POST /api/cart called for email:", req.body.email);
  try {
    const { email, cart } = req.body;
    if (!email) {
      console.error("❌ No email provided in cart update request");
      return res.status(400).json({ error: "Email is required" });
    }
    // Use findOneAndUpdate with upsert to handle concurrent updates safely and avoid VersionErrors
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { cart: cart }, $setOnInsert: { wishlist: [] } },
      { new: true, upsert: true }
    );

    console.log("✅ Cart updated successfully for:", email);
    res.json({ success: true, cart: updatedUser.cart });
  } catch (e) {
    console.error("❌ POST /api/cart Error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Update user's phone number
app.post("/api/user/update-phone", async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone) {
      return res.status(400).json({ error: "Email and phone are required" });
    }
    const user = await User.findOneAndUpdate({ email }, { phone }, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Also save as a Lead for marketing tracker
    try {
      const lead = new WhatsAppLead({
        phoneNumber: phone,
        message: 'Verified via Mandatory Onboarding Popup'
      });
      await lead.save();
    } catch (err) {
      console.error("Error saving lead backup:", err);
    }

    res.json({ success: true, user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update user's wishlist
app.post("/api/wishlist", async (req, res) => {
  try {
    const { email, wishlist } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, cart: [], wishlist });
    } else {
      user.wishlist = wishlist;
    }

    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// User login/register (legacy - email only)
app.post("/api/user/login", async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        cart: [],
        wishlist: [],
        isAdmin: email === "signgalaxy31@gmail.com" || email === "viswakumar2004@gmail.com"
      });
      await user.save();
    }

    res.json({
      email: user.email,
      isAdmin: user.isAdmin,
      phone: user.phone,
      cart: user.cart || [],
      wishlist: user.wishlist || []
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- NEW AUTHENTICATION ENDPOINTS ----------
const { registerUser, loginUser, changePassword } = require('./auth');

// Register new user with email/phone and password
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await registerUser(email, phone, password);

    // Set session
    req.session.userId = user._id;

    res.json({
      success: true,
      user: {
        email: user.email,
        phone: user.phone,
        displayName: user.displayName,
        image: user.image,
        isAdmin: user.isAdmin,
        cart: user.cart || [],
        wishlist: user.wishlist || []
      }
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Login with email/phone and password
app.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/phone and password are required' });
    }

    const user = await loginUser(identifier, password);

    // Set session
    req.session.userId = user._id;

    res.json({
      success: true,
      user: {
        email: user.email,
        phone: user.phone,
        displayName: user.displayName,
        image: user.image,
        isAdmin: user.isAdmin,
        cart: user.cart || [],
        wishlist: user.wishlist || []
      }
    });
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

// Change password
app.post("/api/auth/change-password", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    await changePassword(req.session.userId, oldPassword, newPassword);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


// ---------- WHATSAPP LEADS ----------
app.post("/api/whatsapp-leads", async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const lead = new WhatsAppLead({
      phoneNumber,
      message
    });

    await lead.save();
    res.json({ success: true, lead });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- REVIEWS ----------
// Create Review
app.post("/api/reviews", async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();

    // Recalculate product rating if review is approved
    if (review.status === 'Approved') {
      const reviews = await Review.find({ productId: review.productId, status: 'Approved' });
      const count = reviews.length;
      const avg = count > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / count : 0;

      await Product.findOneAndUpdate({ id: review.productId }, {
        rating: avg.toFixed(1),
        reviewsCount: count
      });
    }

    res.json(review);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get Reviews for Product
app.get("/api/products/:id/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.id, status: 'Approved' });
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get All Reviews (Admin)
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (e) {
    console.error("GET /api/reviews Error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Update Review Status (Admin)
app.put("/api/reviews/:id", async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Recalculate product rating
    if (review) {
      const reviews = await Review.find({ productId: review.productId, status: 'Approved' });
      const count = reviews.length;
      const avg = count > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / count : 0;

      await Product.findOneAndUpdate({ id: review.productId }, {
        rating: avg.toFixed(1),
        reviewsCount: count
      });
    }

    res.json(review);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete Review (Admin)
app.delete("/api/reviews/:id", async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    // Recalculate product rating
    if (review) {
      const reviews = await Review.find({ productId: review.productId, status: 'Approved' });
      const count = reviews.length;
      const avg = count > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / count : 0;

      await Product.findOneAndUpdate({ id: review.productId }, {
        rating: avg.toFixed(1),
        reviewsCount: count
      });
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- CATEGORIES ----------
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.json(category);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(category);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- SHAPES ----------
app.get("/api/shapes", async (req, res) => {
  try {
    const shapes = await Shape.find();
    res.json(shapes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/shapes", async (req, res) => {
  try {
    const shape = new Shape(req.body);
    await shape.save();
    res.json(shape);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/shapes/:id", async (req, res) => {
  try {
    const shape = await Shape.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(shape);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/shapes/:id", async (req, res) => {
  try {
    await Shape.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- SIZES ----------
app.get("/api/sizes", async (req, res) => {
  try {
    const sizes = await Size.find();
    res.json(sizes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/sizes", async (req, res) => {
  try {
    const size = new Size(req.body);
    await size.save();
    res.json(size);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/sizes/:id", async (req, res) => {
  try {
    const size = await Size.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(size);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/sizes/:id", async (req, res) => {
  try {
    await Size.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- SECTIONS ----------
app.get("/api/sections", async (req, res) => {
  try {
    const cached = memoryCache.get('sections');
    if (cached) return res.json(cached);

    const sections = await Section.find().sort({ order: 1 });
    memoryCache.set('sections', sections);
    res.json(sections);
  } catch (e) {
    console.error("GET /api/sections Error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/sections", async (req, res) => {
  try {
    const section = new Section(req.body);
    await section.save();
    memoryCache.clear('sections');
    res.json(section);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/sections/:id", async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
    memoryCache.clear('sections');
    res.json(section);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/sections/:id", async (req, res) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    // Also delete all categories in this section
    await ShopCategory.deleteMany({ sectionId: req.params.id });
    memoryCache.clear('sections');
    memoryCache.clear('categories'); // Clear related if needed, but shop-categories is separate
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- SHOP CATEGORIES ----------
// Basic In-Memory Cache for Categories
let categoryCache = null;
let lastCategoryCacheTime = 0;
let isFetchingCategories = false;
let categoryWaiters = [];
const CATEGORY_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

app.get("/api/shop-categories", async (req, res) => {
  console.log("📥 GET /api/shop-categories requested");
  try {
    // Return cache if valid
    if (Array.isArray(categoryCache) && (Date.now() - lastCategoryCacheTime < CATEGORY_CACHE_DURATION)) {
      console.log("✅ Serving Categories from Cache");
      return res.json(categoryCache);
    }

    // Handle concurrent requests (Cache Stampede Protection)
    if (isFetchingCategories) {
      console.log("⏳ Already fetching categories, adding to waitlist...");
      return new Promise((resolve) => {
        categoryWaiters.push(resolve);
      }).then(data => res.json(data));
    }

    isFetchingCategories = true;
    console.log("...Fetching Categories from DB...");

    // Fetch from DB: Add maxTimeMS to prevent Atlas hangs
    let categories = await ShopCategory.find()
      .limit(100)
      .lean()
      .maxTimeMS(10000); // 10s timeout

    // Sort in memory
    categories.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Update Cache
    categoryCache = categories;
    lastCategoryCacheTime = Date.now();
    isFetchingCategories = false;

    console.log(`✅ Served & Cached ${categories.length} Categories`);

    // Resolve any waiters
    categoryWaiters.forEach(resolve => resolve(categories));
    categoryWaiters = [];

    res.json(categories);
  } catch (e) {
    isFetchingCategories = false;
    console.error("❌ Error fetching categories:", e);

    // Fallback: If cache exists but is expired, return it anyway on error
    if (Array.isArray(categoryCache)) {
      console.log("⚠️ DB error, serving stale cache as fallback");
      categoryWaiters.forEach(resolve => resolve(categoryCache));
      categoryWaiters = [];
      return res.json(categoryCache);
    }

    // Resolve waiters with empty array to prevent client hangs
    categoryWaiters.forEach(resolve => resolve([]));
    categoryWaiters = [];

    res.status(500).json({ error: e.message, stack: e.stack });
  }
});


app.post("/api/shop-categories", async (req, res) => {
  try {
    // Invalidate Cache on Update
    categoryCache = null;
    const category = new ShopCategory(req.body);
    await category.save();
    res.json(category);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/shop-categories/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`📥 [PUT] Updating Category: ${id}`);
  try {
    categoryCache = null; // Clear cache
    const updateData = { ...req.body };
    delete updateData._id; // Prevent MongoDB _id conflicts

    // Find by either standard _id, custom id, or name fallback
    const category = await ShopCategory.findOneAndUpdate(
      { $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] },
      { $set: updateData },
      { new: true }
    );

    if (!category) {
      console.warn(`⚠️ [WARN] Category ${id} not found.`);
      return res.status(404).json({ error: "Category not found" });
    }

    console.log(`✅ [SUCCESS] Category "${category.name}" updated in DB.`);
    res.json(category);
  } catch (err) {
    console.error(`❌ [SERVER ERROR] Update Failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/shop-categories/:id", async (req, res) => {
  try {
    categoryCache = null; // Invalidate cache
    await ShopCategory.findByIdAndDelete(req.params.id);
    // Also delete all sub-categories in this category
    await SubCategory.deleteMany({ categoryId: req.params.id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/admin/fix-images", async (req, res) => {
  try {
    const CAT_IMAGE_MAP = {
      'PHOTO FRAME': '/categories/photo_frame.png',
      '3D CRYSTAL': '/categories/3d_crystal.png',
      'MUGS': '/categories/mugs.png',
      'NEON LIGHTS': '/categories/neon_lights.png',
      'PILLOWS': '/categories/pillows.png',
      'WALLETS': '/categories/wallets.png',
      'WOODEN ENGRAVING & COLOR PRINTING': '/categories/wooden_engraving.png'
    };

    const cats = await ShopCategory.find();
    console.log(`[FixImages] Found ${cats.length} categories.`);
    let updatedCats = 0;
    for (const cat of cats) {
      const normalizedName = cat.name.trim().toUpperCase();
      console.log(`[FixImages] Name: "${cat.name}", Normalized: "${normalizedName}"`);
      let image = cat.image;

      if (CAT_IMAGE_MAP[normalizedName]) {
        console.log(`[FixImages] >> MATCH: ${normalizedName}`);
        image = CAT_IMAGE_MAP[normalizedName];
      } else if (!image || image === "" || image === null || image.includes('placehold.co')) {
        image = `https://placehold.co/600x400/f3f4f6/374151?text=${encodeURIComponent(cat.name.trim())}`;
      }

      if (image !== cat.image) {
        console.log(`[FixImages] >> UPDATING: ${cat.name} -> ${image}`);
        await ShopCategory.updateOne({ _id: cat._id }, { $set: { image: image } });
        updatedCats++;
      }
    }

    const subs = await SubCategory.find();
    let updatedSubs = 0;
    for (const sub of subs) {
      if (!sub.image || sub.image === "" || sub.image === null || sub.image.includes('placehold.co')) {
        sub.image = `https://placehold.co/400x300/f8fafc/64748b?text=${encodeURIComponent(sub.name.trim())}`;
        await SubCategory.updateOne({ _id: sub._id }, { $set: { image: sub.image } });
        updatedSubs++;
      }
    }

    // Invalidate Cache
    categoryCache = null;

    res.json({ success: true, updatedCats, updatedSubs });
  } catch (e) {
    console.error("[FixImages] Error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/shop-categories/:id/convert", async (req, res) => {
  try {
    const { parentCategoryId } = req.body;
    const dbId = req.params.id;

    if (!parentCategoryId) {
      return res.status(400).json({ error: "parentCategoryId is required in request body" });
    }

    const categoryToConvert = await ShopCategory.findById(dbId);
    if (!categoryToConvert) return res.status(404).json({ error: "Category to convert not found in database" });

    if (categoryToConvert.id === parentCategoryId) {
      return res.status(400).json({ error: "Cannot convert a category into itself" });
    }

    const parentCategory = await ShopCategory.findOne({ id: parentCategoryId });
    if (!parentCategory) return res.status(404).json({ error: "Target parent category not found" });

    // Create new SubCategory
    const newSubCategory = new SubCategory({
      id: categoryToConvert.id || `sub_${Date.now()}`,
      categoryId: parentCategoryId,
      name: categoryToConvert.name,
      image: categoryToConvert.image,
      order: categoryToConvert.order || 0
    });
    await newSubCategory.save();

    // Update Products that were in this category
    // We match by both ID and Name to be robust
    await Product.updateMany(
      {
        $or: [
          { shopCategoryId: categoryToConvert.id },
          { category: categoryToConvert.name }
        ]
      },
      {
        shopCategoryId: parentCategory.id,
        category: parentCategory.name,
        subCategoryId: categoryToConvert.id
      }
    );

    // Delete the old category from ShopCategory collection
    await ShopCategory.findByIdAndDelete(dbId);

    res.json({ success: true, message: "Converted successfully" });
  } catch (e) {
    console.error("Conversion API Error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ---------- SUB CATEGORIES ----------
app.get("/api/sub-categories", async (req, res) => {
  try {
    const subCategories = await SubCategory.find().sort({ order: 1 });
    res.json(subCategories);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/sub-categories", async (req, res) => {
  try {
    const subCategory = new SubCategory(req.body);
    await subCategory.save();
    res.json(subCategory);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/sub-categories/:id", async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(subCategory);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/sub-categories/:id", async (req, res) => {
  try {
    await SubCategory.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- SPECIAL OCCASIONS ----------
app.get("/api/special-occasions", async (req, res) => {
  try {
    const cached = memoryCache.get('specialOccasions');
    if (cached) return res.json(cached);

    const occasions = await SpecialOccasion.find().sort({ order: 1 });
    memoryCache.set('specialOccasions', occasions);
    res.json(occasions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/special-occasions", async (req, res) => {
  try {
    const occasion = new SpecialOccasion(req.body);
    await occasion.save();
    memoryCache.clear('specialOccasions');
    res.json(occasion);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/special-occasions/:id", async (req, res) => {
  try {
    const occasion = await SpecialOccasion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    memoryCache.clear('specialOccasions');
    res.json(occasion);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/special-occasions/:id", async (req, res) => {
  try {
    await SpecialOccasion.findByIdAndDelete(req.params.id);
    memoryCache.clear('specialOccasions');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ---------- SHOP BY OCCASION ----------
app.get("/api/shop-occasions", async (req, res) => {
  try {
    const cached = memoryCache.get('shopOccasions');
    if (cached) return res.json(cached);

    const occasions = await ShopOccasion.find().sort({ order: 1 });
    memoryCache.set('shopOccasions', occasions);
    res.json(occasions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/shop-occasions", async (req, res) => {
  try {
    const occasion = new ShopOccasion(req.body);
    await occasion.save();
    memoryCache.clear('shopOccasions');
    res.json(occasion);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/shop-occasions/:id", async (req, res) => {
  try {
    const occasion = await ShopOccasion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    memoryCache.clear('shopOccasions');
    res.json(occasion);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/shop-occasions/:id", async (req, res) => {
  try {
    await ShopOccasion.findByIdAndDelete(req.params.id);
    memoryCache.clear('shopOccasions');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- SHOP RECIPIENTS ----------
app.get("/api/shop-recipients", async (req, res) => {
  try {
    const cached = memoryCache.get('shopRecipients');
    if (cached) return res.json(cached);

    const recipients = await ShopRecipient.find().sort({ order: 1 });
    memoryCache.set('shopRecipients', recipients);
    res.json(recipients);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/shop-recipients", async (req, res) => {
  try {
    const recipient = new ShopRecipient(req.body);
    await recipient.save();
    memoryCache.clear('shopRecipients');
    res.json(recipient);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/shop-recipients/:id", async (req, res) => {
  try {
    const recipient = await ShopRecipient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    memoryCache.clear('shopRecipients');
    res.json(recipient);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/shop-recipients/:id", async (req, res) => {
  try {
    await ShopRecipient.findByIdAndDelete(req.params.id);
    memoryCache.clear('shopRecipients');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- CUSTOMERS (USERS) ----------
app.get("/api/customers", async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false });
    // Map _id to id for frontend compatibility if needed, or just return users
    res.json(users.map(u => ({ ...u.toObject(), id: u._id })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/customers/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- SELLERS ----------
app.get("/api/sellers", async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.json(sellers);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/sellers", async (req, res) => {
  try {
    const seller = new Seller(req.body);
    await seller.save();
    res.json(seller);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/sellers/:id", async (req, res) => {
  try {
    let query = { _id: req.params.id };
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { id: req.params.id };
    }
    const seller = await Seller.findOneAndUpdate(query, req.body, { new: true });
    res.json(seller);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/sellers/:id", async (req, res) => {
  try {
    let query = { _id: req.params.id };
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { id: req.params.id };
    }
    await Seller.findOneAndDelete(query);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- TRANSACTIONS ----------
app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- RETURNS ----------
app.get("/api/returns", async (req, res) => {
  try {
    const returns = await ReturnRequest.find().sort({ date: -1 });
    res.json(returns);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/returns/:id", async (req, res) => {
  try {
    let query = { _id: req.params.id };
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { id: req.params.id };
    }
    const retRequest = await ReturnRequest.findOneAndUpdate(query, req.body, { new: true });
    res.json(retRequest);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- COUPONS ----------
app.get("/api/coupons", async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/coupons", async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.json(coupon);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/coupons/:id", async (req, res) => {
  try {
    let query = { _id: req.params.id };
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { id: req.params.id };
    }
    const coupon = await Coupon.findOneAndUpdate(query, req.body, { new: true });
    res.json(coupon);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/coupons/:id", async (req, res) => {
  try {
    let query = { _id: req.params.id };
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { id: req.params.id };
    }
    await Coupon.findOneAndDelete(query);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- ADMIN HD EXPORT ----------
const fs = require('fs');
let Canvas, Image;
try {
  const canvasModule = require('canvas');
  Canvas = canvasModule.Canvas;
  Image = canvasModule.Image;
} catch (e) {
  console.warn("Canvas module not found or failed to load. HD generation will be disabled.");
}
// Fabric v6 node setup might differ, assuming standard or v5-like for now, 
// but v6 usually requires specific node setup. 
// If fabric v6 is strictly browser-focused or requires jsdom, we'll use jsdom.
// For now, let's try standard require if fabric supports node.
// If not, we might need to use 'fabric/node' or similar.
// Actually, for v6, it's often: import * as fabric from 'fabric';
// In CommonJS: const fabric = require('fabric').fabric || require('fabric');

// Let's try to use a robust method for HD generation
app.post("/api/admin/generate-hd", async (req, res) => {
  try {
    const { designJson, originalImage, width = 3000 } = req.body;

    if (!designJson) {
      return res.status(400).json({ error: "No design JSON provided" });
    }

    // We need to use JSDOM for Fabric v6 on Node usually, or fabric.StaticCanvas if supported directly.
    // Given the environment, let's try a safe approach.
    // If Fabric Node support is tricky, we might mock it or use a simpler replacement if possible,
    // but the user requested Fabric.js backend.

    // NOTE: Fabric v6 on Node is still evolving. 
    // We will assume 'fabric' package exposes what we need or we use a workaround.
    // A common pattern for Node rendering with Fabric:

    const fabric = require('fabric').fabric || require('fabric');

    // Create a static canvas (no interactivity needed)
    // We might need to set the dimensions based on the JSON or target HD size.
    // Let's parse the JSON first to get original dimensions.
    const designObj = JSON.parse(designJson);
    const originalWidth = designObj.width || 500;
    const originalHeight = designObj.height || 500;

    const scaleFactor = width / originalWidth;
    const targetHeight = originalHeight * scaleFactor;

    // In Node, we often pass null as element for StaticCanvas
    const canvas = new fabric.StaticCanvas(null, { width: width, height: targetHeight });

    // Load from JSON
    // We need to handle the asynchronous loading
    await new Promise((resolve, reject) => {
      canvas.loadFromJSON(designObj, () => {
        // Callback when loaded

        // Now we need to scale everything up
        // And replace images if 'originalImage' is provided and matches the main image

        const objects = canvas.getObjects();

        // Scaling logic:
        // Since we initialized canvas with target size, but loadFromJSON might reset it or objects might be small.
        // Actually, loadFromJSON loads objects at their saved properties.
        // We need to scale the entire group of objects.

        // Strategy: Zoom the canvas
        canvas.setZoom(scaleFactor);
        canvas.setWidth(width);
        canvas.setHeight(targetHeight);

        // Replace Image with High Res if applicable
        // This is tricky because we need to know WHICH image to replace.
        // Usually it's the main user photo.
        // We can look for an image object that looks like a user upload (e.g. large size, or specific ID if we saved it).
        // For now, let's iterate and find the largest image or one that matches the preview URL pattern if possible.
        // Or simply, if there's only one image, replace it.

        const processObjects = async () => {
          for (let obj of objects) {
            if (obj.type === 'image') {
              // If we have an originalImage URL and this object looks like the user photo
              // (We might need better tracking, but let's assume the user uploaded one main photo)
              if (originalImage) {
                // Reload this image object with the high-res URL
                // This requires fetching the high-res image data or using a file path if local
                // If originalImage is a URL (http://localhost...), fabric can load it.

                // We need to replace the source.
                // In Fabric, we can setSrc.
                await new Promise((resolveImg) => {
                  obj.setSrc(originalImage, () => {
                    resolveImg();
                  }, { crossOrigin: 'anonymous' });
                });
              }
            }
          }
          resolve();
        };

        processObjects().then(() => {
          canvas.renderAll();
          resolve();
        });

      });
    });

    // Export to Cloudinary
    const buffer = canvas.toBuffer('image/png');
    const fileName = `HD_${Date.now()}.png`;

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await uploadImage(buffer, fileName, 'hd-designs');
      console.log('✅ HD Image uploaded to Cloudinary:', result.url);
      res.json({ success: true, url: result.url });
    } else {
      res.status(500).json({ error: "Cloudinary not configured" });
    }

  } catch (e) {
    console.error("HD Generation Failed", e);
    res.status(500).json({ error: e.message });
  }
});

// HD Design Generation Endpoint (for Admin)
app.post('/api/generate-hd-design', express.json({ limit: '50mb' }), async (req, res) => {
  try {
    const { designJSON, productName } = req.body;

    if (!designJSON) {
      return res.status(400).json({ error: 'No design data provided' });
    }

    // Import fabric and canvas for server-side rendering
    const { createCanvas } = require('canvas');
    const { fabric } = require('fabric');

    // Create HD canvas (3000x3000 for print quality)
    const hdCanvas = createCanvas(3000, 3000);

    // Create fabric canvas from node-canvas
    const fabricCanvas = new fabric.Canvas(hdCanvas);

    // Load design from JSON
    await new Promise((resolve, reject) => {
      fabricCanvas.loadFromJSON(designJSON, () => {
        // Remove watermark (find and remove text with "PREVIEW" content)
        const objects = fabricCanvas.getObjects();
        const watermarkIndex = objects.findIndex(obj =>
          obj.type === 'text' && obj.text && obj.text.includes('PREVIEW')
        );

        if (watermarkIndex !== -1) {
          fabricCanvas.remove(objects[watermarkIndex]);
        }

        // Scale up to HD resolution
        const scaleFactor = 3000 / 600; // Original is now 600x600
        fabricCanvas.setDimensions({ width: 3000, height: 3000 });

        objects.forEach(obj => {
          if (obj.type !== 'text' || !obj.text?.includes('PREVIEW')) {
            obj.scaleX = (obj.scaleX || 1) * scaleFactor;
            obj.scaleY = (obj.scaleY || 1) * scaleFactor;
            obj.left = (obj.left || 0) * scaleFactor;
            obj.top = (obj.top || 0) * scaleFactor;

            if (obj.type === 'text') {
              obj.fontSize = (obj.fontSize || 20) * scaleFactor;
            }
          }
        });

        fabricCanvas.renderAll();
        resolve(true);
      }, (err) => reject(err));
    });

    // Export as high-quality PNG
    const buffer = hdCanvas.toBuffer('image/png', { compressionLevel: 3, filters: hdCanvas.PNG_FILTER_NONE });

    // Upload to Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const fileName = `hd-design-${Date.now()}.png`;
      const result = await uploadImage(buffer, fileName, 'hd-designs');

      console.log('✅ HD Design uploaded to Cloudinary:', result.url);
      res.json({
        success: true,
        url: result.url,
        public_id: result.public_id,
        message: 'HD design generated successfully'
      });
    } else {
      console.error('❌ Cloudinary configuration missing');
      res.status(500).json({ error: 'Cloudinary configuration missing on server.' });
    }

  } catch (error) {
    console.error('Error generating HD design:', error);
    res.status(500).json({ error: error.message });
  }
});

// ---------- SELLERS ----------
app.get("/api/sellers", async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.json(sellers);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Email Transporter
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post("/api/sellers", async (req, res) => {
  try {
    const seller = new Seller(req.body);
    await seller.save();

    // Send Onboarding Email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: seller.email,
        subject: 'Welcome to Yathes Sign Galaxy - Seller Onboarding',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #4F46E5; margin: 0;">Yathes Sign Galaxy</h2>
              <p style="color: #666; margin-top: 5px;">Seller Portal</p>
            </div>
            
            <p style="font-size: 16px;">Dear <strong>${seller.contactPerson}</strong>,</p>
            
            <p>We are thrilled to have <strong>${seller.companyName}</strong> onboard with us!</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
              <p style="margin: 0; font-weight: bold;">Current Status: <span style="color: #D97706;">Pending Approval</span></p>
            </div>

            <p>Your application has been received and is currently under review by our administration team. We want to ensure the best quality for our customers, so this process typically takes <strong>24-48 hours</strong>.</p>
            
            <p>You will receive another email once your account has been fully activated and you can start listing your products.</p>

            <br/>
            <div style="border-top: 1px solid #eee; padding-top: 20px; color: #888; font-size: 12px; text-align: center;">
              <p>Best regards,<br/><strong>Yathes Sign Galaxy Team</strong></p>
              <p>Need help? Contact us at support@ucgoc.com</p>
            </div>
          </div>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('❌ Error sending onboarding email:', error);
        } else {
          console.log('✅ Onboarding email sent:', info.response);
        }
      });
    } else {
      console.warn('⚠️ Email credentials (EMAIL_USER, EMAIL_PASS) not found in .env. Skipping email.');
    }

    res.json(seller);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/sellers/:id", async (req, res) => {
  try {
    // If ID is custom string id
    const seller = await Seller.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    // If ID wasn't found by custom ID, try _id just in case
    if (!seller && req.params.id.length === 24) {
      const sellerById = await Seller.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.json(sellerById);
    }
    res.json(seller);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/sellers/:id", async (req, res) => {
  try {
    await Seller.findOneAndDelete({ id: req.params.id });
    // Fallback for _id if needed
    if (req.params.id.length === 24) {
      await Seller.findByIdAndDelete(req.params.id);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- REVIEW AUTOMATION ----------
app.post("/api/admin/run-review-automation", async (req, res) => {
  console.log("🚀 Starting Review Automation Check...");
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find orders that:
    // 1. Are Delivered
    // 2. Haven't had a review request yet
    // 3. Were delivered at least 24 hours ago
    const pendingOrders = await Order.find({
      status: 'Delivered',
      hasRequestedReview: false,
      deliveredAt: { $lte: twentyFourHoursAgo }
    });

    console.log(`🔍 Found ${pendingOrders.length} orders pending review request.`);

    const results = {
      total: pendingOrders.length,
      emailed: 0,
      failed: 0
    };

    for (const order of pendingOrders) {
      const email = order.user?.email;
      if (!email) continue;

      // Construct Review Link (Directs to the product page with a review query param or just the page)
      // Since we don't have a specific review-only page, we send them to the product details
      const firstItem = order.items?.[0];
      const reviewLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/product/${firstItem?.productId}?action=review`;

      // Email Content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `How is your ${firstItem?.name || 'gift'}? - Yathes Sign Galaxy`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px;">We hope you love it! 🎁</h1>
            </div>
            <div style="padding: 30px; color: #374151; line-height: 1.6;">
              <p>Hi <strong>${order.user?.displayName || 'there'}</strong>,</p>
              <p>It's been a few days since your order <strong>#${order.orderId || order._id}</strong> was delivered. We'd love to hear what you think of your new <strong>${firstItem?.name}</strong>!</p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${reviewLink}" style="background-color: #4F46E5; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                  Leave a Review ⭐️
                </a>
              </div>

              <p style="font-size: 14px; color: #6B7280;">Your feedback helps us continue creating personalized magic for everyone.</p>
            </div>
            <div style="background-color: #F9FAFB; padding: 20px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #f0f0f0;">
              © ${new Date().getFullYear()} Yathes Sign Galaxy. All rights reserved.
            </div>
          </div>
        `
      };

      try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          await transporter.sendMail(mailOptions);
          results.emailed++;

          // Mark as requested
          order.hasRequestedReview = true;
          await order.save();
        } else {
          console.warn("⚠️ Email credentials missing, skipping send.");
        }
      } catch (err) {
        console.error(`❌ Failed to send review email to ${email}:`, err);
        results.failed++;
      }
    }

    res.json({ success: true, ...results });
  } catch (e) {
    console.error("❌ Review Automation Error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ---------- GIFT GENIE ----------


app.post('/api/gift-genie', async (req, res) => {
  try {
    const { answers, recommendedProducts } = req.body;
    const userId = req.user ? req.user._id : 'guest';

    const query = new GiftGenieQuery({
      userId,
      answers,
      recommendedProducts
    });

    await query.save();
    console.log(`🧞‍♂️ Gift Genie query saved! (User: ${userId})`);
    res.json({ success: true, id: query._id });
  } catch (e) {
    console.error('Error saving Gift Genie query:', e);
    res.status(500).json({ error: e.message });
  }
});


// ---------- ERROR HANDLING ----------
// 404 Handler - Ensure JSON response for everything
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
});

// ---------- MISC ROUTES ----------
// ---------- STARTUP ----------
console.log("⏳ Initializing Server...");

// Define connection options - helpful for stable connections
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 60000,
  maxPoolSize: 50,
  connectTimeoutMS: 30000,
};

// Cache Warming Function
// Cache Warming Function (Comprehensive)
// Cache Warming Function (Comprehensive)
const warmUpCaches = async () => {
  console.log("🔥 Warming up ALL caches...");
  try {
    const opts = { maxTimeMS: 60000 };

    // 1. Fetch Categories (Critical & Lightweight) - Do this FIRST
    const startCat = Date.now();
    // Fetch without DB sort to prevent potential Atlas hangs on unindexed fields
    console.log("...Fetching Categories...");
    let categories = await ShopCategory.find().limit(500).lean().setOptions(opts);
    // Sort in memory (robust & fast for small datasets)
    categories.sort((a, b) => (a.order || 0) - (b.order || 0));

    categoryCache = categories;
    lastCategoryCacheTime = Date.now();
    console.log(`✅ [WarmUp] ShopCategories: ${categories.length} (took ${Date.now() - startCat}ms)`);

    // 2. Fetch Sections & SubCategories (Critical structure)
    const startSec = Date.now();
    let sections = await Section.find().lean().setOptions(opts);
    sections.sort((a, b) => (a.order || 0) - (b.order || 0)); // In-memory sort

    const subCategories = await SubCategory.find().lean().setOptions(opts);
    memoryCache.set('sections', sections);
    console.log(`✅ [WarmUp] Sections: ${sections.length}, Subs: ${subCategories.length} (took ${Date.now() - startSec}ms)`);

    // 3. Fetch Products (Heaviest Payload) - Do this LAST
    const startProd = Date.now();
    const products = await Product.find()
      .limit(5000)
      .select('id name pdfPrice mrp finalPrice isManualDiscount image gallery variations discount category subCategoryId shopCategoryId shopCategoryIds sectionId description isTrending isBestseller isComboOffer status rating reviewsCount occasions')
      .lean()
      .maxTimeMS(10000);
    productCache = products;
    lastCacheTime = Date.now();
    console.log(`✅ [WarmUp] Products: ${products.length} (took ${Date.now() - startProd}ms)`);

  } catch (e) {
    console.error("⚠️ Cache warming failed (partial?):", e.message);
  }
};

mongoose.connect(MONGO_URI, mongooseOptions)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);

      // Run seed scripts safely after connection
      seedRecipients().catch(err => console.error("❌ Seed Error:", err));
      warmUpCaches(); // Start fetching data immediately

      app.get('/api/health', (req, res) => res.send('OK')); // Simple health check

      // Diagnostic check on startup
      Product.countDocuments()
        .then(count => console.log(`📊 Current Products in DB: ${count}`))
        .catch(err => console.error("❌ Failed to count products:", err));
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    // process.exit(1); // Optional: Exit if DB fails, but maybe keep running for debugging
  });
