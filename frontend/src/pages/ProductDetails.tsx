import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';
import { RecentlyViewedDetails } from './RecentlyViewedDetails';
import { useParams, useNavigate } from 'react-router-dom';
import { products as localProducts, calculatePrice } from '../data/products';
import { useCart } from '../context';
import { Plus, Minus, ShoppingCart, CheckCircle, Sparkles, Share2, Heart, ArrowLeft, Star, X, Truck, RefreshCcw, Award, ArrowRight, Eye, Clock, MessageCircle, Loader2, ChevronLeft, ChevronRight, MapPin, ChevronDown, Search, Tag } from 'lucide-react';
import { getCachedProduct, setCachedProduct } from '../utils/productCache';
import { ProductCard } from '../components/ProductCard';
import { Coupon, VariationOption, Review } from '../types';

export const ProductDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart, currency, wishlist, toggleWishlist, user, products, setIsLoginModalOpen } = useCart();

    const reviewsRef = useRef<HTMLDivElement>(null);
    const detailsContainerRef = useRef<HTMLDivElement>(null);
    const relatedScrollRef = useRef<HTMLDivElement>(null);

    const scrollToReviews = () => {
        reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };



    const [product, setProduct] = useState<any>(null);
    const [isFetching, setIsFetching] = useState(true);

    // Unified Product Fetching Logic
    useEffect(() => {
        const fetchProduct = async () => {
            setIsFetching(true);
            setProduct(null);

            try {
                // 1. Try context/cache first
                const ctxProduct = products.find(p => p.id === id || (p as any)._id === id);
                const cachedProduct = getCachedProduct(id!);
                const bestMatch = (cachedProduct && cachedProduct.description) ? cachedProduct : ctxProduct;

                if (bestMatch) {
                    setProduct(bestMatch);
                    if (bestMatch.description) {
                        setIsFetching(false);
                        // If we have full data, skip API but keep checking for updates
                    }
                }

                // 2. Always fetch latest from API if we don't have description
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
                if (res.ok) {
                    const fullProduct = await res.json();
                    setProduct(fullProduct);
                    setCachedProduct(id!, fullProduct);
                }
            } catch (err) {
                console.error("Failed to fetch product:", err);
            } finally {
                setIsFetching(false);
            }
        };

        if (id) fetchProduct();
    }, [id]); // ONLY depend on id to avoid infinite loops

    const [extraHeads, setExtraHeads] = useState(0);
    const [symbolNumber, setSymbolNumber] = useState('');

    const [selectedVariations, setSelectedVariations] = useState<Record<string, VariationOption>>({});

    // Receiver Location State
    const [receiverLocation, setReceiverLocation] = useState('');
    const [receiverCountry, setReceiverCountry] = useState('IND');
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [locationMessage, setLocationMessage] = useState('');
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [countrySearchQuery, setCountrySearchQuery] = useState('');

    const COUNTRIES = [
        { code: 'IND', name: 'India', flag: '🇮🇳' },
        { code: 'USA', name: 'United States', flag: '🇺🇸' },
        { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
        { code: 'UAE', name: 'UAE', flag: '🇦🇪' },
        { code: 'CAN', name: 'Canada', flag: '🇨🇦' },
        { code: 'AUS', name: 'Australia', flag: '🇦🇺' },
        { code: 'DEU', name: 'Germany', flag: '🇩🇪' },
        { code: 'FRA', name: 'France', flag: '🇫🇷' },
    ];

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

                // Keep max 25
                viewedIds = viewedIds.slice(0, 25);

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

    // Customization Modal State
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
    const [customizeStep, setCustomizeStep] = useState(1);
    const [customImages, setCustomImages] = useState<string[]>([]);
    const [customImageFiles, setCustomImageFiles] = useState<File[]>([]);
    const [customText, setCustomText] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Description Tab State
    const [descriptionTab, setDescriptionTab] = useState<string | null>('description');

    // Available Coupons State
    const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
    const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);

    // Show All Reviews State
    const [showAllReviews, setShowAllReviews] = useState(false);

    // Fetch Coupons
    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/coupons`);
                if (res.ok) {
                    const data = await res.json();
                    setAvailableCoupons(Array.isArray(data) ? data.filter(c => c.status === 'Active') : []);
                }
            } catch (err) {
                console.error("Failed to fetch coupons:", err);
            } finally {
                setIsLoadingCoupons(false);
            }
        };
        fetchCoupons();
    }, []);



    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check for review action in URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('action') === 'review') {
            // Wait a bit for page load
            setTimeout(() => {
                setIsReviewModalOpen(true);
                scrollToReviews();
            }, 1000);
        }
    }, [window.location.search]);



    const handleCheckLocation = () => {
        if (!receiverLocation.trim()) {
            setLocationStatus('error');
            setLocationMessage('Please enter a valid pincode or area.');
            return;
        }

        setLocationStatus('loading');
        setLocationMessage('');

        // Simulate API call
        setTimeout(() => {
            // Mock logic: 6 digits for success, else error (for IND)
            if (receiverCountry === 'IND' && !/^\d{6}$/.test(receiverLocation.trim())) {
                setLocationStatus('error');
                setLocationMessage('Please enter a valid 6-digit Pincode.');
            } else {
                setLocationStatus('success');
                setLocationMessage('Available for delivery');
                showNotification("Delivery available at this location!", "success");
            }
        }, 1000);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const maxPhotos = 15;
        const availableSlots = maxPhotos - customImages.length;

        if (availableSlots <= 0) {
            showNotification(`Maximum ${maxPhotos} photos reached.`, "error");
            return;
        }

        const filesToProcess = files.slice(0, availableSlots);
        if (files.length > availableSlots) {
            showNotification(`Only ${availableSlots} more photos could be added. Max limit is ${maxPhotos}.`, "info");
        }

        for (const file of filesToProcess) {
            try {
                const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                setCustomImages(prev => [...prev, base64]);
                setCustomImageFiles(prev => [...prev, file]);
            } catch (err) {
                console.error("Failed to read file", err);
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        setCustomImages(prev => prev.filter((_, i) => i !== index));
        setCustomImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleModalAddToCart = async () => {
        let uploadedUrls: string[] = [];
        setIsUploading(true);

        try {
            // Upload all images
            for (let i = 0; i < customImageFiles.length; i++) {
                const file = customImageFiles[i];
                const formData = new FormData();
                formData.append('image', file);

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    uploadedUrls.push(data.url);
                } else {
                    // Fallback to base64 if upload fails
                    uploadedUrls.push(customImages[i]);
                }
            }

            // If no files were selected but we have base64 or already set URLs
            if (customImageFiles.length === 0 && customImages.length > 0) {
                uploadedUrls = customImages;
            }

            const finalImageValue = uploadedUrls.length > 0 ? JSON.stringify(uploadedUrls) : null;
            executeAddToCart(false, finalImageValue, customText);
            setIsCustomizeModalOpen(false);
        } catch (error) {
            console.error("Image upload failed", error);
            showNotification("Some images failed to upload. Adding existing ones.", "info");
            const finalImageValue = customImages.length > 0 ? JSON.stringify(customImages) : null;
            executeAddToCart(false, finalImageValue, customText);
            setIsCustomizeModalOpen(false);
        } finally {
            setIsUploading(false);
        }
    };


    useEffect(() => {
        if (detailsContainerRef.current) {
            detailsContainerRef.current.scrollTop = 0;
        }
    }, [id]);

    useEffect(() => {
        if (product) {
            if (product.variations) {
                const defaults: Record<string, VariationOption> = {};
                product.variations.forEach(v => {
                    // Search for marked default first
                    const markedDefault = v.options.find(o => o.isDefault);
                    if (markedDefault) {
                        defaults[v.id] = markedDefault;
                        if (markedDefault.image) {
                            setActiveImage(markedDefault.image);
                        }
                        return;
                    }

                    // Fallback to original logic
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
            fetch(`${import.meta.env.VITE_API_URL}/api/reviews`)
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

    // Simplified Skeleton Loader
    const ProductSkeleton = () => (
        <div className="bg-app-bg min-h-screen pb-24 md:pb-12 animate-pulse">
            <div className="max-w-7xl mx-auto pt-20 md:pt-8 px-4 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-10">
                    <div className="lg:col-span-5 space-y-6">
                        <div className="aspect-square bg-gray-200 rounded-2xl" />
                        <div className="flex gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg" />
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-7 mt-8 lg:mt-0 space-y-6">
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                        <div className="h-10 bg-gray-200 rounded w-3/4" />
                        <div className="h-6 bg-gray-200 rounded w-1/2" />
                        <div className="h-20 bg-gray-200 rounded w-full" />
                        <div className="space-y-4">
                            <div className="h-12 bg-gray-200 rounded w-full" />
                            <div className="h-12 bg-gray-200 rounded w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (isFetching) {
        return <ProductSkeleton />;
    }

    if (!product) return (
        <div className="flex flex-col items-center justify-center min-h-screen pt-20 text-center px-4">
            <div className="text-xl font-bold text-gray-800 mb-2">Product Not Found</div>
            <p className="text-gray-500 mb-6">We couldn't find the product you're looking for or it's still loading...</p>
            <button
                onClick={() => navigate('/products')}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
                Browse All Products
            </button>
        </div>
    );

    const prices = calculatePrice(product, extraHeads, selectedVariations);
    const isInWishlist = wishlist.some(p => p.id === product.id);
    const formatPrice = (price: number) => { return currency === 'INR' ? `₹${price.toLocaleString('en-IN')}` : `$${(price * 0.012).toFixed(2)}`; };
    const shareUrl = window.location.href;
    const shareText = `Check out ${product.name} on Sign Galaxy!`;

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

    const executeAddToCart = (
        redirect: boolean,
        finalCustomImage: string | null,
        finalCustomText: string,
        overrides?: {
            extraHeads?: number,
            symbolNumber?: string,
            selectedVariations?: Record<string, VariationOption>,
            receiverLocation?: string,
            receiverCountry?: string
        }
    ) => {
        console.log("🛒 executeAddToCart triggered", {
            hasUser: !!user,
            redirect,
            hasImage: !!finalCustomImage,
            overrides: !!overrides
        });

        try {
            // Use overrides or current state
            const currentExtraHeads = overrides?.extraHeads !== undefined ? overrides.extraHeads : extraHeads;
            const currentSymbolNumber = overrides?.symbolNumber !== undefined ? overrides.symbolNumber : symbolNumber;
            const currentSelectedVariations = overrides?.selectedVariations || selectedVariations;
            const currentReceiverLocation = overrides?.receiverLocation || receiverLocation;
            const currentReceiverCountry = overrides?.receiverCountry || receiverCountry;

            // Recalculate prices if using overrides to be safe
            const currentPrices = calculatePrice(product, currentExtraHeads, currentSelectedVariations);

            const finalCustomName = [
                finalCustomText ? `"${finalCustomText}"` : '',
                currentReceiverLocation ? `[Location: ${currentReceiverCountry} - ${currentReceiverLocation}]` : ''
            ].filter(Boolean).join(' ');

            // ADD TO CART ALWAYS (for guest or user)
            addToCart({
                ...product,
                cartId: Date.now().toString(),
                customName: finalCustomName,
                customImage: finalCustomImage,
                calculatedPrice: currentPrices.final,
                originalPrice: currentPrices.original,
                quantity: 1,
                extraHeads: currentExtraHeads,
                symbolNumber: currentSymbolNumber,
                selectedVariations: currentSelectedVariations
            });

            if (!user) {
                // Save pending customization as a backup to localStorage
                const pendingData = {
                    productId: product.id,
                    customText: finalCustomText,
                    customImages: finalCustomImage ? JSON.parse(finalCustomImage) : [],
                    selectedVariations: currentSelectedVariations,
                    extraHeads: currentExtraHeads,
                    symbolNumber: currentSymbolNumber,
                    receiverLocation: currentReceiverLocation,
                    receiverCountry: currentReceiverCountry,
                    timestamp: Date.now()
                };
                console.log("💾 Saving pending customization backup", pendingData);
                // Use route parameter 'id' for the key to be consistent across reloads
                localStorage.setItem(`pending_customization_${id}`, JSON.stringify(pendingData));
                setIsLoginModalOpen(true);
                return;
            }

            // Clear any pending data if logged in
            localStorage.removeItem(`pending_customization_${id}`);
            localStorage.removeItem(`pending_customization_${product.id}`);

            // Clear any pending customization for this product after successful add
            localStorage.removeItem(`pending_customization_${id}`);
            localStorage.removeItem(`pending_customization_${product.id}`); // Clear old key format too if exists

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

    // Restore pending customization after login
    useEffect(() => {
        // We use 'id' from useParams as it's available immediately on mount
        if (user && id) {
            const pendingKey = `pending_customization_${id}`;
            const savedData = localStorage.getItem(pendingKey) || (product?.id ? localStorage.getItem(`pending_customization_${product.id}`) : null);

            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    console.log("🔄 Found pending customization to restore:", data);

                    // Only restore if it's reasonably fresh (last 1 hour)
                    if (Date.now() - data.timestamp < 3600000) {
                        // Restore state for UI
                        if (data.customText) setCustomText(data.customText);
                        if (data.customImages) setCustomImages(data.customImages);
                        if (data.selectedVariations) setSelectedVariations(data.selectedVariations);
                        if (data.extraHeads !== undefined) setExtraHeads(data.extraHeads);
                        if (data.symbolNumber) setSymbolNumber(data.symbolNumber);
                        if (data.receiverLocation) setReceiverLocation(data.receiverLocation);
                        if (data.receiverCountry) setReceiverCountry(data.receiverCountry);

                        // Small delay to ensure state hydration is processed and then execute
                        setTimeout(() => {
                            const finalImageValue = data.customImages && data.customImages.length > 0
                                ? JSON.stringify(data.customImages)
                                : null;

                            console.log("🚀 Executing auto-add-to-cart after restoration");
                            executeAddToCart(false, finalImageValue, data.customText || "", {
                                extraHeads: data.extraHeads,
                                symbolNumber: data.symbolNumber,
                                selectedVariations: data.selectedVariations,
                                receiverLocation: data.receiverLocation,
                                receiverCountry: data.receiverCountry
                            });

                            showNotification("Restored and added your customized product to cart!", "success");
                        }, 2500);
                    } else {
                        console.log("⌛ Pending customization too old, clearing");
                        localStorage.removeItem(pendingKey);
                    }
                } catch (e) {
                    console.error("❌ Failed to restore pending customization", e);
                }
            }
        }
    }, [user, id, product?.id]);


    const handleAddToCartClick = () => {
        setIsCustomizeModalOpen(true);
        setCustomizeStep(1);
    };

    const handleBuyNowClick = () => {
        // For buy now, we can either skip customization or open it with a flag. 
        // For now, let's open the customization modal too, but we need to know we are buying now.
        // Or simpler, just let Buy Now act as "Skip & Buy" if the user wants quick checkout, 
        // BUT for personalized gifts, customization is key.
        // Let's open the modal for Buy Now as well to ensure data is captured.
        // However, the user specifically asked to change "Add to Cart". 
        // I will link Buy Now to the same flow but maybe with a different final action?
        // Let's stick to the request for "Add to Cart". 
        // Existing Buy Now behavior adds to cart and redirects.
        // I'll keep Buy Now as is (direct add without customization) OR update it.
        // Given it's a personalized site, Buy Now should probably also customize.
        // But to avoid overstepping, I will invoke the modal for Add to Cart.
        // And maybe for Buy Now I will just do the old behavior (add current state).
        // Actually, let's make the "Add to Cart" inside the modal handle the final logic.

        // If the user clicks "Buy Now", maybe they expect to skip? 
        // I will keep Buy Now as 'Direct Add' for now, or maybe open modal?
        // Let's just implement the new flow for "Add to Cart" button as requested.

        executeAddToCart(true, null, ""); // Direct Buy Now (no custom image/text unless gathered elsewhere)
    };

    const handleWishlistToggle = () => {
        if (!user) {
            setIsLoginModalOpen(true);
            return;
        }
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

            await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
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
                await fetch(`${import.meta.env.VITE_API_URL}/api/products/${(product as any)._id}`, {
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



    const variationImages = product.variations?.flatMap(v => v.options.map(o => o.image).filter(Boolean)) || [] as string[];
    const allImages = [product.image, ...variationImages, ...(product.gallery || [])].filter((img, idx, self) => img && self.indexOf(img) === idx) as string[];

    return (
        <div className="bg-app-bg min-h-screen pb-24 md:pb-12 overflow-x-hidden">
            <SEO
                title={product.name}
                description={product.description || `Customize and buy ${product.name} at Sign Galaxy. Premium quality, best prices.`}
                image={product.image}
                type="product"
                productData={{
                    price: prices.final,
                    currency: currency,
                    availability: 'InStock',
                    brand: 'Sign Galaxy'
                }}
            />
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-40 px-4 h-16 flex items-center justify-between border-b shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600" title="Go Back"><ArrowLeft className="w-6 h-6" /></button>
                <span className="font-bold text-gray-800 truncate max-w-[200px]">{product.name}</span>
                <div className="flex gap-2">
                    <button onClick={handleNativeShare} className="p-2 text-gray-600" title="Share Product"><Share2 className="w-5 h-5" /></button>
                    <button onClick={() => navigate('/cart')} className="p-2 text-gray-600" title="Go to Cart"><ShoppingCart className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-[45px] md:pt-8 px-0 md:px-4 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-10 items-start">
                    {/* Left Column: Images & Buttons */}
                    <div className="lg:col-span-5 space-y-6 sticky top-20 mt-10">
                        <div className="flex gap-4">
                            {/* Thumbnails (Left Side) */}
                            <div className="hidden md:flex flex-col gap-3 w-16">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`border-2 rounded-lg overflow-hidden aspect-square ${activeImage === img ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
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
                                        onClick={handleNativeShare}
                                        className="absolute top-16 right-4 p-2 rounded-full shadow-md bg-white text-gray-400 hover:text-indigo-600 transition-colors z-10"
                                        title="Share"
                                    >
                                        <Share2 className="w-6 h-6" />
                                    </button>

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
                        <div className="flex md:hidden gap-3 overflow-x-auto pb-2 px-4 no-scrollbar mb-6">
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


                    </div>

                    {/* Mobile Spacer */}
                    <div className="h-12 md:hidden w-full bg-transparent shrink-0"></div>

                    {/* Right Column: Details & Reviews */}
                    <div className="lg:col-span-7 flex flex-col lg:h-[calc(100vh-100px)] lg:sticky lg:top-19">
                        <div
                            ref={detailsContainerRef}
                            className="flex-1 overflow-y-auto p-4 md:p-0 space-y-8 no-scrollbar"
                        >
                            {/* Product Info */}
                            <div className="border-b border-gray-100 pb-6">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                                    {product.isComboOffer
                                        ? (!product.category || product.category.toUpperCase() === 'UNCATEGORIZED' ? 'Special Combo Offer' : product.category)
                                        : (!product.category || product.category.toUpperCase() === 'UNCATEGORIZED' ? 'General Gift' : product.category)}
                                </p>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 leading-tight">{product.name}</h1>

                                <div className="flex items-center gap-2 mt-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={scrollToReviews}>
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < (product.rating || 0) ? 'fill-current' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500">({product.reviewsCount || 0} reviews)</span>
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-baseline gap-3">
                                        <p className="text-3xl font-bold text-gray-900">{formatPrice(prices.final)}</p>

                                        {/* Standard Display for Non-Combos */}
                                        {!product.isComboOffer && prices.final < prices.original && (
                                            <>
                                                <p className="text-sm text-gray-500 line-through">{formatPrice(prices.original)}</p>
                                                <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">
                                                    {Math.round((1 - prices.final / prices.original) * 100)}% OFF
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Special Display for Combo Offers */}
                                    {product.isComboOffer && prices.final < prices.original && (
                                        <div className="flex flex-col gap-1 mt-1 animate-in fade-in slide-in-from-left-4 duration-500">
                                            <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                                                Worth <span className="line-through decoration-red-400">{formatPrice(prices.original)}</span>
                                            </p>
                                            <p className="text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded-lg self-start border border-green-100 shadow-sm flex items-center gap-1">
                                                <span className="bg-green-600 text-white rounded-full p-0.5"><CheckCircle className="w-3 h-3" /></span>
                                                You Save {formatPrice(prices.original - prices.final)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Customization Options */}
                            <div className="space-y-6">
                                {/* Other Variations (excluding Size, Light Base, Shape, and Color) */}
                                {product.variations?.filter(v =>
                                    v.name.toLowerCase() !== 'size' &&
                                    !v.name.toLowerCase().includes('light base') &&
                                    v.name.toLowerCase() !== 'shape' &&
                                    v.name.toLowerCase() !== 'color' &&
                                    v.options && v.options.length > 0
                                ).map((v) => (
                                    <div key={v.id}>
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">{v.name}</h3>
                                        <div className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {v.options.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => handleVariationChange(v.id, opt, v.name)}
                                                    className={`shrink-0 w-32 md:w-36 p-3 text-sm rounded-xl border-2 transition-all flex flex-col items-center justify-start gap-2 text-center ${selectedVariations[v.id]?.id === opt.id ? 'border-primary bg-purple-50 text-primary ring-1 ring-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                                >
                                                    {opt.image && <img src={opt.image} className="w-16 h-16 rounded-lg object-cover shadow-sm bg-white" alt="" />}
                                                    <div className="flex flex-col items-center gap-0.5 w-full">
                                                        <span className="font-bold leading-tight">{opt.label}</span>
                                                        {opt.size && <span className="text-[10px] text-gray-500">{opt.size}</span>}
                                                        {opt.description && <span className="text-[10px] text-gray-400 line-clamp-1">{opt.description}</span>}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}


                                {/* Symbol Number Variation */}
                                {product.symbolNumberConfig?.enabled && (
                                    <div className="space-y-4 bg-purple-50/50 p-5 rounded-2xl border-2 border-dashed border-purple-200/60 transition-all hover:bg-purple-50 group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-primary" />
                                                <h3 className="text-sm font-bold text-gray-900">{product.symbolNumberConfig.title || 'Enter Symbol Number'}</h3>
                                            </div>
                                            {product.symbolNumberConfig.image && (
                                                <button
                                                    onClick={() => {
                                                        setActiveImage(product.symbolNumberConfig!.image!);
                                                        if (detailsContainerRef.current) {
                                                            detailsContainerRef.current.scrollTop = 0;
                                                        }
                                                    }}
                                                    className="text-[10px] uppercase tracking-widest font-black text-primary hover:text-purple-700 flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-full shadow-sm border border-purple-100 transition-all active:scale-95"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> View Chart
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex gap-4">
                                            {product.symbolNumberConfig.image && (
                                                <div
                                                    className="w-24 h-24 flex-shrink-0 bg-white p-1 rounded-xl shadow-md border-2 border-white group-hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden"
                                                    onClick={() => setActiveImage(product.symbolNumberConfig!.image!)}
                                                >
                                                    <img src={product.symbolNumberConfig.image} alt="Chart" className="w-full h-full object-contain" />
                                                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="bg-white/90 px-2 py-1 rounded text-[8px] font-bold text-primary shadow-sm">ZOOM</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={symbolNumber}
                                                        onChange={(e) => setSymbolNumber(e.target.value)}
                                                        placeholder="e.g., S12, C05..."
                                                        className="w-full px-5 py-4 rounded-xl border-2 border-purple-100 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-base font-bold placeholder:text-gray-300 shadow-sm bg-white"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary/40 tracking-tighter uppercase">Required</div>
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-3 font-semibold italic flex items-center gap-1.5 leading-tight">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                                    Please refer to the chart and enter your preferred symbol number.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(() => {
                                    // Robust check: Look for 'size' or 'items' or 'bundle' variation
                                    const sizeVariation = product.variations?.find(v =>
                                        v.name.toLowerCase().includes('size') ||
                                        v.name.toLowerCase().includes('item') ||
                                        v.name.toLowerCase().includes('bundle')
                                    );

                                    // If it's a combo offer, show it as an inclusion list instead of a selection
                                    if (product.isComboOffer && sizeVariation) {
                                        // Calculate total items dynamically
                                        const totalItems = sizeVariation.options.reduce((sum, opt) => {
                                            const qty = parseInt(opt.label.match(/\d+/)?.[0] || '1');
                                            return sum + qty;
                                        }, 0);

                                        return (
                                            <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-[2rem] p-6 border-2 border-primary/10 shadow-xl shadow-primary/5 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                                                        <Sparkles className="w-5 h-5 text-white animate-pulse" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-gray-900 leading-tight">What's in the Box?</h3>
                                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Premium Combo Set Contents</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {sizeVariation.options.map((opt, i) => (
                                                        <motion.div
                                                            key={opt.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-primary/30 transition-all hover:scale-[1.02]"
                                                        >
                                                            <div className="relative">
                                                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl">
                                                                    {opt.label.match(/\d+/)?.[0] || '1'}
                                                                </div>
                                                                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-[10px] font-black px-1.5 rounded-md shadow-sm">PCS</div>
                                                            </div>

                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="font-black text-gray-800 tracking-tight">{opt.label.replace(/^\d+\s*/, '')}</span>
                                                                    <div className="bg-green-100 text-green-700 p-1 rounded-full">
                                                                        <CheckCircle className="w-4 h-4" />
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">Size: {opt.size || opt.description || 'Standard'}</span>
                                                                    {opt.description && opt.size && <span className="text-[10px] text-primary/60 font-medium italic">{opt.description}</span>}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                <div className="mt-6 pt-5 border-t border-dashed border-primary/20 flex items-center justify-between">
                                                    <span className="text-sm font-bold text-gray-500">Total Items in Bundle:</span>
                                                    <span className="text-xl font-black text-primary">{totalItems.toString().padStart(2, '0')} Pieces</span>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Fallback to normal display if not combo or no variation found
                                    if (!sizeVariation) return null;

                                    return (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Select Size</h3>
                                            <div className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                                {sizeVariation.options.map((opt: VariationOption) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => handleVariationChange(sizeVariation.id, opt, sizeVariation.name)}
                                                        className={`shrink-0 w-36 md:w-44 p-3 text-sm rounded-xl border-2 transition-all flex flex-col items-center justify-start gap-3 text-center ${selectedVariations[sizeVariation.id]?.id === opt.id ? 'border-primary bg-purple-50 text-primary ring-2 ring-primary ring-offset-1 shadow-md' : 'border-gray-200 text-gray-700 hover:border-primary hover:bg-gray-50'}`}
                                                    >
                                                        {opt.image && (
                                                            <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-100 bg-white">
                                                                <img src={opt.image} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col items-center gap-0.5 w-full">
                                                            <span className="font-bold text-base leading-tight">{opt.label}</span>
                                                            {opt.size && <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full mt-1">{opt.size}</span>}
                                                            {opt.description && <span className="text-[10px] text-gray-400 mt-1 line-clamp-2">{opt.description}</span>}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Shape Variation */}
                                {(() => {
                                    const shapeVariation = product.variations?.find(v => v.name.toLowerCase() === 'shape');
                                    if (!shapeVariation) return null;

                                    return (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Select Shape</h3>
                                            <div className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                                {shapeVariation.options.map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => handleVariationChange(shapeVariation.id, opt, shapeVariation.name)}
                                                        className={`shrink-0 w-36 md:w-44 p-3 text-sm rounded-xl border-2 transition-all flex flex-col items-center justify-start gap-3 text-center ${selectedVariations[shapeVariation.id]?.id === opt.id ? 'border-primary bg-purple-50 text-primary ring-2 ring-primary ring-offset-1 shadow-md' : 'border-gray-200 text-gray-700 hover:border-primary hover:bg-gray-50'}`}
                                                    >
                                                        {opt.image && (
                                                            <div className="w-full aspect-square rounded-lg overflow-hidden border border-gray-100 bg-white p-2">
                                                                <img src={opt.image} className="w-full h-full object-contain" alt="" />
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col items-center gap-0.5 w-full">
                                                            <span className="font-bold text-sm leading-tight">{opt.label}</span>
                                                            {opt.size && <span className="text-[10px] text-gray-500 font-medium">{opt.size}</span>}
                                                            {opt.description && <span className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{opt.description}</span>}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Color Variation */}
                                {(() => {
                                    const colorVariation = product.variations?.find(v => v.name.toLowerCase() === 'color');
                                    if (!colorVariation || !colorVariation.options || colorVariation.options.length === 0) return null;

                                    return (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Select Color</h3>
                                            <div className="flex flex-nowrap md:flex-wrap gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                                {colorVariation.options.map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => handleVariationChange(colorVariation.id, opt, colorVariation.name)}
                                                        className={`shrink-0 relative group p-1.5 rounded-xl border-2 transition-all ${selectedVariations[colorVariation.id]?.id === opt.id ? 'border-primary bg-purple-50 ring-2 ring-primary ring-offset-1' : 'border-gray-200 hover:border-primary bg-white'}`}
                                                    >
                                                        <div className="flex flex-col items-center gap-2 min-w-[60px]">
                                                            {opt.image && <img src={opt.image} className="w-12 h-12 rounded-lg object-cover shadow-sm" alt={opt.label} />}
                                                            <div className="text-center leading-tight">
                                                                <span className="text-xs font-bold text-gray-800 block">{opt.label}</span>
                                                                {opt.size && <span className="text-[8px] text-gray-500 font-medium block">{opt.size}</span>}
                                                                {opt.description && <span className="text-[8px] text-gray-400 font-medium block">{opt.description}</span>}
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
                                    if (!lightBaseVariation || !lightBaseVariation.options || lightBaseVariation.options.length === 0) return null;

                                    return (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">{lightBaseVariation.name}</h3>
                                            <div className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                                {lightBaseVariation.options.map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => handleVariationChange(lightBaseVariation.id, opt, lightBaseVariation.name)}
                                                        className={`shrink-0 w-32 md:w-40 p-3 text-sm rounded-xl border-2 transition-all flex flex-col items-center justify-start gap-2 text-center ${selectedVariations[lightBaseVariation.id]?.id === opt.id ? 'border-primary bg-purple-50 text-primary ring-2 ring-primary ring-offset-1 shadow-md' : 'border-gray-200 text-gray-700 hover:border-primary hover:bg-gray-50'}`}
                                                    >
                                                        {opt.image && (
                                                            <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-100 bg-white">
                                                                <img src={opt.image} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col items-center gap-0.5 w-full">
                                                            <span className="font-bold text-xs leading-tight">{opt.label}</span>
                                                            {opt.size && <span className="text-[10px] text-gray-500 font-medium">{opt.size}</span>}
                                                            {opt.description && <span className="text-[10px] text-gray-400 line-clamp-2">{opt.description}</span>}
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








                                {/* Gift Receiver's Location */}
                                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                                        <MapPin className="w-4 h-4 text-orange-500" />
                                        Gift Receiver's Location
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative shrink-0 w-28">
                                            <button
                                                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                                className="w-full h-11 pl-3 pr-2 bg-white border border-gray-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-bold flex items-center justify-between hover:border-orange-300 transition-colors"
                                            >
                                                <span className="truncate flex items-center gap-1">
                                                    <span>{COUNTRIES.find(c => c.code === receiverCountry)?.flag}</span>
                                                    <span>{receiverCountry}</span>
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {isCountryDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setIsCountryDropdownOpen(false)}></div>
                                                    <div className="models-dropdown absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden animate-slide-down">
                                                        <div className="p-2 border-b border-gray-50 bg-gray-50/50 sticky top-0">
                                                            <div className="relative">
                                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                                <input
                                                                    type="text"
                                                                    value={countrySearchQuery}
                                                                    onChange={(e) => setCountrySearchQuery(e.target.value)}
                                                                    placeholder="Search country..."
                                                                    className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                                                                    autoFocus
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
                                                            {COUNTRIES
                                                                .filter(c => c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) || c.code.toLowerCase().includes(countrySearchQuery.toLowerCase()))
                                                                .map(country => (
                                                                    <button
                                                                        key={country.code}
                                                                        onClick={() => {
                                                                            setReceiverCountry(country.code);
                                                                            setIsCountryDropdownOpen(false);
                                                                            setCountrySearchQuery('');
                                                                        }}
                                                                        className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between hover:bg-orange-50 transition-colors ${receiverCountry === country.code ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-700'}`}
                                                                    >
                                                                        <span className="flex items-center gap-2">
                                                                            <span>{country.flag}</span>
                                                                            <span>{country.name}</span>
                                                                        </span>
                                                                        {receiverCountry === country.code && <CheckCircle className="w-3.5 h-3.5 text-orange-600" />}
                                                                    </button>
                                                                ))
                                                            }
                                                            {COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) || c.code.toLowerCase().includes(countrySearchQuery.toLowerCase())).length === 0 && (
                                                                <div className="p-3 text-center text-xs text-gray-400">
                                                                    No country found
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={receiverLocation}
                                                onChange={(e) => setReceiverLocation(e.target.value)}
                                                placeholder="Enter Pincode or Area"
                                                className="w-full h-11 pl-4 pr-24 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition-all placeholder:text-gray-400"
                                            />
                                            <button
                                                onClick={handleCheckLocation}
                                                disabled={locationStatus === 'loading'}
                                                className="absolute right-1 top-1 bottom-1 px-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-orange-500 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[70px]"
                                            >
                                                {locationStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
                                            </button>
                                        </div>
                                    </div>

                                    {locationStatus === 'success' && (
                                        <p className="text-[10px] text-green-600 mt-2 flex items-center gap-1.5 ml-1 font-bold animate-fade-in">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            {locationMessage}
                                        </p>
                                    )}

                                    {locationStatus === 'error' && (
                                        <p className="text-[10px] text-red-500 mt-2 flex items-center gap-1.5 ml-1 font-bold animate-fade-in">
                                            <X className="w-3 h-3" />
                                            {locationMessage}
                                        </p>
                                    )}
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

                                {/* About the Product Tabs */}
                                <div className="mt-8 border-t border-gray-100 pt-6">
                                    <h4 className="font-bold text-gray-900 mb-4 text-lg">About the product</h4>

                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {(() => {
                                            const standardTabs = [
                                                { id: 'description', title: 'Description' },
                                                { id: 'instructions', title: 'Instructions' },
                                                { id: 'delivery', title: 'Delivery Info' }
                                            ];

                                            // Get custom sections that aren't one of the standard three (by checking aliases)
                                            const customSections = (product.aboutSections || []).filter(s =>
                                                !s.isHidden &&
                                                !['description', 'desc', 'instructions', 'instr', 'inst', 'delivery', 'del'].includes(s.id.toLowerCase())
                                            );

                                            return [...standardTabs, ...customSections].map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setDescriptionTab(descriptionTab === tab.id ? null : tab.id)}
                                                    className={`
                                                        px-3 py-1.5 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all border-2
                                                        ${(
                                                            descriptionTab === tab.id ||
                                                            (['description', 'desc'].includes(descriptionTab!) && ['description', 'desc'].includes(tab.id)) ||
                                                            (['instructions', 'instr', 'inst'].includes(descriptionTab!) && ['instructions', 'instr', 'inst'].includes(tab.id)) ||
                                                            (['delivery', 'del'].includes(descriptionTab!) && ['delivery', 'del'].includes(tab.id))
                                                        )
                                                            ? 'bg-[#E8F5E9] border-[#4CAF50] text-[#1B5E20]'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
                                                    `}
                                                >
                                                    {tab.title}
                                                </button>
                                            ));
                                        })()}
                                    </div>

                                    {descriptionTab && (
                                        <div
                                            key={descriptionTab}
                                            className="text-gray-600 leading-relaxed space-y-4 text-sm md:text-base min-h-[100px] bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 animate-fade-in"
                                        >
                                            {(() => {
                                                const dynamic = (() => {
                                                    const cat = (product.category || '').toLowerCase();
                                                    const nm = (product.name || '').toLowerCase();

                                                    if (cat.includes('t-shirt') || nm.includes('t-shirt') || cat.includes('apparel')) {
                                                        return {
                                                            description: [
                                                                "Premium Quality Fabric: Soft, breathable cotton-rich blend for all-day comfort.",
                                                                "High-Definition Digital Printing: Vibrant colors with long-lasting print durability.",
                                                                "Comfortable Fit: Precision-cut for a modern, relaxed silhouette.",
                                                                "Perfect Personalized Gift: Ideal for special occasions, team wear, or personal keepsakes."
                                                            ],
                                                            instructions: [
                                                                "Fabric Care: Machine wash cold with similar colors, inside out.",
                                                                "Ironing: Do not iron directly on the printed area; iron on the reverse side.",
                                                                "Detergent: Use mild detergent only; do not bleach or dry clean.",
                                                                "Drying: Tumble dry low or hang dry in shade to maintain print quality."
                                                            ]
                                                        };
                                                    }
                                                    if (cat.includes('crystal') || cat.includes('glass') || nm.includes('crystal')) {
                                                        return {
                                                            description: [
                                                                "Optical Grade K9 Crystal: High-purity crystal with exceptional clarity and brilliance.",
                                                                "Advanced 3D Laser Engraving: Intricate designs etched deep inside for a lifetime of beauty.",
                                                                "Polished Edges: Smooth, bevelled finishes that catch and reflect light elegantly.",
                                                                "Premium Keepsake: A sophisticated decor piece for home or executive office spaces."
                                                            ],
                                                            instructions: [
                                                                "Handling: Handle with care to avoid chipping or surface scratches.",
                                                                "Cleaning: Gently wipe with a soft, lint-free microfiber cloth for a streak-free shine.",
                                                                "Lighting Notes: Place on an LED light base (if available) to bring out the 3D details.",
                                                                "Avoid: Keep away from direct heat and harsh chemical cleaners."
                                                            ]
                                                        };
                                                    }
                                                    if (cat.includes('mug') || nm.includes('mug')) {
                                                        return {
                                                            description: [
                                                                "High-Grade Ceramic: Durable material with a smooth, glossy premium finish.",
                                                                "Vibrant Sublimation Print: Full-color wrap-around graphics that won't fade.",
                                                                "Ergonomic Handle: Designed for a comfortable grip while enjoying hot or cold beverages.",
                                                                "Everyday Utility: Dishwasher-friendly (standard white) and microwave safe."
                                                            ],
                                                            instructions: [
                                                                "Washing: Gentle hand wash with a soft sponge is recommended for longest print life.",
                                                                "Scrubbing: Avoid using metallic scrubbers or abrasive pads on the printed design.",
                                                                "Heat: Durable for boiling liquids; avoid sudden extreme temperature changes.",
                                                                "Storage: Store in a dry place to maintain the outer glossy coating."
                                                            ]
                                                        };
                                                    }
                                                    if (cat.includes('lamp') || nm.includes('lamp') || cat.includes('light')) {
                                                        return {
                                                            description: [
                                                                "Ambient Illumination: Low-energy LED light source providing a warm, comforting glow.",
                                                                "Custom Acrylic Panel: High-transparency acrylic with precision-etched personalized detail.",
                                                                "Sleek Support Base: Modern, sturdy base design with integrated power controls.",
                                                                "Versatile Decor: Ideal as a bedroom night light, nursery lamp, or personalized desk accessory."
                                                            ],
                                                            instructions: [
                                                                "Power Safety: Use only the provided USB cable or recommended 5V adapter.",
                                                                "Surface Cleaning: Use a dry, soft cloth to remove fingerprints from the acrylic panel.",
                                                                "Usage: Do not leave the lamp powered on continuously for more than 24 hours.",
                                                                "Handling: Do not touch the internal LED components or electrical parts."
                                                            ]
                                                        };
                                                    }
                                                    if (cat.includes('wood') || cat.includes('mdf') || cat.includes('frame') || nm.includes('frame')) {
                                                        return {
                                                            description: [
                                                                "Quality Craftsmanship: Made from high-density MDF or natural wood with a refined finish.",
                                                                "High-Resolution Print/Engraving: Sharp details with UV-resistant inks or laser precision.",
                                                                "Easy Display: Designed for quick wall mounting or stable tabletop placement.",
                                                                "Timeless Aesthetic: Neutral wood tones that complement any interior decor style."
                                                            ],
                                                            instructions: [
                                                                "Dusting: Regularly wipe with a soft, dry cloth to prevent dust buildup.",
                                                                "Moisture Protection: Keep in a dry, well-ventilated area; avoid damp environment.",
                                                                "Sunlight Exposure: Avoid prolonged direct sunlight to prevent natural wood fading.",
                                                                "Maintenance: Do not use wet wipes or water-based cleaners on engraved areas."
                                                            ]
                                                        };
                                                    }
                                                    // Fallback
                                                    return {
                                                        description: product.description ? product.description.split('\n') : ["Premium quality personalized gift.", "Expertly crafted for your special moments."],
                                                        instructions: [
                                                            "Handle with care to maintain the product's finish and longevity.",
                                                            "Clean with a soft, dry cloth to remove dust and fingerprints.",
                                                            "Keep in a cool, dry place away from direct moisture or humidity.",
                                                            "Avoid exposure to harsh chemicals or abrasive cleaning agents."
                                                        ]
                                                    };
                                                })();

                                                const currentSection = product.aboutSections?.find(s => s.id === descriptionTab);
                                                const dbContent = currentSection?.content;

                                                if (descriptionTab === 'description' || descriptionTab === 'desc') {
                                                    return (
                                                        <div className="animate-fade-in">
                                                            <h5 className="font-bold text-gray-900 mb-2">Product Details:</h5>
                                                            <div className="space-y-2 mb-4">
                                                                {dbContent ? (
                                                                    dbContent.split('\n').map((line, idx) => (
                                                                        <p key={idx} className="flex gap-2">
                                                                            <span className="text-gray-400 mt-1.5">•</span>
                                                                            <span>{line}</span>
                                                                        </p>
                                                                    ))
                                                                ) : (
                                                                    dynamic.description.map((line, idx) => (
                                                                        <p key={idx} className="flex gap-2">
                                                                            <span className="text-gray-400 mt-1.5">•</span>
                                                                            <span>{line}</span>
                                                                        </p>
                                                                    ))
                                                                )}
                                                            </div>
                                                            <ul className="space-y-1 text-gray-500 text-sm mt-4 pt-4 border-t border-gray-100">
                                                                <li className="flex gap-2"><span className="text-gray-400">•</span> Net Quantity: 1 Unit</li>
                                                                <li className="flex gap-2"><span className="text-gray-400">•</span> Country of Origin: India</li>
                                                            </ul>
                                                        </div>
                                                    );
                                                }
                                                if (descriptionTab === 'instructions' || descriptionTab === 'inst' || descriptionTab === 'instr') {
                                                    return (
                                                        <div className="animate-fade-in space-y-3">
                                                            {dbContent ? (
                                                                dbContent.split('\n').map((line, idx) => (
                                                                    <p key={idx} className="flex gap-2">
                                                                        <span className="text-gray-400 mt-1.5">•</span>
                                                                        <span>{line}</span>
                                                                    </p>
                                                                ))
                                                            ) : (
                                                                dynamic.instructions.map((line, idx) => (
                                                                    <p key={idx} className="flex gap-2">
                                                                        <span className="text-gray-400 mt-1.5">•</span>
                                                                        <span>{line}</span>
                                                                    </p>
                                                                ))
                                                            )}
                                                        </div>
                                                    );
                                                }

                                                if (descriptionTab === 'delivery' || descriptionTab === 'del') {
                                                    return (
                                                        <div className="animate-fade-in space-y-4">
                                                            <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md group/delivery">
                                                                <div className="bg-green-50 p-2.5 rounded-lg group-hover/delivery:bg-green-100 transition-colors">
                                                                    <Truck className="w-5 h-5 text-green-600 shrink-0" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 text-base">Shipping</p>
                                                                    <p className="text-sm text-gray-500 mt-0.5">Delivery in 5-7 business days across India.</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md group/delivery">
                                                                <div className="bg-purple-50 p-2.5 rounded-lg group-hover/delivery:bg-purple-100 transition-colors">
                                                                    <Clock className="w-5 h-5 text-purple-600 shrink-0" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 text-base">Processing</p>
                                                                    <p className="text-sm text-gray-500 mt-0.5">Delivery time depends on location and courier partner.</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md group/delivery">
                                                                <div className="bg-orange-50 p-2.5 rounded-lg group-hover/delivery:bg-orange-100 transition-colors">
                                                                    <RefreshCcw className="w-5 h-5 text-orange-600 shrink-0" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 text-base">Returns</p>
                                                                    <p className="text-sm text-gray-500 mt-0.5">7-day replacement policy for damaged items.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                // Final Fallback for custom sections from DB
                                                if (currentSection?.content) {
                                                    return (
                                                        <div className="animate-fade-in whitespace-pre-wrap">
                                                            {currentSection.content.split('\n').map((line, idx) => (
                                                                <p key={idx} className="flex gap-2 mb-2 last:mb-0">
                                                                    <span className="text-gray-400 mt-1.5">•</span>
                                                                    <span>{line}</span>
                                                                </p>
                                                            ))}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    )}
                                </div>




                            </div>

                            {/* Available Offers Box */}
                            {!product.isComboOffer && (
                                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 animate-fade-in">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-orange-50 p-1.5 rounded-lg">
                                            <Tag className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Available Offers</h3>
                                    </div>

                                    <div className="space-y-3">
                                        {isLoadingCoupons ? (
                                            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                                {[1, 2].map(i => (
                                                    <div key={i} className="min-w-[220px] h-24 bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />
                                                ))}
                                            </div>
                                        ) : availableCoupons.length > 0 ? (
                                            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                                {availableCoupons.map((coupon) => (
                                                    <div
                                                        key={coupon.id}
                                                        className="min-w-[220px] p-4 rounded-2xl border-2 border-dashed border-primary/10 bg-gradient-to-br from-white to-purple-50/30 flex flex-col gap-2 relative overflow-hidden group hover:border-primary/30 transition-all"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] font-black text-primary px-2.5 py-1 bg-white border border-primary/20 rounded shadow-sm uppercase tracking-widest">
                                                                {coupon.code}
                                                            </span>
                                                            <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                                {coupon.discountType === 'PERCENTAGE' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 font-bold leading-tight line-clamp-2 min-h-[1.5rem]">
                                                            {coupon.discountType === 'B2G1' ? 'Buy 2 Get 1 FREE' : `Get ${coupon.discountType === 'PERCENTAGE' ? `${coupon.value}%` : `₹${coupon.value}`} off ${coupon.minPurchase ? `on orders above ₹${coupon.minPurchase}` : 'on your purchase'}.`}
                                                        </p>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(coupon.code);
                                                                showNotification(`Code '${coupon.code}' copied!`, "success");
                                                            }}
                                                            className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1 hover:text-purple-800 flex items-center gap-1.5 transition-colors group/btn"
                                                        >
                                                            Copy Code <ArrowRight className="w-2.5 h-2.5 group-hover/btn:translate-x-1 transition-transform" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic font-medium ml-1">No special offers available at the moment.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons - Fixed at bottom for mobile, docked at bottom for desktop */}
                        <div className="fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto p-3 md:p-4 bg-white border-t border-gray-100 z-50 flex gap-3 md:gap-4 shadow-[0_-4px_15px_rgba(0,0,0,0.08)] lg:shadow-none lg:bg-transparent lg:border-none lg:pt-6">
                            <button onClick={handleAddToCartClick} className="flex-1 bg-primary text-white py-3 md:py-4 rounded-xl font-bold hover:bg-purple-800 shadow-lg shadow-primary/20 transition-all active:scale-95 text-xs md:text-base">Customize & Add to Cart</button>
                            <button onClick={handleBuyNowClick} className="flex-1 bg-white border-2 border-primary text-primary py-3 md:py-4 rounded-xl font-bold hover:bg-purple-50 transition-all active:scale-95 text-xs md:text-base shadow-sm">Buy Now</button>
                        </div>
                    </div>
                </div>

                {/* Customization Modal */}
                {isCustomizeModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up relative flex flex-col max-h-[90vh]">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-purple-50 to-white p-6 border-b border-gray-100 relative">
                                <button
                                    onClick={() => setIsCustomizeModalOpen(false)}
                                    className="absolute top-4 right-4 p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm transition-colors border border-gray-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <h2 className="text-xl font-bold text-gray-900 text-center">Personalize Your Gift</h2>

                                {/* Steps Indicator */}
                                <div className="flex items-center justify-center gap-4 mt-6">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${customizeStep === 1 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-green-500 text-white'}`}>
                                        {customizeStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                                    </div>
                                    <div className={`w-12 h-1 rounded-full transition-colors ${customizeStep > 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${customizeStep === 2 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-100 text-gray-400'}`}>
                                        2
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto">
                                {customizeStep === 1 ? (
                                    <div className="space-y-6">
                                        <div className="text-center space-y-2">
                                            <h3 className="font-bold text-gray-900">Upload Photo <span className="text-gray-400 font-normal">(Required)</span></h3>
                                            <p className="text-xs text-gray-500">Clear front-facing photo recommended</p>
                                        </div>

                                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 transition-all hover:bg-gray-100 group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="photo-upload"
                                                multiple
                                            />

                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                                {customImages.map((img, index) => (
                                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm animate-fade-in group/item">
                                                        <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={() => handleRemoveImage(index)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-md transition-transform hover:scale-110 opacity-0 group-hover/item:opacity-100"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}

                                                {customImages.length < 15 && (
                                                    <label htmlFor="photo-upload" className="flex flex-col items-center justify-center gap-1 cursor-pointer aspect-square bg-white rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group/add">
                                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover/add:scale-110 transition-transform">
                                                            <Plus className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-primary">Add More</span>
                                                    </label>
                                                )}
                                            </div>

                                            {customImages.length === 0 && (
                                                <label htmlFor="photo-upload" className="flex flex-col items-center gap-3 cursor-pointer py-8">
                                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 group-hover:scale-110 transition-transform">
                                                        <Sparkles className="w-8 h-8 text-primary" />
                                                    </div>
                                                    <button className="px-6 py-2.5 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors pointer-events-none">
                                                        Upload Up to 15 Photos
                                                    </button>
                                                </label>
                                            )}
                                        </div>

                                        <p className="text-xs text-center text-gray-500 -mt-2">
                                            Our designers will adjust your image and share a preview before production.
                                        </p>

                                        {/* Extra Image Charges Notice */}
                                        <div className="bg-amber-50/50 border border-amber-100/60 rounded-xl p-3.5">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-amber-600 text-sm">⚠️</span>
                                                <h4 className="font-bold text-amber-900/80 text-[11px] uppercase tracking-wider">Extra Image Charges (if applicable)</h4>
                                            </div>
                                            <p className="text-[10px] text-amber-800/70 leading-relaxed font-medium">
                                                Uploading more than the required number of images may include additional charges.
                                                The final amount will be confirmed during WhatsApp design approval.
                                            </p>
                                        </div>

                                        {/* Notice Box */}
                                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start gap-3">
                                            <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-amber-800 text-sm">No Approval, No Production</h4>
                                                <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                                                    We will send a design preview for your approval on WhatsApp soon. Orders are only produced after you confirm your design!
                                                </p>
                                            </div>
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => {
                                                    setIsCustomizeModalOpen(false);
                                                    executeAddToCart(false, null, ""); // Skip entirely
                                                }}
                                                className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                            >
                                                Skip & Personalize Later
                                            </button>
                                            <button
                                                onClick={() => setCustomizeStep(2)}
                                                className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-bold text-sm hover:bg-purple-800 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                            >
                                                Next Step
                                            </button>
                                        </div>

                                        <div className="mt-6 flex flex-col gap-1 items-center text-center">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1" title="Frequent Reorders"><MessageCircle className="w-3.5 h-3.5" /> Frequent Reorders</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="flex items-center gap-1" title="Fast Design Approval"><Clock className="w-3.5 h-3.5" /> Fast Design Approval</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                                                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                                <span>Loved by 10,000+ Customers</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-slide-in-right">
                                        <div className="text-center">
                                            <h3 className="font-bold text-gray-900">Add Text <span className="text-gray-400 font-normal">(Optional)</span></h3>
                                        </div>

                                        <div>
                                            <input
                                                type="text"
                                                value={customText}
                                                onChange={(e) => setCustomText(e.target.value)}
                                                placeholder="Enter your personalized message"
                                                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base outline-none bg-gray-50 focus:bg-white"
                                            />
                                            <p className="text-center text-xs text-gray-400 mt-2 mb-6">Example: "Happy Birthday Mom!", "Love You Forever"</p>

                                            {/* Extra Text Charges Notice */}
                                            <div className="bg-amber-50/50 border border-amber-100/60 rounded-xl p-3.5 mt-4">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="text-amber-600 text-sm">⚠️</span>
                                                    <h4 className="font-bold text-amber-900/80 text-[11px] uppercase tracking-wider">Extra Text Charges (if applicable)</h4>
                                                </div>
                                                <p className="text-[10px] text-amber-800/70 leading-relaxed font-medium">
                                                    Additional multiple names or longer custom messages may include extra charges.
                                                    The final amount will be shared during WhatsApp design approval.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Notice Box (Repeated) */}
                                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start gap-3">
                                            <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-amber-800 text-sm">No Approval, No Production</h4>
                                                <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                                                    We will send a design preview on WhatsApp soon. Orders are only produced after you confirm your design!
                                                </p>
                                            </div>
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => setCustomizeStep(1)}
                                                className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                            >
                                                Previous Step
                                            </button>
                                            <button
                                                onClick={handleModalAddToCart}
                                                disabled={isUploading}
                                                className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-bold text-sm hover:bg-purple-800 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    'Add to Cart'
                                                )}
                                            </button>
                                        </div>

                                        <div className="mt-6 flex flex-col gap-1 items-center text-center">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> Frequent Reorders</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Fast Design Approval</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                                                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                                <span>Loved by 10,000+ Customers</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Related Products Section */}
                {/* MOVED CUSTOMER REVIEWS SECTION */}
                <div ref={reviewsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Ratings & Reviews</h3>

                    {/* Overall Rating & Distribution */}
                    {/* Overall Rating & Distribution - Compact & Enhanced */}
                    <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm mb-8 max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center">
                            {/* Left: Score */}
                            <div className="text-center md:text-left md:pr-8 md:border-r border-gray-100">
                                <div className="text-5xl font-black text-gray-900 tracking-tight leading-none mb-1">
                                    {product.rating || 0}
                                    <span className="text-lg text-gray-400 font-medium ml-1">/5</span>
                                </div>
                                <div className="flex justify-center md:justify-start text-yellow-400 gap-1 my-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.round(product.rating || 0) ? 'fill-current text-yellow-400' : 'text-gray-200 fill-gray-100'}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-gray-500 text-xs font-medium">
                                    Based on {productReviews.length} Verified Reviews
                                </p>
                            </div>

                            {/* Right: Bars */}
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map(star => {
                                    const count = productReviews.filter(r => Math.round(r.rating) === star).length;
                                    const percentage = productReviews.length > 0 ? (count / productReviews.length) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-3 group">
                                            <div className="flex items-center gap-1 w-12 shrink-0">
                                                <span className="text-sm font-bold text-gray-700">{star}</span>
                                                <Star className="w-3 h-3 text-gray-300 fill-current" />
                                            </div>
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${percentage > 0
                                                        ? (star >= 4 ? 'bg-green-500' : star === 3 ? 'bg-yellow-400' : 'bg-red-500')
                                                        : 'bg-transparent'
                                                        }`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-gray-400 w-8 text-right tabular-nums group-hover:text-gray-600 transition-colors">
                                                {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg">Customer Reviews</h4>
                        </div>
                    </div>

                    {/* Reviews Grid (FNP Style) */}
                    <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x">
                        {productReviews.length === 0 ? (
                            <div className="w-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 shrink-0">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-gray-400">
                                    <MessageCircle className="w-8 h-8" />
                                </div>
                                <h4 className="font-bold text-gray-900">No reviews yet</h4>
                                <p className="text-gray-500 text-sm mt-1">Be the first to share your experience!</p>
                            </div>
                        ) : (
                            productReviews.slice(0, showAllReviews ? undefined : 10).map((review, idx) => (
                                <div key={idx} className="min-w-[280px] md:min-w-[320px] lg:min-w-[calc(20%-16px)] snap-start bg-white border border-gray-100 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col h-full">

                                    {/* Card Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold uppercase tracking-wider shrink-0">
                                            {review.userName ? review.userName.substring(0, 2) : 'CU'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm leading-tight truncate max-w-[140px]">{review.userName || 'Customer'}</h4>
                                            <span className="text-[11px] text-gray-400 font-medium">
                                                {/* Mock "time ago" for demo, or real date */}
                                                {new Date(review.date || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stars */}
                                    <div className="flex text-green-600 mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                        ))}
                                    </div>

                                    {/* Review Content */}
                                    <div className="flex-1 mb-4">
                                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                                            {review.comment}
                                        </p>
                                    </div>

                                    {/* Card Footer tags */}
                                    <div className="pt-3 border-t border-gray-50 flex flex-wrap gap-2 mt-auto">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-[10px] font-medium text-gray-500">
                                            {product.category || 'Gift'}
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-[10px] font-medium text-gray-500">
                                            {review.location || 'India'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Show All Reviews Button */}
                    {productReviews.length > 4 && !showAllReviews && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setShowAllReviews(true)}
                                className="px-6 py-2 border border-gray-300 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                            >
                                Show All Reviews ({productReviews.length})
                            </button>
                        </div>
                    )}
                </div>

                <RecentlyViewedDetails />

                <div className="py-12 mt-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2 block animate-fade-in">You May Also Like</span>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Related Products</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex gap-2">
                                    <button
                                        onClick={() => relatedScrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                                        className="p-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors shadow-sm"
                                        aria-label="Scroll Left"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => relatedScrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                                        className="p-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors shadow-sm"
                                        aria-label="Scroll Right"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                                <button onClick={() => navigate(`/shop?category=${encodeURIComponent(product.category)}`)} className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all text-sm">
                                    View All <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div
                            ref={relatedScrollRef}
                            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {products
                                .filter(p => p.category === product.category && p.id !== product.id)
                                .slice(0, 10)
                                .map(related => (
                                    <div key={related.id} className="min-w-[160px] md:min-w-[220px] snap-start relative group">
                                        <ProductCard
                                            product={related}
                                            formatPrice={formatPrice}
                                            onProductClick={(id) => { navigate(`/product/${id}`); window.scrollTo(0, 0); }}
                                        />
                                    </div>
                                ))}
                        </div>

                        <button onClick={() => navigate(`/shop?category=${encodeURIComponent(product.category)}`)} className="w-full md:hidden flex justify-center items-center gap-2 text-primary font-bold py-3 bg-gray-50 rounded-xl mt-4 border border-gray-100">
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
            </div>
        </div>
    );
};
