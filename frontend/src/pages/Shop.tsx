import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Star, Heart, Filter, Zap, ArrowUpDown, ChevronDown, X } from 'lucide-react';
import { useCart } from '../context';
import { Product } from '../types';
import { calculatePrice } from '../data/products';

export const Shop: React.FC = () => {
    const { currency, wishlist, toggleWishlist } = useCart();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
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

        // 0. Recently Viewed Filter
        if (filterType === 'recent') {
            try {
                const stored = localStorage.getItem('recentlyViewed');
                if (stored) {
                    const ids: string[] = JSON.parse(stored);
                    result = result.filter(p => ids.includes(p.id) || ids.includes((p as any)._id));

                    // Sort to match the order in localStorage (most recent first)
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

        // 1. Search Filter (Higher priority)
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

        // 2. Category Filter
        if (categoryFilter) {
            result = result.filter(p => p.category && p.category.toLowerCase() === categoryFilter.toLowerCase());
        }

        // 3. Sub-category Filter
        if (subCategoryFilter && currentSubCategory) {
            result = result.filter(p => p.subCategoryId === currentSubCategory.id);
        }

        // 2. Price Filter
        if (minPrice || maxPrice) {
            const min = minPrice ? Number(minPrice) : 0;
            const max = maxPrice ? Number(maxPrice) : Infinity;
            result = result.filter(p => {
                const price = calculatePrice(p).final;
                return price >= min && price <= max;
            });
        }

        // 3. Sorting (only apply if NOT recently viewed, or if user explicitly chose a sort)
        // If it's recently viewed and default sort, we want to keep the recent order (already sorted above)
        if (filterType !== 'recent' || sortBy !== 'featured') {
            result.sort((a, b) => {
                const priceA = calculatePrice(a).final;
                const priceB = calculatePrice(b).final;

                switch (sortBy) {
                    case 'price-asc':
                        return priceA - priceB;
                    case 'price-desc':
                        return priceB - priceA;
                    case 'rating':
                        return (b.rating || 0) - (a.rating || 0);
                    case 'newest':
                        const idA = Number(a.id);
                        const idB = Number(b.id);
                        if (!isNaN(idA) && !isNaN(idB)) {
                            return idB - idA;
                        }
                        return String(b.id).localeCompare(String(a.id));
                    default:
                        return 0;
                }
            });
        }

        return result;
    }, [products, categoryFilter, subCategoryFilter, currentSubCategory, minPrice, maxPrice, sortBy, filterType, searchQuery]);

    if (loading) {
        return (
            <div className="min-h-screen bg-app-bg py-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-app-bg py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
                            {categoryFilter && (
                                <>
                                    <span className="text-gray-400">/</span>
                                    <Link to={`/shop?category=${encodeURIComponent(categoryFilter)}`} className="hover:text-primary transition-colors">{categoryFilter}</Link>
                                </>
                            )}
                            {subCategoryFilter && (
                                <>
                                    <span className="text-gray-400">/</span>
                                    <span className="text-gray-900 font-medium">{subCategoryFilter}</span>
                                </>
                            )}
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            {searchQuery ? `Results for "${searchQuery}"` :
                                (subCategoryFilter ? subCategoryFilter :
                                    (categoryFilter ? categoryFilter :
                                        (filterType === 'recent' ? 'Recently Viewed' : 'All Products')))}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Showing {processedProducts.length} product{processedProducts.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <Filter className="w-4 h-4" /> Filters
                        </button>

                        {/* Sort Dropdown */}
                        <div className="relative group">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:border-primary/50 transition-colors cursor-pointer">
                                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-transparent border-none focus:ring-0 text-gray-700 pr-4 cursor-pointer outline-none"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="rating">Top Rated</option>
                                    <option value="newest">Newest</option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none absolute right-3" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Filter Chips */}
                {(categoryFilter || subCategoryFilter || searchQuery || minPrice || maxPrice) && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {categoryFilter && (
                            <button
                                onClick={() => navigate('/shop')}
                                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20 hover:bg-primary/20 transition-colors"
                            >
                                {categoryFilter} <X className="w-3 h-3" />
                            </button>
                        )}
                        {subCategoryFilter && (
                            <button
                                onClick={() => navigate(`/shop?category=${encodeURIComponent(categoryFilter || '')}`)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-bold border border-accent/20 hover:bg-accent/20 transition-colors"
                            >
                                {subCategoryFilter} <X className="w-3 h-3" />
                            </button>
                        )}
                        {searchQuery && (
                            <button
                                onClick={() => navigate('/shop')}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200 hover:bg-gray-200 transition-colors"
                            >
                                "{searchQuery}" <X className="w-3 h-3" />
                            </button>
                        )}
                        {(minPrice || maxPrice) && (
                            <button
                                onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200 hover:bg-green-100 transition-colors"
                            >
                                {minPrice ? `₹${minPrice}` : '0'} - {maxPrice ? `₹${maxPrice}` : 'Any'} <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                )}

                {/* Sub-categories Grid */}
                {categoryFilter && !subCategoryFilter && activeSubCategories.length > 0 && (
                    <div className="mb-12 animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            Explore {categoryFilter} Sub-categories
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {activeSubCategories.map((sub) => (
                                <Link
                                    key={sub.id}
                                    to={`/shop?category=${encodeURIComponent(categoryFilter)}&subCategory=${encodeURIComponent(sub.name)}`}
                                    className="group flex flex-col items-center bg-white p-4 rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="aspect-square w-full mb-3 rounded-xl overflow-hidden bg-gray-50 border border-gray-50 group-hover:scale-105 transition-transform duration-500">
                                        <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors text-center">{sub.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters Section */}
                <div className={`mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 ${isFilterExpanded ? 'block' : 'hidden md:block'}`}>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Price Range */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Price Range:</span>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-24 pl-6 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <span className="text-gray-400">-</span>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-24 pl-6 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Active Filter Badges */}
                        {(minPrice || maxPrice || categoryFilter || subCategoryFilter || searchQuery) && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>
                                {categoryFilter && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                                        Category: {categoryFilter}
                                        <button onClick={() => {
                                            const newParams = new URLSearchParams(searchParams);
                                            newParams.delete('category');
                                            newParams.delete('subCategory');
                                            navigate({ search: newParams.toString() });
                                        }} className="hover:text-primary-dark ml-1">×</button>
                                    </div>
                                )}
                                {subCategoryFilter && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                                        Sub: {subCategoryFilter}
                                        <button onClick={() => {
                                            const newParams = new URLSearchParams(searchParams);
                                            newParams.delete('subCategory');
                                            navigate({ search: newParams.toString() });
                                        }} className="hover:text-blue-900 ml-1">×</button>
                                    </div>
                                )}
                                {searchQuery && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
                                        Search: {searchQuery}
                                        <button onClick={() => {
                                            const newParams = new URLSearchParams(searchParams);
                                            newParams.delete('q');
                                            navigate({ search: newParams.toString() });
                                        }} className="hover:text-purple-900 ml-1">×</button>
                                    </div>
                                )}
                                {(minPrice || maxPrice) && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full border border-gray-200">
                                        Price: {minPrice || '0'} - {maxPrice || 'Any'}
                                        <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="hover:text-red-500 ml-1">×</button>
                                    </div>
                                )}
                                <button
                                    onClick={() => {
                                        setMinPrice('');
                                        setMaxPrice('');
                                        setSortBy('featured');
                                        if (categoryFilter || searchQuery) navigate('/shop');
                                    }}
                                    className="text-xs text-gray-500 hover:text-red-600 underline"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Products Grid */}
                {processedProducts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                        <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                            We couldn't find any products matching your current filters. Try adjusting your search criteria.
                        </p>
                        <button
                            onClick={() => { setMinPrice(''); setMaxPrice(''); setSortBy('featured'); }}
                            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {processedProducts.map((product) => {
                            const prices = calculatePrice(product);
                            const productId = product.id || (product as any)._id;
                            return (
                                <div key={productId} className="relative group">
                                    <Link to={`/product/${productId}`} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                                        <div className="relative aspect-square bg-white overflow-hidden">
                                            <img
                                                className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                                src={product.image}
                                                alt={product.name}
                                                loading="lazy"
                                            />
                                            {product.discount && (
                                                <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg shadow-sm z-10">
                                                    {product.discount}% OFF
                                                </div>
                                            )}

                                            {/* Customize Button - Overlay inside image */}
                                            <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm py-2 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
                                                <span className="text-primary font-bold text-sm flex items-center justify-center gap-1">
                                                    <Zap className="w-3 h-3" /> Customize
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3 flex flex-col flex-grow">
                                            <div className="flex-1">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                                                    {product.category}
                                                </p>
                                                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors h-10 leading-5">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center gap-1 mt-1.5">
                                                    <div className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                        {product.rating || 4.8} <Star className="w-2 h-2 fill-current" />
                                                    </div>
                                                    <span className="text-[10px] text-gray-400">({product.reviewsCount || 0})</span>
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-2 border-t border-gray-50 flex justify-between items-center">
                                                <div>
                                                    <span className="text-lg font-bold text-gray-900">
                                                        {formatPrice(prices.final)}
                                                    </span>
                                                    {(product.discount !== undefined && product.discount > 0) && (
                                                        <span className="text-xs text-gray-400 line-through ml-2">
                                                            {formatPrice(prices.original)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Wishlist Button */}
                                    <button
                                        onClick={(e) => handleWishlistToggle(e, product)}
                                        className={`absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md transition-all transform hover:scale-110 z-20 ${isInWishlist(productId) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                    >
                                        <Heart className={`w-4 h-4 ${isInWishlist(productId) ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div >
    );
};
