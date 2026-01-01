import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate, useNavigationType } from 'react-router-dom';
import { Star, Heart, Filter, X } from 'lucide-react';
import { useCart } from '../context';
import { Product } from '../types';
import { calculatePrice } from '../data/products';

export const Shop: React.FC = () => {
    const { currency, wishlist, toggleWishlist } = useCart();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const navType = useNavigationType();
    const categoryFilter = searchParams.get('category');
    const subCategoryFilter = searchParams.get('subCategory');
    const searchQuery = searchParams.get('q');
    const filterType = searchParams.get('filter');


    const [products, setProducts] = useState<Product[]>([]);
    const [shopCategories, setShopCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter & Sort State
    const [sortBy, setSortBy] = useState('featured');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);

    // Handle legacy category links that are now sub-categories
    useEffect(() => {
        if (categoryFilter && !subCategoryFilter && shopCategories.length > 0 && subCategories.length > 0) {
            const isCategory = shopCategories.find(c => c.name.toLowerCase() === categoryFilter.toLowerCase());
            if (!isCategory) {
                const asSubCategory = subCategories.find(s => s.name.toLowerCase() === categoryFilter.toLowerCase());
                if (asSubCategory) {
                    const parent = shopCategories.find(c => c.id === asSubCategory.categoryId);
                    if (parent) {
                        navigate(`/shop?category=${encodeURIComponent(parent.name)}&subCategory=${encodeURIComponent(asSubCategory.name)}`, { replace: true });
                    }
                }
            }
        }
    }, [categoryFilter, subCategoryFilter, shopCategories, subCategories, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes, subCategoriesRes] = await Promise.all([
                    fetch('http://localhost:5000/api/products'),
                    fetch('http://localhost:5000/api/shop-categories'),
                    fetch('http://localhost:5000/api/sub-categories')
                ]);
                setProducts(await productsRes.json());
                setShopCategories(await categoriesRes.json());
                setSubCategories(await subCategoriesRes.json());
            } catch (error) {
                console.error('Failed to fetch shop data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleProductClick = (id: string) => {
        sessionStorage.setItem('shopScrollPosition', window.scrollY.toString());
        navigate(`/product/${id}`);
    };

    // Scroll Position Retention
    useEffect(() => {
        if (navType === 'PUSH') {
            sessionStorage.removeItem('shopScrollPosition');
        }

        if (!loading && navType === 'POP') {
            const savedPosition = sessionStorage.getItem('shopScrollPosition');
            if (savedPosition) {
                const position = parseInt(savedPosition, 10);
                const performScroll = () => {
                    window.scrollTo({
                        top: position,
                        behavior: 'instant'
                    });
                };
                performScroll();
                setTimeout(performScroll, 50);
                setTimeout(performScroll, 150);
                setTimeout(performScroll, 300);
            }
        }
    }, [loading, navType]);



    const formatPrice = (price: number) => {
        return currency === 'INR'
            ? `₹${price.toLocaleString('en-IN')}`
            : `$${(price * 0.012).toFixed(2)}`;
    };

    const isInWishlist = (id: string) => wishlist.some(p => p.id === id);

    const handleWishlistToggle = (e: React.MouseEvent, product: any) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
    };

    // Current category and subcategories
    const currentCategory = useMemo(() => {
        if (!categoryFilter) return null;
        return shopCategories.find(c => c.name.toLowerCase() === categoryFilter.toLowerCase());
    }, [categoryFilter, shopCategories]);

    const activeSubCategories = useMemo(() => {
        if (!currentCategory) return [];
        return subCategories.filter(s => s.categoryId === currentCategory.id);
    }, [currentCategory, subCategories]);

    const currentSubCategory = useMemo(() => {
        if (!subCategoryFilter || !currentCategory) return null;
        return subCategories.find(s =>
            s.name.toLowerCase() === subCategoryFilter.toLowerCase() &&
            s.categoryId === currentCategory.id
        );
    }, [subCategoryFilter, subCategories, currentCategory]);

    // Filter & Sort Logic
    const processedProducts = useMemo(() => {
        let result = [...products];

        if (filterType === 'recent') {
            try {
                const stored = localStorage.getItem('recentlyViewed');
                if (stored) {
                    const ids: string[] = JSON.parse(stored);
                    result = result.filter(p => ids.includes(p.id) || ids.includes((p as any)._id));
                    result.sort((a, b) => {
                        const idA = a.id || (a as any)._id;
                        const idB = b.id || (b as any)._id;
                        return ids.indexOf(idA) - ids.indexOf(idB);
                    });
                } else {
                    result = [];
                }
            } catch (e) {
                console.error(e);
                result = [];
            }
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const terms = query.split(/ & | and /);
            result = result.filter(p =>
                terms.some(term => {
                    const trimmedTerm = term.trim();
                    if (!trimmedTerm) return false;
                    return p.name.toLowerCase().includes(trimmedTerm) ||
                        (p.category && p.category.toLowerCase().includes(trimmedTerm)) ||
                        (p.description && p.description.toLowerCase().includes(trimmedTerm));
                })
            );
        }

        if (categoryFilter) {
            result = result.filter(p => p.category && p.category.toLowerCase() === categoryFilter.toLowerCase());
        }

        if (subCategoryFilter && currentSubCategory) {
            result = result.filter(p => p.subCategoryId === currentSubCategory.id);
        }

        if (minPrice || maxPrice) {
            const min = minPrice ? Number(minPrice) : 0;
            const max = maxPrice ? Number(maxPrice) : Infinity;
            result = result.filter(p => {
                const price = calculatePrice(p).final;
                return price >= min && price <= max;
            });
        }

        if (filterType !== 'recent' || sortBy !== 'featured') {
            result.sort((a, b) => {
                const priceA = calculatePrice(a).final;
                const priceB = calculatePrice(b).final;
                switch (sortBy) {
                    case 'price-asc': return priceA - priceB;
                    case 'price-desc': return priceB - priceA;
                    case 'rating': return (b.rating || 0) - (a.rating || 0);
                    case 'newest':
                        const idA = Number(a.id);
                        const idB = Number(b.id);
                        if (!isNaN(idA) && !isNaN(idB)) return idB - idA;
                        return String(b.id).localeCompare(String(a.id));
                    default: return 0;
                }
            });
        }
        return result;
    }, [products, categoryFilter, subCategoryFilter, currentSubCategory, minPrice, maxPrice, sortBy, filterType, searchQuery]);

    const SkeletonCard = () => (
        <div className="bg-white rounded overflow-hidden border border-gray-100 animate-pulse">
            <div className="aspect-[3/4] bg-gray-200" />
            <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-app-bg py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-4 bg-gray-200 rounded w-48 mb-6" />
                    <div className="lg:flex gap-6">
                        <aside className="hidden lg:block lg:w-72 h-[600px] bg-white rounded-lg animate-pulse" />
                        <div className="flex-1 space-y-6">
                            <div className="h-32 bg-white rounded-lg animate-pulse" />
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-app-bg py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 px-2 sm:px-0">
                    <Link to="/" className="hover:text-primary transition-colors font-medium">Home</Link>
                    <span className="text-gray-400">/</span>
                    <Link to="/shop" className="hover:text-primary transition-colors font-medium">Shop</Link>
                    {categoryFilter && (
                        <>
                            <span className="text-gray-400">/</span>
                            <span className={`${subCategoryFilter ? 'hover:text-primary transition-colors cursor-pointer' : 'text-gray-900 font-bold'}`}
                                onClick={() => subCategoryFilter && navigate(`/shop?category=${encodeURIComponent(categoryFilter)}`)}>
                                {categoryFilter}
                            </span>
                        </>
                    )}
                    {subCategoryFilter && (
                        <>
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-900 font-bold">{subCategoryFilter}</span>
                        </>
                    )}
                </div>

                <div className="lg:flex gap-6 items-start">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="lg:w-72 flex-shrink-0 bg-white border border-gray-100 rounded-lg shadow-sm sticky top-24 overflow-hidden hidden lg:block">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                            <h2 className="font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2 text-sm">
                                <Filter className="w-4 h-4 text-primary" /> Filters
                            </h2>
                        </div>

                        {/* Active Filters Summary */}
                        {(categoryFilter || subCategoryFilter || searchQuery || minPrice || maxPrice) && (
                            <div className="p-4 border-b border-gray-50">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected</span>
                                    <button
                                        onClick={() => { setMinPrice(''); setMaxPrice(''); setSortBy('featured'); navigate('/shop'); }}
                                        className="text-[10px] text-primary font-bold hover:underline"
                                    >
                                        CLEAR ALL
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {categoryFilter && (
                                        <span className="px-2 py-1 bg-purple-50 text-primary text-[10px] font-bold rounded flex items-center gap-1 border border-purple-100">
                                            {categoryFilter}
                                            <button onClick={() => {
                                                const newParams = new URLSearchParams(searchParams);
                                                newParams.delete('category');
                                                newParams.delete('subCategory');
                                                navigate({ search: newParams.toString() });
                                            }} className="hover:text-red-500 font-bold">×</button>
                                        </span>
                                    )}
                                    {subCategoryFilter && (
                                        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded flex items-center gap-1 border border-blue-100">
                                            {subCategoryFilter}
                                            <button onClick={() => {
                                                const newParams = new URLSearchParams(searchParams);
                                                newParams.delete('subCategory');
                                                navigate({ search: newParams.toString() });
                                            }} className="hover:text-red-500 font-bold">×</button>
                                        </span>
                                    )}
                                    {(minPrice || maxPrice) && (
                                        <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded flex items-center gap-1 border border-green-100">
                                            ₹{minPrice || '0'}-₹{maxPrice || '∞'}
                                            <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="hover:text-red-500 font-bold">×</button>
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Categories List */}
                        <div className="p-4 border-b border-gray-50 overflow-y-auto max-h-[400px]">
                            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Categories</h3>
                            <div className="space-y-1">
                                {shopCategories.map((cat) => (
                                    <div key={cat.id} className="group">
                                        <button
                                            onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
                                            className={`text-sm w-full text-left p-2 rounded-md transition-all flex items-center justify-between group-hover:bg-gray-50 ${categoryFilter?.toLowerCase() === cat.name.toLowerCase() ? 'bg-primary/5 text-primary font-bold' : 'text-gray-600'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full transition-all ${categoryFilter?.toLowerCase() === cat.name.toLowerCase() ? 'bg-primary scale-125' : 'bg-gray-300 group-hover:bg-gray-400'}`}></div>
                                                {cat.name}
                                            </div>
                                            {categoryFilter?.toLowerCase() === cat.name.toLowerCase() && <div className="w-1.5 h-1.5 border-t-2 border-r-2 border-primary rotate-45" />}
                                        </button>
                                        {categoryFilter?.toLowerCase() === cat.name.toLowerCase() && activeSubCategories.length > 0 && (
                                            <div className="pl-4 pr-2 py-1 space-y-0.5 mt-1">
                                                {activeSubCategories.map(sub => (
                                                    <button
                                                        key={sub.id}
                                                        onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}&subCategory=${encodeURIComponent(sub.name)}`)}
                                                        className={`text-xs w-full text-left p-2 rounded transition-all flex items-center gap-2 ${subCategoryFilter?.toLowerCase() === sub.name.toLowerCase() ? 'text-primary font-bold bg-white shadow-sm' : 'text-gray-500 hover:text-primary hover:bg-gray-50'}`}
                                                    >
                                                        {sub.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Vertical */}
                        <div className="p-4">
                            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Price Range</h3>
                            <div className="space-y-4">
                                <div className="flex gap-2 items-center">
                                    <div className="relative flex-1">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">₹</span>
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="w-full pl-5 pr-2 py-2 text-xs border border-gray-100 rounded-md focus:ring-1 focus:ring-primary outline-none bg-gray-50 font-bold"
                                        />
                                    </div>
                                    <span className="text-gray-400 text-[10px] font-bold">TO</span>
                                    <div className="relative flex-1">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">₹</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-full pl-5 pr-2 py-2 text-xs border border-gray-100 rounded-md focus:ring-1 focus:ring-primary outline-none bg-gray-50 font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { l: 'Under 500', min: '0', max: '500' },
                                        { l: '500-1000', min: '500', max: '1000' },
                                        { l: '1000-2000', min: '1000', max: '2000' },
                                        { l: 'Over 2000', min: '2000', max: '' },
                                    ].map((range, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setMinPrice(range.min); setMaxPrice(range.max); }}
                                            className="text-[10px] font-bold py-1.5 px-2 bg-gray-50 border border-gray-100 rounded-md text-gray-600 hover:bg-white hover:border-primary hover:text-primary transition-all text-center"
                                        >
                                            {range.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {/* Title & Stats */}
                        <div className="bg-white p-4 lg:p-6 border border-gray-100 rounded-lg shadow-sm mb-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                        {searchQuery ? `Results for "${searchQuery}"` :
                                            (subCategoryFilter ? subCategoryFilter :
                                                (categoryFilter ? categoryFilter :
                                                    (filterType === 'recent' ? 'Recently Viewed' : 'Shop All Gifts')))}
                                        {processedProducts.length > 0 && (
                                            <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/10">
                                                {processedProducts.length} items
                                            </span>
                                        )}
                                    </h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-1 w-8 bg-primary rounded-full" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            {categoryFilter || 'Trending Collection'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Mobile Filter Trigger */}
                                    <button
                                        onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold shadow-lg shadow-gray-900/20 active:scale-95 transition-transform"
                                    >
                                        <Filter className="w-4 h-4" /> Filters
                                    </button>

                                    {/* Sort Bar */}
                                    <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 ring-1 ring-black/5">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">Sort By:</span>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="bg-transparent text-xs font-black text-gray-700 outline-none cursor-pointer"
                                        >
                                            <option value="featured">Featured Picks</option>
                                            <option value="price-asc">Price: Low to High</option>
                                            <option value="price-desc">Price: High to Low</option>
                                            <option value="rating">Customer Rating</option>
                                            <option value="newest">Fresh Arrivals</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Subcategory Pills - Dynamic Switcher */}
                            {categoryFilter && activeSubCategories.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-50">
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Explore {categoryFilter}</span>
                                        {subCategoryFilter && (
                                            <button
                                                onClick={() => navigate(`/shop?category=${encodeURIComponent(categoryFilter)}`)}
                                                className="text-[10px] font-bold text-primary hover:underline"
                                            >
                                                View All
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
                                        {activeSubCategories.map(sub => (
                                            <button
                                                key={sub.id}
                                                onClick={() => navigate(`/shop?category=${encodeURIComponent(categoryFilter)}&subCategory=${encodeURIComponent(sub.name)}`)}
                                                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-black transition-all border ${subCategoryFilter === sub.name ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-white text-gray-600 border-gray-100 hover:border-primary/30 hover:bg-gray-50'}`}
                                            >
                                                {sub.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Products Grid */}
                        <div className="animate-fade-in-up">
                            {processedProducts.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200 shadow-sm overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-white shadow-inner">
                                        <Filter className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900">Oops! No matches found</h3>
                                    <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto font-medium">
                                        We couldn't find any products matching your current filters. Try adjusting your price or clearing filters.
                                    </p>
                                    <div className="flex items-center justify-center gap-4 mt-8">
                                        <button
                                            onClick={() => { setMinPrice(''); setMaxPrice(''); setSortBy('featured'); navigate('/shop'); }}
                                            className="px-8 py-3 bg-gray-900 text-white rounded-full hover:shadow-xl transition-all font-black text-xs uppercase tracking-widest"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {processedProducts.map((product) => {
                                        const prices = calculatePrice(product);
                                        const productId = product.id || (product as any)._id;
                                        return (
                                            <div key={productId} className="relative group bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-lg overflow-hidden flex flex-col h-full transform-gpu hover:-translate-y-1">
                                                <Link
                                                    to={`/product/${productId}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleProductClick(productId);
                                                    }}
                                                    className="flex flex-col h-full"
                                                >
                                                    <div className="relative aspect-[3/4] bg-white overflow-hidden p-3 bg-gradient-to-b from-gray-50/50 to-white">
                                                        <img
                                                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                                                            src={product.image}
                                                            alt={product.name}
                                                            loading="lazy"
                                                        />

                                                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                                                            {product.discount && (
                                                                <div className="bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded shadow-lg shadow-red-600/20 uppercase tracking-tighter">
                                                                    {product.discount}% OFF
                                                                </div>
                                                            )}
                                                            {product.isBestseller && (
                                                                <div className="bg-yellow-500 text-white text-[9px] font-black px-2 py-1 rounded shadow-lg shadow-yellow-500/20 uppercase tracking-tighter border border-yellow-400/30">
                                                                    BESTSELLER
                                                                </div>
                                                            )}
                                                            {product.isTrending && (
                                                                <div className="bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded shadow-lg shadow-blue-600/20 uppercase tracking-tighter border border-blue-400/30">
                                                                    TRENDING
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
                                                            <div className="bg-white/90 backdrop-blur-md py-2 px-4 rounded-lg shadow-xl text-center">
                                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                                                    Customize Now
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 bg-white flex-1 border-t border-gray-50 flex flex-col justify-between">
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-400 h-3 uppercase tracking-tighter mb-1">
                                                                {product.category}
                                                            </p>
                                                            <h3 className="text-xs font-bold text-gray-900 line-clamp-2 h-9 mb-2 transition-colors group-hover:text-primary leading-tight">
                                                                {product.name}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <div className="bg-green-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm shadow-green-600/10">
                                                                    {product.rating || 4.5} <Star className="w-2.5 h-2.5 fill-current" />
                                                                </div>
                                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                                    ({product.reviewsCount || 12} reviews)
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-end justify-between mt-auto">
                                                            <div className="flex flex-col">
                                                                <span className="text-base font-black text-gray-900 leading-none">
                                                                    {formatPrice(prices.final)}
                                                                </span>
                                                                {product.discount && (
                                                                    <span className="text-[10px] text-gray-400 line-through font-bold mt-1">
                                                                        {formatPrice(prices.original)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                                                                <Star className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <button
                                                    onClick={(e) => handleWishlistToggle(e, product)}
                                                    className={`absolute top-3 right-3 p-2 rounded-full shadow-lg z-20 transition-all duration-300 ${isInWishlist(productId) ? 'bg-red-50 text-red-500 scale-110 shadow-red-500/10' : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white'}`}
                                                >
                                                    <Heart className={`w-3.5 h-3.5 transition-transform duration-300 ${isInWishlist(productId) ? 'fill-current' : 'group-hover/heart:scale-125'}`} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Filter Overlay */}
            {isFilterExpanded && (
                <div className="fixed inset-0 z-[100] lg:hidden flex">
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsFilterExpanded(false)}></div>
                    <div className="relative w-full max-w-[320px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-900 text-white">
                            <h2 className="font-black uppercase tracking-widest text-sm">Refine Results</h2>
                            <button onClick={() => setIsFilterExpanded(false)} className="p-2 bg-white/10 rounded-full active:scale-90 transition-transform"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-10">
                            <div>
                                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-5">Categories</h3>
                                <div className="space-y-4">
                                    {shopCategories.map(cat => (
                                        <div key={cat.id} className="space-y-3">
                                            <button
                                                onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
                                                className={`flex items-center justify-between w-full text-left rounded-lg p-3 transition-all ${categoryFilter === cat.name ? 'bg-primary text-white font-black shadow-lg shadow-primary/20' : 'bg-gray-50 text-gray-600 font-bold'}`}
                                            >
                                                <span className="text-sm">{cat.name}</span>
                                                {categoryFilter === cat.name && <X className="w-4 h-4 opacity-50" />}
                                            </button>
                                            {categoryFilter === cat.name && (
                                                <div className="pl-4 space-y-2 border-l-2 border-primary/20">
                                                    {activeSubCategories.map(sub => (
                                                        <button
                                                            key={sub.id}
                                                            onClick={() => { navigate(`/shop?category=${encodeURIComponent(cat.name)}&subCategory=${encodeURIComponent(sub.name)}`); setIsFilterExpanded(false); }}
                                                            className={`block w-full text-left px-4 py-2.5 rounded-lg text-xs font-black transition-all ${subCategoryFilter === sub.name ? 'text-primary bg-primary/5' : 'text-gray-500 hover:bg-gray-50'}`}
                                                        >
                                                            {sub.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-5">Price Budget</h3>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                        <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full pl-7 p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                        <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full pl-7 p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {['Under 500', '500-1000', '1000-2000', '2000+'].map((label, i) => {
                                        const [min, max] = label.includes('-') ? label.split('-') : (label.includes('Under') ? ['0', label.split(' ')[1]] : ['2000', '']);
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => { setMinPrice(min); setMaxPrice(max); }}
                                                className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black text-gray-600 active:bg-primary active:text-white transition-all"
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t border-gray-100 bg-white">
                            <button
                                onClick={() => setIsFilterExpanded(false)}
                                className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-transform uppercase tracking-widest text-xs"
                            >
                                SHOW {processedProducts.length} GIFTS
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
