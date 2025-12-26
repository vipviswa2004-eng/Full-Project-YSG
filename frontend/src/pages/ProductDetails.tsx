import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products as localProducts, calculatePrice } from '../data/products';
import { useCart } from '../context';
import { VariationOption, Review } from '../types';
import { Type, Plus, Minus, ShoppingCart, CheckCircle, Sparkles, Share2, Heart, ArrowLeft, Star, ThumbsUp, ThumbsDown, X, Truck, RefreshCcw, Award, ArrowRight } from 'lucide-react';
import { CustomDesigner } from '../components/CustomDesigner';

export const ProductDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart, currency, wishlist, toggleWishlist, user, products } = useCart();

    const reviewsRef = useRef<HTMLDivElement>(null);
    const scrollToReviews = () => {
        reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const initialProduct = products.find(p => p.id === id || (p as any)._id === id) || localProducts.find(p => p.id === id);
    const [product, setProduct] = useState(initialProduct);

    // Update product when products context changes
    useEffect(() => {
        const updatedProduct = products.find(p => p.id === id || (p as any)._id === id) || localProducts.find(p => p.id === id);
        if (updatedProduct) {
            setProduct(updatedProduct);
        }
    }, [products, id]);

    const [customName, setCustomName] = useState('');
    const [extraHeads, setExtraHeads] = useState(0);

    const [selectedVariations, setSelectedVariations] = useState<Record<string, VariationOption>>({});

    // Receiver Location State
    const [receiverLocation, setReceiverLocation] = useState('');
    const [receiverCountry, setReceiverCountry] = useState('IND');

    // Image Gallery State
    const [activeImage, setActiveImage] = useState<string>('');
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [isZoomed, setIsZoomed] = useState(false);

    // Save to recently viewed
    useEffect(() => {
        if (product && product.id) {
            try {
                const stored = localStorage.getItem('recentlyViewed');
                let viewedIds: string[] = stored ? JSON.parse(stored) : [];

                // Remove if already exists (to move to front)
                viewedIds = viewedIds.filter(vId => vId !== product.id);

                // Add to front
                viewedIds.unshift(product.id);

                // Keep max 10
                viewedIds = viewedIds.slice(0, 10);

                localStorage.setItem('recentlyViewed', JSON.stringify(viewedIds));
            } catch (e) {
                console.error("Failed to save recently viewed", e);
            }
        }
    }, [product]);

    // Review State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewLocation, setReviewLocation] = useState('');
    const [productReviews, setProductReviews] = useState<Review[]>([]);

    // Toast notification state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

    // Custom Designer State
    const [customDesignData, setCustomDesignData] = useState<any>(null);

    useEffect(() => {
        if (product) {
            if (product.variations) {
                const defaults: Record<string, VariationOption> = {};
                product.variations.forEach(v => {
                    // Skip default selection if disabled or for specific types
                    if (v.disableAutoSelect || v.name.toLowerCase().includes('light base') || v.name.toLowerCase().includes('shape')) {
                        return;
                    }
                    if (v.options.length > 0) {
                        defaults[v.id] = v.options[0];
                    }
                });
                setSelectedVariations(defaults);
            }
            setActiveImage(product.image);

            // Fetch reviews
            fetch('http://localhost:5000/api/reviews')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        const filtered = data.filter((r: any) =>
                            (r.productId === product.id || r.productName === product.name) &&
                            r.status === 'Approved'
                        );
                        setProductReviews(filtered);
                    }
                })
                .catch(err => console.error("Failed to fetch reviews", err));
        }
    }, [product]);

    // Screenshot Protection
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Disable Print Screen, Ctrl+S, Ctrl+Shift+S
            if (
                e.key === 'PrintScreen' ||
                (e.ctrlKey && e.key === 's') ||
                (e.ctrlKey && e.shiftKey && e.key === 's') ||
                (e.metaKey && e.key === 's') // Mac Command+S
            ) {
                e.preventDefault();
                setToastMessage('⚠️ Screenshots are disabled for preview protection');
                setToastType('info');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2000);
                return false;
            }
        };

        // Add event listeners
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    if (!product) return <div className="p-10 text-center text-gray-500">Product not found</div>;

    const prices = calculatePrice(product, extraHeads, selectedVariations);
    const isInWishlist = wishlist.some(p => p.id === product.id);
    const formatPrice = (price: number) => { return currency === 'INR' ? `₹${price.toLocaleString('en-IN')}` : `$${(price * 0.012).toFixed(2)}`; };
    const shareUrl = window.location.href;
    const shareText = `Check out ${product.name} on Yathes Sign Galaxy!`;

    const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: product.name, text: shareText, url: shareUrl });
            } catch (err) {
                console.log('Error sharing', err);
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            showNotification("Link copied to clipboard!", "info");
        }
    };

    const handleVariationChange = (variationId: string, option: VariationOption, variationName?: string) => {
        setSelectedVariations(prev => {
            // Find variation to check properties
            const variation = product.variations?.find(v => v.id === variationId);
            const isToggleable = variation?.disableAutoSelect || (variationName && (variationName.toLowerCase().includes('light base') || variationName.toLowerCase().includes('shape')));

            if (isToggleable) {
                // If already selected, deselect it
                if (prev[variationId]?.id === option.id) {
                    const newVariations = { ...prev };
                    delete newVariations[variationId];
                    return newVariations;
                }
            }
            // For all variations, set the selected option
            return { ...prev, [variationId]: option };
        });
        if (option.image) { setActiveImage(option.image); }
    };

    const handleAddToCart = (redirect: boolean) => {
        try {
            addToCart({
                ...product,
                cartId: Date.now().toString(),
                customName: receiverLocation ? `${customName} [Location: ${receiverCountry} - ${receiverLocation}]` : customName,
                customImage: null,
                customDesign: customDesignData, // Add custom design data
                calculatedPrice: prices.final,
                originalPrice: prices.original,
                quantity: 1,
                extraHeads,
                selectedVariations
            });

            if (redirect) {
                navigate(`/cart${redirect ? '?buyNow=true' : ''}`);
            } else {
                showNotification("🎉 Item added to your cart!", "success");
            }
        } catch (error) {
            console.error("Add to cart failed", error);
            showNotification("Failed to add to cart. Please try again.", "error");
        }
    };

    const handleWishlistToggle = () => {
        toggleWishlist(product);
        const isAdded = !isInWishlist;
        showNotification(
            isAdded ? "❤️ Added to Wishlist" : "💔 Removed from Wishlist",
            isAdded ? "success" : "info"
        );
    };

    const handleReviewSubmit = async () => {
        if (!user) {
            showNotification("Please login to submit a review", "info");
            return;
        }
        try {
            const newReview = {
                productId: product?.id,
                productName: product?.name,
                userId: user.email,
                userName: user.displayName || user.email.split('@')[0],
                rating: reviewRating,
                comment: reviewComment,
                status: 'Approved',
                location: reviewLocation || 'Bangalore',
                date: new Date().toISOString()
            };

            await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReview)
            });

            // Update local reviews list
            const updatedReviews = [newReview as Review, ...productReviews];
            setProductReviews(updatedReviews);

            // Calculate new average rating
            const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
            const newAverageRating = totalRating / updatedReviews.length;
            const newReviewsCount = updatedReviews.length;

            // Update product rating and count in database
            if (product && (product as any)._id) {
                await fetch(`http://localhost:5000/api/products/${(product as any)._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...product,
                        rating: parseFloat(newAverageRating.toFixed(1)),
                        reviewsCount: newReviewsCount
                    })
                });

                // Update local product state immediately
                setProduct({
                    ...product,
                    rating: parseFloat(newAverageRating.toFixed(1)),
                    reviewsCount: newReviewsCount
                });
            }

            showNotification("Review submitted successfully!", "success");
            setIsReviewModalOpen(false);
            setReviewComment('');
            setReviewLocation('');
            setReviewRating(5);
        } catch (e) {
            console.error("Failed to submit review", e);
            showNotification("Failed to submit review", "error");
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPosition({ x, y });
        setIsZoomed(true);
    };

    const handleMouseLeave = () => {
        setIsZoomed(false);
    };

    const handleReviewLike = (index: number) => {
        const updated = [...productReviews];
        const review = updated[index] as any;

        if (review.userAction === 'like') {
            review.likes = (review.likes || 0) - 1;
            review.userAction = null;
        } else {
            if (review.userAction === 'dislike') {
                review.dislikes = (review.dislikes || 0) - 1;
            }
            review.likes = (review.likes || 0) + 1;
            review.userAction = 'like';
        }
        setProductReviews(updated);
    };

    const handleReviewDislike = (index: number) => {
        const updated = [...productReviews];
        const review = updated[index] as any;

        if (review.userAction === 'dislike') {
            review.dislikes = (review.dislikes || 0) - 1;
            review.userAction = null;
        } else {
            if (review.userAction === 'like') {
                review.likes = (review.likes || 0) - 1;
            }
            review.dislikes = (review.dislikes || 0) + 1;
            review.userAction = 'dislike';
        }
        setProductReviews(updated);
    };

    const allImages = [product.image, ...(product.gallery || [])];

    return (
        <div className="bg-app-bg min-h-screen pb-24 md:pb-12 overflow-x-hidden">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-40 px-4 h-14 flex items-center justify-between border-b shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600" title="Go Back"><ArrowLeft className="w-6 h-6" /></button>
                <span className="font-bold text-gray-800 truncate max-w-[200px]">{product.name}</span>
                <div className="flex gap-2">
                    <button onClick={handleNativeShare} className="p-2 text-gray-600" title="Share Product"><Share2 className="w-5 h-5" /></button>
                    <button onClick={() => navigate('/cart')} className="p-2 text-gray-600" title="Go to Cart"><ShoppingCart className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-16 md:pt-8 px-0 md:px-4 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-10 items-start">
                    {/* Left Column: Images & Buttons */}
                    <div className="lg:col-span-5 space-y-6 sticky top-24">
                        <div className="flex gap-4">
                            {/* Thumbnails (Left Side) */}
                            <div className="hidden md:flex flex-col gap-3 w-16">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`border-2 rounded-lg overflow-hidden aspect-square ${activeImage === img ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>

                            {/* Main Image with Zoom */}
                            <div className="flex-1 relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group">
                                <div
                                    className="aspect-square relative flex items-center justify-center p-4 cursor-crosshair"
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {/* Normal Image */}
                                    <img
                                        src={activeImage}
                                        alt={product.name}
                                        className={`max-w-full max-h-full object-contain transition-opacity duration-300 select-none pointer-events-none ${isZoomed ? 'opacity-0' : 'opacity-100'}`}
                                        draggable={false}
                                        onContextMenu={(e) => e.preventDefault()}
                                    />

                                    {/* Zoomed Image Background */}
                                    {isZoomed && (
                                        <div
                                            className="absolute inset-0 bg-no-repeat pointer-events-none"
                                            style={{
                                                backgroundImage: `url("${activeImage}")`,
                                                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                                backgroundSize: '200%'
                                            }}
                                        />
                                    )}

                                    <button
                                        onClick={handleWishlistToggle}
                                        className={`absolute top-4 right-4 p-2 rounded-full shadow-md transition-colors z-10 ${isInWishlist ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:text-red-500'}`}
                                    >
                                        <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />
                                    </button>

                                    {/* Screenshot Protection Watermark Removed */}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Thumbnails (Horizontal) */}
                        <div className="flex md:hidden gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide mb-6">
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(img)}
                                    className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden ${activeImage === img ? 'border-primary' : 'border-transparent'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        {/* Action Buttons (Desktop & Mobile) */}
                        {/* Action Buttons */}
                        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-100 z-50 md:static md:p-0 md:bg-transparent md:border-none md:z-auto flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none">
                            <button onClick={() => handleAddToCart(false)} className="flex-1 bg-white border-2 border-primary text-primary py-3 md:py-4 rounded-xl font-bold hover:bg-purple-50 transition-colors text-sm md:text-base">Add to Cart</button>
                            <button onClick={() => handleAddToCart(true)} className="flex-1 bg-primary text-white py-3 md:py-4 rounded-xl font-bold hover:bg-purple-800 shadow-lg transition-all text-sm md:text-base">Buy Now</button>
                        </div>


                    </div>

                    {/* Mobile Spacer */}
                    <div className="h-12 md:hidden w-full bg-transparent shrink-0"></div>

                    {/* Right Column: Details & Reviews */}
                    <div className="lg:col-span-7 p-4 md:p-0 md:mt-0 space-y-8 lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2">
                        {/* Product Info */}
                        <div className="border-b border-gray-100 pb-6">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{product.category}</p>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 leading-tight">{product.name}</h1>

                            <div className="flex items-center gap-2 mt-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={scrollToReviews}>
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < (product.rating || 0) ? 'fill-current' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">({product.reviewsCount || 0} reviews)</span>
                            </div>

                            <div className="mt-4 flex items-baseline gap-3">
                                <p className="text-3xl font-bold text-gray-900">{formatPrice(prices.final)}</p>
                                {(product.discount !== undefined && product.discount > 0) && (
                                    <>
                                        <p className="text-sm text-gray-500 line-through">{formatPrice(prices.original)}</p>
                                        <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">{product.discount}% OFF</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Customization Options */}
                        <div className="space-y-6">
                            {/* Other Variations (excluding Size, Light Base, Shape, and Color) */}
                            {product.variations?.filter(v => v.name !== 'Size' && !v.name.toLowerCase().includes('light base') && v.name !== 'Shape' && v.name !== 'Color').map((v) => (
                                <div key={v.id}>
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">{v.name}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {v.options.map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => handleVariationChange(v.id, opt, v.name)}
                                                className={`px-3 py-2 text-sm rounded-md border transition-all flex items-center gap-2 ${selectedVariations[v.id]?.id === opt.id ? 'border-primary bg-purple-50 text-primary ring-1 ring-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                            >
                                                {opt.image && <img src={opt.image} className="w-6 h-6 rounded object-cover" alt="" />}
                                                <div className="flex flex-col items-start leading-none gap-0.5">
                                                    <span className="font-medium">{opt.label}</span>
                                                    {opt.size && <span className="text-[10px] text-gray-500">{opt.size}</span>}
                                                    {opt.description && <span className="text-[10px] text-gray-400">{opt.description}</span>}
                                                    {opt.priceAdjustment > 0 && (
                                                        <span className="text-xs font-bold text-green-600">
                                                            +₹{opt.priceAdjustment}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}



                            {/* Size Variation - Prominently displayed above Custom Text */}
                            {(() => {
                                const sizeVariation = product.variations?.find(v => v.name === 'Size');
                                if (!sizeVariation) return null;

                                return (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Select Size</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {sizeVariation.options.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => handleVariationChange(sizeVariation.id, opt, sizeVariation.name)}
                                                    className={`px-4 py-3 text-sm rounded-lg border-2 transition-all ${selectedVariations[sizeVariation.id]?.id === opt.id ? 'border-primary bg-purple-50 text-primary ring-2 ring-primary ring-offset-1' : 'border-gray-200 text-gray-700 hover:border-primary hover:bg-gray-50'}`}
                                                >
                                                    <div className="flex flex-col items-center gap-1">
                                                        {opt.image && <img src={opt.image} className="w-10 h-10 rounded object-cover mb-1" alt="" />}
                                                        <span className="font-bold">{opt.label}</span>
                                                        {opt.description && <span className="text-[10px] text-gray-500">{opt.description}</span>}
                                                        {opt.priceAdjustment > 0 && (
                                                            <span className="text-xs font-bold text-green-600 mt-1">
                                                                +₹{opt.priceAdjustment}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Shape Variation */}
                            {(() => {
                                const shapeVariation = product.variations?.find(v => v.name === 'Shape');
                                if (!shapeVariation) return null;

                                return (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Select Shape</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {shapeVariation.options.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => handleVariationChange(shapeVariation.id, opt, shapeVariation.name)}
                                                    className={`px-4 py-3 text-sm rounded-lg border-2 transition-all ${selectedVariations[shapeVariation.id]?.id === opt.id ? 'border-primary bg-purple-50 text-primary ring-2 ring-primary ring-offset-1' : 'border-gray-200 text-gray-700 hover:border-primary hover:bg-gray-50'}`}
                                                >
                                                    <div className="flex flex-col items-center gap-1">
                                                        {opt.image && <img src={opt.image} className="w-10 h-10 rounded object-cover mb-1" alt="" />}
                                                        <span className="font-bold">{opt.label}</span>
                                                        {opt.priceAdjustment > 0 && (
                                                            <span className="text-xs font-bold text-green-600 mt-1">
                                                                +₹{opt.priceAdjustment}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Color Variation */}
                            {(() => {
                                const colorVariation = product.variations?.find(v => v.name === 'Color');
                                if (!colorVariation) return null;

                                return (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Select Color</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {colorVariation.options.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => handleVariationChange(colorVariation.id, opt, colorVariation.name)}
                                                    className={`relative group p-1.5 rounded-xl border-2 transition-all ${selectedVariations[colorVariation.id]?.id === opt.id ? 'border-primary bg-purple-50 ring-2 ring-primary ring-offset-1' : 'border-gray-200 hover:border-primary bg-white'}`}
                                                >
                                                    <div className="flex flex-col items-center gap-2 min-w-[60px]">
                                                        {opt.image ? (
                                                            <img src={opt.image} className="w-12 h-12 rounded-lg object-cover shadow-sm" alt={opt.label} />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                                <span className="text-[10px] text-gray-400">No Image</span>
                                                            </div>
                                                        )}
                                                        <div className="text-center leading-tight">
                                                            <span className="text-xs font-bold text-gray-800 block">{opt.label}</span>
                                                            {opt.priceAdjustment > 0 && (
                                                                <span className="text-[10px] font-bold text-green-600">
                                                                    +₹{opt.priceAdjustment}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {selectedVariations[colorVariation.id]?.id === opt.id && (
                                                        <div className="absolute -top-2 -right-2 bg-primary text-white p-0.5 rounded-full shadow-md">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Light Base Variation - Displayed under Size */}
                            {(() => {
                                const lightBaseVariation = product.variations?.find(v => v.name.toLowerCase().includes('light base'));
                                if (!lightBaseVariation) return null;

                                return (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">{lightBaseVariation.name}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {lightBaseVariation.options.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => handleVariationChange(lightBaseVariation.id, opt, lightBaseVariation.name)}
                                                    className={`px-3 py-2 text-sm rounded-md border transition-all flex items-center gap-2 ${selectedVariations[lightBaseVariation.id]?.id === opt.id ? 'border-primary bg-purple-50 text-primary ring-1 ring-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                                >
                                                    {opt.image && <img src={opt.image} className="w-6 h-6 rounded object-cover" alt="" />}
                                                    <div className="flex flex-col items-start leading-none gap-0.5">
                                                        <span className="font-medium">{opt.label}</span>
                                                        {opt.description && <span className="text-[10px] text-gray-400">{opt.description}</span>}
                                                        {opt.priceAdjustment > 0 && (
                                                            <span className="text-xs font-bold text-green-600">
                                                                +₹{opt.priceAdjustment}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Additional Heads - Only show if enabled */}
                            {product.additionalHeadsConfig?.enabled && (
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex justify-between items-center">
                                    <label className="text-sm font-medium text-blue-900">
                                        Extra Persons
                                        <span className="text-xs text-blue-600 block">
                                            (+₹{product.additionalHeadsConfig.pricePerHead}/head)
                                        </span>
                                    </label>
                                    <div className="flex items-center gap-3 bg-white rounded-md border border-blue-200 px-2 py-1">
                                        <button
                                            onClick={() => setExtraHeads(Math.max(0, extraHeads - 1))}
                                            disabled={extraHeads === 0}
                                            className="text-gray-500 disabled:opacity-30"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-bold w-4 text-center">{extraHeads}</span>
                                        <button
                                            onClick={() => setExtraHeads(Math.min(product.additionalHeadsConfig?.maxLimit || 10, extraHeads + 1))}
                                            disabled={extraHeads >= (product.additionalHeadsConfig?.maxLimit || 10)}
                                            className="text-blue-600 disabled:opacity-30"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Text</label>
                                <div className="relative">
                                    <Type className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Happy Birthday!" className="pl-10 w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary py-2.5 border" />
                                </div>
                            </div>



                            {/* Custom Product Designer */}
                            <div className="mt-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-accent" />
                                    Custom Product Designer
                                </h3>
                                <CustomDesigner
                                    productImage={activeImage}
                                    productName={product.name}
                                    onSaveDesign={(designData) => {
                                        setCustomDesignData(designData);
                                        setToastMessage('Design saved! You can now add to cart.');
                                        setToastType('success');
                                        setShowToast(true);
                                        setTimeout(() => setShowToast(false), 3000);
                                    }}
                                />
                            </div>

                            {/* Gift Receiver's Location */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Gift Receiver's Location</label>
                                <div className="flex rounded-md shadow-sm">
                                    <div className="relative flex-shrink-0">
                                        <select
                                            value={receiverCountry}
                                            onChange={(e) => setReceiverCountry(e.target.value)}
                                            className="h-full py-2.5 pl-3 pr-8 border-gray-300 bg-gray-50 text-gray-900 rounded-l-lg border-r-0 focus:ring-primary focus:border-primary sm:text-sm font-medium"
                                        >
                                            <option value="IND">🇮🇳 IND</option>
                                            <option value="USA">🇺🇸 USA</option>
                                            <option value="UK">🇬🇧 UK</option>
                                            <option value="UAE">🇦🇪 UAE</option>
                                        </select>
                                    </div>
                                    <input
                                        type="text"
                                        value={receiverLocation}
                                        onChange={(e) => setReceiverLocation(e.target.value)}
                                        placeholder="Enter Receiver's pincode, location, area"
                                        className="flex-1 min-w-0 block w-full px-3 py-2.5 rounded-none rounded-r-lg border-gray-300 focus:ring-primary focus:border-primary sm:text-sm border"
                                    />
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-100 bg-gray-50/50 rounded-xl px-4">
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="bg-green-100 p-2 rounded-full text-green-600"><Truck className="w-5 h-5" /></div>
                                    <span className="text-xs font-bold text-gray-700">Free Shipping</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="bg-purple-100 p-2 rounded-full text-purple-600"><Award className="w-5 h-5" /></div>
                                    <span className="text-xs font-bold text-gray-700">Premium Quality</span>
                                </div>
                                <button
                                    onClick={() => navigate('/returns')}
                                    className="flex flex-col items-center text-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                    <div className="bg-orange-100 p-2 rounded-full text-orange-600"><RefreshCcw className="w-5 h-5" /></div>
                                    <span className="text-xs font-bold text-gray-700">Replacement</span>
                                    <span className="text-[10px] text-blue-600 underline">Click here to know more</span>
                                </button>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-3 text-lg">Product Description</h4>
                                <div className="text-gray-600 leading-relaxed space-y-4 text-sm md:text-base">
                                    {product.description.split('\n').map((paragraph, idx) => (
                                        <p key={idx}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section (Scrollable) */}
                        <div ref={reviewsRef} className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Ratings & Reviews</h3>

                            {/* Overall Rating & Distribution */}
                            <div className="flex flex-col md:flex-row items-start gap-8 mb-8 bg-gray-50 p-6 rounded-xl">
                                <div className="text-center md:text-left">
                                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                        <span className="text-5xl font-bold text-gray-900">{product.rating || 0}</span>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-5 h-5 ${i < Math.round(product.rating || 0) ? 'fill-current' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1">Total {productReviews.length} Ratings</p>
                                </div>

                                <div className="flex-1 w-full space-y-2">
                                    {[5, 4, 3, 2, 1].map(star => {
                                        const count = productReviews.filter(r => Math.round(r.rating) === star).length;
                                        const percentage = productReviews.length > 0 ? (count / productReviews.length) * 100 : 0;
                                        return (
                                            <div key={star} className="flex items-center gap-3 text-sm">
                                                <span className="w-3 font-medium">{star}</span>
                                                <Star className="w-3 h-3 text-gray-400 fill-current" />
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${star === 5 ? 'bg-green-500' : star === 4 ? 'bg-lime-500' : star === 3 ? 'bg-yellow-400' : 'bg-red-500'}`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <span className="w-6 text-right text-gray-500">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Reviews List Header */}
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h4 className="font-bold text-gray-900">Reviews ({productReviews.length})</h4>
                                <button onClick={() => setIsReviewModalOpen(true)} className="text-primary text-sm font-bold hover:underline">Rate and Write Review</button>
                            </div>

                            {/* Scrollable Reviews List */}
                            <div className="max-h-[400px] overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                {productReviews.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No reviews yet. Be the first to review!</p>
                                    </div>
                                ) : (
                                    productReviews.map((review, idx) => (
                                        <div key={idx} className="flex gap-4 border-b border-gray-100 pb-6 last:border-0">
                                            {/* Avatar */}
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 rounded-full border-2 border-purple-600 flex items-center justify-center text-purple-600 font-bold text-lg bg-white uppercase">
                                                    {review.userName ? review.userName.substring(0, 2) : 'CU'}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <div className="mb-1">
                                                    <h4 className="font-bold text-gray-900 text-base">{review.userName || 'Customer'}</h4>
                                                    <p className="text-xs text-gray-500">{review.location || 'Bangalore'} - {new Date(review.date || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                </div>

                                                <div className="flex text-yellow-400 mb-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                                    ))}
                                                </div>

                                                <p className="text-gray-800 text-sm mb-3 leading-relaxed">{review.comment}</p>

                                                <div className="flex gap-6 text-gray-400">
                                                    <button
                                                        onClick={() => handleReviewLike(idx)}
                                                        className={`flex items-center gap-1.5 transition-colors ${(review as any).userAction === 'like' ? 'text-blue-600' : 'hover:text-gray-600'}`}
                                                    >
                                                        <ThumbsUp className={`w-4 h-4 ${(review as any).userAction === 'like' ? 'fill-current' : ''}`} />
                                                        <span className="text-xs font-medium">{review.likes || 0}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleReviewDislike(idx)}
                                                        className={`flex items-center gap-1.5 transition-colors ${(review as any).userAction === 'dislike' ? 'text-red-600' : 'hover:text-gray-600'}`}
                                                    >
                                                        <ThumbsDown className={`w-4 h-4 ${(review as any).userAction === 'dislike' ? 'fill-current' : ''}`} />
                                                        <span className="text-xs font-medium">{review.dislikes || 0}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            <div className="bg-white py-12 border-t border-gray-100 mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <span className="text-secondary font-bold text-xs uppercase tracking-wider mb-1 block">You May Also Like</span>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Related Products</h2>
                        </div>
                        <button onClick={() => navigate(`/shop?category=${encodeURIComponent(product.category)}`)} className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                            View All <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
                        {products
                            .filter(p => p.category === product.category && p.id !== product.id)
                            .slice(0, 6)
                            .map(related => {
                                const relatedPrices = calculatePrice(related);
                                return (
                                    <div key={related.id} className="min-w-[160px] md:min-w-[220px] snap-start group cursor-pointer" onClick={() => { navigate(`/product/${related.id}`); window.scrollTo(0, 0); }}>
                                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                                            <div className="relative aspect-square overflow-hidden bg-gray-50">
                                                <img
                                                    src={related.image}
                                                    alt={related.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                                {related.discount && (
                                                    <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                                        {related.discount}% OFF
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 flex flex-col flex-1">
                                                <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">{related.name}</h3>
                                                <div className="mt-auto">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="font-bold text-gray-900">{formatPrice(relatedPrices.final)}</span>
                                                        {related.discount && <span className="text-xs text-gray-400 line-through">{formatPrice(relatedPrices.original)}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>

                    <button onClick={() => navigate(`/shop?category=${encodeURIComponent(product.category)}`)} className="w-full md:hidden flex justify-center items-center gap-2 text-primary font-bold py-3 bg-gray-50 rounded-lg mt-2">
                        View All Products <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Toast Notification */}
            {
                showToast && (
                    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] animate-slide-down">
                        <div className={`
                        px-6 py-4 rounded-xl shadow-2xl border-2 flex items-center gap-3 min-w-[280px] max-w-md
                        ${toastType === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
                        ${toastType === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
                        ${toastType === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
                    `}>
                            {toastType === 'success' && <div className="bg-green-500 rounded-full p-1"><CheckCircle className="w-5 h-5 text-white" /></div>}
                            {toastType === 'error' && <div className="bg-red-500 rounded-full p-1"><X className="w-5 h-5 text-white" /></div>}
                            {toastType === 'info' && <div className="bg-blue-500 rounded-full p-1"><Sparkles className="w-5 h-5 text-white" /></div>}
                            <span className="font-bold text-sm flex-1">{toastMessage}</span>
                            <button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                    </div>
                )
            }

            {/* Review Modal */}
            {
                isReviewModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                            <h3 className="text-lg font-bold mb-4">Rate {product.name}</h3>
                            <div className="flex gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none">
                                        <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                className="w-full border rounded-md p-2 mb-4"
                                placeholder="Your City (e.g. Bangalore)"
                                value={reviewLocation}
                                onChange={(e) => setReviewLocation(e.target.value)}
                            />
                            <textarea
                                className="w-full border rounded-md p-2 mb-4 h-32"
                                placeholder="Write your review..."
                                value={reviewComment}
                                onChange={e => setReviewComment(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsReviewModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button onClick={handleReviewSubmit} className="px-4 py-2 bg-primary text-white rounded font-bold">Submit Review</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
