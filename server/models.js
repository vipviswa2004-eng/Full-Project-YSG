const mongoose = require('mongoose');

// Product Schema
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
  mrp: Number,
  finalPrice: Number,
  discount: Number,
  isManualDiscount: { type: Boolean, default: false },
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
  isBestseller: { type: Boolean, default: false },
  occasions: [String],
  aboutSections: [{
    id: String,
    title: String,
    content: String,
    isHidden: Boolean
  }],
  symbolNumberConfig: {
    enabled: { type: Boolean, default: false },
    title: { type: String, default: 'Symbol Number' },
    image: String
  }
}, { id: false, collection: 'products' });

// User Schema
const UserSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
  email: String,
  image: String,
  isAdmin: { type: Boolean, default: false },
  phone: String,
  password: { type: String, select: false },
  cart: [Object], // Flexible to store productId, quantity, customization, etc. without strict schema validation for now
  wishlist: [String] // Array of product IDs
}, { timestamps: true, collection: 'users' });

// Order Schema
const OrderSchema = new mongoose.Schema({
  user: Object,
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    customImage: String,
    customName: String,
    selectedVariations: Object
  }],
  total: Number,
  status: { type: String, default: 'Design Pending' },
  paymentMethod: String,
  shippingAddress: Object,
  date: { type: Date, default: Date.now },
  orderId: String,
  paymentId: String
}, { collection: 'orders' });

// Review Schema
const ReviewSchema = new mongoose.Schema({
  productId: String,
  userName: String,
  userAvatar: String,
  rating: Number,
  comment: String,
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' }, // Pending, Approved, Rejected
  images: [String]
}, { collection: 'reviews' });

// Category Schema (Legacy - keep for now)
const CategorySchema = new mongoose.Schema({
  id: String,
  name: String,
  image: String,
  subCategories: [String]
}, { collection: 'categories' });

// Shape Schema
const ShapeSchema = new mongoose.Schema({
  id: String,
  name: String,
  image: String,
  priceMultiplier: { type: Number, default: 1 }
}, { collection: 'shapes' });

// Size Schema
const SizeSchema = new mongoose.Schema({
  id: String,
  name: String,
  dimensions: String,
  priceMultiplier: { type: Number, default: 1 }
}, { collection: 'sizes' });

// Shop Sections Hierarchy
const SectionSchema = new mongoose.Schema({
  id: String,
  title: String,
  image: String,
  order: { type: Number, default: 0 }
}, { collection: 'sections' });

const ShopCategorySchema = new mongoose.Schema({
  id: String,
  name: String,
  image: String,
  sectionId: String, // References Section.id (single parent)
  sectionIds: [String], // References Section.id (multiple parents support)
  order: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false }
}, { collection: 'shopcategories' });

const SubCategorySchema = new mongoose.Schema({
  id: String,
  name: String,
  image: String,
  categoryId: String, // References ShopCategory.id
  order: { type: Number, default: 0 }
}, { collection: 'subcategories' });

// Special Occasions (Seasonal/Events like Mother's Day)
const SpecialOccasionSchema = new mongoose.Schema({
  id: String,
  name: String,
  image: String,
  description: String,
  link: String,
  order: { type: Number, default: 0 }
}, { collection: 'specialoccasions' });

// Shop By Occasion (Standard like Birthday, Wedding)
const ShopOccasionSchema = new mongoose.Schema({
  id: String,
  name: String,
  image: String,
  description: String,
  link: String,
  order: { type: Number, default: 0 },
  color: { type: String, default: 'from-gray-500 to-gray-700' }
}, { collection: 'shopoccasions' });

// Shop By Recipient
const ShopRecipientSchema = new mongoose.Schema({
  id: String,
  name: String,
  image: String,
  link: String,
  order: { type: Number, default: 0 }
}, { collection: 'shoprecipients' });

// Seller Schema
const SellerSchema = new mongoose.Schema({
  id: String,
  companyName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  joinedDate: { type: Date, default: Date.now },
  productsCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  returnRate: { type: Number, default: 0 }
}, { collection: 'sellers' });

// Transaction Schema
const TransactionSchema = new mongoose.Schema({
  id: String,
  orderId: String,
  amount: Number,
  status: { type: String, default: 'Completed' },
  date: { type: Date, default: Date.now },
  method: String,
  customerName: String
}, { collection: 'transactions' });

// Return Request Schema
const ReturnRequestSchema = new mongoose.Schema({
  id: String,
  orderId: String,
  customerName: String,
  amount: Number,
  reason: String,
  status: { type: String, default: 'Pending' },
  date: { type: Date, default: Date.now }
}, { collection: 'returnrequests' });

// Coupon Schema
const CouponSchema = new mongoose.Schema({
  id: String,
  code: String,
  discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], default: 'FIXED' },
  value: Number,
  minPurchase: Number,
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  status: { type: String, default: 'Active' }
}, { collection: 'coupons' });

// Gift Genie Query Schema
const GiftGenieQuerySchema = new mongoose.Schema({
  userId: String,
  answers: Object,
  recommendedProducts: [String],
  timestamp: { type: Date, default: Date.now }
});

// WhatsApp Lead Schema
const WhatsAppLeadSchema = new mongoose.Schema({
  phoneNumber: String,
  message: String,
  date: { type: Date, default: Date.now }
}, { collection: 'whatsapp_leads' });

// Export Models
const Product = mongoose.model('Product', ProductSchema);
const User = mongoose.model('User', UserSchema);
const Order = mongoose.model('Order', OrderSchema);
const Review = mongoose.model('Review', ReviewSchema);
const Category = mongoose.model('Category', CategorySchema);
const Shape = mongoose.model('Shape', ShapeSchema);
const Size = mongoose.model('Size', SizeSchema);
const Section = mongoose.model('Section', SectionSchema);
const ShopCategory = mongoose.model('ShopCategory', ShopCategorySchema);
const SubCategory = mongoose.model('SubCategory', SubCategorySchema);
const SpecialOccasion = mongoose.model('SpecialOccasion', SpecialOccasionSchema);
const ShopOccasion = mongoose.model('ShopOccasion', ShopOccasionSchema);
const ShopRecipient = mongoose.model('ShopRecipient', ShopRecipientSchema);
const Seller = mongoose.model('Seller', SellerSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);
const ReturnRequest = mongoose.model('ReturnRequest', ReturnRequestSchema);
const Coupon = mongoose.model('Coupon', CouponSchema);
const GiftGenieQuery = mongoose.model('GiftGenieQuery', GiftGenieQuerySchema);
const WhatsAppLead = mongoose.model('WhatsAppLead', WhatsAppLeadSchema);

module.exports = {
  Product,
  User,
  Order,
  Review,
  Category,
  Shape,
  Size,
  Section,
  ShopCategory,
  SubCategory,
  SpecialOccasion,
  ShopOccasion,
  ShopRecipient,
  Seller,
  Transaction,
  ReturnRequest,
  Coupon,
  GiftGenieQuery,
  WhatsAppLead
};
