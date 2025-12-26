const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: String,
  code: String,
  name: String,
  category: String,
  pdfPrice: Number,
  shape: String,
  image: String,
  gallery: [String],
  description: String,
  stock: Number,
  discount: Number,
  status: { type: String, default: 'Active' },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  variations: Array,
  additionalHeadsConfig: {
    enabled: { type: Boolean, default: false },
    pricePerHead: { type: Number, default: 125 },
    maxLimit: { type: Number, default: 10 }
  },
  sectionId: String,
  shopCategoryId: String,
  subCategoryId: String,
  isTrending: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false }
}, { id: false });

const UserSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
  image: String,
  email: { type: String, unique: true, required: true },
  phone: { type: String, sparse: true }, // Phone number (optional, unique if provided)
  password: { type: String }, // Hashed password
  isAdmin: { type: Boolean, default: false },
  wishlist: [String], // Array of Product IDs
  cart: [{
    productId: String,
    quantity: Number,
    customName: String,
    customImage: String,
    customDesign: Object, // Fabric.js design JSON + preview
    calculatedPrice: Number,
    originalPrice: Number,
    extraHeads: Number,
    selectedVariations: Object
  }],
  createdAt: { type: Date, default: Date.now }
});

const OrderSchema = new mongoose.Schema({
  customerId: String,
  customerName: String,
  items: Array,
  total: Number,
  status: { type: String, default: 'Pending' },
  date: { type: Date, default: Date.now }
});

const ReviewSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  userId: String,
  userName: String,
  rating: Number,
  comment: String,
  status: { type: String, default: 'Pending' }, // Pending, Approved, Rejected
  location: String,
  date: { type: Date, default: Date.now }
});

const CategorySchema = new mongoose.Schema({
  id: String,
  name: String,
  thumbnailImage: String
}, { id: false });

const ShapeSchema = new mongoose.Schema({
  id: String,
  categoryId: String,
  shapeName: String,
  productImage: String
}, { id: false });

const SizeSchema = new mongoose.Schema({
  id: String,
  shapeId: String,
  sizeLabel: String,
  price: Number
}, { id: false });

const SectionSchema = new mongoose.Schema({
  id: String,
  title: String,
  order: Number
}, { id: false });

const SubCategorySchema = new mongoose.Schema({
  id: String,
  categoryId: String,
  name: String,
  image: String,
  order: Number
}, { id: false });

const ShopCategorySchema = new mongoose.Schema({
  id: String,
  sectionId: String,
  name: String,
  image: String,
  order: Number
}, { id: false });

const WhatsAppLeadSchema = new mongoose.Schema({
  phoneNumber: String,
  message: String,
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'New' } // New, Contacted, Converted
});

const SellerSchema = new mongoose.Schema({
  id: String,
  companyName: String,
  contactPerson: String,
  email: String,
  phone: String,
  status: { type: String, default: 'Pending' },
  rating: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  returnRate: { type: Number, default: 0 },
  joinedDate: { type: Date, default: Date.now }
});

const TransactionSchema = new mongoose.Schema({
  id: String,
  orderId: String,
  amount: Number,
  type: String,
  status: String,
  date: { type: Date, default: Date.now },
  method: String
});

const ReturnRequestSchema = new mongoose.Schema({
  id: String,
  orderId: String,
  customerName: String,
  productName: String,
  reason: String,
  status: { type: String, default: 'Pending' },
  amount: Number,
  date: { type: Date, default: Date.now }
});

const CouponSchema = new mongoose.Schema({
  id: String,
  code: { type: String, unique: true },
  discountType: String,
  value: Number,
  expiryDate: Date,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  status: { type: String, default: 'Active' }
});

const SpecialOccasionSchema = new mongoose.Schema({
  id: String,
  name: String,
  image: String,
  description: String,
  link: String,
  order: Number
}, { id: false });

module.exports = {
  Product: mongoose.model('Product', ProductSchema),
  User: mongoose.model('User', UserSchema),
  Order: mongoose.model('Order', OrderSchema),
  Review: mongoose.model('Review', ReviewSchema),
  Category: mongoose.model('Category', CategorySchema),
  Shape: mongoose.model('Shape', ShapeSchema),
  Size: mongoose.model('Size', SizeSchema),
  Section: mongoose.model('Section', SectionSchema),
  ShopCategory: mongoose.model('ShopCategory', ShopCategorySchema),
  SubCategory: mongoose.model('SubCategory', SubCategorySchema),
  WhatsAppLead: mongoose.model('WhatsAppLead', WhatsAppLeadSchema),
  Seller: mongoose.model('Seller', SellerSchema),
  Transaction: mongoose.model('Transaction', TransactionSchema),
  ReturnRequest: mongoose.model('ReturnRequest', ReturnRequestSchema),
  Coupon: mongoose.model('Coupon', CouponSchema),
  SpecialOccasion: mongoose.model('SpecialOccasion', SpecialOccasionSchema)
};