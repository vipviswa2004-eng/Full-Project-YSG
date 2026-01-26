import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context';
import { calculatePrice } from '../data/products';
import { Link } from 'react-router-dom';
import { History, ChevronLeft, ChevronRight, Heart } from 'lucide-react';

export const RecentlyViewedDetails: React.FC = () => {
    const { products: allProducts, currency, wishlist, toggleWishlist } = useCart();
    const [recentProducts, setRecentProducts] = useState<any[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('recentlyViewed');
            if (stored) {
                const ids = JSON.parse(stored);
                // Map IDs to products, maintaining order
                const viewed = ids
                    .map((id: string) => allProducts.find(p => p.id === id || (p as any)._id === id))
                    .filter(Boolean);
                setRecentProducts(viewed);
            }
        } catch (e) {
            console.error(e);
        }
    }, [allProducts]);

    if (recentProducts.length === 0) return null;

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

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

    return (
        <div className="py-8 border-t border-gray-100 relative group/section mt-8 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <History className="w-6 h-6 text-gray-700" /> Recently Viewed By You
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex gap-2">
                            <button
                                onClick={() => scroll('left')}
                                className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 bg-white transition-colors"
                                aria-label="Scroll Left"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 bg-white transition-colors"
                                aria-label="Scroll Right"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full">
                <div
                    ref={scrollRef}
                    className="grid grid-flow-col auto-cols-[calc((100%-32px)/3)] md:auto-cols-[calc((100%-64px)/5)] gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x px-4 md:px-[max(1rem,calc((100vw-80rem)/2+1rem))]"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {recentProducts.map((product) => {
                        const prices = calculatePrice(product);
                        const productId = product.id || (product as any)._id;
                        return (
                            <div
                                key={productId}
                                className="snap-start relative group"
                            >
                                <Link to={`/product/${productId}`} onClick={() => window.scrollTo(0, 0)} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                                    <div className="relative aspect-square bg-white overflow-hidden">
                                        <img className="w-full h-full object-contain p-2 md:p-3 transition-transform duration-500 group-hover:scale-105" src={product.image} alt={product.name} loading="lazy" />
                                        {product.discount && <div className="absolute top-0 left-0 bg-red-600 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg shadow-sm z-10">{product.discount}% OFF</div>}
                                    </div>

                                    <div className="p-2 md:p-2.5 flex flex-col flex-grow">
                                        <div className="flex-1">
                                            <h3 className="text-[10px] md:text-xs font-semibold text-gray-800 line-clamp-2 h-7 md:h-8 leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                                        </div>
                                        <div className="mt-1 md:mt-2 flex items-baseline gap-1 md:gap-1.5">
                                            <span className="text-xs md:text-sm font-bold text-gray-900">{formatPrice(prices.final)}</span>
                                            {(product.discount !== undefined && product.discount > 0) && (
                                                <span className="text-[9px] md:text-[10px] text-gray-400 line-through">{formatPrice(prices.original)}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>

                                <button
                                    onClick={(e) => handleWishlistToggle(e, product)}
                                    className={`absolute top-1 right-1 md:top-1.5 md:right-1.5 p-1 bg-white rounded-full shadow-sm transition-all hover:scale-110 z-20 ${isInWishlist(productId) ? 'text-red-500' : 'text-gray-300 hover:text-red-500'}`}
                                >
                                    <Heart className={`w-3 h-3 md:w-3.5 md:h-3.5 ${isInWishlist(productId) ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
