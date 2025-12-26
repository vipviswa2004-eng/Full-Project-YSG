// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Product, User, Order, Review, Category, Shape, Size, Section, ShopCategory, SubCategory, Seller, Transaction, ReturnRequest, Coupon, SpecialOccasion } = require('./models');

const app = express();
const PORT = 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yathes_sign_galaxy";

// ---------- MIDDLEWARE ----------
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if Cloudinary is configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      // Upload to Cloudinary
      const result = await uploadImage(
        req.file.buffer,
        req.file.originalname,
        'product-images'
      );

      console.log('✅ Image uploaded to Cloudinary:', result.url);
      res.json({ url: result.url, public_id: result.public_id });
    } else {
      console.error('❌ Cloudinary configuration missing');
      res.status(500).json({ error: 'Cloudinary configuration missing on server.' });
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: error.message });
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
      callbackURL: "http://localhost:5000/auth/google/callback",
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
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// ---------- AUTH ROUTES ----------
// Test endpoint to verify server is working
app.get("/auth/test", (req, res) => {
  console.log("✅ Test endpoint hit!");
  res.send("Server is working! OAuth should work too.");
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
        return res.redirect("http://localhost:5173?error=auth_failed");
      }
      if (!user) {
        console.error("❌ Google Auth Failed: No user returned");
        console.log("Info:", info);
        return res.redirect("http://localhost:5173?error=no_user");
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
        return res.redirect("http://localhost:5173?login=success");
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
      res.redirect("http://localhost:5173");
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
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- PRODUCTS ----------
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create/Update Product (Admin)
app.post("/api/products", async (req, res) => {
  try {
    const productData = req.body;

    if (productData._id) {
      // Update existing product
      const updated = await Product.findByIdAndUpdate(
        productData._id,
        productData,
        { new: true, upsert: true }
      );
      res.json(updated);
    } else {
      // Create new product
      const product = new Product(productData);
      await product.save();
      res.json(product);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update Product (Admin)
app.put("/api/products/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
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
    res.json({ cart: user.cart || [], wishlist: user.wishlist || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update user's cart
app.post("/api/cart", async (req, res) => {
  try {
    const { email, cart } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, cart, wishlist: [] });
    } else {
      user.cart = cart;
    }

    await user.save();
    res.json({ success: true, cart: user.cart });
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
        rating: avg,
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
        rating: avg,
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
    const sections = await Section.find().sort({ order: 1 });
    res.json(sections);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/sections", async (req, res) => {
  try {
    const section = new Section(req.body);
    await section.save();
    res.json(section);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/sections/:id", async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- SHOP CATEGORIES ----------
app.get("/api/shop-categories", async (req, res) => {
  try {
    const categories = await ShopCategory.find().sort({ order: 1 });
    res.json(categories);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/shop-categories", async (req, res) => {
  try {
    const category = new ShopCategory(req.body);
    await category.save();
    res.json(category);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/shop-categories/:id", async (req, res) => {
  try {
    const category = await ShopCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(category);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/shop-categories/:id", async (req, res) => {
  try {
    await ShopCategory.findByIdAndDelete(req.params.id);
    // Also delete all sub-categories in this category
    await SubCategory.deleteMany({ categoryId: req.params.id });
    res.json({ success: true });
  } catch (e) {
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
    const occasions = await SpecialOccasion.find().sort({ order: 1 });
    res.json(occasions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/special-occasions", async (req, res) => {
  try {
    const occasion = new SpecialOccasion(req.body);
    await occasion.save();
    res.json(occasion);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/special-occasions/:id", async (req, res) => {
  try {
    const occasion = await SpecialOccasion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(occasion);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/special-occasions/:id", async (req, res) => {
  try {
    await SpecialOccasion.findByIdAndDelete(req.params.id);
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

// ---------- ADMIN HD EXPORT ----------
const fs = require('fs');
const { Canvas, Image } = require('canvas'); // node-canvas
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

// ---------- MISC ROUTES ----------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
