
import React, { useState, useEffect } from 'react';
import { useCart } from '../context';
import { calculatePrice } from '../data/products';
import { Product, Variation, VariationOption, Order, Shape, Customer, Review, Coupon, Seller, OrderStatus, Transaction, ReturnRequest, Section, ShopCategory, SubCategory, SpecialOccasion, ShopOccasion, ShopRecipient } from '../types';
import { SEO } from '../components/SEO';
// import { generateProductImage, generateProductDescription, enhanceProductImage } from '../services/gemini'; // Unused
import {
    Plus, Minus, Edit, LayoutDashboard, Package,
    ShoppingBag, Search, Trash2, X, Filter,
    DollarSign, Truck, AlertCircle, CheckCircle, BarChart3, Users,
    Star, Eye, ShieldCheck,
    RotateCcw, Ticket, Ban, ImagePlus
} from 'lucide-react';

// Mock data generators removed

export const Admin: React.FC = () => {
    const { user } = useCart();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'customers' | 'sellers' | 'payments' | 'logistics' | 'returns' | 'reviews' | 'analytics' | 'coupons' | 'security' | 'settings' | 'shop-sections'>('dashboard');

    const [productList, setProductList] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);

    // Coupon Management State
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [isEditingCoupon, setIsEditingCoupon] = useState<Coupon | null>(null);
    const [newCouponData, setNewCouponData] = useState<Partial<Coupon>>({});

    // Seller Management State
    const [isEditingSeller, setIsEditingSeller] = useState<Seller | null>(null);
    const [showSellerModal, setShowSellerModal] = useState(false);
    const [newSellerData, setNewSellerData] = useState<Partial<Seller>>({});

    // Shop Sections & Categories
    const [sections, setSections] = useState<Section[]>([]);
    const [shopCategories, setShopCategories] = useState<ShopCategory[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [specialOccasions, setSpecialOccasions] = useState<SpecialOccasion[]>([]);
    const [shopOccasions, setShopOccasions] = useState<ShopOccasion[]>([]);
    const [shopRecipients, setShopRecipients] = useState<ShopRecipient[]>([]);
    const [shopSectionTab, setShopSectionTab] = useState<'sections' | 'categories' | 'sub-categories' | 'special-occasions' | 'shop-occasions' | 'shop-recipients'>('sections');
    const [subCategoryListFilter, setSubCategoryListFilter] = useState<string>('');
    const [isEditingShopItem, setIsEditingShopItem] = useState<any>(null);
    const [isConvertingCategory, setIsConvertingCategory] = useState<ShopCategory | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Draft'>('All');
    const [isEditing, setIsEditing] = useState<Product | null>(null);
    const [editedProduct, setEditedProduct] = useState<Product | null>(null);
    const [editTab, setEditTab] = useState<'vital' | 'images' | 'variations' | 'desc'>('vital'); // Removed ai-studio
    const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
    const [isAutomating, setIsAutomating] = useState(false);

    // Removed unused AI state

    useEffect(() => {
        if (isEditing) {
            const editCopy = JSON.parse(JSON.stringify(isEditing));

            // Sync category name from shopCategories to ensure consistency
            if (editCopy.shopCategoryId && (!editCopy.shopCategoryIds || editCopy.shopCategoryIds.length === 0)) {
                editCopy.shopCategoryIds = [editCopy.shopCategoryId];
            }

            if (editCopy.shopCategoryIds && editCopy.shopCategoryIds.length > 0 && shopCategories.length > 0) {
                const mainCatId = editCopy.shopCategoryIds[0];
                const cat = shopCategories.find((c: any) => (c.id === mainCatId || c._id === mainCatId));
                if (cat) {
                    editCopy.category = cat.name;
                    if (cat.sectionIds && cat.sectionIds.length > 0) editCopy.sectionId = cat.sectionIds[0];
                    else if (cat.sectionId) editCopy.sectionId = cat.sectionId;
                }
            }

            setEditedProduct(editCopy);
            setEditTab('vital');
        } else {
            setEditedProduct(null);
        }
    }, [isEditing, shopCategories]);

    // ... Database Sync Logic ...
    const fetchReviews = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, { cache: 'no-store' });
            const data = await res.json();
            setReviews(data);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        }
    };

    const handleReviewAction = async (id: string, action: 'Approve' | 'Reject' | 'Delete') => {
        try {
            if (action === 'Delete') {
                const reviewToDelete = reviews.find(r => r._id === id || r.id === id);
                await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}`, { method: 'DELETE' });
                if (reviewToDelete && reviewToDelete.productId) {
                    const remainingReviews = reviews.filter(r =>
                        (r.productId === reviewToDelete.productId) &&
                        (r._id !== id && r.id !== id)
                    );
                    const newCount = remainingReviews.length;
                    let newRating = 0;
                    if (newCount > 0) {
                        const totalRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0);
                        newRating = parseFloat((totalRating / newCount).toFixed(1));
                    }
                    const product = productList.find(p => p.id === reviewToDelete.productId || (p as any)._id === reviewToDelete.productId);
                    if (product) {
                        const prodId = (product as any)._id || product.id;
                        await fetch(`${import.meta.env.VITE_API_URL}/api/products/${prodId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ...product,
                                rating: newRating,
                                reviewsCount: newCount
                            })
                        });
                        setProductList(prev => prev.map(p =>
                            (p.id === product.id) ? { ...p, rating: newRating, reviewsCount: newCount } : p
                        ));
                    }
                }
            } else {
                await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: action === 'Approve' ? 'Approved' : 'Rejected' })
                });
            }
            fetchReviews();
        } catch (error) {
            console.error("Failed to update review", error);
        }
    };

    const fetchShopData = async () => {
        try {
            const t = Date.now();
            const [sectionsRes, categoriesRes, subCategoriesRes, occasionsRes, shopOccasionsRes, recipientsRes, couponsRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/api/sections?t=${t}`),
                fetch(`${import.meta.env.VITE_API_URL}/api/shop-categories?t=${t}`),
                fetch(`${import.meta.env.VITE_API_URL}/api/sub-categories?t=${t}`),
                fetch(`${import.meta.env.VITE_API_URL}/api/special-occasions?t=${t}`),
                fetch(`${import.meta.env.VITE_API_URL}/api/shop-occasions?t=${t}`),
                fetch(`${import.meta.env.VITE_API_URL}/api/shop-recipients?t=${t}`),
                fetch(`${import.meta.env.VITE_API_URL}/api/coupons?t=${t}`)
            ]);

            const parseSafe = async (res: Response) => {
                try {
                    const data = await res.json();
                    return Array.isArray(data) ? data : [];
                } catch (e) {
                    console.error("Error parsing response:", e);
                    return [];
                }
            };

            setSections(await parseSafe(sectionsRes));
            setShopCategories(await parseSafe(categoriesRes));
            setSubCategories(await parseSafe(subCategoriesRes));
            setSpecialOccasions(await parseSafe(occasionsRes));
            setShopOccasions(await parseSafe(shopOccasionsRes));
            setShopRecipients(await parseSafe(recipientsRes));
            setCoupons(await parseSafe(couponsRes));
        } catch (error) {
            console.error("Failed to fetch shop data", error);
        }
    };

    const fetchSellerList = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sellers`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setSellers(data);
            }
        } catch (error) {
            console.error("Failed to fetch sellers", error);
        }
    };





    const handleSaveSeller = async () => {
        if (!newSellerData.companyName || !newSellerData.contactPerson || !newSellerData.email || !newSellerData.phone) {
            alert("All 4 fields (Company Name, Contact Person, Email, Phone) are mandatory.");
            return;
        }

        try {
            const method = isEditingSeller ? 'PUT' : 'POST';
            const url = isEditingSeller
                ? `${import.meta.env.VITE_API_URL}/api/sellers/${isEditingSeller.id}`
                : `${import.meta.env.VITE_API_URL}/api/sellers`;

            const payload = {
                ...newSellerData,
                id: isEditingSeller ? isEditingSeller.id : `sell_${Date.now()}`,
                status: isEditingSeller ? isEditingSeller.status : 'Pending',
                joinedDate: isEditingSeller ? isEditingSeller.joinedDate : new Date(),
                productsCount: isEditingSeller ? isEditingSeller.productsCount : 0,
                rating: isEditingSeller ? isEditingSeller.rating : 0,
                balance: isEditingSeller ? isEditingSeller.balance : 0,
                returnRate: isEditingSeller ? isEditingSeller.returnRate : 0
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowSellerModal(false);
                setIsEditingSeller(null);
                setNewSellerData({});
                fetchSellerList();
            } else {
                alert('Failed to save seller');
            }
        } catch (error) {
            console.error('Error saving seller:', error);
            alert('Error saving seller');
        }
    };

    const handleSellerAction = async (id: string, action: 'Approve' | 'Suspend' | 'Activate' | 'Delete') => {
        try {
            if (action === 'Delete') {
                if (confirm('Are you sure you want to delete this seller?')) {
                    await fetch(`${import.meta.env.VITE_API_URL}/api/sellers/${id}`, { method: 'DELETE' });
                }
            } else {
                const statusMap = { 'Approve': 'Active', 'Suspend': 'Suspended', 'Activate': 'Active' };
                await fetch(`${import.meta.env.VITE_API_URL}/api/sellers/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: statusMap[action] })
                });
            }
            fetchSellerList();
        } catch (error) {
            console.error("Failed to update seller", error);
        }
    };

    const handleSaveCoupon = async () => {
        const isB2G1 = newCouponData.discountType === 'B2G1';

        if (!newCouponData.code || (!isB2G1 && !newCouponData.value) || !newCouponData.expiryDate) {
            alert(isB2G1 ? "Code and Expiry Date are required." : "Code, Value, and Expiry Date are required.");
            return;
        }

        try {
            const method = isEditingCoupon ? 'PUT' : 'POST';
            const url = isEditingCoupon
                ? `${import.meta.env.VITE_API_URL}/api/coupons/${isEditingCoupon._id || isEditingCoupon.id}`
                : `${import.meta.env.VITE_API_URL}/api/coupons`;

            const payload = {
                ...newCouponData,
                value: isB2G1 ? 0 : newCouponData.value, // B2G1 doesnt need a value input
                id: isEditingCoupon ? isEditingCoupon.id : `coup_${Date.now()}`,
                status: isEditingCoupon ? isEditingCoupon.status : 'Active',
                usedCount: isEditingCoupon ? isEditingCoupon.usedCount : 0,
                discountType: newCouponData.discountType || 'FIXED',
                usageLimit: newCouponData.usageLimit || 1
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowCouponModal(false);
                setIsEditingCoupon(null);
                setNewCouponData({});
                // Refresh list
                const refreshed = await fetch(`${import.meta.env.VITE_API_URL}/api/coupons`).then(r => r.json());
                setCoupons(refreshed);
                alert('Coupon saved successfully!');
            } else {
                alert('Failed to save coupon');
            }
        } catch (error) {
            console.error("Error saving coupon", error);
            alert("Error saving coupon");
        }
    };

    const handleDeleteCoupon = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/coupons/${id}`, { method: 'DELETE' });
            setCoupons(prev => prev.filter(c => c.id !== id));
        } catch (e) { console.error(e); alert("Failed to delete coupon"); }
    };

    useEffect(() => {
        console.log('🔄 Loading products from database...');
        fetch(`${import.meta.env.VITE_API_URL}/api/products?t=${Date.now()}`, {
            headers: { 'Cache-Control': 'no-cache' }
        })
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    setProductList(data);
                }
            })
            .catch(err => console.error("❌ Failed to load products:", err));

        fetchReviews();
        fetchShopData();
        fetchSellerList();
    }, []);

    const handleShopItemSave = async (type: 'sections' | 'categories' | 'sub-categories' | 'special-occasions' | 'shop-occasions' | 'shop-recipients', data: any) => {
        try {
            let finalData = { ...data };

            // If image is base64, upload to Cloudinary first
            if (finalData.image && finalData.image.startsWith('data:')) {
                console.log('📤 Uploading base64 image to Cloudinary...');
                try {
                    // Convert base64 to blob
                    const response = await fetch(finalData.image);
                    const blob = await response.blob();

                    // Create form data
                    const formData = new FormData();
                    formData.append('image', blob, 'category-image.png');

                    // Upload to Cloudinary
                    const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
                        method: 'POST',
                        body: formData
                    });

                    if (uploadResponse.ok) {
                        const uploadData = await uploadResponse.json();
                        finalData.image = uploadData.url;
                        console.log('✅ Image uploaded successfully:', uploadData.url);
                    } else {
                        console.warn('⚠️ Cloudinary upload failed, using base64 as fallback');
                        // Keep base64 as fallback
                    }
                } catch (uploadError) {
                    console.error('❌ Image upload error:', uploadError);
                    console.warn('⚠️ Using base64 as fallback');
                    // Keep base64 as fallback
                }
            }

            const method = finalData._id ? 'PUT' : 'POST';
            const apiPath = type === 'sections' ? 'sections' : type === 'categories' ? 'shop-categories' : type === 'sub-categories' ? 'sub-categories' : type === 'special-occasions' ? 'special-occasions' : type === 'shop-recipients' ? 'shop-recipients' : 'shop-occasions';
            const url = `${import.meta.env.VITE_API_URL}/api/${apiPath}${finalData._id ? `/${finalData._id}` : ''}`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Failed to save ${type}`);
            }

            fetchShopData();
            setIsEditingShopItem(null);
            alert(`${type === 'sections' ? 'Section' : type === 'categories' ? 'Category' : type === 'sub-categories' ? 'Sub-category' : type === 'special-occasions' ? 'Special Occasion' : 'Shop Occasion'} saved successfully!`);
        } catch (error: any) {
            console.error(`Failed to save ${type}`, error);
            alert(`Error: ${error.message}`);
        }
    };

    const handleShopItemDelete = async (type: 'sections' | 'categories' | 'sub-categories' | 'special-occasions' | 'shop-occasions' | 'shop-recipients', id: string) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const apiPath = type === 'sections' ? 'sections' : type === 'categories' ? 'shop-categories' : type === 'sub-categories' ? 'sub-categories' : type === 'special-occasions' ? 'special-occasions' : type === 'shop-recipients' ? 'shop-recipients' : 'shop-occasions';
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/${apiPath}/${id}`, { method: 'DELETE' });

            if (!res.ok) throw new Error(`Failed to delete ${type}`);

            fetchShopData();
            alert("Deleted successfully!");
        } catch (error: any) {
            console.error(`Failed to delete ${type}`, error);
            alert(`Error: ${error.message}`);
        }
    };

    const handleCategoryConvert = async (categoryId: string, parentCategoryId: string) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shop-categories/${categoryId}/convert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentCategoryId })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to convert category");
            }
            alert("Category converted successfully!");
            setIsConvertingCategory(null);
            fetchShopData();
        } catch (error: any) {
            console.error("Conversion failed:", error);
            alert(`Error: ${error.message}`);
        }
    };


    const filteredProducts = productList.filter(product => {
        const matchesSearch = !searchQuery ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase().trim());
        const matchesStatus = statusFilter === 'All' || product.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (!user || !user.isAdmin) {
        return (
            <>
                <SEO title="Access Denied" noindex={true} />
                <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">Access Denied</div>
            </>
        );
    }

    const handleDeleteProduct = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                const product = productList.find(p => p.id === id);
                if (product && (product as any)._id) {
                    await fetch(`${import.meta.env.VITE_API_URL}/api/products/${(product as any)._id}`, {
                        method: 'DELETE',
                        cache: 'no-store'
                    });
                }
                setProductList(prev => prev.filter(p => p.id !== id));
            } catch (e) {
                console.error("Failed to delete product", e);
            }
        }
    };
    const handleActivateAllProducts = async () => {
        if (window.confirm("Are you sure you want to set ALL products to Active status? This action cannot be undone.")) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/activate-all`, {
                    method: 'POST',
                    cache: 'no-store'
                });
                const data = await response.json();
                if (data.success) {
                    alert(`Successfully activated ${data.modifiedCount} products.`);
                    fetchProducts();
                } else {
                    alert("Failed to activate products: " + (data.error || "Unknown error"));
                }
            } catch (e) {
                console.error("Failed to activate all products", e);
                alert("An error occurred. Please try again.");
            }
        }
    };
    const handleStockUpdate = async (id: string, newStock: number) => {
        const updatedList = productList.map(p => p.id === id ? { ...p, stock: Math.max(0, newStock) } : p);
        setProductList(updatedList);

        try {
            const product = updatedList.find(p => p.id === id);
            if (product && (product as any)._id) {
                await fetch(`${import.meta.env.VITE_API_URL}/api/products/${(product as any)._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(product),
                    cache: 'no-store'
                });
            }
        } catch (e) {
            console.error("Failed to update stock", e);
        }
    };
    const toggleCustomerStatus = async (id: string) => {
        try {
            const customer = customers.find(c => c.id === id);
            // Assuming id is already _id or mapped to it in fetchCustomers
            // Since fetchCustomers maps nothing currently (just setCustomers(data)), 
            // if customer was created via API it has _id. 
            // If we use 'id' field in frontend but API expects '_id' in params...
            // MongoDB user docs usually have _id. 
            // Let's assume id passed here is the one used in key/render, which is likely _id for real data.
            // But wait, my fetchCustomers logic didn't map _id to id.
            // So if I use `_id` as key in map, `id` here is `_id`.

            if (!customer) return;

            const newStatus = customer.status === 'Active' ? 'Blocked' : 'Active';

            // For now, I'll try to use 'id' directly as it might be _id if I updated types
            await fetch(`${import.meta.env.VITE_API_URL}/api/customers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        } catch (error) {
            console.error("Failed to toggle customer status", error);
        }
    };
    const updateOrderStatus = async (id: string, status: OrderStatus) => {
        try {
            const order = orders.find(o => o.id === id);
            if (!order || !(order as any)._id) return; // Need _id for API

            await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${(order as any)._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            // Optimistic update or fetch
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        } catch (error) {
            console.error("Failed to update order status", error);
        }
    };

    // ... handleImageUpload (keep) ...
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'variant', varId?: string, optId?: string) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validation
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                alert("Invalid file type. Please upload JPG, JPEG, PNG, or WEBP.");
                return;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB
                alert("File is too large. Maximum size is 10MB.");
                return;
            }

            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (data.url) {
                    const imageUrl = data.url;
                    if (target === 'main' && editedProduct) {
                        setEditedProduct(prev => {
                            if (!prev) return null;
                            const currentGallery = prev.gallery || [];
                            const nextGallery = currentGallery.includes(imageUrl)
                                ? currentGallery
                                : [imageUrl, ...currentGallery];
                            return { ...prev, image: imageUrl, gallery: nextGallery };
                        });
                    } else if (target === 'variant' && editedProduct && varId && optId) {
                        setEditedProduct(prev => {
                            if (!prev) return null;
                            const currentGallery = prev.gallery || [];
                            const nextGallery = currentGallery.includes(imageUrl)
                                ? currentGallery
                                : [...currentGallery, imageUrl];
                            const newVars = prev.variations?.map(v => {
                                if (v.id === varId) {
                                    return {
                                        ...v,
                                        options: v.options.map(o => o.id === optId ? { ...o, image: imageUrl } : o)
                                    };
                                }
                                return v;
                            });
                            return { ...prev, variations: newVars, gallery: nextGallery };
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to upload image", error);
                alert("Failed to upload image. Please try again.");
            }
        }
    };

    const handleSetDefaultOption = (type: 'variation' | 'gallery', varId?: string, optId?: string, galleryIdx?: number) => {
        setEditedProduct(prev => {
            if (!prev) return null;

            let nextImage = prev.image;
            let nextMRP = prev.mrp;
            let nextFinal = prev.finalPrice;
            let nextDiscount = prev.discount;
            let nextIsManual = prev.isManualDiscount;
            let nextVariations = prev.variations;

            if (type === 'variation' && varId && optId) {
                nextVariations = prev.variations?.map(v => {
                    if (v.id === varId) {
                        return {
                            ...v,
                            options: v.options.map(o => {
                                const isMatch = o.id === optId;
                                if (isMatch) {
                                    if (o.image) nextImage = o.image;
                                    // Update pricing from default variation
                                    if (o.mrp !== undefined) nextMRP = o.mrp;
                                    if (o.finalPrice !== undefined) nextFinal = o.finalPrice;
                                    if (o.discount !== undefined) nextDiscount = o.discount;
                                    if (o.isManualDiscount !== undefined) nextIsManual = o.isManualDiscount;
                                }
                                return { ...o, isDefault: isMatch };
                            })
                        };
                    }
                    // For other variations, ensure only one variation can have a "default" that affects main pricing?
                    // Actually, usually only one variation type (like Size) is the "base" price.
                    // But for now, we just unmark others in THIS variation.
                    return v;
                });
            } else if (type === 'gallery' && galleryIdx !== undefined && prev.gallery?.[galleryIdx]) {
                nextImage = prev.gallery[galleryIdx];
                // Sync with variations if this image belongs to one
                prev.variations?.forEach(v => {
                    const matchedOption = v.options.find(o => o.image === nextImage);
                    if (matchedOption) {
                        if (matchedOption.mrp !== undefined) nextMRP = matchedOption.mrp;
                        if (matchedOption.finalPrice !== undefined) nextFinal = matchedOption.finalPrice;
                        if (matchedOption.discount !== undefined) nextDiscount = matchedOption.discount;
                        if (matchedOption.isManualDiscount !== undefined) nextIsManual = matchedOption.isManualDiscount;

                        nextVariations = nextVariations?.map(v2 => {
                            if (v2.id === v.id) {
                                return {
                                    ...v2,
                                    options: v2.options.map(o2 => ({
                                        ...o2,
                                        isDefault: o2.id === matchedOption.id
                                    }))
                                };
                            }
                            return v2;
                        });
                    }
                });
            }

            return {
                ...prev,
                image: nextImage,
                variations: nextVariations,
                mrp: nextMRP,
                finalPrice: nextFinal,
                discount: nextDiscount,
                isManualDiscount: nextIsManual,
                pdfPrice: nextMRP || prev.pdfPrice
            };
        });
    };

    // Helper for Premium Pricing Logic
    // Helper for Premium Pricing Logic
    // RULES: 
    // 1. Final Price must end in 9 (X9). 
    // 2. MRP must end in 99 (X99).
    // 3. Discount approx 35-50%.
    const calculatePremiumPricing = (rawFinalPrice: number) => {
        if (!rawFinalPrice || rawFinalPrice <= 0) return { final: rawFinalPrice, mrp: 0, discount: 0 };

        // 1. Enforce Final Price ending in 9
        // Logic: Round to nearest 10, then subtract 1. (800 -> 799, 804 -> 799, 805 -> 809)
        let final = Math.round(rawFinalPrice / 10) * 10 - 1;
        if (final <= 0) final = 9; // Safety

        // 2. Minimum Price Difference Rule: MRP - Final >= 1000
        const MIN_DIFF = 1000;
        const minMRPByDiff = final + MIN_DIFF;

        // 3. Ratio Rule: At least 1.35x
        const minMRPByRatio = Math.ceil(final * 1.35);

        // Absolute Minimum MRP allowed
        const absoluteMinMRP = Math.max(minMRPByDiff, minMRPByRatio);

        // Find nearest X99 >= absoluteMinMRP
        // Start from base of absoluteMinMRP
        let base = Math.floor(absoluteMinMRP / 100) * 100;
        let candidates = [
            base - 100 + 99,
            base + 99,
            base + 100 + 99,
            base + 200 + 99
        ];

        // Filter valid candidates
        candidates = candidates.filter(c => c >= absoluteMinMRP);

        let bestMRP = 0;
        if (candidates.length > 0) {
            // Pick the smallest valid X99 that satisfies the condition (to keep it competitive but premium)
            // Or pick closest to 1.6x if possible?
            // Let's target 1.6x if it satisfies the condition
            let targetMRP = final * 1.6;
            // Best one is closest to target BUT must be >= absoluteMinMRP
            bestMRP = candidates.reduce((prev, curr) => {
                return (Math.abs(curr - targetMRP) < Math.abs(prev - targetMRP) ? curr : prev);
            });
        } else {
            // Fallback construction
            let approxBase = Math.floor(absoluteMinMRP / 100) * 100;
            bestMRP = approxBase + 99;
            if (bestMRP < absoluteMinMRP) bestMRP += 100;
        }

        let discount = Math.round(((bestMRP - final) / bestMRP) * 100);

        return { final, mrp: bestMRP, discount };
    };

    // Removed unused helper functions (handleAddVariation, etc.)
    const saveProduct = async () => {
        if (!editedProduct) return;

        console.log('💾 Saving product:', editedProduct.name, 'ID:', editedProduct.id, 'MongoID:', (editedProduct as any)._id);

        let finalProduct = { ...editedProduct };

        // Use custom id from shopCategoryId if available
        if (finalProduct.shopCategoryIds && finalProduct.shopCategoryIds.length > 0) {
            const mainCatId = finalProduct.shopCategoryIds[0];
            finalProduct.shopCategoryId = mainCatId; // Backward compatibility
            const cat = shopCategories.find(c => (c.id === mainCatId) || ((c as any)._id === mainCatId));
            if (cat) {
                finalProduct.category = cat.name;
                // Preserve section mapping from category
                if (cat.sectionIds && cat.sectionIds.length > 0) {
                    finalProduct.sectionId = cat.sectionIds[0];
                } else if (cat.sectionId) {
                    finalProduct.sectionId = cat.sectionId;
                }
            }
        }

        try {
            const mongoId = (finalProduct as any)._id || (finalProduct as any).id;
            const isUpdate = !!(finalProduct as any)._id;

            const method = isUpdate ? 'PUT' : 'POST';
            const url = isUpdate
                ? `${import.meta.env.VITE_API_URL}/api/products/${mongoId}`
                : `${import.meta.env.VITE_API_URL}/api/products`;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalProduct),
                cache: 'no-store'
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to save product');
            }

            const savedProduct = await response.json();
            console.log('✅ Product saved successfully:', savedProduct);

            // Merge server response with sent data to ensure fields aren't lost if server strips them (e.g. schema desync)
            const finalSaved = {
                ...finalProduct,
                ...savedProduct,
                // Explicitly preserve these fields if server didn't return them
                shopCategoryIds: (savedProduct.shopCategoryIds && savedProduct.shopCategoryIds.length > 0)
                    ? savedProduct.shopCategoryIds
                    : finalProduct.shopCategoryIds,
                subCategoryId: savedProduct.subCategoryId || finalProduct.subCategoryId
            };

            // Update local state robustly
            setProductList(prev => {
                const index = prev.findIndex(p =>
                    ((p as any)._id && (p as any)._id === finalSaved._id) ||
                    (p.id === finalSaved.id)
                );

                if (index !== -1) {
                    const newList = [...prev];
                    newList[index] = finalSaved;
                    return newList;
                } else {
                    return [...prev, finalSaved];
                }
            });

            setIsEditing(null);
        } catch (e: any) {
            console.error("Failed to save product", e);
            alert(`Failed to save product: ${e.message}`);
        }
    };

    const renderDashboard = () => {
        // Calculate Metrics
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const totalOrders = orders.length;
        const totalCustomers = customers.length;
        const pendingReturns = returns.filter(r => r.status === 'Pending').length;

        // Low Stock
        const lowStockProducts = productList.filter(p => (p.stock || 0) < 10).slice(0, 5);

        // Recent Orders
        const recentOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        return (
            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-bold">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-bold">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100">
                            <ShoppingBag className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-bold">Total Customers</p>
                            <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
                        </div>
                        <div className="p-3 rounded-full bg-purple-100">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-bold">Pending Returns</p>
                            <p className="text-2xl font-bold text-gray-900">{pendingReturns}</p>
                        </div>
                        <div className="p-3 rounded-full bg-red-100">
                            <RotateCcw className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Orders - Spans 2 cols */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" /> Recent Orders
                            </h3>
                            <button onClick={() => setActiveTab('orders')} className="text-xs text-blue-600 hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3">Order ID</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Total</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentOrders.length > 0 ? recentOrders.map(o => (
                                        <tr key={o.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                                            <td className="px-4 py-3">{o.customerName}</td>
                                            <td className="px-4 py-3 text-gray-500">{new Date(o.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 font-medium">₹{o.total}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${o.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                    o.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                                        o.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                            o.status === 'Design Approved' ? 'bg-teal-100 text-teal-700' :
                                                                o.status === 'Design Changes Requested' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {o.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-8 text-gray-400">No recent orders</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Low Stock Alerts & Quick Stats */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-red-50">
                                <h3 className="font-bold text-red-800 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Low Stock Alerts
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {lowStockProducts.length > 0 ? lowStockProducts.map(p => (
                                    <div key={p.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <img src={p.image} alt="" className="w-8 h-8 rounded object-cover border" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.name}</p>
                                                <p className="text-xs text-gray-500">{p.code}</p>
                                            </div>
                                        </div>
                                        <span className="text-red-600 font-bold text-sm">{p.stock} left</span>
                                    </div>
                                )) : (
                                    <div className="p-4 text-center text-green-600 text-sm">All products strictly stocked!</div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary to-purple-700 rounded-xl p-6 text-white text-center shadow-md">
                            <h3 className="font-bold text-lg mb-2">Grow Your Business</h3>
                            <p className="text-sm opacity-90 mb-4">Add new products or create a marketing campaign.</p>
                            <button onClick={() => setIsEditing({ id: `NEW-${Date.now()}`, code: '', name: 'New Product', category: 'Uncategorized', pdfPrice: 0, shape: Shape.RECTANGLE, image: 'https://via.placeholder.com/150', description: '', stock: 0, status: 'Draft', variations: [] })} className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-bold w-full hover:bg-gray-100 transition shadow-sm">
                                + Add Product
                            </button>
                        </div>
                    </div>
                </div>
                {/* Coupon Modal */}
                {showCouponModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800">{isEditingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h3>
                                <button onClick={() => setShowCouponModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Coupon Code</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2 uppercase"
                                        value={newCouponData.code || ''}
                                        onChange={e => setNewCouponData({ ...newCouponData, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g. SUMMER50"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Discount Type</label>
                                        <select
                                            className="w-full border rounded-lg p-2"
                                            value={newCouponData.discountType || 'FIXED'}
                                            onChange={e => setNewCouponData({ ...newCouponData, discountType: e.target.value as any })}
                                        >
                                            <option value="FIXED">Flat Amount (₹)</option>
                                            <option value="PERCENTAGE">Percentage (%)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Value</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg p-2"
                                            value={newCouponData.value || ''}
                                            onChange={e => setNewCouponData({ ...newCouponData, value: parseFloat(e.target.value) })}
                                            placeholder="e.g. 100"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Expiry Date</label>
                                        <input
                                            type="date"
                                            className="w-full border rounded-lg p-2"
                                            value={newCouponData.expiryDate ? new Date(newCouponData.expiryDate).toISOString().split('T')[0] : ''}
                                            onChange={e => setNewCouponData({ ...newCouponData, expiryDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Usage Limit</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg p-2"
                                            value={newCouponData.usageLimit || ''}
                                            onChange={e => setNewCouponData({ ...newCouponData, usageLimit: parseInt(e.target.value) })}
                                            placeholder="e.g. 1000"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveCoupon}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                                >
                                    {isEditingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderProducts = () => {
        const stats = {
            total: productList.length,
            active: productList.filter(p => p.status === 'Active').length,
            outOfStock: productList.filter(p => (p.stock || 0) === 0).length,
            lowStock: productList.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 10).length
        };

        return (
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Package className="w-7 h-7 text-primary" /> Inventory Management
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Track stock levels, update pricing, and manage product visibility</p>
                    </div>
                </div>

                {/* Inventory Insight Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] cursor-default">
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Products</p>
                            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] cursor-default">
                        <div className="p-3 bg-green-50 rounded-lg text-green-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active</p>
                            <p className="text-xl font-bold text-gray-900">{stats.active}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] cursor-default">
                        <div className="p-3 bg-red-50 rounded-lg text-red-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Out of Stock</p>
                            <p className="text-xl font-bold text-gray-900">{stats.outOfStock}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] cursor-default">
                        <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
                            <Filter className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Low Stock</p>
                            <p className="text-xl font-bold text-gray-900">{stats.lowStock}</p>
                        </div>
                    </div>
                </div>

                {/* Search and Action Bar */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-4 z-20 backdrop-blur-md bg-white/95">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div className="flex flex-1 gap-3">
                            <div className="relative flex-1 group">
                                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-gray-50/50 hover:bg-white"
                                    placeholder="Search by name, SKU, or category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary bg-white appearance-none cursor-pointer hover:bg-gray-50 transition-colors font-medium text-gray-700 min-w-[140px]"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Draft">Draft</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <LayoutDashboard className="w-3.5 h-3.5 rotate-90" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleActivateAllProducts}
                                className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-green-700 hover:shadow-lg hover:shadow-green-200/50 transition-all active:scale-95 border border-green-700"
                            >
                                <CheckCircle className="w-4 h-4" /> Activate All
                            </button>
                            <button
                                onClick={() => setIsEditing({
                                    id: `NEW-${Date.now()}`,
                                    code: '',
                                    name: 'New Product',
                                    category: 'Uncategorized',
                                    pdfPrice: 0,
                                    shape: Shape.RECTANGLE,
                                    image: 'https://via.placeholder.com/150',
                                    description: '',
                                    stock: 0,
                                    status: 'Draft',
                                    variations: [],
                                    aboutSections: [
                                        { id: 'desc', title: 'Description', content: '', isHidden: false },
                                        { id: 'instr', title: 'Instructions', content: 'Handle with care. Clean with a soft, dry cloth.', isHidden: false },
                                        { id: 'del', title: 'Delivery Info', content: 'Standard shipping available.', isHidden: false }
                                    ]
                                })}
                                className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-purple-700 hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95 shadow-sm shadow-primary/20"
                            >
                                <Plus className="w-5 h-5" /> Add Product
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden border-separate border-spacing-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left font-bold text-gray-600 uppercase tracking-wider text-[11px]">Product Details</th>
                                    <th className="px-6 py-4 text-left font-bold text-gray-600 uppercase tracking-wider text-[11px]">Category</th>
                                    <th className="px-6 py-4 text-left font-bold text-gray-600 uppercase tracking-wider text-[11px]">Stock Status</th>
                                    <th className="px-6 py-4 text-left font-bold text-gray-600 uppercase tracking-wider text-[11px]">Pricing</th>
                                    <th className="px-6 py-4 text-left font-bold text-gray-600 uppercase tracking-wider text-[11px]">Visibility</th>
                                    <th className="px-6 py-4 text-right font-bold text-gray-600 uppercase tracking-wider text-[11px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.map(p => (
                                    <tr key={p._id || p.id} className="hover:bg-blue-50/30 transition-all group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img
                                                        src={p.image}
                                                        className="w-12 h-12 rounded-xl border border-gray-100 object-cover shadow-sm group-hover:scale-110 transition-transform duration-300"
                                                        alt={p.name}
                                                    />
                                                    {(p.stock || 0) < 5 && (
                                                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">{p.name}</span>
                                                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 tracking-tight uppercase flex items-center gap-1 group-hover:text-gray-600">
                                                        #{p.code}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center bg-gray-100/50 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl p-1 w-fit transition-all shadow-inner hover:shadow-sm">
                                                    <button
                                                        onClick={() => handleStockUpdate(p.id, (p.stock || 0) - 1)}
                                                        className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={p.stock || 0}
                                                        onChange={(e) => handleStockUpdate(p.id, parseInt(e.target.value) || 0)}
                                                        className="w-10 text-center text-sm font-black bg-transparent focus:outline-none h-6"
                                                    />
                                                    <button
                                                        onClick={() => handleStockUpdate(p.id, (p.stock || 0) + 1)}
                                                        className="p-1 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 transition-all"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {(p.stock || 0) <= 0 ? (
                                                        <span className="h-2 w-2 rounded-full bg-red-500 shadow-sm shadow-red-200" />
                                                    ) : (p.stock || 0) < 10 ? (
                                                        <span className="h-2 w-2 rounded-full bg-yellow-500 shadow-sm shadow-yellow-200" />
                                                    ) : (
                                                        <span className="h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-200" />
                                                    )}
                                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${(p.stock || 0) <= 0 ? 'text-red-500' : (p.stock || 0) < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                        {(p.stock || 0) <= 0 ? 'Out of Stock' : (p.stock || 0) < 10 ? 'Low Stock' : 'Available'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const cp = calculatePrice(p);
                                                const hasDiscount = cp.original > cp.final;
                                                const discountPercent = hasDiscount ? Math.round((1 - cp.final / cp.original) * 100) : 0;

                                                if (hasDiscount) {
                                                    return (
                                                        <div className="flex flex-col">
                                                            <div className="text-gray-400 line-through text-[10px] font-medium italic">₹{cp.original}</div>
                                                            <div className="font-black text-gray-900 text-base flex items-center gap-1.5 leading-none">
                                                                ₹{cp.final}
                                                                <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full font-bold">
                                                                    -{discountPercent}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return <div className="font-black text-gray-900 text-lg leading-none">₹{cp.final}</div>;
                                            })()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest border transition-all shadow-sm ${p.status === 'Active' ? 'bg-green-600 text-white border-green-700 shadow-green-100' :
                                                p.status === 'Draft' ? 'bg-amber-100 text-amber-700 border-amber-200 shadow-amber-50' :
                                                    'bg-slate-100 text-slate-700 border-slate-200 shadow-slate-50'
                                                }`}>
                                                {p.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out">
                                                <button
                                                    onClick={() => setIsEditing({
                                                        ...p,
                                                        aboutSections: p.aboutSections || [
                                                            { id: 'desc', title: 'Description', content: p.description || '', isHidden: false },
                                                            { id: 'instr', title: 'Instructions', content: 'Handle with care. Clean with a soft, dry cloth.', isHidden: false },
                                                            { id: 'del', title: 'Delivery Info', content: 'Standard shipping available.', isHidden: false }
                                                        ]
                                                    })}
                                                    className="p-2.5 bg-white border border-gray-200 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-95"
                                                    title="Edit Product"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(p.id)}
                                                    className="p-2.5 bg-white border border-gray-200 text-red-500 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm active:scale-95"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div >
        );
    };
    const fetchProducts = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setProductList(data);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/customers`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setCustomers(data);
            }
        } catch (error) {
            console.error("Failed to fetch customers", error);
        }
    };

    const autoTagRules = [
        { tag: 'Birthday', keywords: ['Birthday', 'Bday', 'Year'] },
        { tag: 'Wedding & Anniversary', keywords: ['Wedding', 'Anniversary', 'Marriage', 'Engagement', 'Bride', 'Groom', 'Spouse', 'Wifey', 'Hubby'] },
        { tag: 'Love & Romance', keywords: ['Love', 'Valentine', 'Romance', 'Heart', 'Date', 'Soulmate'] },
        { tag: 'For Kids', keywords: ['Kid', 'Child', 'Baby', 'School', 'Toy', 'Boy', 'Girl', 'Son', 'Daughter', 'Born'] },
        { tag: 'Him', keywords: ['Him', 'Husband', 'Boyfriend', 'Dad', 'Father', 'Brother', 'Men', 'Man', 'Grandfather', 'Papa', 'Appa', 'Thatha', 'Hubby'] },
        { tag: 'Her', keywords: ['Her', 'Wife', 'Girlfriend', 'Mom', 'Mother', 'Sister', 'Woman', 'Women', 'Lady', 'Grandmother', 'Amma', 'Pati', 'Wifey'] },
        { tag: 'Couples', keywords: ['Couple', 'Pair', 'Husband & Wife', 'Mr & Mrs', 'Together', 'Wedding'] },
        { tag: 'Kids', keywords: ['Kid', 'Child', 'Baby', 'School', 'Toy', 'Boy', 'Girl', 'Son', 'Daughter'] },
        { tag: 'Parents', keywords: ['Parent', 'Mom & Dad', 'Father & Mother', 'Anniversary', 'Amma & Appa'] }
    ];

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        if (!editedProduct) return;

        const nameLower = newName.toLowerCase();
        const currentOccasions = new Set(editedProduct.occasions || []);

        autoTagRules.forEach(rule => {
            const match = rule.keywords.some(k => nameLower.includes(k.toLowerCase()));
            if (match) {
                currentOccasions.add(rule.tag);
            }
        });

        setEditedProduct({
            ...editedProduct,
            name: newName,
            occasions: Array.from(currentOccasions)
        });
    };



    const fetchTransactions = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setTransactions(data);
            }
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        }
    };

    const fetchReturns = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/returns`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setReturns(data);
            }
        } catch (error) {
            console.error("Failed to fetch returns", error);
        }
    };

    const fetchCoupons = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/coupons`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setCoupons(data);
            }
        } catch (error) {
            console.error("Failed to fetch coupons", error);
        }
    };

    useEffect(() => {
        fetchProducts(); // Assuming this exists or will be added/checked
        fetchOrders();
        fetchCustomers();
        fetchSellerList();
        fetchTransactions();
        fetchReturns();
        fetchReviews();
        fetchShopData();
        fetchCoupons();
    }, []);

    const handleGenerateHD = async (item: any) => {
        if (!item.designJson) return;
        const confirmGen = window.confirm("Generate HD Print File? This may take a few seconds.");
        if (!confirmGen) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/generate-hd`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    designJson: item.designJson,
                    originalImage: item.originalImage
                })
            });
            const data = await res.json();
            if (data.success && data.url) {
                window.open(data.url, '_blank');
            } else {
                alert('Failed to generate HD image: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error("HD Gen Error", error);
            alert('Error generating HD image');
        }
    };

    const handleRunAutomation = async () => {
        if (!window.confirm("This will send review request emails to all customers whose orders were delivered more than 24 hours ago. Continue?")) return;

        setIsAutomating(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/run-review-automation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await res.json();
            if (result.success) {
                alert(`Automation complete!\n\nTotal Pending: ${result.total}\nEmailed: ${result.emailed}\nFailed: ${result.failed}`);
                fetchOrders(); // Refresh status
            } else {
                alert("Automation failed: " + (result.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Automation Error:", error);
            alert("Automation failed. Check console.");
        } finally {
            setIsAutomating(false);
        }
    };

    const renderOrders = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Order Management</h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleRunAutomation}
                        disabled={isAutomating}
                        className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-all ${isAutomating ? 'bg-gray-100 text-gray-400' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg'}`}
                    >
                        <LayoutDashboard className="w-3 h-3" />
                        {isAutomating ? 'Running Automation...' : 'Run Review Automation'}
                    </button>
                    <button onClick={fetchOrders} className="text-sm text-blue-600 hover:underline">Refresh</button>
                </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">Order ID</th>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Items</th>
                            <th className="px-6 py-3">Total</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Delivery / Review</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {orders.map(o => (
                            <tr key={o.id}>
                                <td className="px-6 py-4 font-bold text-primary">{o.id}</td>
                                <td className="px-6 py-4">{o.customerName}</td>
                                <td className="px-6 py-4">
                                    <div className="space-y-2">
                                        {o.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs border-b pb-1 last:border-0">
                                                <img src={item.image} className="w-8 h-8 rounded object-cover" alt="" />
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    {item.designJson && (
                                                        <button
                                                            onClick={() => handleGenerateHD(item)}
                                                            className="text-white bg-purple-600 hover:bg-purple-700 px-2 py-0.5 rounded flex items-center gap-1 mt-1"
                                                        >
                                                            <ImagePlus className="w-3 h-3" /> Generate HD
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {!o.items?.length && <span className="text-gray-400">No items data</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">₹{o.total}</td>
                                <td className="px-6 py-4">
                                    <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)} className="border rounded text-xs p-1 bg-gray-50 max-w-[120px]">
                                        {[
                                            'Payment Confirmed',
                                            'Design Pending',
                                            'Design Sent',
                                            'Design Approved',
                                            'Design Changes Requested',
                                            'Packed',
                                            'Shipped',
                                            'Delivered',
                                            'Cancelled'
                                        ].map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    {o.deliveredAt ? (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                                <Truck className="w-3 h-3" /> {new Date(o.deliveredAt).toLocaleDateString()}
                                            </span>
                                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full w-fit ${o.hasRequestedReview ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {o.hasRequestedReview ? 'Review Requested' : 'Automation Pending'}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic text-[10px]">Not delivered yet</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button className="text-blue-600 text-xs hover:underline">Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    const renderCustomers = () => (<div className="space-y-4"><h2 className="text-xl font-bold">Customer Management</h2><div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">Name</th><th className="px-6 py-3">Contact</th><th className="px-6 py-3">Orders</th><th className="px-6 py-3">Spent</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-200">{customers.map(c => (<tr key={c.id}><td className="px-6 py-4 font-medium">{c.name}</td><td className="px-6 py-4">{c.email}<br /><span className="text-xs text-gray-500">{c.phone}</span></td><td className="px-6 py-4">{c.totalOrders}</td><td className="px-6 py-4">₹{c.totalSpent}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs ${c.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{c.status}</span></td><td className="px-6 py-4 text-right space-x-2"><button onClick={() => setViewCustomer(c)} className="text-blue-600 hover:underline"><Eye className="w-4 h-4" /></button><button onClick={() => toggleCustomerStatus(c.id)} className={`${c.status === 'Active' ? 'text-red-600' : 'text-green-600'}`}>{c.status === 'Active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}</button></td></tr>))}</tbody></table></div>{viewCustomer && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-lg w-96 shadow-xl"><h3 className="text-xl font-bold mb-4">Customer Profile</h3><div className="space-y-2 text-sm"><p><strong>ID:</strong> {viewCustomer.id}</p><p><strong>Name:</strong> {viewCustomer.name}</p><p><strong>Address:</strong> {viewCustomer.address}</p><div className="mt-4 pt-4 border-t"><h4 className="font-bold">Order History</h4><p className="text-gray-500 text-xs">Last 5 orders would appear here...</p></div></div><button onClick={() => setViewCustomer(null)} className="mt-6 w-full bg-gray-200 py-2 rounded hover:bg-gray-300">Close</button></div></div>)}</div>);
    const renderSellers = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">Seller Management</h2>
                    <p className="text-sm text-gray-500">Manage vendors, approvals, and payouts</p>
                </div>
                <button
                    onClick={() => { setShowSellerModal(true); setIsEditingSeller(null); setNewSellerData({}); }}
                    className="bg-primary hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md transition-all"
                >
                    <Plus className="w-4 h-4" /> Onboard New Seller
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sellers.map((seller) => (
                            <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-primary font-bold">
                                            {(seller.companyName || '?').charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{seller.companyName || 'Unknown Company'}</div>
                                            <div className="text-xs text-gray-500">ID: {seller.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{seller.contactPerson}</div>
                                    <div className="text-xs text-gray-500">{seller.email}</div>
                                    <div className="text-xs text-gray-500">{seller.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${seller.status === 'Active' ? 'bg-green-100 text-green-800' :
                                        seller.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {seller.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-400 fill-current" /> {seller.rating}
                                    </div>
                                    <div className="text-xs text-gray-500">Return Rate: {seller.returnRate || 0}%</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="text-sm font-bold text-gray-900">₹{(seller.balance || 0).toLocaleString()}</div>
                                    {seller.balance > 0 && (
                                        <button className="text-xs text-blue-600 hover:text-blue-900 font-medium">Process Payout</button>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => { setIsEditingSeller(seller); setNewSellerData(seller); setShowSellerModal(true); }}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        {seller.status === 'Pending' && (
                                            <button onClick={() => handleSellerAction(seller.id, 'Approve')} className="text-green-600 hover:text-green-900">
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        {seller.status === 'Active' && (
                                            <button onClick={() => handleSellerAction(seller.id, 'Suspend')} className="text-amber-600 hover:text-amber-900">
                                                <Ban className="w-4 h-4" />
                                            </button>
                                        )}
                                        {seller.status === 'Suspended' && (
                                            <button onClick={() => handleSellerAction(seller.id, 'Activate')} className="text-green-600 hover:text-green-900">
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button onClick={() => handleSellerAction(seller.id, 'Delete')} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sellers.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No sellers found. Onboard your first seller!</p>
                    </div>
                )}
            </div>
        </div>
    );
    const renderPayments = () => (<div className="space-y-4"><h2 className="text-xl font-bold">Payments</h2><div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">Txn ID</th><th className="px-6 py-3">Ref</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Status</th></tr></thead><tbody className="divide-y divide-gray-200">{transactions.map(t => (<tr key={t.id}><td className="px-6 py-4 font-mono text-xs">{t.id}</td><td className="px-6 py-4">{t.orderId}</td><td className="px-6 py-4">{t.type}</td><td className="px-6 py-4 font-bold">₹{t.amount}</td><td className="px-6 py-4"><span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {t.status}</span></td></tr>))}</tbody></table></div></div>);
    const renderLogistics = () => (<div className="space-y-4"><h2 className="text-xl font-bold">Logistics</h2><div className="grid gap-4">{orders.filter(o => o.status === 'Shipped' || o.status === 'Packed').map(o => (<div key={o.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center"><div><p className="font-bold text-lg">{o.id}</p><p className="text-sm text-gray-500">To: {o.shippingAddress}</p><div className="mt-2 flex gap-2"><span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">{o.status}</span>{o.trackingNumber && <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{o.courier}: {o.trackingNumber}</span>}</div></div><div className="flex flex-col gap-2"><button className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs font-bold hover:bg-blue-100">Assign Courier</button></div></div>))}</div></div>);
    const renderReturns = () => (<div className="space-y-4"><h2 className="text-xl font-bold">Return Requests</h2><div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">Return ID</th><th className="px-6 py-3">Product</th><th className="px-6 py-3">Reason</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-200">{returns.map(r => (<tr key={r.id}><td className="px-6 py-4">{r.id}</td><td className="px-6 py-4">{r.productName}</td><td className="px-6 py-4 text-red-500">{r.reason}</td><td className="px-6 py-4 font-bold">{r.status}</td><td className="px-6 py-4 text-right space-x-2">{r.status === 'Pending' && (<><button className="text-green-600 hover:underline text-xs">Approve</button><button className="text-red-600 hover:underline text-xs">Reject</button></>)}</td></tr>))}</tbody></table></div></div>);
    const renderReviews = () => (<div className="space-y-4"><h2 className="text-xl font-bold">Reviews Moderation</h2><div className="grid gap-4">{reviews.map(r => (<div key={r._id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"><div className="flex justify-between"><div className="flex items-center gap-2"><div className="flex text-yellow-400">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div><span className="font-bold text-gray-800">{r.productName}</span></div><span className={`text-xs px-2 py-0.5 rounded ${r.status === 'Flagged' || r.status === 'Rejected' ? 'bg-red-100 text-red-800' : r.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100'}`}>{r.status}</span></div><p className="text-gray-600 mt-2 text-sm">"{r.comment}"</p><div className="mt-3 flex justify-end gap-2"><button onClick={() => handleReviewAction(r._id, 'Delete')} className="text-gray-600 text-xs font-bold hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button></div></div>))}</div></div>);
    const renderCoupons = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2"><Ticket className="w-5 h-5" /> Coupons</h2>
                <button
                    onClick={() => {
                        setIsEditingCoupon(null);
                        setNewCouponData({});
                        setShowCouponModal(true);
                    }}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-purple-700 transition"
                >
                    <Plus className="w-4 h-4" /> Add Coupon
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map(c => (
                    <div key={c._id || c.id} className="bg-white p-4 rounded-xl border border-dashed border-primary/50 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-20 h-20 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                        <div className="z-10">
                            <p className="font-mono font-black text-xl text-primary tracking-wider">{c.code}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {c.status}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">
                                    {c.discountType === 'PERCENTAGE' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">Expires: {new Date(c.expiryDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right z-10 flex flex-col items-end gap-2">
                            <p className="text-xs text-gray-400 font-medium">Used: <span className="text-gray-900 font-bold">{c.usedCount}</span>/{c.usageLimit}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsEditingCoupon(c);
                                        setNewCouponData(c);
                                        setShowCouponModal(true);
                                    }}
                                    className="p-1.5 hover:bg-blue-50 text-blue-600 rounded"
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteCoupon(c._id || c.id)}
                                    className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {coupons.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Ticket className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No coupons created yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
    const renderSecurity = () => (<div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h2 className="text-xl font-bold">Security & Permissions</h2><div className="space-y-4">{['Super Admin', 'Product Manager', 'Order Manager', 'Support Agent'].map(role => (<div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded border"><span className="font-medium">{role}</span><button className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-100">Manage</button></div>))}</div></div>);

    // Shop Sections Management
    const renderShopSections = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Shop Sections & Categories</h2>
                <div className="flex gap-4 border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setShopSectionTab('sections')}
                        className={`px-4 py-2 font-medium text-sm transition-colors ${shopSectionTab === 'sections' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Sections
                    </button>
                    <button
                        onClick={() => setShopSectionTab('categories')}
                        className={`px-4 py-2 font-medium text-sm transition-colors ${shopSectionTab === 'categories' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Categories
                    </button>
                    <button
                        onClick={() => setShopSectionTab('sub-categories')}
                        className={`px-4 py-2 font-medium text-sm transition-colors ${shopSectionTab === 'sub-categories' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Sub-categories
                    </button>
                    <button
                        onClick={() => setShopSectionTab('special-occasions')}
                        className={`px-4 py-2 font-medium text-sm transition-colors ${shopSectionTab === 'special-occasions' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Special Occasions
                    </button>
                    <button
                        onClick={() => setShopSectionTab('shop-occasions')}
                        className={`px-4 py-2 font-medium text-sm transition-colors ${shopSectionTab === 'shop-occasions' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Shop By Occasion
                    </button>
                    <button
                        onClick={() => setShopSectionTab('shop-recipients')}
                        className={`px-4 py-2 font-medium text-sm transition-colors ${shopSectionTab === 'shop-recipients' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Shop By Recipient
                    </button>
                </div>
            </div>

            {/* Sections Tab */}
            {shopSectionTab === 'sections' && (
                <div className="space-y-4">
                    <button
                        onClick={() => setIsEditingShopItem({ type: 'section', data: { id: `sec_${Date.now()}`, title: '', order: sections.length + 1 } })}
                        className="bg-primary text-white px-4 py-2 rounded font-bold hover:bg-primary-dark"
                    >
                        + Add New Section
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sections.map(section => (
                            <div key={section._id || section.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1">Order: {section.order}</p>
                                        <p className="text-xs text-gray-500">ID: {section.id}</p>
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                        {shopCategories.filter(c => c.sectionId === section.id).length} categories
                                    </span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => setIsEditingShopItem({ type: 'section', data: section })}
                                        className="flex-1 text-blue-600 border border-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50"
                                    >
                                        <Edit className="w-4 h-4 inline mr-1" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleShopItemDelete('sections', section._id || section.id)}
                                        className="flex-1 text-red-600 border border-red-600 px-3 py-1 rounded text-sm hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4 inline mr-1" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Categories Tab */}
            {shopSectionTab === 'categories' && (
                <div className="space-y-4">
                    <button
                        onClick={() => setIsEditingShopItem({ type: 'category', data: { id: `cat_${Date.now()}`, sectionId: '', name: '', image: '', order: shopCategories.length + 1 } })}
                        className="bg-primary text-white px-4 py-2 rounded font-bold hover:bg-primary-dark"
                    >
                        + Add New Category
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {shopCategories.map(category => (
                            <div key={category._id || category.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex gap-4">
                                    <img
                                        src={category.image || 'https://placehold.co/200x200?text=No+Image'}
                                        alt={category.name}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{category.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Sections: {
                                                category.sectionIds && category.sectionIds.length > 0
                                                    ? category.sectionIds.map(sid => sections.find(s => s.id === sid)?.title).filter(Boolean).join(', ')
                                                    : sections.find(s => s.id === category.sectionId)?.title || 'Unknown'
                                            }
                                        </p>
                                        {category.specialOccasionIds && category.specialOccasionIds.length > 0 && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Special: {category.specialOccasionIds.map(oid => specialOccasions.find(o => o.id === oid)?.name).filter(Boolean).join(', ')}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500">Order: {category.order}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => setIsEditingShopItem({ type: 'category', data: category })}
                                        className="flex-1 text-blue-600 border border-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50"
                                    >
                                        <Edit className="w-4 h-4 inline mr-1" /> Edit
                                    </button>
                                    <button
                                        onClick={() => setIsConvertingCategory(category)}
                                        className="flex-1 text-purple-600 border border-purple-600 px-3 py-1 rounded text-sm hover:bg-purple-50"
                                    >
                                        <RotateCcw className="w-4 h-4 inline mr-1" /> Convert
                                    </button>
                                    <button
                                        onClick={() => handleShopItemDelete('categories', category._id || category.id)}
                                        className="flex-1 text-red-600 border border-red-600 px-3 py-1 rounded text-sm hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4 inline mr-1" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Sub-categories Tab */}
            {shopSectionTab === 'sub-categories' && (
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <button
                            onClick={() => setIsEditingShopItem({ type: 'sub-category', data: { id: `sub_${Date.now()}`, categoryId: subCategoryListFilter || '', name: '', image: '', order: subCategories.length + 1 } })}
                            className="bg-primary text-white px-4 py-2 rounded font-bold hover:bg-primary-dark"
                        >
                            + Add New Sub-category
                        </button>

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
                            <select
                                value={subCategoryListFilter}
                                onChange={(e) => setSubCategoryListFilter(e.target.value)}
                                className="border rounded px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                            >
                                <option value="">All Categories</option>
                                {shopCategories.map(cat => (
                                    <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subCategories
                            .filter(sub => !subCategoryListFilter || sub.categoryId === subCategoryListFilter)
                            .map(sub => (
                                <div key={sub._id || sub.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex gap-4">
                                        <img
                                            src={sub.image || 'https://placehold.co/200x200?text=No+Image'}
                                            alt={sub.name}
                                            className="w-20 h-20 rounded-lg object-cover border-2 border-gray-100"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900">{sub.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Category: {shopCategories.find(c => (c.id || c._id) === sub.categoryId)?.name || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-gray-500">Order: {sub.order}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => setIsEditingShopItem({ type: 'sub-category', data: sub })}
                                            className="flex-1 text-blue-600 border border-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50"
                                        >
                                            <Edit className="w-4 h-4 inline mr-1" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleShopItemDelete('sub-categories', sub._id || sub.id)}
                                            className="flex-1 text-red-600 border border-red-600 px-3 py-1 rounded text-sm hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4 inline mr-1" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
            {/* Special Occasions Tab */}
            {shopSectionTab === 'special-occasions' && (
                <div className="space-y-4">
                    <button
                        onClick={() => setIsEditingShopItem({ type: 'special-occasion', data: { id: `occ_${Date.now()}`, name: '', description: '', image: '', link: '', order: specialOccasions.length + 1 } })}
                        className="bg-primary text-white px-4 py-2 rounded font-bold hover:bg-primary-dark"
                    >
                        + Add Special Occasion
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {specialOccasions.map(occ => (
                            <div key={occ._id || occ.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex gap-4">
                                    <img
                                        src={occ.image}
                                        alt={occ.name}
                                        className="w-20 h-20 rounded-lg object-cover border-2 border-gray-100"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{occ.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{occ.description}</p>
                                        <p className="text-xs text-blue-600 truncate">{occ.link}</p>
                                        <p className="text-xs text-gray-500">Order: {occ.order}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => setIsEditingShopItem({ type: 'special-occasion', data: occ })}
                                        className="flex-1 text-blue-600 border border-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50"
                                    >
                                        <Edit className="w-4 h-4 inline mr-1" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleShopItemDelete('special-occasions', occ._id || occ.id)}
                                        className="flex-1 text-red-600 border border-red-600 px-3 py-1 rounded text-sm hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4 inline mr-1" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Shop By Occasion Tab (Standard Occasions) */}
            {shopSectionTab === 'shop-occasions' && (
                <div className="space-y-4">
                    <button
                        onClick={() => setIsEditingShopItem({ type: 'shop-occasion', data: { id: `shop_occ_${Date.now()}`, name: '', description: '', image: '', link: '', order: shopOccasions.length + 1 } })}
                        className="bg-primary text-white px-4 py-2 rounded font-bold hover:bg-primary-dark"
                    >
                        + Add Shop Occasion
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {shopOccasions.map(occ => (
                            <div key={occ._id || occ.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex gap-4">
                                    <img
                                        src={occ.image}
                                        alt={occ.name}
                                        className="w-20 h-20 rounded-lg object-cover border-2 border-gray-100"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{occ.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{occ.description}</p>
                                        <p className="text-xs text-blue-600 truncate">{occ.link}</p>
                                        <p className="text-xs text-gray-500">Order: {occ.order}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => setIsEditingShopItem({ type: 'shop-occasion', data: occ })}
                                        className="flex-1 text-blue-600 border border-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50"
                                    >
                                        <Edit className="w-4 h-4 inline mr-1" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleShopItemDelete('shop-occasions', occ._id || occ.id)}
                                        className="flex-1 text-red-600 border border-red-600 px-3 py-1 rounded text-sm hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4 inline mr-1" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Shop By Recipient Tab */}
            {shopSectionTab === 'shop-recipients' && (
                <div className="space-y-4">
                    <button
                        onClick={() => setIsEditingShopItem({ type: 'shop-recipient', data: { id: `rec_${Date.now()}`, name: '', image: '', link: '', order: shopRecipients.length + 1 } })}
                        className="bg-primary text-white px-4 py-2 rounded font-bold hover:bg-primary-dark"
                    >
                        + Add Recipient
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {shopRecipients.map(rec => (
                            <div key={rec._id || rec.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex gap-4">
                                    <img
                                        src={rec.image || 'https://placehold.co/200x200?text=No+Image'}
                                        alt={rec.name}
                                        className="w-20 h-20 rounded-lg object-cover border-2 border-gray-100"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{rec.name}</h3>
                                        <p className="text-xs text-blue-600 truncate">{rec.link}</p>
                                        <p className="text-xs text-gray-500">Order: {rec.order}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => setIsEditingShopItem({ type: 'shop-recipient', data: rec })}
                                        className="flex-1 text-blue-600 border border-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50"
                                    >
                                        <Edit className="w-4 h-4 inline mr-1" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleShopItemDelete('shop-recipients', rec._id || rec.id)}
                                        className="flex-1 text-red-600 border border-red-600 px-3 py-1 rounded text-sm hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4 inline mr-1" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {isEditingShopItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg w-80 shadow-xl space-y-3">
                        <h3 className="text-base font-bold">
                            {isEditingShopItem.data._id ? 'Edit' : 'Add'} {isEditingShopItem.type === 'section' ? 'Section' : isEditingShopItem.type === 'category' ? 'Category' : isEditingShopItem.type === 'sub-category' ? 'Sub-category' : isEditingShopItem.type === 'shop-occasion' ? 'Shop Occasion' : isEditingShopItem.type === 'shop-recipient' ? 'Recipient' : 'Special Occasion'}
                        </h3>

                        {isEditingShopItem.type === 'section' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                                    <input
                                        placeholder="e.g., Personalised"
                                        value={isEditingShopItem.data.title || ''}
                                        onChange={e => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, title: e.target.value } })}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        placeholder="1"
                                        value={isEditingShopItem.data.order || 1}
                                        onChange={e => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, order: parseInt(e.target.value) } })}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                            </>
                        ) : isEditingShopItem.type === 'category' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sections (Select Multiple)</label>
                                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded bg-gray-50">
                                        {sections.map(s => (
                                            <label key={s.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded group">
                                                <input
                                                    type="checkbox"
                                                    checked={(isEditingShopItem.data.sectionIds || []).includes(s.id) || isEditingShopItem.data.sectionId === s.id}
                                                    onChange={e => {
                                                        const currentIds = isEditingShopItem.data.sectionIds || (isEditingShopItem.data.sectionId ? [isEditingShopItem.data.sectionId] : []);
                                                        let newIds;
                                                        if (e.target.checked) {
                                                            newIds = [...currentIds, s.id];
                                                        } else {
                                                            newIds = currentIds.filter((id: string) => id !== s.id);
                                                        }
                                                        setIsEditingShopItem({
                                                            ...isEditingShopItem,
                                                            data: {
                                                                ...isEditingShopItem.data,
                                                                sectionIds: newIds,
                                                                sectionId: newIds[0] || '' // Fallback for components that still use sectionId
                                                            }
                                                        });
                                                    }}
                                                    className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                                />
                                                <span className="text-xs group-hover:text-primary transition-colors">{s.title}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1 italic">Category will appear in all selected sections.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Occasions (Select Multiple)</label>
                                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded bg-gray-50">
                                        {specialOccasions.map(occ => (
                                            <label key={occ.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded group">
                                                <input
                                                    type="checkbox"
                                                    checked={(isEditingShopItem.data.specialOccasionIds || []).includes(occ.id)}
                                                    onChange={e => {
                                                        const currentIds = isEditingShopItem.data.specialOccasionIds || [];
                                                        let newIds;
                                                        if (e.target.checked) {
                                                            newIds = [...currentIds, occ.id];
                                                        } else {
                                                            newIds = currentIds.filter((id: string) => id !== occ.id);
                                                        }
                                                        setIsEditingShopItem({
                                                            ...isEditingShopItem,
                                                            data: {
                                                                ...isEditingShopItem.data,
                                                                specialOccasionIds: newIds
                                                            }
                                                        });
                                                    }}
                                                    className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                                />
                                                <span className="text-xs group-hover:text-primary transition-colors">{occ.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1 italic">Category will also be featured in selected special occasions.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                    <input
                                        placeholder="e.g., 3D Crystals"
                                        value={isEditingShopItem.data.name || ''}
                                        onChange={e => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, name: e.target.value } })}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                                    <div className="space-y-2">
                                        {isEditingShopItem.data.image && (
                                            <img src={isEditingShopItem.data.image} alt="Preview" className="w-20 h-20 object-cover rounded border" />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setIsEditingShopItem({
                                                            ...isEditingShopItem,
                                                            data: { ...isEditingShopItem.data, image: reader.result as string }
                                                        });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        placeholder="1"
                                        value={isEditingShopItem.data.order || 1}
                                        onChange={e => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, order: parseInt(e.target.value) } })}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                            </>
                        ) : isEditingShopItem.type === 'sub-category' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={isEditingShopItem.data.categoryId || ''}
                                        onChange={e => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, categoryId: e.target.value } })}
                                        className="w-full border p-2 rounded"
                                    >
                                        <option value="">Select Category</option>
                                        {shopCategories.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub-category Name</label>
                                    <input
                                        placeholder="e.g., MDF Trophy"
                                        value={isEditingShopItem.data.name || ''}
                                        onChange={e => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, name: e.target.value } })}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                                    <div className="space-y-2">
                                        {isEditingShopItem.data.image && (
                                            <img src={isEditingShopItem.data.image} alt="Preview" className="w-20 h-20 object-cover rounded border" />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setIsEditingShopItem({
                                                            ...isEditingShopItem,
                                                            data: { ...isEditingShopItem.data, image: reader.result as string }
                                                        });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        placeholder="1"
                                        value={isEditingShopItem.data.order || 1}
                                        onChange={e => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, order: parseInt(e.target.value) } })}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                            </>
                        ) : isEditingShopItem.type === 'special-occasion' || isEditingShopItem.type === 'shop-occasion' ? (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Occasion Name</label>
                                    <input
                                        placeholder="e.g., Mother's Day"
                                        value={isEditingShopItem.data.name || ''}
                                        onChange={e => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, name: e.target.value } })}
                                        className="w-full border p-1 rounded text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Description</label>
                                    <textarea
                                        placeholder="Add a catchy description..."
                                        value={isEditingShopItem.data.description || ''}
                                        onChange={e => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, description: e.target.value } })}
                                        className="w-full border p-1 rounded text-sm"
                                        rows={1}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Link (URL)</label>
                                    <input
                                        placeholder="/products?q=Mother"
                                        value={isEditingShopItem.data.link || ''}
                                        onChange={e => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, link: e.target.value } })}
                                        className="w-full border p-1 rounded text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Image</label>
                                    <div className="space-y-1">
                                        {isEditingShopItem.data.image && (
                                            <div className="flex items-center gap-2">
                                                <img src={isEditingShopItem.data.image} alt="Preview" className="w-12 h-12 object-cover rounded border" />
                                                <button
                                                    onClick={() => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, image: '' } })}
                                                    className="text-xs text-red-600 hover:text-red-800 underline"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setIsEditingShopItem({
                                                            ...isEditingShopItem,
                                                            data: { ...isEditingShopItem.data, image: reader.result as string }
                                                        });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        value={isEditingShopItem.data.order || 1}
                                        onChange={e => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, order: parseInt(e.target.value) } })}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                            </>
                        ) : isEditingShopItem.type === 'shop-recipient' ? (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Recipient Name</label>
                                    <input
                                        placeholder="e.g., Him"
                                        value={isEditingShopItem.data.name || ''}
                                        onChange={e => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, name: e.target.value } })}
                                        className="w-full border p-1 rounded text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Link (URL)</label>
                                    <input
                                        placeholder="/shop?recipient=Him"
                                        value={isEditingShopItem.data.link || ''}
                                        onChange={e => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, link: e.target.value } })}
                                        className="w-full border p-1 rounded text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Image</label>
                                    <div className="space-y-1">
                                        {isEditingShopItem.data.image && (
                                            <div className="flex items-center gap-2">
                                                <img src={isEditingShopItem.data.image} alt="Preview" className="w-12 h-12 object-cover rounded border" />
                                                <button
                                                    onClick={() => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, image: '' } })}
                                                    className="text-xs text-red-600 hover:text-red-800 underline"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setIsEditingShopItem({
                                                            ...isEditingShopItem,
                                                            data: { ...isEditingShopItem.data, image: reader.result as string }
                                                        });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        value={isEditingShopItem.data.order || 1}
                                        onChange={e => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, order: parseInt(e.target.value) } })}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                            </>
                        ) : null}

                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                onClick={() => setIsEditingShopItem(null)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleShopItemSave(isEditingShopItem.type === 'section' ? 'sections' : isEditingShopItem.type === 'category' ? 'categories' : isEditingShopItem.type === 'sub-category' ? 'sub-categories' : isEditingShopItem.type === 'shop-recipient' ? 'shop-recipients' : isEditingShopItem.type === 'shop-occasion' ? 'shop-occasions' : 'special-occasions', isEditingShopItem.data)}
                                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark font-bold"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div >
            )
            }

            {/* CONVERT CATEGORY MODAL */}
            {
                isConvertingCategory && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                        <div className="bg-white p-6 rounded-lg w-96 shadow-xl space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <RotateCcw className="w-5 h-5 text-purple-600" />
                                Convert to Sub-category
                            </h3>
                            <p className="text-sm text-gray-600">
                                You are converting <strong>{isConvertingCategory.name}</strong> into a sub-category. All products in this category will be moved.
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Parent Category</label>
                                <select
                                    className="w-full border p-2 rounded"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            if (window.confirm(`Are you sure you want to make "${isConvertingCategory.name}" a sub-category of "${shopCategories.find(c => c.id === e.target.value)?.name}"?`)) {
                                                handleCategoryConvert(isConvertingCategory._id || '', e.target.value);
                                            }
                                        }
                                    }}
                                >
                                    <option value="">Select Category...</option>
                                    {shopCategories
                                        .filter(c => c.id !== isConvertingCategory.id)
                                        .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                    }
                                </select>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setIsConvertingCategory(null)}
                                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );

    const renderContent = () => { switch (activeTab) { case 'products': return renderProducts(); case 'orders': return renderOrders(); case 'customers': return renderCustomers(); case 'sellers': return renderSellers(); case 'payments': return renderPayments(); case 'logistics': return renderLogistics(); case 'returns': return renderReturns(); case 'reviews': return renderReviews(); case 'analytics': return renderDashboard(); case 'coupons': return renderCoupons(); case 'security': return renderSecurity(); case 'settings': return renderSecurity(); case 'shop-sections': return renderShopSections(); default: return renderDashboard(); } };

    return (
        <div className="min-h-screen bg-app-bg flex font-sans">
            <SEO title="Admin Dashboard" noindex={true} />
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10 hidden md:flex h-screen sticky top-0">
                <div className="p-4 border-b border-slate-700"><h2 className="text-lg font-bold tracking-tight flex gap-2 items-center"><LayoutDashboard className="text-accent" /> Seller Central</h2></div>
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">{[{ id: 'dashboard', label: 'Dashboard', icon: BarChart3 }, { id: 'orders', label: 'Orders', icon: ShoppingBag }, { id: 'products', label: 'Inventory', icon: Package }, { id: 'shop-sections', label: 'Shop Sections', icon: LayoutDashboard }, { id: 'customers', label: 'Customers', icon: Users }, { id: 'sellers', label: 'Sellers', icon: Users }, { id: 'payments', label: 'Payments', icon: DollarSign }, { id: 'logistics', label: 'Logistics', icon: Truck }, { id: 'returns', label: 'Returns', icon: RotateCcw }, { id: 'reviews', label: 'Reviews', icon: Star }, { id: 'coupons', label: 'Coupons', icon: Ticket }, { id: 'security', label: 'Security', icon: ShieldCheck }].map(item => (<button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-slate-800 text-white border-l-4 border-accent' : 'text-slate-400 hover:bg-slate-800 hover:text-gray-200'}`}><item.icon className="w-4 h-4" /> {item.label}</button>))}</nav>
            </aside>
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 border-b border-gray-200 z-10 shrink-0"><div className="flex items-center text-gray-800 font-semibold text-xl capitalize">{activeTab}</div><div className="flex items-center gap-4"><div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full"><div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">A</div><p className="text-sm font-bold text-gray-900 truncate max-w-[100px]">{user.email.split('@')[0]}</p></div></div></header>
                <main className="flex-1 overflow-auto p-6 bg-app-bg">{renderContent()}</main>
            </div>
            {/* PRODUCT EDIT MODAL */}
            {editedProduct && (
                <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col animate-fade-in-up">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50"><h3 className="font-bold text-lg flex items-center gap-2"><Edit className="w-5 h-5 text-primary" /> Edit: {editedProduct.name}</h3><button onClick={() => setIsEditing(null)} className="hover:bg-gray-200 p-1 rounded"><X className="w-6 h-6" /></button></div>
                        <div className="flex flex-1 overflow-hidden">
                            <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col p-2 gap-1">{['vital', 'images', 'variations', 'desc'].map(tab => (<button key={tab} onClick={() => setEditTab(tab as any)} className={`text-left px-4 py-3 rounded-md text-sm font-medium transition-all ${editTab === tab ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-gray-100'}`}>{tab === 'vital' && 'Vital Info'} {tab === 'images' && 'Images & Enhance'} {tab === 'variations' && 'Variations'} {tab === 'desc' && 'About the Product'}</button>))}</div>
                            <div className="flex-1 p-8 overflow-y-auto">
                                {editTab === 'vital' && (<div className="space-y-6">
                                    {/* Vital Info Fields */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div><label className="block text-sm font-medium text-gray-700">Product Name</label><input value={editedProduct.name} onChange={handleNameChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                                        <div><label className="block text-sm font-medium text-gray-700">MRP (Original Price)</label><input type="number" value={editedProduct.mrp !== undefined ? editedProduct.mrp : (editedProduct.pdfPrice || '')} onChange={e => {
                                            const mrp = parseFloat(e.target.value) || 0;
                                            const currentFinal = editedProduct.finalPrice || (editedProduct.pdfPrice * (1 - (editedProduct.discount || 0) / 100));
                                            const disc = mrp > 0 ? Math.round((1 - currentFinal / mrp) * 100) : 0;
                                            setEditedProduct({
                                                ...editedProduct,
                                                mrp: mrp,
                                                pdfPrice: mrp,
                                                discount: disc
                                            });
                                        }} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>

                                        <div><label className="block text-sm font-medium text-gray-700">Final Price (Source of Truth)</label><input type="number" value={editedProduct.finalPrice !== undefined ? editedProduct.finalPrice : ''} onChange={e => {
                                            const rawFinal = parseFloat(e.target.value) || 0;
                                            if (editedProduct.isManualDiscount) {
                                                const mrp = editedProduct.mrp || editedProduct.pdfPrice || 0;
                                                const disc = mrp > 0 ? Math.round((1 - rawFinal / mrp) * 100) : 0;
                                                setEditedProduct({
                                                    ...editedProduct,
                                                    finalPrice: rawFinal,
                                                    discount: disc
                                                });
                                            } else {
                                                const { final, mrp, discount } = calculatePremiumPricing(rawFinal);
                                                setEditedProduct({
                                                    ...editedProduct,
                                                    finalPrice: final,
                                                    mrp: mrp,
                                                    pdfPrice: mrp,
                                                    discount: discount
                                                });
                                            }
                                        }} className="mt-1 block w-full border border-gray-300 rounded-md p-2 font-bold text-green-600 shadow-sm border-green-200 focus:border-green-500" /></div>

                                        <div><label className="block text-sm font-medium text-gray-700">Stock</label><input type="number" value={editedProduct.stock || 0} onChange={e => setEditedProduct({ ...editedProduct, stock: parseInt(e.target.value) })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>

                                        <div>
                                            <div className="flex justify-between items-center">
                                                <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                                                <label className="flex items-center gap-1 text-[10px] font-bold text-gray-500 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={editedProduct.isManualDiscount || false}
                                                        onChange={e => {
                                                            const isManual = e.target.checked;
                                                            if (!isManual && editedProduct.finalPrice) {
                                                                const { final, mrp, discount } = calculatePremiumPricing(editedProduct.finalPrice);
                                                                setEditedProduct({
                                                                    ...editedProduct,
                                                                    isManualDiscount: isManual,
                                                                    finalPrice: final,
                                                                    mrp,
                                                                    pdfPrice: mrp,
                                                                    discount
                                                                });
                                                            } else {
                                                                setEditedProduct({ ...editedProduct, isManualDiscount: isManual });
                                                            }
                                                        }}
                                                        className="w-3 h-3 text-primary focus:ring-primary rounded"
                                                    /> Manual
                                                </label>
                                            </div>
                                            <input type="number" min="0" max="100" value={editedProduct.discount || 0} onChange={e => {
                                                const disc = parseInt(e.target.value) || 0;
                                                const final = editedProduct.finalPrice || (editedProduct.pdfPrice * (1 - (editedProduct.discount || 0) / 100));
                                                const mrp = disc < 100 ? Math.round(final / (1 - disc / 100)) : final;
                                                setEditedProduct({
                                                    ...editedProduct,
                                                    discount: disc,
                                                    mrp: editedProduct.isManualDiscount ? mrp : editedProduct.mrp,
                                                    pdfPrice: editedProduct.isManualDiscount ? mrp : editedProduct.pdfPrice
                                                });
                                            }} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="e.g., 35" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Categories</label>
                                            <div className="mt-1 block w-full border border-gray-300 rounded-md p-2 h-40 overflow-y-auto bg-gray-50/50">
                                                <div className="grid grid-cols-2 gap-2">
                                                    {shopCategories.map(cat => (
                                                        <label key={cat.id || (cat as any)._id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                                                            <input
                                                                type="checkbox"
                                                                checked={editedProduct.shopCategoryIds?.includes(cat.id || (cat as any)._id) || false}
                                                                onChange={e => {
                                                                    const catId = cat.id || (cat as any)._id;
                                                                    const currentIds = editedProduct.shopCategoryIds || [];
                                                                    let nextIds;
                                                                    if (e.target.checked) {
                                                                        nextIds = [...currentIds, catId];
                                                                    } else {
                                                                        nextIds = currentIds.filter(id => id !== catId);
                                                                    }

                                                                    const mainCat = shopCategories.find(c => (c.id || (c as any)._id) === nextIds[0]);

                                                                    setEditedProduct({
                                                                        ...editedProduct,
                                                                        shopCategoryIds: nextIds,
                                                                        shopCategoryId: nextIds[0] || '',
                                                                        sectionId: mainCat?.sectionId || (mainCat as any)?.sectionIds?.[0] || '',
                                                                        category: mainCat?.name || '',
                                                                        subCategoryId: '' // Reset sub-category when categories change
                                                                    });
                                                                }}
                                                                className="w-4 h-4 text-primary focus:ring-primary rounded"
                                                            />
                                                            <span className="text-xs font-semibold text-gray-700">{cat.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Sub-category</label>
                                            <select
                                                value={editedProduct.subCategoryId || ''}
                                                onChange={e => setEditedProduct({ ...editedProduct, subCategoryId: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                                disabled={!editedProduct.shopCategoryIds || editedProduct.shopCategoryIds.length === 0}
                                            >
                                                <option value="">-- Select Sub-category --</option>
                                                {subCategories
                                                    .filter(sub => {
                                                        // Robust filtering: Match against any selected category ID
                                                        if (!editedProduct.shopCategoryIds || editedProduct.shopCategoryIds.length === 0) return false;
                                                        return editedProduct.shopCategoryIds.some(catId => {
                                                            if (sub.categoryId === catId) return true;
                                                            const cat = shopCategories.find(c => (c.id === catId || (c as any)._id === catId));
                                                            if (cat) {
                                                                return sub.categoryId === cat.id || sub.categoryId === (cat as any)._id;
                                                            }
                                                            return false;
                                                        });
                                                    })
                                                    .map(sub => (
                                                        <option key={sub.id || (sub as any)._id} value={sub.id || (sub as any)._id}>{sub.name}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                        <div><label className="block text-sm font-medium text-gray-700">Status</label><select value={editedProduct.status || 'Active'} onChange={e => setEditedProduct({ ...editedProduct, status: e.target.value as any })} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option value="Active">Active</option><option value="Draft">Draft</option><option value="Out of Stock">Out of Stock</option></select></div>
                                        <div><label className="block text-sm font-medium text-gray-700">Rating (Auto-calculated)</label><input type="number" step="0.1" min="0" max="5" value={editedProduct.rating || 0} readOnly disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed" title="Automatically calculated from reviews" /></div>
                                        <div><label className="block text-sm font-medium text-gray-700">Reviews Count (Auto-calculated)</label><input type="number" min="0" value={editedProduct.reviewsCount || 0} readOnly disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed" title="Automatically calculated from reviews" /></div>
                                        <div className="flex items-center gap-2 pt-6">
                                            <input
                                                type="checkbox"
                                                id="isTrending"
                                                checked={editedProduct.isTrending || false}
                                                onChange={e => setEditedProduct({ ...editedProduct, isTrending: e.target.checked })}
                                                className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                                            />
                                            <label htmlFor="isTrending" className="font-bold text-gray-700">Trending Product (Show on Home)</label>
                                        </div>
                                        <div className="flex items-center gap-2 pt-6">
                                            <input
                                                type="checkbox"
                                                id="isBestseller"
                                                checked={editedProduct.isBestseller || false}
                                                onChange={e => setEditedProduct({ ...editedProduct, isBestseller: e.target.checked })}
                                                className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                                            />
                                            <label htmlFor="isBestseller" className="font-bold text-gray-700">Bestseller Product (Show on Home)</label>
                                        </div>
                                        <div className="flex items-center gap-2 pt-6">
                                            <input
                                                type="checkbox"
                                                id="isComboOffer"
                                                checked={editedProduct.isComboOffer || false}
                                                onChange={e => setEditedProduct({ ...editedProduct, isComboOffer: e.target.checked })}
                                                className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                                            />
                                            <label htmlFor="isComboOffer" className="font-bold text-gray-700">Combo Offer Product (Show on Special Banner)</label>
                                        </div>

                                        <div className="pt-6 col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Shop By Occasion</label>
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                                                {/* Standard Occasions */}
                                                <div>
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block p-1">Standard Occasions</span>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        {shopOccasions.length > 0 ? shopOccasions.map(occ => (
                                                            <label key={occ.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer transition-all border border-transparent hover:border-gray-200 group">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={(editedProduct.occasions || []).includes(occ.name)}
                                                                    onChange={e => {
                                                                        const currentOccasions = editedProduct.occasions || [];
                                                                        let newOccasions;
                                                                        if (e.target.checked) {
                                                                            newOccasions = [...currentOccasions, occ.name];
                                                                        } else {
                                                                            newOccasions = currentOccasions.filter(name => name !== occ.name);
                                                                        }
                                                                        setEditedProduct({ ...editedProduct, occasions: newOccasions });
                                                                    }}
                                                                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                                                                />
                                                                <span className="text-xs font-bold text-gray-600 group-hover:text-primary transition-colors">{occ.name}</span>
                                                            </label>
                                                        )) : <p className="text-xs text-gray-400 p-2 col-span-full">No standard occasions found.</p>}
                                                    </div>
                                                </div>

                                                {/* Special Occasions */}
                                                {specialOccasions.length > 0 && (
                                                    <div>
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block p-1 border-t border-gray-200 pt-3 mt-1">Seasonal / Special</span>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                            {specialOccasions.map(occ => (
                                                                <label key={occ.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer transition-all border border-transparent hover:border-gray-200 group">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={(editedProduct.occasions || []).includes(occ.name)}
                                                                        onChange={e => {
                                                                            const currentOccasions = editedProduct.occasions || [];
                                                                            let newOccasions;
                                                                            if (e.target.checked) {
                                                                                newOccasions = [...currentOccasions, occ.name];
                                                                            } else {
                                                                                newOccasions = currentOccasions.filter(name => name !== occ.name);
                                                                            }
                                                                            setEditedProduct({ ...editedProduct, occasions: newOccasions });
                                                                        }}
                                                                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                                                                    />
                                                                    <span className="text-xs font-bold text-gray-600 group-hover:text-primary transition-colors">{occ.name}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Shop By Recipient */}
                                                <div>
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block p-1 border-t border-gray-200 pt-3 mt-1">Shop By Recipient</span>
                                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                                        {['Him', 'Her', 'Couples', 'Kids', 'Parents'].map(rec => (
                                                            <label key={rec} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer transition-all border border-transparent hover:border-gray-200 group">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={(editedProduct.occasions || []).includes(rec)}
                                                                    onChange={e => {
                                                                        const currentOccasions = editedProduct.occasions || [];
                                                                        let newOccasions;
                                                                        if (e.target.checked) {
                                                                            newOccasions = [...currentOccasions, rec];
                                                                        } else {
                                                                            newOccasions = currentOccasions.filter(name => name !== rec);
                                                                        }
                                                                        setEditedProduct({ ...editedProduct, occasions: newOccasions });
                                                                    }}
                                                                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                                                                />
                                                                <span className="text-xs font-bold text-gray-600 group-hover:text-primary transition-colors">{rec}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div></div>)}
                                {editTab === 'images' && (
                                    <div className="space-y-6">
                                        {/* Main Image */}
                                        <div>
                                            <h4 className="font-bold mb-2">Main Image</h4>
                                            <div className="flex gap-4 items-start">
                                                <img src={editedProduct.image} className="w-32 h-32 object-contain border rounded bg-white" />
                                                <div className="space-y-2">
                                                    <input type="file" onChange={(e) => handleImageUpload(e, 'main')} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                                                    <p className="text-xs text-gray-500">This is the primary image shown on product cards.</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Gallery Images */}
                                        <div>
                                            <h4 className="font-bold mb-2">Gallery Images</h4>
                                            <div className="grid grid-cols-4 gap-4 mb-4">
                                                {editedProduct.gallery?.map((img, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <img src={img} className="w-full h-24 object-contain border rounded bg-white" />
                                                        <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/80 px-1 rounded backdrop-blur-sm">
                                                            <input
                                                                type="radio"
                                                                name="defaultImage"
                                                                checked={editedProduct.image === img}
                                                                onChange={() => handleSetDefaultOption('gallery', undefined, undefined, idx)}
                                                                className="w-3 h-3 text-primary"
                                                            />
                                                            <span className="text-[9px] font-bold text-gray-700">Main</span>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const newGallery = [...(editedProduct.gallery || [])];
                                                                newGallery.splice(idx, 1);
                                                                setEditedProduct({ ...editedProduct, gallery: newGallery });
                                                            }}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={async (e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    if (files.length === 0) return;

                                                    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                                                    const uploadPromises = files.map(async (file) => {
                                                        // Validation
                                                        if (!allowedTypes.includes(file.type)) {
                                                            alert(`Skipping ${file.name}: Invalid file type.`);
                                                            return null;
                                                        }
                                                        if (file.size > 10 * 1024 * 1024) { // 10MB
                                                            alert(`Skipping ${file.name}: File too large (Max 10MB).`);
                                                            return null;
                                                        }

                                                        const formData = new FormData();
                                                        formData.append('image', file);
                                                        try {
                                                            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
                                                                method: 'POST',
                                                                body: formData
                                                            });
                                                            const data = await response.json();
                                                            return data.url;
                                                        } catch (error) {
                                                            console.error("Failed to upload gallery image", error);
                                                            return null;
                                                        }
                                                    });

                                                    const urls = await Promise.all(uploadPromises);
                                                    const validUrls = urls.filter(url => url !== null) as string[];

                                                    if (validUrls.length > 0) {
                                                        setEditedProduct(prev => {
                                                            if (!prev) return null;
                                                            return {
                                                                ...prev,
                                                                gallery: [...(prev.gallery || []), ...validUrls]
                                                            };
                                                        });
                                                    }
                                                }}
                                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                            />
                                        </div>
                                    </div>
                                )}
                                {editTab === 'variations' && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-lg">Product Sizes</h4>
                                            <button
                                                onClick={() => {
                                                    const sizeVariation = editedProduct.variations?.find(v => v.name === 'Size');
                                                    if (sizeVariation) {
                                                        const isFirst = sizeVariation.options.length === 0;
                                                        const newOption: VariationOption = {
                                                            id: `size_${Date.now()}`,
                                                            label: 'New Size',
                                                            description: '',
                                                            priceAdjustment: 0,
                                                            isDefault: isFirst
                                                        };
                                                        const updatedVariations = editedProduct.variations?.map(v =>
                                                            v.name === 'Size' ? { ...v, options: [...v.options, newOption] } : v
                                                        );
                                                        setEditedProduct(prev => {
                                                            if (!prev) return null;
                                                            return {
                                                                ...prev,
                                                                variations: updatedVariations,
                                                                ...(isFirst ? {
                                                                    mrp: newOption.mrp || prev.mrp,
                                                                    finalPrice: newOption.finalPrice || prev.finalPrice,
                                                                    discount: newOption.discount || prev.discount,
                                                                    isManualDiscount: newOption.isManualDiscount || prev.isManualDiscount,
                                                                    pdfPrice: newOption.mrp || prev.pdfPrice
                                                                } : {})
                                                            };
                                                        });
                                                    } else {
                                                        const newOption: VariationOption = {
                                                            id: `size_${Date.now()}`,
                                                            label: 'New Size',
                                                            description: '',
                                                            finalPrice: 0,
                                                            mrp: 0,
                                                            discount: 0,
                                                            isManualDiscount: false,
                                                            priceAdjustment: 0,
                                                            isDefault: true
                                                        };
                                                        const newVariation: Variation = {
                                                            id: 'size_variation',
                                                            name: 'Size',
                                                            options: [newOption]
                                                        };
                                                        setEditedProduct(prev => {
                                                            if (!prev) return null;
                                                            return {
                                                                ...prev,
                                                                variations: [...(prev.variations || []), newVariation],
                                                                mrp: 0,
                                                                finalPrice: 0,
                                                                discount: 0,
                                                                isManualDiscount: false,
                                                                pdfPrice: prev.pdfPrice
                                                            };
                                                        });
                                                    }
                                                }}
                                                className="bg-primary text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-purple-700"
                                            >
                                                <Plus className="w-4 h-4" /> Add Size
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {(() => {
                                                const sizeVar = editedProduct.variations?.find(v => v.name === 'Size');
                                                if (!sizeVar || sizeVar.options.length === 0) {
                                                    return (
                                                        <div className="text-center py-8 text-gray-500">
                                                            <p>No sizes added yet. Click "Add Size" to create one.</p>
                                                        </div>
                                                    );
                                                }
                                                return sizeVar.options.map((option) => (
                                                    <div key={option.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                        <div className="grid grid-cols-5 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Size Name</label>
                                                                <input
                                                                    type="text"
                                                                    value={option.label}
                                                                    onChange={(e) => {
                                                                        const updatedVariations = editedProduct.variations?.map(v => {
                                                                            if (v.name === 'Size') {
                                                                                return {
                                                                                    ...v,
                                                                                    options: v.options.map(o =>
                                                                                        o.id === option.id ? { ...o, label: e.target.value } : o
                                                                                    )
                                                                                };
                                                                            }
                                                                            return v;
                                                                        });
                                                                        setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                    }}
                                                                    placeholder="e.g., Small, Medium, Large"
                                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                                                                <input
                                                                    type="text"
                                                                    value={option.description || ''}
                                                                    onChange={(e) => {
                                                                        const updatedVariations = editedProduct.variations?.map(v => {
                                                                            if (v.name === 'Size') {
                                                                                return {
                                                                                    ...v,
                                                                                    options: v.options.map(o =>
                                                                                        o.id === option.id ? { ...o, description: e.target.value } : o
                                                                                    )
                                                                                };
                                                                            }
                                                                            return v;
                                                                        });
                                                                        setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                    }}
                                                                    placeholder="e.g., 10x10cm"
                                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">MRP (₹)</label>
                                                                <input
                                                                    type="number"
                                                                    value={option.mrp || 0}
                                                                    onChange={(e) => {
                                                                        const mrp = parseFloat(e.target.value) || 0;
                                                                        const final = option.finalPrice || 0;
                                                                        const disc = mrp > 0 ? Math.round((1 - final / mrp) * 100) : 0;
                                                                        const updatedVariations = editedProduct.variations?.map(v => {
                                                                            if (v.name === 'Size') {
                                                                                return {
                                                                                    ...v,
                                                                                    options: v.options.map(o =>
                                                                                        o.id === option.id ? {
                                                                                            ...o,
                                                                                            mrp,
                                                                                            priceAdjustment: mrp || 0,
                                                                                            discount: disc
                                                                                        } : o
                                                                                    )
                                                                                };
                                                                            }
                                                                            return v;
                                                                        });
                                                                        setEditedProduct(prev => {
                                                                            if (!prev) return null;
                                                                            return {
                                                                                ...prev,
                                                                                variations: updatedVariations,
                                                                                ...(option.isDefault ? {
                                                                                    mrp,
                                                                                    discount: disc,
                                                                                    pdfPrice: mrp || prev.pdfPrice
                                                                                } : {})
                                                                            };
                                                                        });
                                                                    }}
                                                                    placeholder="MRP"
                                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Final Price (₹)</label>
                                                                <input
                                                                    type="number"
                                                                    value={option.finalPrice || 0}
                                                                    onChange={(e) => {
                                                                        const rawFinal = parseFloat(e.target.value) || 0;
                                                                        const updatedVariations = editedProduct.variations?.map(v => {
                                                                            if (v.name === 'Size') {
                                                                                return {
                                                                                    ...v,
                                                                                    options: v.options.map(o => {
                                                                                        if (o.id === option.id) {
                                                                                            if (o.isManualDiscount) {
                                                                                                const mrp = o.mrp || 0;
                                                                                                const disc = mrp > 0 ? Math.round((1 - rawFinal / mrp) * 100) : 0;
                                                                                                return { ...o, finalPrice: rawFinal, discount: disc };
                                                                                            } else {
                                                                                                const { final, mrp, discount } = calculatePremiumPricing(rawFinal);
                                                                                                return { ...o, finalPrice: final, mrp: mrp, discount: discount, priceAdjustment: mrp || 0 };
                                                                                            }
                                                                                        }
                                                                                        return o;
                                                                                    })
                                                                                };
                                                                            }
                                                                            return v;
                                                                        });
                                                                        setEditedProduct(prev => {
                                                                            if (!prev) return null;
                                                                            const matchedOpt = updatedVariations?.find(v => v.name === 'Size')?.options.find(o => o.id === option.id);
                                                                            return {
                                                                                ...prev,
                                                                                variations: updatedVariations,
                                                                                ...(option.isDefault && matchedOpt ? {
                                                                                    finalPrice: matchedOpt.finalPrice,
                                                                                    mrp: matchedOpt.mrp,
                                                                                    discount: matchedOpt.discount,
                                                                                    pdfPrice: matchedOpt.mrp || prev.pdfPrice
                                                                                } : {})
                                                                            };
                                                                        });
                                                                    }}
                                                                    placeholder="Final"
                                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm font-bold text-green-600 shadow-sm border-green-200"
                                                                />
                                                            </div>

                                                            <div>
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <label className="block text-xs font-medium text-gray-700">Disc (%)</label>
                                                                    <label className="flex items-center gap-0.5 text-[9px] font-bold text-gray-400 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={option.isManualDiscount || false}
                                                                            onChange={e => {
                                                                                const isManual = e.target.checked;
                                                                                const updatedVariations = editedProduct.variations?.map(v => {
                                                                                    if (v.name === 'Size') {
                                                                                        return {
                                                                                            ...v,
                                                                                            options: v.options.map(o => {
                                                                                                if (o.id === option.id) {
                                                                                                    if (!isManual && o.finalPrice) {
                                                                                                        const { final, mrp, discount } = calculatePremiumPricing(o.finalPrice);
                                                                                                        return { ...o, isManualDiscount: isManual, finalPrice: final, mrp, discount };
                                                                                                    }
                                                                                                    return { ...o, isManualDiscount: isManual };
                                                                                                }
                                                                                                return o;
                                                                                            })
                                                                                        };
                                                                                    }
                                                                                    return v;
                                                                                });
                                                                                setEditedProduct(prev => {
                                                                                    if (!prev) return null;
                                                                                    const matchedOpt = updatedVariations?.find(v => v.name === 'Size')?.options.find(o => o.id === option.id);
                                                                                    return {
                                                                                        ...prev,
                                                                                        variations: updatedVariations,
                                                                                        ...(option.isDefault && matchedOpt ? {
                                                                                            isManualDiscount: matchedOpt.isManualDiscount,
                                                                                            finalPrice: matchedOpt.finalPrice,
                                                                                            mrp: matchedOpt.mrp,
                                                                                            discount: matchedOpt.discount,
                                                                                            pdfPrice: matchedOpt.mrp || prev.pdfPrice
                                                                                        } : {})
                                                                                    };
                                                                                });
                                                                            }}
                                                                            className="w-2.5 h-2.5 rounded"
                                                                        /> M
                                                                    </label>
                                                                </div>
                                                                <input
                                                                    type="number"
                                                                    value={option.discount || (option.mrp && option.finalPrice ? Math.round((1 - option.finalPrice / option.mrp) * 100) : 0)}
                                                                    onChange={(e) => {
                                                                        const disc = parseInt(e.target.value) || 0;
                                                                        const final = option.finalPrice || 0;
                                                                        const mrp = disc < 100 ? Math.round(final / (1 - disc / 100)) : final;
                                                                        const updatedVariations = editedProduct.variations?.map(v => {
                                                                            if (v.name === 'Size') {
                                                                                return {
                                                                                    ...v,
                                                                                    options: v.options.map(o =>
                                                                                        o.id === option.id ? {
                                                                                            ...o,
                                                                                            discount: disc,
                                                                                            mrp: o.isManualDiscount ? mrp : o.mrp,
                                                                                            priceAdjustment: (o.isManualDiscount ? mrp : o.mrp) || o.priceAdjustment || 0
                                                                                        } : o
                                                                                    )
                                                                                };
                                                                            }
                                                                            return v;
                                                                        });
                                                                        setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                    }}
                                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Variant Image</label>
                                                                <div className="flex items-center gap-2">
                                                                    {option.image ? (
                                                                        <div className="relative group/opt">
                                                                            <img src={option.image} alt="" className="w-10 h-10 rounded border border-gray-200 object-cover" />
                                                                            <button
                                                                                onClick={() => {
                                                                                    const updatedVariations = editedProduct.variations?.map(v => {
                                                                                        if (v.name === 'Size') {
                                                                                            return {
                                                                                                ...v,
                                                                                                options: v.options.map(o => o.id === option.id ? { ...o, image: undefined } : o)
                                                                                            };
                                                                                        }
                                                                                        return v;
                                                                                    });
                                                                                    setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                                }}
                                                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                                                                            >
                                                                                <X className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <label className="w-10 h-10 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-colors bg-white">
                                                                            <ImagePlus className="w-5 h-5 text-gray-400" />
                                                                            <input
                                                                                type="file"
                                                                                className="hidden"
                                                                                onChange={(e) => handleImageUpload(e, 'variant', sizeVar.id, option.id)}
                                                                            />
                                                                        </label>
                                                                    )}
                                                                    <div className="flex flex-col gap-1 items-start">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <input
                                                                                type="radio"
                                                                                name="defaultImage"
                                                                                id={`default_${option.id}`}
                                                                                checked={option.isDefault || false}
                                                                                onChange={() => handleSetDefaultOption('variation', sizeVar.id, option.id)}
                                                                                className="w-3.5 h-3.5 text-primary focus:ring-primary border-gray-300"
                                                                            />
                                                                            <label htmlFor={`default_${option.id}`} className="text-[10px] text-gray-600 font-bold cursor-pointer">Default</label>
                                                                        </div>
                                                                        <div className="text-[10px] items-start flex flex-col">
                                                                            <span className="text-gray-500 font-bold leading-tight">
                                                                                Disc: {option.mrp && option.finalPrice ? Math.round((1 - option.finalPrice / option.mrp) * 100) : 0}%
                                                                            </span>
                                                                            <span className="text-gray-500 font-bold leading-tight">
                                                                                Final: ₹{option.finalPrice || 0}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-end">
                                                                <button
                                                                    onClick={() => {
                                                                        const updatedVariations = editedProduct.variations?.map(v => {
                                                                            if (v.name === 'Size') {
                                                                                return {
                                                                                    ...v,
                                                                                    options: v.options.filter(o => o.id !== option.id)
                                                                                };
                                                                            }
                                                                            return v;
                                                                        }).filter(v => v.name !== 'Size' || v.options.length > 0);
                                                                        setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                    }}
                                                                    className="w-full bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-1"
                                                                >
                                                                    <Trash2 className="w-4 h-4" /> Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>

                                        <div className="border-t pt-6 mt-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editedProduct.variations?.find(v => v.id === 'lb_variation' || v.name === 'Light Base')?.name || 'Light Base'}
                                                        onChange={(e) => {
                                                            const newName = e.target.value;
                                                            const existing = editedProduct.variations?.find(v => v.id === 'lb_variation' || v.name === 'Light Base');
                                                            if (existing) {
                                                                const updatedVariations = editedProduct.variations?.map(v =>
                                                                    (v.id === 'lb_variation' || v.name === 'Light Base') ? { ...v, name: newName, id: 'lb_variation' } : v
                                                                );
                                                                setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                            } else {
                                                                const newVariation: Variation = {
                                                                    id: 'lb_variation',
                                                                    name: newName,
                                                                    options: []
                                                                };
                                                                setEditedProduct({
                                                                    ...editedProduct,
                                                                    variations: [...(editedProduct.variations || []), newVariation]
                                                                });
                                                            }
                                                        }}
                                                        className="font-bold text-lg border-b border-dashed border-gray-400 focus:border-primary focus:outline-none bg-transparent hover:border-solid w-48"
                                                        placeholder="Variation Name"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const lbVariation = editedProduct.variations?.find(v => v.id === 'lb_variation' || v.name === 'Light Base');
                                                        if (lbVariation) {
                                                            const newOption: VariationOption = {
                                                                id: `lb_${Date.now()}`,
                                                                label: 'With Light Base',
                                                                description: '',
                                                                finalPrice: 0,
                                                                mrp: 0,
                                                                discount: 0,
                                                                isManualDiscount: false,
                                                                priceAdjustment: 0,
                                                                isDefault: lbVariation.options.length === 0
                                                            };
                                                            const updatedVariations = editedProduct.variations?.map(v =>
                                                                (v.id === 'lb_variation' || v.name === 'Light Base') ? { ...v, options: [...v.options, newOption] } : v
                                                            );
                                                            setEditedProduct(prev => {
                                                                if (!prev) return null;
                                                                return {
                                                                    ...prev,
                                                                    variations: updatedVariations,
                                                                    ...(newOption.isDefault ? {
                                                                        mrp: 0,
                                                                        finalPrice: 0,
                                                                        discount: 0,
                                                                        isManualDiscount: false
                                                                    } : {})
                                                                };
                                                            });
                                                        } else {
                                                            const newOption: VariationOption = {
                                                                id: `lb_${Date.now()}`,
                                                                label: 'Light Base',
                                                                description: '',
                                                                finalPrice: 0,
                                                                mrp: 0,
                                                                discount: 0,
                                                                isManualDiscount: false,
                                                                priceAdjustment: 0,
                                                                isDefault: true
                                                            };
                                                            const newVariation: Variation = {
                                                                id: 'lb_variation',
                                                                name: 'Light Base',
                                                                options: [newOption]
                                                            };
                                                            setEditedProduct(prev => {
                                                                if (!prev) return null;
                                                                return {
                                                                    ...prev,
                                                                    variations: [...(prev.variations || []), newVariation],
                                                                    mrp: 0,
                                                                    finalPrice: 0,
                                                                    discount: 0,
                                                                    isManualDiscount: false
                                                                };
                                                            });
                                                        }
                                                    }}
                                                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-purple-700"
                                                >
                                                    <Plus className="w-4 h-4" /> Add Option
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {(() => {
                                                    const lbVar = editedProduct.variations?.find(v => v.id === 'lb_variation' || v.name === 'Light Base');
                                                    if (!lbVar || lbVar.options.length === 0) {
                                                        return (
                                                            <div className="text-center py-8 text-gray-500">
                                                                <p>No options added yet. Click "Add Option" to create one.</p>
                                                            </div>
                                                        );
                                                    }
                                                    return lbVar.options.map((option) => (
                                                        <div key={option.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                            <div className="grid grid-cols-6 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                                                                    <input
                                                                        type="text"
                                                                        value={option.label}
                                                                        onChange={(e) => {
                                                                            const updatedVariations = editedProduct.variations?.map(v => {
                                                                                if (v.id === 'lb_variation' || v.name === 'Light Base') {
                                                                                    return {
                                                                                        ...v,
                                                                                        options: v.options.map(o =>
                                                                                            o.id === option.id ? { ...o, label: e.target.value } : o
                                                                                        )
                                                                                    };
                                                                                }
                                                                                return v;
                                                                            });
                                                                            setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                        }}
                                                                        placeholder="e.g., With Light Base"
                                                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Desc</label>
                                                                    <input
                                                                        type="text"
                                                                        value={option.description || ''}
                                                                        onChange={(e) => {
                                                                            const updatedVariations = editedProduct.variations?.map(v => {
                                                                                if (v.id === 'lb_variation' || v.name === 'Light Base') {
                                                                                    return {
                                                                                        ...v,
                                                                                        options: v.options.map(o =>
                                                                                            o.id === option.id ? { ...o, description: e.target.value } : o
                                                                                        )
                                                                                    };
                                                                                }
                                                                                return v;
                                                                            });
                                                                            setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                        }}
                                                                        placeholder="Optional"
                                                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                                                                    <input
                                                                        type="text"
                                                                        value={option.size || ''}
                                                                        onChange={(e) => {
                                                                            const updatedVariations = editedProduct.variations?.map(v => {
                                                                                if (v.id === 'lb_variation' || v.name === 'Light Base') {
                                                                                    return {
                                                                                        ...v,
                                                                                        options: v.options.map(o =>
                                                                                            o.id === option.id ? { ...o, size: e.target.value } : o
                                                                                        )
                                                                                    };
                                                                                }
                                                                                return v;
                                                                            });
                                                                            setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                        }}
                                                                        placeholder="e.g., 15cm"
                                                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">MRP (₹)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={option.mrp || 0}
                                                                        onChange={(e) => {
                                                                            const mrp = parseFloat(e.target.value) || 0;
                                                                            const final = option.finalPrice || 0;
                                                                            const disc = mrp > 0 ? Math.round((1 - final / mrp) * 100) : 0;
                                                                            const updatedVariations = editedProduct.variations?.map(v => {
                                                                                if (v.id === 'lb_variation' || v.name === 'Light Base') {
                                                                                    return {
                                                                                        ...v,
                                                                                        options: v.options.map(o =>
                                                                                            o.id === option.id ? {
                                                                                                ...o,
                                                                                                mrp,
                                                                                                priceAdjustment: mrp || 0,
                                                                                                discount: disc
                                                                                            } : o
                                                                                        )
                                                                                    };
                                                                                }
                                                                                return v;
                                                                            });
                                                                            setEditedProduct(prev => {
                                                                                if (!prev) return null;
                                                                                return {
                                                                                    ...prev,
                                                                                    variations: updatedVariations,
                                                                                    ...(option.isDefault ? {
                                                                                        mrp,
                                                                                        discount: disc,
                                                                                        pdfPrice: mrp || prev.pdfPrice
                                                                                    } : {})
                                                                                };
                                                                            });
                                                                        }}
                                                                        placeholder="MRP"
                                                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Final (₹)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={option.finalPrice || 0}
                                                                        onChange={(e) => {
                                                                            const rawFinal = parseFloat(e.target.value) || 0;
                                                                            const updatedVariations = editedProduct.variations?.map(v => {
                                                                                if (v.id === 'lb_variation' || v.name === 'Light Base') {
                                                                                    return {
                                                                                        ...v,
                                                                                        options: v.options.map(o => {
                                                                                            if (o.id === option.id) {
                                                                                                if (o.isManualDiscount) {
                                                                                                    const mrp = o.mrp || 0;
                                                                                                    const disc = mrp > 0 ? Math.round((1 - rawFinal / mrp) * 100) : 0;
                                                                                                    return { ...o, finalPrice: rawFinal, discount: disc };
                                                                                                } else {
                                                                                                    const { final, mrp, discount } = calculatePremiumPricing(rawFinal);
                                                                                                    return { ...o, finalPrice: final, mrp: mrp, discount: discount, priceAdjustment: mrp || 0 };
                                                                                                }
                                                                                            }
                                                                                            return o;
                                                                                        })
                                                                                    };
                                                                                }
                                                                                return v;
                                                                            });
                                                                            setEditedProduct(prev => {
                                                                                if (!prev) return null;
                                                                                const matchedOpt = updatedVariations?.find(v => v.id === 'lb_variation' || v.name === 'Light Base')?.options.find(o => o.id === option.id);
                                                                                return {
                                                                                    ...prev,
                                                                                    variations: updatedVariations,
                                                                                    ...(option.isDefault && matchedOpt ? {
                                                                                        finalPrice: matchedOpt.finalPrice,
                                                                                        mrp: matchedOpt.mrp,
                                                                                        discount: matchedOpt.discount,
                                                                                        pdfPrice: matchedOpt.mrp || prev.pdfPrice
                                                                                    } : {})
                                                                                };
                                                                            });
                                                                        }}
                                                                        placeholder="Final"
                                                                        className="w-full border border-gray-300 rounded-md p-2 text-sm font-bold text-green-600 shadow-sm border-green-200"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <label className="block text-xs font-medium text-gray-700">Disc (%)</label>
                                                                        <label className="flex items-center gap-0.5 text-[9px] font-bold text-gray-400 cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={option.isManualDiscount || false}
                                                                                onChange={e => {
                                                                                    const isManual = e.target.checked;
                                                                                    const updatedVariations = editedProduct.variations?.map(v => {
                                                                                        if (v.id === 'lb_variation' || v.name === 'Light Base') {
                                                                                            return {
                                                                                                ...v,
                                                                                                options: v.options.map(o => {
                                                                                                    if (o.id === option.id) {
                                                                                                        if (!isManual && o.finalPrice) {
                                                                                                            const { final, mrp, discount } = calculatePremiumPricing(o.finalPrice);
                                                                                                            return { ...o, isManualDiscount: isManual, finalPrice: final, mrp, discount };
                                                                                                        }
                                                                                                        return { ...o, isManualDiscount: isManual };
                                                                                                    }
                                                                                                    return o;
                                                                                                })
                                                                                            };
                                                                                        }
                                                                                        return v;
                                                                                    });
                                                                                    setEditedProduct(prev => {
                                                                                        if (!prev) return null;
                                                                                        const matchedOpt = updatedVariations?.find(v => v.id === 'lb_variation' || v.name === 'Light Base')?.options.find(o => o.id === option.id);
                                                                                        return {
                                                                                            ...prev,
                                                                                            variations: updatedVariations,
                                                                                            ...(option.isDefault && matchedOpt ? {
                                                                                                isManualDiscount: matchedOpt.isManualDiscount,
                                                                                                finalPrice: matchedOpt.finalPrice,
                                                                                                mrp: matchedOpt.mrp,
                                                                                                discount: matchedOpt.discount,
                                                                                                pdfPrice: matchedOpt.mrp || prev.pdfPrice
                                                                                            } : {})
                                                                                        };
                                                                                    });
                                                                                }}
                                                                                className="w-2.5 h-2.5 rounded"
                                                                            /> M
                                                                        </label>
                                                                    </div>
                                                                    <input
                                                                        type="number"
                                                                        value={option.discount || (option.mrp && option.finalPrice ? Math.round((1 - option.finalPrice / option.mrp) * 100) : 0)}
                                                                        onChange={(e) => {
                                                                            const disc = parseInt(e.target.value) || 0;
                                                                            const final = option.finalPrice || 0;
                                                                            const mrp = disc < 100 ? Math.round(final / (1 - disc / 100)) : final;
                                                                            const updatedVariations = editedProduct.variations?.map(v => {
                                                                                if (v.id === 'lb_variation' || v.name === 'Light Base') {
                                                                                    return {
                                                                                        ...v,
                                                                                        options: v.options.map(o =>
                                                                                            o.id === option.id ? {
                                                                                                ...o,
                                                                                                discount: disc,
                                                                                                mrp: o.isManualDiscount ? mrp : o.mrp,
                                                                                                priceAdjustment: (o.isManualDiscount ? mrp : o.mrp) || o.priceAdjustment || 0
                                                                                            } : o
                                                                                        )
                                                                                    };
                                                                                }
                                                                                return v;
                                                                            });
                                                                            setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                        }}
                                                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Image</label>
                                                                    <div className="flex items-center gap-2">
                                                                        {option.image ? (
                                                                            <div className="relative group/opt">
                                                                                <img src={option.image} alt="" className="w-10 h-10 rounded border border-gray-200 object-cover" />
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const updatedVariations = editedProduct.variations?.map(v => {
                                                                                            if (v.id === 'lb_variation' || v.name === 'Light Base') {
                                                                                                return {
                                                                                                    ...v,
                                                                                                    options: v.options.map(o => o.id === option.id ? { ...o, image: undefined } : o)
                                                                                                };
                                                                                            }
                                                                                            return v;
                                                                                        });
                                                                                        setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                                    }}
                                                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                                                                                >
                                                                                    <X className="w-3 h-3" />
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <label className="w-10 h-10 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-colors bg-white">
                                                                                <ImagePlus className="w-5 h-5 text-gray-400" />
                                                                                <input
                                                                                    type="file"
                                                                                    className="hidden"
                                                                                    onChange={(e) => handleImageUpload(e, 'variant', lbVar.id, option.id)}
                                                                                />
                                                                            </label>
                                                                        )}
                                                                        <div className="flex flex-col gap-1 items-start">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="defaultImage"
                                                                                    id={`default_${option.id}`}
                                                                                    checked={option.isDefault || false}
                                                                                    onChange={() => handleSetDefaultOption('variation', lbVar.id, option.id)}
                                                                                    className="w-3.5 h-3.5 text-primary focus:ring-primary border-gray-300"
                                                                                />
                                                                                <label htmlFor={`default_${option.id}`} className="text-[10px] text-gray-600 font-bold cursor-pointer">Default</label>
                                                                            </div>
                                                                            <div className="text-[10px] items-start flex flex-col">
                                                                                <span className="text-gray-500 font-bold leading-tight">
                                                                                    Disc: {option.mrp && option.finalPrice ? Math.round((1 - option.finalPrice / option.mrp) * 100) : 0}%
                                                                                </span>
                                                                                <span className="text-gray-500 font-bold leading-tight">
                                                                                    Final: ₹{option.finalPrice || 0}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-end">
                                                                    <button
                                                                        onClick={() => {
                                                                            const updatedVariations = editedProduct.variations?.map(v => {
                                                                                if (v.id === 'lb_variation' || v.name === 'Light Base') {
                                                                                    return {
                                                                                        ...v,
                                                                                        options: v.options.filter(o => o.id !== option.id)
                                                                                    };
                                                                                }
                                                                                return v;
                                                                            }).filter(v => (v.id !== 'lb_variation' && v.name !== 'Light Base') || v.options.length > 0);
                                                                            setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                        }}
                                                                        className="w-full bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-1"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>

                                            {/* Shape Variation */}
                                            <div className="border-t pt-6 mt-6">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-bold text-lg">Product Shapes</h4>
                                                    <button
                                                        onClick={() => {
                                                            const shapeVariation = editedProduct.variations?.find(v => v.name === 'Shape');
                                                            if (shapeVariation) {
                                                                const newOption: VariationOption = {
                                                                    id: `shape_${Date.now()}`,
                                                                    label: 'New Shape',
                                                                    description: '',
                                                                    size: '',
                                                                    finalPrice: 0,
                                                                    mrp: 0,
                                                                    discount: 0,
                                                                    isManualDiscount: false,
                                                                    priceAdjustment: 0,
                                                                    isDefault: shapeVariation.options.length === 0
                                                                };
                                                                const updatedVariations = editedProduct.variations?.map(v =>
                                                                    v.name === 'Shape' ? { ...v, options: [...v.options, newOption] } : v
                                                                );
                                                                setEditedProduct(prev => {
                                                                    if (!prev) return null;
                                                                    return {
                                                                        ...prev,
                                                                        variations: updatedVariations,
                                                                        ...(newOption.isDefault ? {
                                                                            mrp: 0,
                                                                            finalPrice: 0,
                                                                            discount: 0,
                                                                            isManualDiscount: false
                                                                        } : {})
                                                                    };
                                                                });
                                                            } else {
                                                                const newOption: VariationOption = {
                                                                    id: `shape_${Date.now()}`,
                                                                    label: 'Rectangle',
                                                                    description: '',
                                                                    size: '',
                                                                    finalPrice: 0,
                                                                    mrp: 0,
                                                                    discount: 0,
                                                                    isManualDiscount: false,
                                                                    priceAdjustment: 0,
                                                                    isDefault: true
                                                                };
                                                                const newVariation: Variation = {
                                                                    id: 'shape_variation',
                                                                    name: 'Shape',
                                                                    options: [newOption]
                                                                };
                                                                setEditedProduct(prev => {
                                                                    if (!prev) return null;
                                                                    return {
                                                                        ...prev,
                                                                        variations: [...(prev.variations || []), newVariation],
                                                                        mrp: 0,
                                                                        finalPrice: 0,
                                                                        discount: 0,
                                                                        isManualDiscount: false
                                                                    };
                                                                });
                                                            }
                                                        }}
                                                        className="bg-primary text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-purple-700"
                                                    >
                                                        <Plus className="w-4 h-4" /> Add Shape
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    {(() => {
                                                        const shapeVar = editedProduct.variations?.find(v => v.name === 'Shape');
                                                        if (!shapeVar || shapeVar.options.length === 0) {
                                                            return (
                                                                <div className="text-center py-8 text-gray-500">
                                                                    <p>No shapes added yet. Click "Add Shape" to create one.</p>
                                                                </div>
                                                            );
                                                        }
                                                        return shapeVar.options.map((option) => (
                                                            <div key={option.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                <div className="grid grid-cols-6 gap-3">
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Shape Name</label>
                                                                        <input
                                                                            type="text"
                                                                            value={option.label}
                                                                            onChange={(e) => {
                                                                                const updatedVariations = editedProduct.variations?.map(v => {
                                                                                    if (v.name === 'Shape') {
                                                                                        return {
                                                                                            ...v,
                                                                                            options: v.options.map(o =>
                                                                                                o.id === option.id ? { ...o, label: e.target.value } : o
                                                                                            )
                                                                                        };
                                                                                    }
                                                                                    return v;
                                                                                });
                                                                                setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                            }}
                                                                            placeholder="e.g., Rectangle, Heart"
                                                                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                                                                        <input
                                                                            type="text"
                                                                            value={option.size || ''}
                                                                            onChange={(e) => {
                                                                                const updatedVariations = editedProduct.variations?.map(v => {
                                                                                    if (v.name === 'Shape') {
                                                                                        return {
                                                                                            ...v,
                                                                                            options: v.options.map(o =>
                                                                                                o.id === option.id ? { ...o, size: e.target.value } : o
                                                                                            )
                                                                                        };
                                                                                    }
                                                                                    return v;
                                                                                });
                                                                                setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                            }}
                                                                            placeholder="e.g., 10x10cm"
                                                                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">MRP (₹)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={option.mrp || 0}
                                                                            onChange={(e) => {
                                                                                const mrp = parseFloat(e.target.value) || 0;
                                                                                const final = option.finalPrice || 0;
                                                                                const disc = mrp > 0 ? Math.round((1 - final / mrp) * 100) : 0;
                                                                                const updatedVariations = editedProduct.variations?.map(v => {
                                                                                    if (v.name === 'Shape') {
                                                                                        return {
                                                                                            ...v,
                                                                                            options: v.options.map(o =>
                                                                                                o.id === option.id ? {
                                                                                                    ...o,
                                                                                                    mrp,
                                                                                                    priceAdjustment: mrp || 0,
                                                                                                    discount: disc
                                                                                                } : o
                                                                                            )
                                                                                        };
                                                                                    }
                                                                                    return v;
                                                                                });
                                                                                setEditedProduct(prev => {
                                                                                    if (!prev) return null;
                                                                                    return {
                                                                                        ...prev,
                                                                                        variations: updatedVariations,
                                                                                        ...(option.isDefault ? {
                                                                                            mrp: mrp,
                                                                                            discount: disc,
                                                                                            pdfPrice: mrp || prev.pdfPrice
                                                                                        } : {})
                                                                                    };
                                                                                });
                                                                            }}
                                                                            placeholder="MRP"
                                                                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Final (₹)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={option.finalPrice || 0}
                                                                            onChange={(e) => {
                                                                                const rawFinal = parseFloat(e.target.value) || 0;
                                                                                const updatedVariations = editedProduct.variations?.map(v => {
                                                                                    if (v.name === 'Shape') {
                                                                                        return {
                                                                                            ...v,
                                                                                            options: v.options.map(o => {
                                                                                                if (o.id === option.id) {
                                                                                                    if (o.isManualDiscount) {
                                                                                                        const mrp = o.mrp || 0;
                                                                                                        const disc = mrp > 0 ? Math.round((1 - rawFinal / mrp) * 100) : 0;
                                                                                                        return { ...o, finalPrice: rawFinal, discount: disc };
                                                                                                    } else {
                                                                                                        const { final, mrp, discount } = calculatePremiumPricing(rawFinal);
                                                                                                        return { ...o, finalPrice: final, mrp: mrp, discount: discount, priceAdjustment: mrp || 0 };
                                                                                                    }
                                                                                                }
                                                                                                return o;
                                                                                            })
                                                                                        };
                                                                                    }
                                                                                    return v;
                                                                                });
                                                                                setEditedProduct(prev => {
                                                                                    if (!prev) return null;
                                                                                    const matchedOpt = updatedVariations?.find(v => v.name === 'Shape')?.options.find(o => o.id === option.id);
                                                                                    return {
                                                                                        ...prev,
                                                                                        variations: updatedVariations,
                                                                                        ...(option.isDefault && matchedOpt ? {
                                                                                            finalPrice: matchedOpt.finalPrice,
                                                                                            mrp: matchedOpt.mrp,
                                                                                            discount: matchedOpt.discount,
                                                                                            pdfPrice: matchedOpt.mrp || prev.pdfPrice
                                                                                        } : {})
                                                                                    };
                                                                                });
                                                                            }}
                                                                            placeholder="Final"
                                                                            className="w-full border border-gray-300 rounded-md p-2 text-sm font-bold text-green-600 shadow-sm border-green-200"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <div className="flex justify-between items-center mb-1">
                                                                            <label className="block text-xs font-medium text-gray-700">Disc (%)</label>
                                                                            <label className="flex items-center gap-0.5 text-[9px] font-bold text-gray-400 cursor-pointer">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={option.isManualDiscount || false}
                                                                                    onChange={e => {
                                                                                        const isManual = e.target.checked;
                                                                                        const updatedVariations = editedProduct.variations?.map(v => {
                                                                                            if (v.name === 'Shape') {
                                                                                                return {
                                                                                                    ...v,
                                                                                                    options: v.options.map(o => {
                                                                                                        if (o.id === option.id) {
                                                                                                            if (!isManual && o.finalPrice) {
                                                                                                                const { final, mrp, discount } = calculatePremiumPricing(o.finalPrice);
                                                                                                                return { ...o, isManualDiscount: isManual, finalPrice: final, mrp, discount };
                                                                                                            }
                                                                                                            return { ...o, isManualDiscount: isManual };
                                                                                                        }
                                                                                                        return o;
                                                                                                    })
                                                                                                };
                                                                                            }
                                                                                            return v;
                                                                                        });
                                                                                        setEditedProduct(prev => {
                                                                                            if (!prev) return null;
                                                                                            const matchedOpt = updatedVariations?.find(v => v.name === 'Shape')?.options.find(o => o.id === option.id);
                                                                                            return {
                                                                                                ...prev,
                                                                                                variations: updatedVariations,
                                                                                                ...(option.isDefault && matchedOpt ? {
                                                                                                    isManualDiscount: matchedOpt.isManualDiscount,
                                                                                                    finalPrice: matchedOpt.finalPrice,
                                                                                                    mrp: matchedOpt.mrp,
                                                                                                    discount: matchedOpt.discount,
                                                                                                    pdfPrice: matchedOpt.mrp || prev.pdfPrice
                                                                                                } : {})
                                                                                            };
                                                                                        });
                                                                                    }}
                                                                                    className="w-2.5 h-2.5 rounded"
                                                                                /> Manual
                                                                            </label>
                                                                        </div>
                                                                        <input
                                                                            type="number"
                                                                            value={option.discount || (option.mrp && option.finalPrice ? Math.round((1 - option.finalPrice / option.mrp) * 100) : 0)}
                                                                            onChange={(e) => {
                                                                                const disc = parseInt(e.target.value) || 0;
                                                                                const final = option.finalPrice || 0;
                                                                                const mrp = disc < 100 ? Math.round(final / (1 - disc / 100)) : final;
                                                                                const updatedVariations = editedProduct.variations?.map(v => {
                                                                                    if (v.name === 'Shape') {
                                                                                        return {
                                                                                            ...v,
                                                                                            options: v.options.map(o =>
                                                                                                o.id === option.id ? {
                                                                                                    ...o,
                                                                                                    discount: disc,
                                                                                                    mrp: o.isManualDiscount ? mrp : o.mrp,
                                                                                                    priceAdjustment: (o.isManualDiscount ? mrp : o.mrp) || o.priceAdjustment || 0
                                                                                                } : o
                                                                                            )
                                                                                        };
                                                                                    }
                                                                                    return v;
                                                                                });
                                                                                setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                            }}
                                                                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Image & Actions</label>
                                                                        <div className="flex items-center gap-2">
                                                                            {option.image ? (
                                                                                <div className="relative group/opt">
                                                                                    <img src={option.image} alt="" className="w-10 h-10 rounded border border-gray-200 object-cover" />
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            const updatedVariations = editedProduct.variations?.map(v => {
                                                                                                if (v.name === 'Shape') {
                                                                                                    return {
                                                                                                        ...v,
                                                                                                        options: v.options.map(o => o.id === option.id ? { ...o, image: undefined } : o)
                                                                                                    };
                                                                                                }
                                                                                                return v;
                                                                                            });
                                                                                            setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                                        }}
                                                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                                                                                    >
                                                                                        <X className="w-3 h-3" />
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <label className="w-10 h-10 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-colors bg-white">
                                                                                    <ImagePlus className="w-5 h-5 text-gray-400" />
                                                                                    <input
                                                                                        type="file"
                                                                                        className="hidden"
                                                                                        onChange={(e) => handleImageUpload(e, 'variant', shapeVar.id, option.id)}
                                                                                    />
                                                                                </label>
                                                                            )}
                                                                            <div className="flex flex-col gap-1 items-start">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <input
                                                                                        type="radio"
                                                                                        name="defaultImage"
                                                                                        id={`default_${option.id}`}
                                                                                        checked={option.isDefault || false}
                                                                                        onChange={() => handleSetDefaultOption('variation', shapeVar.id, option.id)}
                                                                                        className="w-3.5 h-3.5 text-primary focus:ring-primary border-gray-300"
                                                                                    />
                                                                                    <label htmlFor={`default_${option.id}`} className="text-[10px] text-gray-600 font-bold cursor-pointer">Default</label>
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const updatedVariations = editedProduct.variations?.map(v => {
                                                                                            if (v.name === 'Shape') {
                                                                                                return {
                                                                                                    ...v,
                                                                                                    options: v.options.filter(o => o.id !== option.id)
                                                                                                };
                                                                                            }
                                                                                            return v;
                                                                                        }).filter(v => v.name !== 'Shape' || v.options.length > 0);
                                                                                        setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                                    }}
                                                                                    className="bg-red-50 text-red-600 p-1.5 rounded-md hover:bg-red-100 transition-colors"
                                                                                    title="Delete Option"
                                                                                >
                                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>

                                            </div>

                                            {/* Color Variation */}
                                            <div className="border-t pt-6 mt-6">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <h4 className="font-bold text-lg">Product Colors</h4>
                                                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={editedProduct.variations?.find(v => v.name === 'Color')?.disableAutoSelect || false}
                                                                onChange={(e) => {
                                                                    const colorVar = editedProduct.variations?.find(v => v.name === 'Color');
                                                                    if (colorVar) {
                                                                        const updated = editedProduct.variations?.map(v => v.id === colorVar.id ? { ...v, disableAutoSelect: e.target.checked } : v);
                                                                        setEditedProduct({ ...editedProduct, variations: updated });
                                                                    } else if (e.target.checked) {
                                                                        const newVariation: Variation = {
                                                                            id: 'color_variation',
                                                                            name: 'Color',
                                                                            disableAutoSelect: true,
                                                                            options: []
                                                                        };
                                                                        setEditedProduct({
                                                                            ...editedProduct,
                                                                            variations: [...(editedProduct.variations || []), newVariation]
                                                                        });
                                                                    }
                                                                }}
                                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                                            />
                                                            Disable Auto-Select
                                                        </label>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const colorVariation = editedProduct.variations?.find(v => v.name === 'Color');
                                                            if (colorVariation) {
                                                                const newOption: VariationOption = {
                                                                    id: `color_${Date.now()}`,
                                                                    label: 'New Color',
                                                                    description: '',
                                                                    size: '',
                                                                    finalPrice: 0,
                                                                    mrp: 0,
                                                                    discount: 0,
                                                                    isManualDiscount: false,
                                                                    priceAdjustment: 0,
                                                                    isDefault: colorVariation.options.length === 0
                                                                };
                                                                const updatedVariations = editedProduct.variations?.map(v =>
                                                                    v.name === 'Color' ? { ...v, options: [...v.options, newOption] } : v
                                                                );
                                                                setEditedProduct(prev => {
                                                                    if (!prev) return null;
                                                                    return {
                                                                        ...prev,
                                                                        variations: updatedVariations,
                                                                        ...(newOption.isDefault ? {
                                                                            mrp: 0,
                                                                            finalPrice: 0,
                                                                            discount: 0,
                                                                            isManualDiscount: false
                                                                        } : {})
                                                                    };
                                                                });
                                                            } else {
                                                                const newOption: VariationOption = {
                                                                    id: `color_${Date.now()}`,
                                                                    label: 'New Color',
                                                                    description: '',
                                                                    size: '',
                                                                    finalPrice: 0,
                                                                    mrp: 0,
                                                                    discount: 0,
                                                                    isManualDiscount: false,
                                                                    priceAdjustment: 0,
                                                                    isDefault: true
                                                                };
                                                                const newVariation: Variation = {
                                                                    id: 'color_variation',
                                                                    name: 'Color',
                                                                    disableAutoSelect: false,
                                                                    options: [newOption]
                                                                };
                                                                setEditedProduct(prev => {
                                                                    if (!prev) return null;
                                                                    return {
                                                                        ...prev,
                                                                        variations: [...(prev.variations || []), newVariation],
                                                                        mrp: 0,
                                                                        finalPrice: 0,
                                                                        discount: 0,
                                                                        isManualDiscount: false
                                                                    };
                                                                });
                                                            }
                                                        }}
                                                        className="bg-primary text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-purple-700"
                                                    >
                                                        <Plus className="w-4 h-4" /> Add Color
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    {(() => {
                                                        const colorVar = editedProduct.variations?.find(v => v.name === 'Color');
                                                        if (!colorVar || colorVar.options.length === 0) {
                                                            return (
                                                                <div className="text-center py-8 text-gray-500">
                                                                    <p>No colors added yet. Click "Add Color" to create one.</p>
                                                                </div>
                                                            );
                                                        }
                                                        return colorVar.options.map((option) => (
                                                            <div key={option.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                <div className="grid grid-cols-6 gap-3">
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Color Name</label>
                                                                        <input
                                                                            type="text"
                                                                            value={option.label}
                                                                            onChange={(e) => {
                                                                                const updatedVariations = editedProduct.variations?.map(v => {
                                                                                    if (v.name === 'Color') {
                                                                                        return {
                                                                                            ...v,
                                                                                            options: v.options.map(o =>
                                                                                                o.id === option.id ? { ...o, label: e.target.value } : o
                                                                                            )
                                                                                        };
                                                                                    }
                                                                                    return v;
                                                                                });
                                                                                setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                            }}
                                                                            placeholder="e.g., Red, Blue"
                                                                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                                                                        <input
                                                                            type="text"
                                                                            value={option.size || ''}
                                                                            onChange={(e) => {
                                                                                const updatedVariations = editedProduct.variations?.map(v => {
                                                                                    if (v.name === 'Color') {
                                                                                        return {
                                                                                            ...v,
                                                                                            options: v.options.map(o =>
                                                                                                o.id === option.id ? { ...o, size: e.target.value } : o
                                                                                            )
                                                                                        };
                                                                                    }
                                                                                    return v;
                                                                                });
                                                                                setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                            }}
                                                                            placeholder="e.g., Standard"
                                                                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">MRP (₹)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={option.mrp || 0}
                                                                            onChange={(e) => {
                                                                                const mrp = parseFloat(e.target.value) || 0;
                                                                                const final = option.finalPrice || 0;
                                                                                const disc = mrp > 0 ? Math.round((1 - final / mrp) * 100) : 0;
                                                                                const updatedVariations = editedProduct.variations?.map(v => {
                                                                                    if (v.name === 'Color') {
                                                                                        return {
                                                                                            ...v,
                                                                                            options: v.options.map(o =>
                                                                                                o.id === option.id ? {
                                                                                                    ...o,
                                                                                                    mrp,
                                                                                                    priceAdjustment: mrp || 0,
                                                                                                    discount: disc
                                                                                                } : o
                                                                                            )
                                                                                        };
                                                                                    }
                                                                                    return v;
                                                                                });
                                                                                setEditedProduct(prev => {
                                                                                    if (!prev) return null;
                                                                                    return {
                                                                                        ...prev,
                                                                                        variations: updatedVariations,
                                                                                        ...(option.isDefault ? {
                                                                                            mrp,
                                                                                            discount: disc,
                                                                                            pdfPrice: mrp || prev.pdfPrice
                                                                                        } : {})
                                                                                    };
                                                                                });
                                                                            }}
                                                                            placeholder="MRP"
                                                                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Final (₹)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={option.finalPrice || 0}
                                                                            onChange={(e) => {
                                                                                const rawFinal = parseFloat(e.target.value) || 0;
                                                                                const updatedVariations = editedProduct.variations?.map(v => {
                                                                                    if (v.name === 'Color') {
                                                                                        return {
                                                                                            ...v,
                                                                                            options: v.options.map(o => {
                                                                                                if (o.id === option.id) {
                                                                                                    if (o.isManualDiscount) {
                                                                                                        const mrp = o.mrp || 0;
                                                                                                        const disc = mrp > 0 ? Math.round((1 - rawFinal / mrp) * 100) : 0;
                                                                                                        return { ...o, finalPrice: rawFinal, discount: disc };
                                                                                                    } else {
                                                                                                        const { final, mrp, discount } = calculatePremiumPricing(rawFinal);
                                                                                                        return { ...o, finalPrice: final, mrp: mrp, discount: discount, priceAdjustment: mrp || 0 };
                                                                                                    }
                                                                                                }
                                                                                                return o;
                                                                                            })
                                                                                        };
                                                                                    }
                                                                                    return v;
                                                                                });
                                                                                setEditedProduct(prev => {
                                                                                    if (!prev) return null;
                                                                                    const matchedOpt = updatedVariations?.find(v => v.name === 'Color')?.options.find(o => o.id === option.id);
                                                                                    return {
                                                                                        ...prev,
                                                                                        variations: updatedVariations,
                                                                                        ...(option.isDefault && matchedOpt ? {
                                                                                            finalPrice: matchedOpt.finalPrice,
                                                                                            mrp: matchedOpt.mrp,
                                                                                            discount: matchedOpt.discount,
                                                                                            pdfPrice: matchedOpt.mrp || prev.pdfPrice
                                                                                        } : {})
                                                                                    };
                                                                                });
                                                                            }}
                                                                            placeholder="Final"
                                                                            className="w-full border border-gray-300 rounded-md p-2 text-sm font-bold text-green-600 shadow-sm border-green-200"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <div className="flex justify-between items-center mb-1">
                                                                            <label className="block text-xs font-medium text-gray-700">Disc (%)</label>
                                                                            <label className="flex items-center gap-0.5 text-[9px] font-bold text-gray-400 cursor-pointer">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={option.isManualDiscount || false}
                                                                                    onChange={e => {
                                                                                        const isManual = e.target.checked;
                                                                                        const updatedVariations = editedProduct.variations?.map(v => {
                                                                                            if (v.name === 'Color') {
                                                                                                return {
                                                                                                    ...v,
                                                                                                    options: v.options.map(o => {
                                                                                                        if (o.id === option.id) {
                                                                                                            if (!isManual && o.finalPrice) {
                                                                                                                const { final, mrp, discount } = calculatePremiumPricing(o.finalPrice);
                                                                                                                return { ...o, isManualDiscount: isManual, finalPrice: final, mrp, discount };
                                                                                                            }
                                                                                                            return { ...o, isManualDiscount: isManual };
                                                                                                        }
                                                                                                        return o;
                                                                                                    })
                                                                                                };
                                                                                            }
                                                                                            return v;
                                                                                        });
                                                                                        setEditedProduct(prev => {
                                                                                            if (!prev) return null;
                                                                                            const matchedOpt = updatedVariations?.find(v => v.name === 'Color')?.options.find(o => o.id === option.id);
                                                                                            return {
                                                                                                ...prev,
                                                                                                variations: updatedVariations,
                                                                                                ...(option.isDefault && matchedOpt ? {
                                                                                                    isManualDiscount: matchedOpt.isManualDiscount,
                                                                                                    finalPrice: matchedOpt.finalPrice,
                                                                                                    mrp: matchedOpt.mrp,
                                                                                                    discount: matchedOpt.discount,
                                                                                                    pdfPrice: matchedOpt.mrp || prev.pdfPrice
                                                                                                } : {})
                                                                                            };
                                                                                        });
                                                                                    }}
                                                                                    className="w-2.5 h-2.5 rounded"
                                                                                /> Manual
                                                                            </label>
                                                                        </div>
                                                                        <input
                                                                            type="number"
                                                                            value={option.discount || (option.mrp && option.finalPrice ? Math.round((1 - option.finalPrice / option.mrp) * 100) : 0)}
                                                                            onChange={(e) => {
                                                                                const disc = parseInt(e.target.value) || 0;
                                                                                const final = option.finalPrice || 0;
                                                                                const mrp = disc < 100 ? Math.round(final / (1 - disc / 100)) : final;
                                                                                const updatedVariations = editedProduct.variations?.map(v => {
                                                                                    if (v.name === 'Color') {
                                                                                        return {
                                                                                            ...v,
                                                                                            options: v.options.map(o =>
                                                                                                o.id === option.id ? {
                                                                                                    ...o,
                                                                                                    discount: disc,
                                                                                                    mrp: o.isManualDiscount ? mrp : o.mrp,
                                                                                                    priceAdjustment: (o.isManualDiscount ? mrp : o.mrp) || o.priceAdjustment || 0
                                                                                                } : o
                                                                                            )
                                                                                        };
                                                                                    }
                                                                                    return v;
                                                                                });
                                                                                setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                            }}
                                                                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Image & Actions</label>
                                                                        <div className="flex items-center gap-2">
                                                                            {option.image ? (
                                                                                <div className="relative group/opt">
                                                                                    <img src={option.image} alt="" className="w-10 h-10 rounded border border-gray-200 object-cover" />
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            const updatedVariations = editedProduct.variations?.map(v => {
                                                                                                if (v.name === 'Color') {
                                                                                                    return {
                                                                                                        ...v,
                                                                                                        options: v.options.map(o => o.id === option.id ? { ...o, image: undefined } : o)
                                                                                                    };
                                                                                                }
                                                                                                return v;
                                                                                            });
                                                                                            setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                                        }}
                                                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                                                                                    >
                                                                                        <X className="w-3 h-3" />
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <label className="w-10 h-10 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-colors bg-white">
                                                                                    <ImagePlus className="w-5 h-5 text-gray-400" />
                                                                                    <input
                                                                                        type="file"
                                                                                        className="hidden"
                                                                                        onChange={(e) => handleImageUpload(e, 'variant', colorVar.id, option.id)}
                                                                                    />
                                                                                </label>
                                                                            )}
                                                                            <div className="flex flex-col gap-1 items-start">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <input
                                                                                        type="radio"
                                                                                        name="defaultImage"
                                                                                        id={`default_${option.id}`}
                                                                                        checked={option.isDefault || false}
                                                                                        onChange={() => handleSetDefaultOption('variation', colorVar.id, option.id)}
                                                                                        className="w-3.5 h-3.5 text-primary focus:ring-primary border-gray-300"
                                                                                    />
                                                                                    <label htmlFor={`default_${option.id}`} className="text-[10px] text-gray-600 font-bold cursor-pointer">Default</label>
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const updatedVariations = editedProduct.variations?.map(v => {
                                                                                            if (v.name === 'Color') {
                                                                                                return {
                                                                                                    ...v,
                                                                                                    options: v.options.filter(o => o.id !== option.id)
                                                                                                };
                                                                                            }
                                                                                            return v;
                                                                                        }).filter(v => v.name !== 'Color' || v.options.length > 0 || v.disableAutoSelect);
                                                                                        setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                                    }}
                                                                                    className="bg-red-50 text-red-600 p-1.5 rounded-md hover:bg-red-100 transition-colors"
                                                                                    title="Delete Option"
                                                                                >
                                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>

                                            </div>

                                            {/* Additional Heads Configuration */}
                                            <div className="border-t pt-6 mt-6">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-bold text-lg">Additional Heads</h4>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={editedProduct.additionalHeadsConfig?.enabled || false}
                                                            onChange={(e) => {
                                                                setEditedProduct({
                                                                    ...editedProduct,
                                                                    additionalHeadsConfig: {
                                                                        enabled: e.target.checked,
                                                                        pricePerHead: editedProduct.additionalHeadsConfig?.pricePerHead || 125,
                                                                        maxLimit: editedProduct.additionalHeadsConfig?.maxLimit || 10
                                                                    }
                                                                });
                                                            }}
                                                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700">Enable Additional Heads</span>
                                                    </label>
                                                </div>

                                                {editedProduct.additionalHeadsConfig?.enabled && (
                                                    <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Price Per Head (₹)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={editedProduct.additionalHeadsConfig.pricePerHead}
                                                                onChange={(e) => {
                                                                    setEditedProduct({
                                                                        ...editedProduct,
                                                                        additionalHeadsConfig: {
                                                                            ...editedProduct.additionalHeadsConfig!,
                                                                            pricePerHead: parseInt(e.target.value) || 0
                                                                        }
                                                                    });
                                                                }}
                                                                className="w-full border border-gray-300 rounded-md p-2"
                                                                placeholder="125"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Maximum Limit
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="50"
                                                                value={editedProduct.additionalHeadsConfig.maxLimit}
                                                                onChange={(e) => {
                                                                    setEditedProduct({
                                                                        ...editedProduct,
                                                                        additionalHeadsConfig: {
                                                                            ...editedProduct.additionalHeadsConfig!,
                                                                            maxLimit: parseInt(e.target.value) || 10
                                                                        }
                                                                    });
                                                                }}
                                                                className="w-full border border-gray-300 rounded-md p-2"
                                                                placeholder="10"
                                                            />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-xs text-gray-600 bg-white p-3 rounded border border-blue-200">
                                                                <strong>Preview:</strong> Customers can add up to {editedProduct.additionalHeadsConfig.maxLimit} extra persons at ₹{editedProduct.additionalHeadsConfig.pricePerHead} per head.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Symbol Customization Configuration */}
                                            <div className="border-t pt-6 mt-6">
                                                <div className="bg-purple-50 p-6 rounded-2xl border-2 border-dashed border-purple-200">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                                <Star className="w-5 h-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900">Symbol Customization (Charter/Charm)</h4>
                                                                <p className="text-xs text-gray-500">Enable a textbox for customers to enter a symbol or charm number</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                id="symbolNumberEnabled"
                                                                checked={editedProduct.symbolNumberConfig?.enabled || false}
                                                                onChange={e => setEditedProduct({
                                                                    ...editedProduct,
                                                                    symbolNumberConfig: {
                                                                        enabled: e.target.checked,
                                                                        title: editedProduct.symbolNumberConfig?.title || 'Symbol Number',
                                                                        image: editedProduct.symbolNumberConfig?.image
                                                                    }
                                                                })}
                                                                className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                                                            />
                                                            <label htmlFor="symbolNumberEnabled" className="text-sm font-bold text-gray-700 cursor-pointer">Enabled</label>
                                                        </div>
                                                    </div>

                                                    {editedProduct.symbolNumberConfig?.enabled && (
                                                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Textbox Title</label>
                                                                <input
                                                                    type="text"
                                                                    value={editedProduct.symbolNumberConfig.title}
                                                                    onChange={e => setEditedProduct({
                                                                        ...editedProduct,
                                                                        symbolNumberConfig: {
                                                                            ...editedProduct.symbolNumberConfig!,
                                                                            title: e.target.value
                                                                        }
                                                                    })}
                                                                    placeholder="e.g., Enter Symbol Number"
                                                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Charm Chart Image (Optional)</label>
                                                                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200">
                                                                    {editedProduct.symbolNumberConfig.image ? (
                                                                        <div className="relative group/sym">
                                                                            <img src={editedProduct.symbolNumberConfig.image} alt="Preview" className="w-12 h-12 object-contain rounded border bg-gray-50" />
                                                                            <button
                                                                                onClick={() => setEditedProduct({ ...editedProduct, symbolNumberConfig: { ...editedProduct.symbolNumberConfig!, image: undefined } })}
                                                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/sym:opacity-100 transition-opacity"
                                                                            >
                                                                                <X className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-12 h-12 rounded border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
                                                                            <ImagePlus className="w-5 h-5 text-gray-300" />
                                                                        </div>
                                                                    )}
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                const reader = new FileReader();
                                                                                reader.onloadend = () => {
                                                                                    setEditedProduct({
                                                                                        ...editedProduct,
                                                                                        symbolNumberConfig: {
                                                                                            ...editedProduct.symbolNumberConfig!,
                                                                                            image: reader.result as string
                                                                                        }
                                                                                    });
                                                                                };
                                                                                reader.readAsDataURL(file);
                                                                            }
                                                                        }}
                                                                        className="flex-1 text-[11px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="border-t pt-6 mt-6">
                                                <h4 className="font-bold text-lg mb-4">Other Variations</h4>
                                                {editedProduct.variations?.filter(v => !['Size', 'Shape', 'Light Base', 'Color'].includes(v.name)).map((variation) => (
                                                    <div key={variation.id} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <h5 className="font-bold text-gray-800">{variation.name}</h5>
                                                            <button
                                                                onClick={() => {
                                                                    const updatedVariations = editedProduct.variations?.filter(v => v.id !== variation.id);
                                                                    setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                }}
                                                                className="text-red-500 text-xs font-bold hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                                            >
                                                                Remove Variation
                                                            </button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {variation.options.map((opt) => (
                                                                <div key={opt.id} className="bg-white p-3 rounded border border-gray-100 shadow-sm transition-all hover:shadow-md">
                                                                    <div className="grid grid-cols-6 gap-3 items-end">
                                                                        <div>
                                                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Option Name</label>
                                                                            <input
                                                                                type="text"
                                                                                value={opt.label}
                                                                                onChange={(e) => {
                                                                                    const updatedVariations = editedProduct.variations?.map(v => {
                                                                                        if (v.id === variation.id) {
                                                                                            return {
                                                                                                ...v,
                                                                                                options: v.options.map(o => o.id === opt.id ? { ...o, label: e.target.value } : o)
                                                                                            };
                                                                                        }
                                                                                        return v;
                                                                                    });
                                                                                    setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                                }}
                                                                                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                                                                            />
                                                                        </div>

                                                                        <div>
                                                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">MRP (₹)</label>
                                                                            <input
                                                                                type="number"
                                                                                value={opt.mrp || 0}
                                                                                onChange={(e) => {
                                                                                    const mrp = parseFloat(e.target.value) || 0;
                                                                                    const final = opt.finalPrice || 0;
                                                                                    const disc = mrp > 0 ? Math.round((1 - final / mrp) * 100) : 0;
                                                                                    const updatedVariations = editedProduct.variations?.map(v => {
                                                                                        if (v.id === variation.id) {
                                                                                            return {
                                                                                                ...v,
                                                                                                options: v.options.map(o => o.id === opt.id ? {
                                                                                                    ...o,
                                                                                                    mrp,
                                                                                                    priceAdjustment: mrp || 0,
                                                                                                    discount: o.isManualDiscount ? o.discount : disc
                                                                                                } : o)
                                                                                            };
                                                                                        }
                                                                                        return v;
                                                                                    });
                                                                                    setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                                }}
                                                                                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/10 transition-all"
                                                                            />
                                                                        </div>

                                                                        <div>
                                                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Final (₹)</label>
                                                                            <input
                                                                                type="number"
                                                                                value={opt.finalPrice || 0}
                                                                                onChange={(e) => {
                                                                                    const rawFinal = parseFloat(e.target.value) || 0;
                                                                                    const { final, mrp, discount } = calculatePremiumPricing(rawFinal);
                                                                                    const updatedVariations = editedProduct.variations?.map(v => {
                                                                                        if (v.id === variation.id) {
                                                                                            return {
                                                                                                ...v,
                                                                                                options: v.options.map(o => o.id === opt.id ? {
                                                                                                    ...o,
                                                                                                    finalPrice: final,
                                                                                                    mrp: mrp,
                                                                                                    discount: discount,
                                                                                                    priceAdjustment: mrp || 0
                                                                                                } : o)
                                                                                            };
                                                                                        }
                                                                                        return v;
                                                                                    });
                                                                                    setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                                }}
                                                                                className="w-full border border-gray-200 rounded-lg p-2 text-sm font-bold text-green-600 focus:ring-2 focus:ring-green-100 transition-all shadow-inner"
                                                                            />
                                                                        </div>

                                                                        <div>
                                                                            <div className="flex justify-between items-center mb-1">
                                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Disc (%)</label>
                                                                                <label className="flex items-center gap-0.5 text-[9px] font-bold text-gray-300 cursor-pointer">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={opt.isManualDiscount || false}
                                                                                        onChange={e => {
                                                                                            const updatedVariations = editedProduct.variations?.map(v => {
                                                                                                if (v.id === variation.id) {
                                                                                                    return {
                                                                                                        ...v,
                                                                                                        options: v.options.map(o => o.id === opt.id ? { ...o, isManualDiscount: e.target.checked } : o)
                                                                                                    };
                                                                                                }
                                                                                                return v;
                                                                                            });
                                                                                            setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                                        }}
                                                                                        className="w-2.5 h-2.5 rounded"
                                                                                    /> Manual
                                                                                </label>
                                                                            </div>
                                                                            <input
                                                                                type="number"
                                                                                value={opt.discount || (opt.mrp && opt.finalPrice ? Math.round((1 - opt.finalPrice / opt.mrp) * 100) : 0)}
                                                                                onChange={(e) => {
                                                                                    const disc = parseInt(e.target.value) || 0;
                                                                                    const final = opt.finalPrice || 0;
                                                                                    const mrp = disc < 100 ? Math.round(final / (1 - disc / 100)) : final;
                                                                                    const updatedVariations = editedProduct.variations?.map(v => {
                                                                                        if (v.id === variation.id) {
                                                                                            return {
                                                                                                ...v,
                                                                                                options: v.options.map(o => o.id === opt.id ? {
                                                                                                    ...o,
                                                                                                    discount: disc,
                                                                                                    mrp: o.isManualDiscount ? mrp : o.mrp,
                                                                                                    priceAdjustment: (o.isManualDiscount ? mrp : o.mrp) || o.priceAdjustment || 0
                                                                                                } : o)
                                                                                            };
                                                                                        }
                                                                                        return v;
                                                                                    });
                                                                                    setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                                }}
                                                                                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/10 transition-all"
                                                                            />
                                                                        </div>

                                                                        <div>
                                                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1 text-center">Default</label>
                                                                            <div className="flex justify-center h-9 items-center">
                                                                                <input
                                                                                    type="radio"
                                                                                    name={`default_${variation.id}`}
                                                                                    checked={opt.isDefault || false}
                                                                                    onChange={() => handleSetDefaultOption('variation', variation.id, opt.id)}
                                                                                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    const updatedVariations = editedProduct.variations?.map(v => {
                                                                                        if (v.id === variation.id) {
                                                                                            return {
                                                                                                ...v,
                                                                                                options: v.options.filter(o => o.id !== opt.id)
                                                                                            };
                                                                                        }
                                                                                        return v;
                                                                                    }).filter(v => v.options.length > 0 || ['Size', 'Color', 'Shape', 'Light Base'].includes(v.name));
                                                                                    setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                                }}
                                                                                className="w-full bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                                                                                title="Delete Option"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <button
                                                                onClick={() => {
                                                                    const updatedVariations = editedProduct.variations?.map(v => {
                                                                        if (v.id === variation.id) {
                                                                            return {
                                                                                ...v,
                                                                                options: [...v.options, {
                                                                                    id: `opt_${Date.now()}`,
                                                                                    label: 'New Option',
                                                                                    priceAdjustment: 0,
                                                                                    mrp: 0,
                                                                                    finalPrice: 0,
                                                                                    discount: 0
                                                                                }]
                                                                            };
                                                                        }
                                                                        return v;
                                                                    });
                                                                    setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                }}
                                                                className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-xs font-bold hover:border-gray-300 hover:text-gray-500 transition-all flex items-center justify-center gap-1.5"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" /> Add {variation.name} Option
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {editTab === 'desc' && (
                                    <div className="space-y-6">
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 mb-4">
                                            <p className="flex items-center gap-2 font-bold"><Eye className="w-4 h-4" /> Notes:</p>
                                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                                <li>The "Description" section is the main product description shown on cards and SEO.</li>
                                                <li>You can rename sections or hide them using the checkbox.</li>
                                                <li>Users will see these as tabs on the product page.</li>
                                            </ul>
                                        </div>
                                        {editedProduct.aboutSections?.map((section, idx) => (
                                            <div key={section.id} className={`p-4 rounded-xl border-2 transition-all ${section.isHidden ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-200 focus-within:border-primary focus-within:ring-4 ring-primary/5'}`}>
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <input
                                                            value={section.title}
                                                            onChange={e => {
                                                                const updated = [...(editedProduct.aboutSections || [])];
                                                                updated[idx] = { ...updated[idx], title: e.target.value };
                                                                setEditedProduct({ ...editedProduct, aboutSections: updated });
                                                            }}
                                                            className="font-bold text-lg bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none transition-colors"
                                                            placeholder="Section Title"
                                                        />
                                                        {section.isHidden && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold">Hidden</span>}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {idx !== 0 && (
                                                            <button
                                                                onClick={() => {
                                                                    const updated = [...(editedProduct.aboutSections || [])];
                                                                    updated.splice(idx, 1);
                                                                    setEditedProduct({ ...editedProduct, aboutSections: updated });
                                                                }}
                                                                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                                                title="Delete Section"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={section.isManual}
                                                                onChange={e => {
                                                                    const updated = [...(editedProduct.aboutSections || [])];
                                                                    updated[idx] = { ...updated[idx], isManual: e.target.checked };
                                                                    setEditedProduct({ ...editedProduct, aboutSections: updated });
                                                                }}
                                                                className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
                                                            />
                                                            <span className="text-sm font-medium text-gray-600">Manual</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={section.isHidden}
                                                                onChange={e => {
                                                                    const updated = [...(editedProduct.aboutSections || [])];
                                                                    updated[idx] = { ...updated[idx], isHidden: e.target.checked };
                                                                    setEditedProduct({ ...editedProduct, aboutSections: updated });
                                                                }}
                                                                className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
                                                            />
                                                            <span className="text-sm font-medium text-gray-600">Hide Section</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <textarea
                                                    value={section.content}
                                                    onChange={e => {
                                                        const updated = [...(editedProduct.aboutSections || [])];
                                                        updated[idx] = { ...updated[idx], content: e.target.value };
                                                        // Sync description with the first section
                                                        const updates: any = { aboutSections: updated };
                                                        if (idx === 0) updates.description = e.target.value;
                                                        setEditedProduct({ ...editedProduct, ...updates });
                                                    }}
                                                    className="w-full h-48 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all leading-relaxed"
                                                    placeholder={`Enter ${section.title} content here...`}
                                                />
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setEditedProduct({
                                                ...editedProduct,
                                                aboutSections: [...(editedProduct.aboutSections || []), {
                                                    id: `sec_${Date.now()}`,
                                                    title: 'New Section',
                                                    content: '',
                                                    isHidden: false,
                                                    isManual: false
                                                }]
                                            })}
                                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" /> Add New Section
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setIsEditing(null)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                            <button onClick={saveProduct} className="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-purple-700">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Seller Management Modal */}
            {showSellerModal && (
                <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full animate-fade-in-up">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">{isEditingSeller ? 'Edit Seller' : 'Onboard New Seller'}</h3>
                            <button onClick={() => setShowSellerModal(false)} className="hover:bg-gray-200 p-1 rounded"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Company Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={newSellerData.companyName || ''}
                                    onChange={e => setNewSellerData({ ...newSellerData, companyName: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contact Person <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={newSellerData.contactPerson || ''}
                                    onChange={e => setNewSellerData({ ...newSellerData, contactPerson: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    value={newSellerData.email || ''}
                                    onChange={e => setNewSellerData({ ...newSellerData, email: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={newSellerData.phone || ''}
                                    onChange={e => setNewSellerData({ ...newSellerData, phone: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    placeholder="+91 9876543210"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setShowSellerModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                            <button onClick={handleSaveSeller} className="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-purple-700">
                                {isEditingSeller ? 'Update Seller' : 'Onboard Seller'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Coupon Modal */}
            {showCouponModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">{isEditingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h3>
                            <button onClick={() => setShowCouponModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Coupon Code</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2 uppercase"
                                    value={newCouponData.code || ''}
                                    onChange={e => setNewCouponData({ ...newCouponData, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. SUMMER50"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Discount Type</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        value={newCouponData.discountType || 'FIXED'}
                                        onChange={e => setNewCouponData({ ...newCouponData, discountType: e.target.value as any })}
                                    >
                                        <option value="FIXED">Flat Amount (₹)</option>
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="B2G1">Buy 2 Get 1 (B2G1)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">
                                        {newCouponData.discountType === 'B2G1' ? 'Value (Not required for B2G1)' : 'Value'}
                                    </label>
                                    <input
                                        type="number"
                                        className={`w-full border rounded-lg p-2 ${newCouponData.discountType === 'B2G1' ? 'bg-gray-100 opacity-50 cursor-not-allowed' : ''}`}
                                        value={newCouponData.discountType === 'B2G1' ? '' : (newCouponData.value || '')}
                                        onChange={e => setNewCouponData({ ...newCouponData, value: e.target.value ? parseFloat(e.target.value) : undefined })}
                                        placeholder={newCouponData.discountType === 'B2G1' ? 'N/A' : 'e.g. 100'}
                                        disabled={newCouponData.discountType === 'B2G1'}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg p-2"
                                        value={newCouponData.expiryDate ? new Date(newCouponData.expiryDate).toISOString().split('T')[0] : ''}
                                        onChange={e => setNewCouponData({ ...newCouponData, expiryDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Usage Limit</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2"
                                        value={newCouponData.usageLimit || ''}
                                        onChange={e => setNewCouponData({ ...newCouponData, usageLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                                        placeholder="e.g. 1000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Min Purchase Amount</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2"
                                        value={newCouponData.minPurchase || ''}
                                        onChange={e => setNewCouponData({ ...newCouponData, minPurchase: e.target.value ? parseFloat(e.target.value) : undefined })}
                                        placeholder="e.g. 1500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Max Purchase Amount (optional)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2"
                                        value={newCouponData.maxPurchase || ''}
                                        onChange={e => setNewCouponData({ ...newCouponData, maxPurchase: e.target.value ? parseFloat(e.target.value) : undefined })}
                                        placeholder="e.g. 3000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Max Discount Amount (optional)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2"
                                        value={newCouponData.maxDiscount || ''}
                                        onChange={e => setNewCouponData({ ...newCouponData, maxDiscount: e.target.value ? parseFloat(e.target.value) : undefined })}
                                        placeholder="e.g. 500"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveCoupon}
                                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                            >
                                {isEditingCoupon ? 'Update Coupon' : 'Create Coupon'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
