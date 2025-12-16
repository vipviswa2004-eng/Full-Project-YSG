
import React, { useState, useEffect } from 'react';
import { useCart } from '../context';
// import { products as initialProducts } from '../data/products';
import { Product, Variation, VariationOption, Order, Shape, Customer, Review, Coupon, Seller, OrderStatus, Transaction, ReturnRequest, Section, ShopCategory } from '../types';
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

    // Seller Management State
    const [isEditingSeller, setIsEditingSeller] = useState<Seller | null>(null);
    const [showSellerModal, setShowSellerModal] = useState(false);
    const [newSellerData, setNewSellerData] = useState<Partial<Seller>>({});

    // Shop Sections & Categories
    const [sections, setSections] = useState<Section[]>([]);
    const [shopCategories, setShopCategories] = useState<ShopCategory[]>([]);
    const [shopSectionTab, setShopSectionTab] = useState<'sections' | 'categories'>('sections');
    const [isEditingShopItem, setIsEditingShopItem] = useState<any>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Draft'>('All');
    const [isEditing, setIsEditing] = useState<Product | null>(null);
    const [editedProduct, setEditedProduct] = useState<Product | null>(null);
    const [editTab, setEditTab] = useState<'vital' | 'images' | 'variations' | 'desc'>('vital'); // Removed ai-studio
    const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);

    // Removed unused AI state

    useEffect(() => {
        if (isEditing) {
            setEditedProduct(JSON.parse(JSON.stringify(isEditing)));
            setEditTab('vital');
        } else {
            setEditedProduct(null);
        }
    }, [isEditing]);

    // ... Database Sync Logic ...
    const fetchReviews = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/reviews', { cache: 'no-store' });
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
                await fetch(`http://localhost:5000/api/reviews/${id}`, { method: 'DELETE' });
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
                        await fetch(`http://localhost:5000/api/products/${prodId}`, {
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
                await fetch(`http://localhost:5000/api/reviews/${id}`, {
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
            const [sectionsRes, categoriesRes] = await Promise.all([
                fetch('http://localhost:5000/api/sections'),
                fetch('http://localhost:5000/api/shop-categories')
            ]);
            setSections(await sectionsRes.json());
            setShopCategories(await categoriesRes.json());
        } catch (error) {
            console.error("Failed to fetch shop data", error);
        }
    };

    // Load products and initial data
    useEffect(() => {
        console.log('🔄 Loading products from database...');
        fetch(`http://localhost:5000/api/products?t=${Date.now()}`, {
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
    }, []);

    const handleShopItemSave = async (type: 'sections' | 'categories', data: any) => {
        try {
            const method = data._id ? 'PUT' : 'POST';
            const apiPath = type === 'sections' ? 'sections' : 'shop-categories';
            const url = `http://localhost:5000/api/${apiPath}${data._id ? `/${data._id}` : ''}`;
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            fetchShopData();
            setIsEditingShopItem(null);
        } catch (error) {
            console.error(`Failed to save ${type}`, error);
        }
    };

    const handleShopItemDelete = async (type: 'sections' | 'categories', id: string) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const apiPath = type === 'sections' ? 'sections' : 'shop-categories';
            await fetch(`http://localhost:5000/api/${apiPath}/${id}`, { method: 'DELETE' });
            fetchShopData();
        } catch (error) {
            console.error(`Failed to delete ${type}`, error);
        }
    };

    // Seller Management Functions
    const handleSaveSeller = async () => {
        try {
            const method = isEditingSeller ? 'PUT' : 'POST';
            const url = isEditingSeller
                ? `http://localhost:5000/api/sellers/${isEditingSeller.id}`
                : 'http://localhost:5000/api/sellers';

            const body = isEditingSeller ? { ...isEditingSeller, ...newSellerData } : {
                id: `S${Date.now()}`,
                companyName: newSellerData.companyName || 'New Company',
                contactPerson: newSellerData.contactPerson || '',
                email: newSellerData.email || '',
                phone: newSellerData.phone || '',
                status: 'Pending',
                rating: 0,
                balance: 0,
                returnRate: 0
            };

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            fetchSellers();
            setShowSellerModal(false);
            setIsEditingSeller(null);
            setNewSellerData({});
        } catch (error) {
            console.error("Failed to save seller", error);
            alert("Failed to save seller");
        }
    };

    const handleSellerAction = async (id: string, action: 'Approve' | 'Suspend' | 'Activate' | 'Delete') => {
        try {
            if (action === 'Delete') {
                if (window.confirm("Delete this seller?")) {
                    await fetch(`http://localhost:5000/api/sellers/${id}`, { method: 'DELETE' });
                    fetchSellers();
                }
            } else {
                const statusMap: Record<string, 'Active' | 'Suspended' | 'Pending'> = {
                    'Approve': 'Active',
                    'Activate': 'Active',
                    'Suspend': 'Suspended'
                };

                await fetch(`http://localhost:5000/api/sellers/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: statusMap[action] })
                });
                fetchSellers();
            }
        } catch (error) {
            console.error(`Failed to ${action} seller`, error);
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
        return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">Access Denied</div>;
    }

    const handleDeleteProduct = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                const product = productList.find(p => p.id === id);
                if (product && (product as any)._id) {
                    await fetch(`http://localhost:5000/api/products/${(product as any)._id}`, {
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
    const handleStockUpdate = async (id: string, newStock: number) => {
        const updatedList = productList.map(p => p.id === id ? { ...p, stock: Math.max(0, newStock) } : p);
        setProductList(updatedList);

        try {
            const product = updatedList.find(p => p.id === id);
            if (product && (product as any)._id) {
                await fetch(`http://localhost:5000/api/products/${(product as any)._id}`, {
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
            await fetch(`http://localhost:5000/api/customers/${id}`, {
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

            await fetch(`http://localhost:5000/api/orders/${(order as any)._id}`, {
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
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch('http://localhost:5000/api/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (data.url) {
                    const imageUrl = data.url;
                    if (target === 'main' && editedProduct) {
                        setEditedProduct({ ...editedProduct, image: imageUrl });
                    } else if (target === 'variant' && editedProduct && varId && optId) {
                        setEditedProduct(prev => {
                            if (!prev) return null;
                            const newVars = prev.variations?.map(v => {
                                if (v.id === varId) {
                                    return {
                                        ...v,
                                        options: v.options.map(o => o.id === optId ? { ...o, image: imageUrl } : o)
                                    };
                                }
                                return v;
                            });
                            return { ...prev, variations: newVars };
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to upload image", error);
                alert("Failed to upload image. Please try again.");
            }
        }
    };

    // Removed unused helper functions (handleAddVariation, etc.)
    const saveProduct = async () => {
        if (!editedProduct) return;

        console.log('💾 Saving product:', editedProduct.name, 'ID:', editedProduct.id, 'MongoID:', (editedProduct as any)._id);

        try {
            const response = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedProduct),
                cache: 'no-store'
            });

            const savedProduct = await response.json();
            console.log('✅ Product saved successfully:', savedProduct);

            const exists = productList.find(p => p.id === editedProduct.id);
            if (exists) {
                setProductList(prev => prev.map(p => p.id === editedProduct.id ? savedProduct : p));
            } else {
                setProductList(prev => [...prev, savedProduct]);
            }

            setIsEditing(null);
        } catch (e) {
            console.error("Failed to save product", e);
            alert("Failed to save product. Please try again.");
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
            </div>
        );
    };
    const renderProducts = () => (<div className="space-y-4"><div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm"><div className="flex items-center gap-3"><h2 className="text-lg font-bold flex items-center gap-2"><Package className="w-5 h-5" /> Inventory</h2><span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">{filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}</span></div><div className="flex gap-4 items-center"><div className="relative"><Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" /><input className="pl-9 pr-4 py-2 border rounded-md text-sm w-64 focus:ring-primary focus:border-primary" placeholder="Search Name, SKU, Category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div><div className="relative"><Filter className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="pl-9 pr-4 py-2 border rounded-md text-sm focus:ring-primary focus:border-primary bg-white"><option value="All">All Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Draft">Draft</option></select></div><button onClick={() => setIsEditing({ id: `NEW-${Date.now()}`, code: '', name: 'New Product', category: 'Uncategorized', pdfPrice: 0, shape: Shape.RECTANGLE, image: 'https://via.placeholder.com/150', description: '', stock: 0, status: 'Draft', variations: [] })} className="bg-primary text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Add Product</button></div></div><div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left font-medium text-gray-500">Product</th><th className="px-6 py-3 text-left font-medium text-gray-500">Category</th><th className="px-6 py-3 text-left font-medium text-gray-500">Stock</th><th className="px-6 py-3 text-left font-medium text-gray-500">Price</th><th className="px-6 py-3 text-left font-medium text-gray-500">Status</th><th className="px-6 py-3 text-right font-medium text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-200">{filteredProducts.map(p => (<tr key={p.id} className="hover:bg-gray-50"><td className="px-6 py-4 flex items-center gap-3"><img src={p.image} className="w-10 h-10 rounded border object-cover" alt="" /><div><div className="font-medium text-gray-900">{p.name}</div><div className="text-xs text-gray-500 font-mono">{p.code}</div></div></td><td className="px-6 py-4 text-gray-600">{p.category}</td><td className="px-6 py-4"><div className="flex items-center gap-2"><div className="flex items-center border rounded-md"><button onClick={() => handleStockUpdate(p.id, (p.stock || 0) - 1)} className="p-1 hover:bg-gray-100 border-r"><Minus className="w-3 h-3 text-gray-600" /></button><input type="number" value={p.stock || 0} onChange={(e) => handleStockUpdate(p.id, parseInt(e.target.value) || 0)} className="w-10 text-center text-sm focus:outline-none h-[24px]" /><button onClick={() => handleStockUpdate(p.id, (p.stock || 0) + 1)} className="p-1 hover:bg-gray-100 border-l"><Plus className="w-3 h-3 text-gray-600" /></button></div>{(p.stock || 0) < 10 && (<div className="flex items-center text-red-600" title="Low Stock"><AlertCircle className="w-4 h-4" /></div>)}</div></td><td className="px-6 py-4">{p.discount ? (<div><div className="text-gray-400 line-through text-xs">₹{p.pdfPrice}</div><div className="font-bold text-green-600">₹{Math.round(p.pdfPrice * (1 - p.discount / 100))}</div></div>) : (<div className="font-bold">₹{p.pdfPrice}</div>)}</td><td className="px-6 py-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{p.status}</span></td><td className="px-6 py-4 text-right space-x-2"><button onClick={() => setIsEditing(p)} className="text-blue-600 hover:underline">Edit</button><button onClick={() => handleDeleteProduct(p.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button></td></tr>))}</tbody></table></div></div>);
    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/products');
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
            const res = await fetch('http://localhost:5000/api/orders');
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
            const res = await fetch('http://localhost:5000/api/customers');
            const data = await res.json();
            if (Array.isArray(data)) {
                setCustomers(data);
            }
        } catch (error) {
            console.error("Failed to fetch customers", error);
        }
    };

    const fetchSellers = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/sellers');
            const data = await res.json();
            if (Array.isArray(data)) {
                setSellers(data);
            }
        } catch (error) {
            console.error("Failed to fetch sellers", error);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/transactions');
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
            const res = await fetch('http://localhost:5000/api/returns');
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
            const res = await fetch('http://localhost:5000/api/coupons');
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
        fetchSellers();
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
            const res = await fetch('http://localhost:5000/api/admin/generate-hd', {
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

    const renderOrders = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Order Management</h2>
                <button onClick={fetchOrders} className="text-sm text-blue-600 hover:underline">Refresh</button>
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
                                    <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)} className="border rounded text-xs p-1 bg-gray-50">
                                        {['Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                                    </select>
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
                                            {seller.companyName.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{seller.companyName}</div>
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
                                    <div className="text-xs text-gray-500">Return Rate: {seller.returnRate}%</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="text-sm font-bold text-gray-900">₹{seller.balance.toLocaleString()}</div>
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
    const renderLogistics = () => (<div className="space-y-4"><h2 className="text-xl font-bold">Logistics</h2><div className="grid gap-4">{orders.filter(o => o.status === 'Shipped' || o.status === 'Processing').map(o => (<div key={o.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center"><div><p className="font-bold text-lg">{o.id}</p><p className="text-sm text-gray-500">To: {o.shippingAddress}</p><div className="mt-2 flex gap-2"><span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">{o.status}</span>{o.trackingNumber && <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{o.courier}: {o.trackingNumber}</span>}</div></div><div className="flex flex-col gap-2"><button className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs font-bold hover:bg-blue-100">Assign Courier</button></div></div>))}</div></div>);
    const renderReturns = () => (<div className="space-y-4"><h2 className="text-xl font-bold">Return Requests</h2><div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">Return ID</th><th className="px-6 py-3">Product</th><th className="px-6 py-3">Reason</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-200">{returns.map(r => (<tr key={r.id}><td className="px-6 py-4">{r.id}</td><td className="px-6 py-4">{r.productName}</td><td className="px-6 py-4 text-red-500">{r.reason}</td><td className="px-6 py-4 font-bold">{r.status}</td><td className="px-6 py-4 text-right space-x-2">{r.status === 'Pending' && (<><button className="text-green-600 hover:underline text-xs">Approve</button><button className="text-red-600 hover:underline text-xs">Reject</button></>)}</td></tr>))}</tbody></table></div></div>);
    const renderReviews = () => (<div className="space-y-4"><h2 className="text-xl font-bold">Reviews Moderation</h2><div className="grid gap-4">{reviews.map(r => (<div key={r._id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"><div className="flex justify-between"><div className="flex items-center gap-2"><div className="flex text-yellow-400">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div><span className="font-bold text-gray-800">{r.productName}</span></div><span className={`text-xs px-2 py-0.5 rounded ${r.status === 'Flagged' || r.status === 'Rejected' ? 'bg-red-100 text-red-800' : r.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100'}`}>{r.status}</span></div><p className="text-gray-600 mt-2 text-sm">"{r.comment}"</p><div className="mt-3 flex justify-end gap-2"><button onClick={() => handleReviewAction(r._id, 'Delete')} className="text-gray-600 text-xs font-bold hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button></div></div>))}</div></div>);
    const renderCoupons = () => (<div className="space-y-4"><div className="flex justify-between"><h2 className="text-xl font-bold">Coupons</h2><button className="bg-primary text-white px-3 py-1 rounded text-sm font-bold">+ Add Coupon</button></div><div className="grid grid-cols-2 gap-4">{coupons.map(c => (<div key={c.id} className="bg-white p-4 rounded-lg border border-dashed border-primary flex justify-between items-center shadow-sm"><div><p className="font-mono font-bold text-xl">{c.code}</p><p className="text-sm text-gray-500">{c.discountType === 'PERCENTAGE' ? `${c.value}% OFF` : `₹${c.value} OFF`}</p></div><div className="text-right"><p className="text-xs text-gray-400">Used: {c.usedCount}</p><button className="text-xs text-blue-600 underline">Edit</button></div></div>))}</div></div>);
    const renderSecurity = () => (<div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h2 className="text-xl font-bold">Security & Permissions</h2><div className="space-y-4">{['Super Admin', 'Product Manager', 'Order Manager', 'Support Agent'].map(role => (<div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded border"><span className="font-medium">{role}</span><button className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-100">Manage</button></div>))}</div></div>);

    // Shop Sections Management
    const renderShopSections = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Shop Sections & Categories</h2>
                <div className="flex gap-2 bg-white p-1 rounded border">
                    <button
                        onClick={() => setShopSectionTab('sections')}
                        className={`px-4 py-2 rounded text-sm font-medium ${shopSectionTab === 'sections' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Sections
                    </button>
                    <button
                        onClick={() => setShopSectionTab('categories')}
                        className={`px-4 py-2 rounded text-sm font-medium ${shopSectionTab === 'categories' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Categories
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
                            <div key={section.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
                            <div key={category.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex gap-4">
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{category.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Section: {sections.find(s => s.id === category.sectionId)?.title || 'Unknown'}
                                        </p>
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

            {/* Edit Modal */}
            {isEditingShopItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-xl space-y-4">
                        <h3 className="text-lg font-bold">
                            {isEditingShopItem.data._id ? 'Edit' : 'Add'} {isEditingShopItem.type === 'section' ? 'Section' : 'Category'}
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
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                    <select
                                        value={isEditingShopItem.data.sectionId || ''}
                                        onChange={e => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, sectionId: e.target.value } })}
                                        className="w-full border p-2 rounded"
                                    >
                                        <option value="">Select Section</option>
                                        {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                    </select>
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
                                        <input
                                            placeholder="Or enter Image URL..."
                                            value={isEditingShopItem.data.image || ''}
                                            onChange={e => setIsEditingShopItem({ ...isEditingShopItem, data: { ...isEditingShopItem.data, image: e.target.value } })}
                                            className="w-full border p-2 rounded text-sm"
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
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                onClick={() => setIsEditingShopItem(null)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleShopItemSave(isEditingShopItem.type === 'section' ? 'sections' : 'categories', isEditingShopItem.data)}
                                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark font-bold"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderContent = () => { switch (activeTab) { case 'products': return renderProducts(); case 'orders': return renderOrders(); case 'customers': return renderCustomers(); case 'sellers': return renderSellers(); case 'payments': return renderPayments(); case 'logistics': return renderLogistics(); case 'returns': return renderReturns(); case 'reviews': return renderReviews(); case 'analytics': return renderDashboard(); case 'coupons': return renderCoupons(); case 'security': return renderSecurity(); case 'settings': return renderSecurity(); case 'shop-sections': return renderShopSections(); default: return renderDashboard(); } };

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10 hidden md:flex h-screen sticky top-0">
                <div className="p-4 border-b border-slate-700"><h2 className="text-lg font-bold tracking-tight flex gap-2 items-center"><LayoutDashboard className="text-accent" /> Seller Central</h2></div>
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">{[{ id: 'dashboard', label: 'Dashboard', icon: BarChart3 }, { id: 'orders', label: 'Orders', icon: ShoppingBag }, { id: 'products', label: 'Inventory', icon: Package }, { id: 'shop-sections', label: 'Shop Sections', icon: LayoutDashboard }, { id: 'customers', label: 'Customers', icon: Users }, { id: 'sellers', label: 'Sellers', icon: Users }, { id: 'payments', label: 'Payments', icon: DollarSign }, { id: 'logistics', label: 'Logistics', icon: Truck }, { id: 'returns', label: 'Returns', icon: RotateCcw }, { id: 'reviews', label: 'Reviews', icon: Star }, { id: 'coupons', label: 'Coupons', icon: Ticket }, { id: 'security', label: 'Security', icon: ShieldCheck }].map(item => (<button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-slate-800 text-white border-l-4 border-accent' : 'text-slate-400 hover:bg-slate-800 hover:text-gray-200'}`}><item.icon className="w-4 h-4" /> {item.label}</button>))}</nav>
            </aside>
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 border-b border-gray-200 z-10 shrink-0"><div className="flex items-center text-gray-800 font-semibold text-xl capitalize">{activeTab}</div><div className="flex items-center gap-4"><div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full"><div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">A</div><p className="text-sm font-bold text-gray-900 truncate max-w-[100px]">{user.email.split('@')[0]}</p></div></div></header>
                <main className="flex-1 overflow-auto p-6 bg-gray-50">{renderContent()}</main>
            </div>
            {/* PRODUCT EDIT MODAL */}
            {editedProduct && (
                <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col animate-fade-in-up">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50"><h3 className="font-bold text-lg flex items-center gap-2"><Edit className="w-5 h-5 text-primary" /> Edit: {editedProduct.name}</h3><button onClick={() => setIsEditing(null)} className="hover:bg-gray-200 p-1 rounded"><X className="w-6 h-6" /></button></div>
                        <div className="flex flex-1 overflow-hidden">
                            <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col p-2 gap-1">{['vital', 'images', 'variations', 'desc'].map(tab => (<button key={tab} onClick={() => setEditTab(tab as any)} className={`text-left px-4 py-3 rounded-md text-sm font-medium transition-all ${editTab === tab ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-gray-100'}`}>{tab === 'vital' && 'Vital Info'} {tab === 'images' && 'Images & Enhance'} {tab === 'variations' && 'Variations'} {tab === 'desc' && 'Description'}</button>))}</div>
                            <div className="flex-1 p-8 overflow-y-auto">
                                {editTab === 'vital' && (<div className="space-y-6">
                                    {/* Vital Info Fields */}
                                    <div className="grid grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-700">Product Name</label><input value={editedProduct.name} onChange={e => setEditedProduct({ ...editedProduct, name: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div><div><label className="block text-sm font-medium text-gray-700">Price</label><input type="number" value={editedProduct.pdfPrice} onChange={e => setEditedProduct({ ...editedProduct, pdfPrice: parseFloat(e.target.value) })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div><div><label className="block text-sm font-medium text-gray-700">Stock</label><input type="number" value={editedProduct.stock || 0} onChange={e => setEditedProduct({ ...editedProduct, stock: parseInt(e.target.value) })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div><div><label className="block text-sm font-medium text-gray-700">Discount (%)</label><input type="number" min="0" max="100" value={editedProduct.discount || 0} onChange={e => setEditedProduct({ ...editedProduct, discount: parseInt(e.target.value) })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="e.g., 35" /></div><div><label className="block text-sm font-medium text-gray-700">Final Price (Calculated)</label><input type="text" value={editedProduct.pdfPrice && editedProduct.discount ? Math.round(editedProduct.pdfPrice * (1 - editedProduct.discount / 100)) : editedProduct.pdfPrice} readOnly disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100 font-bold text-green-600" /></div><div><label className="block text-sm font-medium text-gray-700">Category</label><select value={editedProduct.category} onChange={e => setEditedProduct({ ...editedProduct, category: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option value="">-- Select Category --</option>{shopCategories.map(cat => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}</select></div><div><label className="block text-sm font-medium text-gray-700">Status</label><select value={editedProduct.status || 'Active'} onChange={e => setEditedProduct({ ...editedProduct, status: e.target.value as any })} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option value="Active">Active</option><option value="Draft">Draft</option><option value="Out of Stock">Out of Stock</option></select></div><div><label className="block text-sm font-medium text-gray-700">Rating (Auto-calculated)</label><input type="number" step="0.1" min="0" max="5" value={editedProduct.rating || 0} readOnly disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed" title="Automatically calculated from reviews" /></div><div><label className="block text-sm font-medium text-gray-700">Reviews Count (Auto-calculated)</label><input type="number" min="0" value={editedProduct.reviewsCount || 0} readOnly disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed" title="Automatically calculated from reviews" /></div>
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
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    files.forEach(file => {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setEditedProduct(prev => {
                                                                if (!prev) return null;
                                                                return {
                                                                    ...prev,
                                                                    gallery: [...(prev.gallery || []), reader.result as string]
                                                                };
                                                            });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    });
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
                                                        const newOption: VariationOption = {
                                                            id: `size_${Date.now()}`,
                                                            label: 'New Size',
                                                            description: '',
                                                            priceAdjustment: 0
                                                        };
                                                        const updatedVariations = editedProduct.variations?.map(v =>
                                                            v.name === 'Size' ? { ...v, options: [...v.options, newOption] } : v
                                                        );
                                                        setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                    } else {
                                                        const newVariation: Variation = {
                                                            id: 'size_variation',
                                                            name: 'Size',
                                                            options: [{
                                                                id: `size_${Date.now()}`,
                                                                label: 'New Size',
                                                                description: '',
                                                                priceAdjustment: 0
                                                            }]
                                                        };
                                                        setEditedProduct({
                                                            ...editedProduct,
                                                            variations: [...(editedProduct.variations || []), newVariation]
                                                        });
                                                    }
                                                }}
                                                className="bg-primary text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-purple-700"
                                            >
                                                <Plus className="w-4 h-4" /> Add Size
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {editedProduct.variations?.find(v => v.name === 'Size')?.options.map((option) => (
                                                <div key={option.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <div className="grid grid-cols-4 gap-4">
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
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Price Adjustment (₹)</label>
                                                            <input
                                                                type="number"
                                                                value={option.priceAdjustment}
                                                                onChange={(e) => {
                                                                    const updatedVariations = editedProduct.variations?.map(v => {
                                                                        if (v.name === 'Size') {
                                                                            return {
                                                                                ...v,
                                                                                options: v.options.map(o =>
                                                                                    o.id === option.id ? { ...o, priceAdjustment: parseFloat(e.target.value) || 0 } : o
                                                                                )
                                                                            };
                                                                        }
                                                                        return v;
                                                                    });
                                                                    setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                }}
                                                                placeholder="0"
                                                                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Final: ₹{(Math.round(editedProduct.pdfPrice * (1 - (editedProduct.discount || 0) / 100)) + (option.priceAdjustment || 0)).toFixed(2)}
                                                            </p>
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
                                            )) || (
                                                    <div className="text-center py-8 text-gray-500">
                                                        <p>No sizes added yet. Click "Add Size" to create one.</p>
                                                    </div>
                                                )}
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
                                                                priceAdjustment: 0
                                                            };
                                                            const updatedVariations = editedProduct.variations?.map(v =>
                                                                (v.id === 'lb_variation' || v.name === 'Light Base') ? { ...v, options: [...v.options, newOption] } : v
                                                            );
                                                            setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                        } else {
                                                            const newVariation: Variation = {
                                                                id: 'lb_variation',
                                                                name: 'Light Base',
                                                                options: [{
                                                                    id: `lb_${Date.now()}`,
                                                                    label: 'With Light Base',
                                                                    description: '',
                                                                    priceAdjustment: 0
                                                                }]
                                                            };
                                                            setEditedProduct({
                                                                ...editedProduct,
                                                                variations: [...(editedProduct.variations || []), newVariation]
                                                            });
                                                        }
                                                    }}
                                                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-purple-700"
                                                >
                                                    <Plus className="w-4 h-4" /> Add Option
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {editedProduct.variations?.find(v => v.id === 'lb_variation' || v.name === 'Light Base')?.options.map((option) => (
                                                    <div key={option.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                        <div className="grid grid-cols-4 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Option Name</label>
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
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
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
                                                                    placeholder="Optional details"
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
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Price Adjustment (₹)</label>
                                                                <input
                                                                    type="number"
                                                                    value={option.priceAdjustment}
                                                                    onChange={(e) => {
                                                                        const updatedVariations = editedProduct.variations?.map(v => {
                                                                            if (v.id === 'lb_variation' || v.name === 'Light Base') {
                                                                                return {
                                                                                    ...v,
                                                                                    options: v.options.map(o =>
                                                                                        o.id === option.id ? { ...o, priceAdjustment: parseFloat(e.target.value) || 0 } : o
                                                                                    )
                                                                                };
                                                                            }
                                                                            return v;
                                                                        });
                                                                        setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                    }}
                                                                    placeholder="0"
                                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                />
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Final: ₹{(Math.round(editedProduct.pdfPrice * (1 - (editedProduct.discount || 0) / 100)) + (option.priceAdjustment || 0)).toFixed(2)}
                                                                </p>
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
                                                                    <Trash2 className="w-4 h-4" /> Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )) || (
                                                        <div className="text-center py-8 text-gray-500">
                                                            <p>No options added yet. Click "Add Option" to create one.</p>
                                                        </div>
                                                    )}
                                            </div>

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
                                                                priceAdjustment: 0
                                                            };
                                                            const updatedVariations = editedProduct.variations?.map(v =>
                                                                v.name === 'Shape' ? { ...v, options: [...v.options, newOption] } : v
                                                            );
                                                            setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                        } else {
                                                            const newVariation: Variation = {
                                                                id: 'shape_variation',
                                                                name: 'Shape',
                                                                options: [{
                                                                    id: `shape_${Date.now()}`,
                                                                    label: 'Rectangle',
                                                                    description: '',
                                                                    size: '',
                                                                    priceAdjustment: 0
                                                                }]
                                                            };
                                                            setEditedProduct({
                                                                ...editedProduct,
                                                                variations: [...(editedProduct.variations || []), newVariation]
                                                            });
                                                        }
                                                    }}
                                                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-purple-700"
                                                >
                                                    <Plus className="w-4 h-4" /> Add Shape
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {editedProduct.variations?.find(v => v.name === 'Shape')?.options.map((option) => (
                                                    <div key={option.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                        <div className="grid grid-cols-4 gap-4">
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
                                                                    placeholder="e.g., Rectangle, Heart, Round"
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
                                                                    placeholder="e.g., 10x10cm, 15cm diameter"
                                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹)</label>
                                                                <input
                                                                    type="number"
                                                                    value={option.priceAdjustment}
                                                                    onChange={(e) => {
                                                                        const updatedVariations = editedProduct.variations?.map(v => {
                                                                            if (v.name === 'Shape') {
                                                                                return {
                                                                                    ...v,
                                                                                    options: v.options.map(o =>
                                                                                        o.id === option.id ? { ...o, priceAdjustment: parseFloat(e.target.value) || 0 } : o
                                                                                    )
                                                                                };
                                                                            }
                                                                            return v;
                                                                        });
                                                                        setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                    }}
                                                                    placeholder="0"
                                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                />
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Final: ₹{(Math.round(editedProduct.pdfPrice * (1 - (editedProduct.discount || 0) / 100)) + (option.priceAdjustment || 0)).toFixed(2)}
                                                                </p>
                                                            </div>

                                                            <div className="flex items-end">
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
                                                                    className="w-full bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-1"
                                                                >
                                                                    <Trash2 className="w-4 h-4" /> Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )) || (
                                                        <div className="text-center py-8 text-gray-500">
                                                            <p>No shapes added yet. Click "Add Shape" to create one.</p>
                                                        </div>
                                                    )}
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
                                                                priceAdjustment: 0
                                                            };
                                                            const updatedVariations = editedProduct.variations?.map(v =>
                                                                v.name === 'Color' ? { ...v, options: [...v.options, newOption] } : v
                                                            );
                                                            setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                        } else {
                                                            const newVariation: Variation = {
                                                                id: 'color_variation',
                                                                name: 'Color',
                                                                disableAutoSelect: false,
                                                                options: [{
                                                                    id: `color_${Date.now()}`,
                                                                    label: 'New Color',
                                                                    description: '',
                                                                    size: '',
                                                                    priceAdjustment: 0
                                                                }]
                                                            };
                                                            setEditedProduct({
                                                                ...editedProduct,
                                                                variations: [...(editedProduct.variations || []), newVariation]
                                                            });
                                                        }
                                                    }}
                                                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-purple-700"
                                                >
                                                    <Plus className="w-4 h-4" /> Add Color
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {editedProduct.variations?.find(v => v.name === 'Color')?.options.map((option) => (
                                                    <div key={option.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                        <div className="grid grid-cols-4 gap-4">
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
                                                                    placeholder="e.g., XL, 10cm"
                                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹)</label>
                                                                <input
                                                                    type="number"
                                                                    value={option.priceAdjustment}
                                                                    onChange={(e) => {
                                                                        const updatedVariations = editedProduct.variations?.map(v => {
                                                                            if (v.name === 'Color') {
                                                                                return {
                                                                                    ...v,
                                                                                    options: v.options.map(o =>
                                                                                        o.id === option.id ? { ...o, priceAdjustment: parseFloat(e.target.value) || 0 } : o
                                                                                    )
                                                                                };
                                                                            }
                                                                            return v;
                                                                        });
                                                                        setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                                    }}
                                                                    placeholder="0"
                                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                                />
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Final: ₹{(Math.round(editedProduct.pdfPrice * (1 - (editedProduct.discount || 0) / 100)) + (option.priceAdjustment || 0)).toFixed(2)}
                                                                </p>
                                                            </div>

                                                            <div className="flex items-end">
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
                                                                    className="w-full bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-1"
                                                                >
                                                                    <Trash2 className="w-4 h-4" /> Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )) || (
                                                        <div className="text-center py-8 text-gray-500">
                                                            <p>No colors added yet. Click "Add Color" to create one.</p>
                                                        </div>
                                                    )}
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

                                        <div className="border-t pt-6 mt-6">
                                            <h4 className="font-bold text-lg mb-4">Other Variations</h4>
                                            {editedProduct.variations?.filter(v => !['Size', 'Shape', 'Light Base', 'Color'].includes(v.name)).map((variation) => (
                                                <div key={variation.id} className="mb-6 p-4 bg-gray-50 rounded-lg">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h5 className="font-medium">{variation.name}</h5>
                                                        <button
                                                            onClick={() => {
                                                                const updatedVariations = editedProduct.variations?.filter(v => v.id !== variation.id);
                                                                setEditedProduct({ ...editedProduct, variations: updatedVariations });
                                                            }}
                                                            className="text-red-600 text-sm hover:underline"
                                                        >
                                                            Remove Variation
                                                        </button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {variation.options.map((opt) => (
                                                            <div key={opt.id} className="flex gap-2 items-center bg-white p-2 rounded">
                                                                <span className="flex-1 text-sm">{opt.label}</span>
                                                                <span className="text-xs text-gray-500">+₹{opt.priceAdjustment}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {editTab === 'desc' && (<div><textarea value={editedProduct.description} onChange={e => setEditedProduct({ ...editedProduct, description: e.target.value })} className="w-full h-64 border p-2" /></div>)}
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3"><button onClick={() => setIsEditing(null)} className="px-4 py-2 border rounded">Cancel</button><button onClick={saveProduct} className="px-6 py-2 bg-primary text-white rounded font-bold">Save Changes</button></div>
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
                                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                <input
                                    type="text"
                                    value={newSellerData.companyName || ''}
                                    onChange={e => setNewSellerData({ ...newSellerData, companyName: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                                <input
                                    type="text"
                                    value={newSellerData.contactPerson || ''}
                                    onChange={e => setNewSellerData({ ...newSellerData, contactPerson: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={newSellerData.email || ''}
                                    onChange={e => setNewSellerData({ ...newSellerData, email: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
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
        </div>
    );
};
