
export enum Shape {
  RECTANGLE = 'RECTANGLE',
  SQUARE = 'SQUARE',
  ROUND = 'ROUND',
  HEART = 'HEART',
  OTHER = 'OTHER',
  CUSTOM = 'CUSTOM'
}

export interface VariationOption {
  id: string;
  label: string; // e.g., "Small", "Red", "Heart"
  description?: string; // e.g. "10x10cm", "Premium Wood"
  priceAdjustment: number; // Added to the base PDF price
  image?: string; // Specific image for this variation option
  size?: string;
  isDefault?: boolean; // If true, this variation's image is used as the main product image
}

export interface Variation {
  id: string;
  name: string; // e.g. "Size", "Color", "Shape"
  disableAutoSelect?: boolean;
  options: VariationOption[];
}

export type ProductStatus = 'Active' | 'Inactive' | 'Draft';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  pdfPrice: number;
  shape: Shape;
  customShapeName?: string; // Used when shape is CUSTOM
  customShapeCost?: number; // Used when shape is CUSTOM
  image: string;
  gallery?: string[]; // Additional images
  description: string;
  size?: string;
  discount?: number; // Percentage (e.g., 35)
  allowsExtraHeads?: boolean; // Deprecated - kept for backward compatibility
  additionalHeadsConfig?: {
    enabled: boolean;
    pricePerHead: number;
    maxLimit: number;
  };
  variations?: Variation[];
  stock?: number;
  sku?: string;
  status?: ProductStatus;
  rating?: number;
  reviewsCount?: number;
  sectionId?: string; // Link to shop section
  shopCategoryId?: string; // Link to shop category
  subCategoryId?: string; // Link to shop sub-category
  isTrending?: boolean;
  isBestseller?: boolean;
  symbolNumberConfig?: {
    enabled: boolean;
    title: string;
    image?: string;
  };
}

export interface CartItem extends Product {
  cartId: string;
  customName: string;
  customImage?: string | null;
  customDesign?: any; // Fabric.js design data (JSON + preview)
  calculatedPrice: number;
  originalPrice: number;
  quantity: number;
  extraHeads?: number; // Number of additional heads added
  symbolNumber?: string;
  selectedVariations?: Record<string, VariationOption>; // variationId -> selectedOption
}

export type OrderStatus = 'Pending' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned' | 'Refunded';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';
  itemsCount: number;
  trackingNumber?: string;
  courier?: string;
  returnReason?: string;
  shippingAddress?: string;
  items?: any[]; // Order items with product details
}

export type AdminRole = 'Super Admin' | 'Product Manager' | 'Order Manager' | 'Inventory Operator' | 'Finance Manager' | 'Customer Support' | 'Support Agent';

export interface User {
  email: string;
  isAdmin: boolean;
  role?: AdminRole;
  googleId?: string;
  displayName?: string;
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: 'Active' | 'Blocked';
  joinDate: string;
  address?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Flagged';
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  status: 'Active' | 'Expired';
}

export interface Seller {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  status: 'Active' | 'Pending' | 'Suspended';
  rating: number;
  balance: number;
  returnRate?: number;
}

export interface Shipment {
  id: string;
  orderId: string;
  courier: string;
  trackingId: string;
  status: 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Exception';
  estimatedDelivery: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  type: 'Credit' | 'Debit' | 'Payout';
  status: 'Success' | 'Pending' | 'Failed';
  date: string;
  method: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  productName: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  amount: number;
}

export const ADMIN_EMAILS = [
  "signgalaxy31@gmail.com",
  "viswakumar2004@gmail.com"
];

export const WHATSAPP_NUMBERS = [
  "9342310194",
  "6380016798"
];

export interface Review {
  _id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Flagged';
  date: string;
  likes?: number;
  dislikes?: number;
  title?: string;
  location?: string;
}

export interface Section {
  _id?: string;
  id: string;
  title: string; // e.g., "Personalised", "Mini You Series", "Home & Decor"
  order: number;
}

export interface ShopCategory {
  _id?: string;
  id: string;
  sectionId?: string;
  sectionIds?: string[];
  name: string; // e.g., "3D Crystals", "Wooden Plaques"
  image: string; // WebP thumbnail
  order?: number;
}

export interface SubCategory {
  _id?: string;
  id: string;
  categoryId: string; // Link to ShopCategory
  name: string;
  image: string;
  order?: number;
}

export interface SpecialOccasion {
  _id?: string;
  id: string;
  name: string;
  description: string;
  image: string;
  link: string;
  order: number;
}
