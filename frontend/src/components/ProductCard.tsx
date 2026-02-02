import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { Product } from '../types';
import { calculatePrice } from '../data/products';
import { useCart } from '../context';

interface ProductCardProps {
    product: Product;
    // currency: string; // Removed unused prop
    onProductClick: (id: string, e: React.MouseEvent) => void;
    formatPrice: (price: number) => string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick, formatPrice }) => {
    const { wishlist, toggleWishlist } = useCart();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const prices = calculatePrice(product);
    const productId = product.id || (product as any)._id;

    const allImages = useMemo(() => {
        const images = [product.image];
        if (product.gallery) {
            images.push(...product.gallery);
        }
        if (product.variations) {
            product.variations.forEach(v => {
                v.options.forEach(opt => {
                    if (opt.image) images.push(opt.image);
                });
            });
        }
        // Deduplicate and filter empty
        return Array.from(new Set(images.filter(Boolean)));
    }, [product]);

    useEffect(() => {
        let interval: any;
        if (isHovered && allImages.length > 1) {
            interval = setInterval(() => {
                setCurrentImageIndex(prev => (prev + 1) % allImages.length);
            }, 1000); // Change image every 1 second
        } else {
            setCurrentImageIndex(0);
        }
        return () => clearInterval(interval);
    }, [isHovered, allImages.length]);

    const isInWishlist = wishlist.some(p => p.id === productId);

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
    };

    return (
        <div
            className="relative group bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-lg overflow-hidden flex flex-col h-full transform-gpu hover:-translate-y-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link
                to={`/product/${productId}`}
                onClick={(e) => onProductClick(productId, e)}
                className="flex flex-col h-full"
            >
                <div className="relative aspect-[3/4] bg-white overflow-hidden p-3 bg-gradient-to-b from-gray-50/50 to-white">
                    <img
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                        src={allImages[currentImageIndex] || product.image || '/placeholder-image.png'}
                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                        alt={product.name}
                        loading="lazy"
                    />

                    {/* Image Indicators (dots) if multiple images */}
                    {isHovered && allImages.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                            {allImages.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-primary' : 'bg-gray-300'}`}
                                />
                            ))}
                        </div>
                    )}

                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        {/* Only show % OFF badge for non-combo offers */}
                        {!product.isComboOffer && prices.final < prices.original && (
                            <div className="bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded shadow-lg shadow-red-600/20 uppercase tracking-tighter">
                                {Math.round((1 - prices.final / prices.original) * 100)}% OFF
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

                <div className="p-4 bg-white border-t border-gray-50 flex flex-col gap-2">
                    <div>
                        <p className="text-[9px] font-black text-gray-400 min-h-[12px] uppercase tracking-tighter mb-1 line-clamp-2">
                            {product.isComboOffer
                                ? (!product.category || product.category.toUpperCase() === 'UNCATEGORIZED' ? 'Special Combo Offer' : product.category)
                                : (!product.category || product.category.toUpperCase() === 'UNCATEGORIZED' ? 'General Gift' : product.category)}
                        </p>
                        <h3 className="text-xs font-bold text-gray-900 line-clamp-2 transition-colors group-hover:text-primary leading-tight mb-1">
                            {product.name}
                        </h3>
                        {/* Conditionally render rating only if there are reviews */}
                        {(product.reviewsCount || 0) > 0 && (
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-green-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm shadow-green-600/10">
                                    {product.rating} <Star className="w-2.5 h-2.5 fill-current" />
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                    ({product.reviewsCount} reviews)
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-gray-900 leading-none">
                                {formatPrice(prices.final)}
                            </span>
                            {/* Enhanced Display for Combo Offers in Card */
                                product.isComboOffer && prices.final < prices.original ? (
                                    <div className="flex flex-col mt-0.5">
                                        <p className="text-[10px] text-gray-500 font-medium leading-none">
                                            Worth <span className="line-through decoration-red-400">{formatPrice(prices.original)}</span>
                                        </p>
                                        <p className="text-green-600 font-bold text-[10px] mt-0.5 leading-none">
                                            You Save {formatPrice(prices.original - prices.final)}
                                        </p>
                                    </div>
                                ) : (
                                    /* Standard Inline Display for Regular Products */
                                    prices.final < prices.original && (
                                        <span className="text-[10px] text-gray-400 line-through font-bold mt-1">
                                            {formatPrice(prices.original)}
                                        </span>
                                    )
                                )}
                        </div>
                    </div>
                </div>
            </Link>
            <button
                onClick={handleWishlistClick}
                className={`absolute top-3 right-3 p-2 rounded-full shadow-lg z-20 transition-all duration-300 ${isInWishlist ? 'bg-red-50 text-red-500 scale-110 shadow-red-500/10' : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white'}`}
            >
                <Heart className={`w-3.5 h-3.5 transition-transform duration-300 ${isInWishlist ? 'fill-current' : 'group-hover/heart:scale-125'}`} />
            </button>
        </div>
    );
};
