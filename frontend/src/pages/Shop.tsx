import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, Heart, Filter, Zap } from 'lucide-react';
import { useCart } from '../context';
import { Product } from '../types';
import { calculatePrice } from '../data/products';

export const Shop: React.FC = () => {
    const { currency, wishlist, toggleWishlist } = useCart();
    const [searchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category');

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/products');
                const data = await res.json();
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
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

    // Filter products by category if specified
    const filteredProducts = categoryFilter
        ? products.filter(p => p.category && p.category.toLowerCase() === categoryFilter.toLowerCase())
        : products;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header with Filter Info */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        {categoryFilter ? `${categoryFilter} Products` : 'All Products'}
                    </h1>
                    {categoryFilter && (
                        <div className="mt-2 flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                                Filtered by: <span className="font-semibold text-primary">{categoryFilter}</span>
                            </span>
                            <Link to="/shop" className="ml-2 text-sm text-blue-600 hover:underline">
                                Clear filter
                            </Link>
                        </div>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                        Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg">No products found in this category.</p>
                        <Link to="/shop" className="mt-4 inline-block text-primary hover:underline">
                            View all products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {filteredProducts.map((product) => {
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
        </div>
    );
};
