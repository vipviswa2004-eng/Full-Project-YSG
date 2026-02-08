import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context';
import { Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp, Star, X, MapPin } from 'lucide-react';
import { SEO } from '../components/SEO';

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    customization?: any;
    customName?: string;
    customImage?: string;
    selectedVariations?: Record<string, any>;
}

interface Order {
    id: string;
    _id: string;
    date: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Design Pending' | 'Design Sent';
    total: number;
    items: OrderItem[];
    orderId: string;
    paymentStatus?: 'Paid' | 'Unpaid' | 'Refunded';
}

export const Orders: React.FC = () => {
    const { user } = useCart();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

    // Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewLocation, setReviewLocation] = useState('');
    const [selectedProductForReview, setSelectedProductForReview] = useState<{ id: string, name: string, image: string } | null>(null);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        if (!user) {
            // If not logged in, redirect home or show empty
            // navigate('/'); 
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/my-orders?email=${encodeURIComponent(user.email)}`, {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                    // Expand the first order by default
                    if (data.length > 0) {
                        setExpandedOrders([data[0]._id || data[0].id]);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const toggleOrder = (orderId: string) => {
        setExpandedOrders(prev =>
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'text-green-600 bg-green-50 border-green-200';
            case 'Shipped': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'Processing': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'Cancelled': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const openReviewModal = (product: { id: string, name: string, image: string }) => {
        setSelectedProductForReview(product);
        setReviewRating(5);
        setReviewComment('');
        setReviewLocation('');
        setIsReviewModalOpen(true);
    };

    const handleSubmitReview = async () => {
        if (!selectedProductForReview || !user) return;

        setIsSubmittingReview(true);
        try {
            const reviewData = {
                productId: selectedProductForReview.id,
                userName: user.displayName || user.email.split('@')[0],
                userAvatar: user.image,
                rating: reviewRating,
                comment: reviewComment,
                location: reviewLocation,
                date: new Date(),
                status: 'Pending' // Auto-approved? Or pending. Schema says Pending default.
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            });

            if (response.ok) {
                alert('Review submitted successfully!');
                setIsReviewModalOpen(false);
            } else {
                alert('Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error submitting review');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex justify-center">
                <SEO title="Loading Orders" noindex={true} />
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                    <div className="h-64 w-full max-w-2xl bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-app-bg pt-20 pb-12 flex flex-col items-center justify-center px-4">
                <SEO title="My Orders" noindex={true} />
                <div className="text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">My Orders</h2>
                    <p className="text-gray-500 mb-6">Please log in to view your order history.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-app-bg pt-8 pb-12">
            <SEO title="My Orders" noindex={true} />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-black text-gray-900 mb-8">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't placed any orders yet. Start shopping to find the perfect gift!</p>
                        <button
                            onClick={() => navigate('/shop')}
                            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-purple-800 transition-colors shadow-lg shadow-purple-500/20"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id || order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md group">
                                {/* Order Header */}
                                <div
                                    className="p-6 cursor-pointer bg-white hover:bg-gray-50/50 transition-colors"
                                    onClick={() => toggleOrder(order._id || order.id)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-start gap-5">
                                            <div className="bg-primary/5 p-4 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                                                <Package className="w-8 h-8 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="font-bold text-xl text-gray-900">
                                                        #{order.orderId || (order._id ? order._id.slice(-6).toUpperCase() : 'UNKNOWN')}
                                                    </h3>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(order.status)}`}>
                                                        {order.status === 'Delivered' && <CheckCircle className="w-3.5 h-3.5" />}
                                                        {order.status === 'Shipped' && <Truck className="w-3.5 h-3.5" />}
                                                        {order.status === 'Processing' && <Clock className="w-3.5 h-3.5" />}
                                                        {(order.status === 'Design Pending' ? 'Design in Progress' : order.status === 'Design Sent' ? 'Design Shared' : order.status)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                                                    Placed on {new Date(order.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                                                <p className="font-extrabold text-gray-900 text-2xl">₹{order.total?.toLocaleString()}</p>
                                                <div className="flex justify-end mt-1">
                                                    {(order.paymentStatus === 'Unpaid') ? (
                                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wide">Payment: Unpaid</span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 uppercase tracking-wide">Payment: Paid</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`p-2 rounded-full transition-colors ${expandedOrders.includes(order._id || order.id) ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                {expandedOrders.includes(order._id || order.id) ? (
                                                    <ChevronUp className="w-6 h-6" />
                                                ) : (
                                                    <ChevronDown className="w-6 h-6" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Details (Expanded) */}
                                {(expandedOrders.includes(order._id || order.id)) && (
                                    <div className="border-t border-gray-100 bg-gray-50/50 p-6 animate-slide-down">
                                        <div className="space-y-4">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row gap-6 items-start bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
                                                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                                        <img
                                                            src={(() => {
                                                                if (item.customImage) {
                                                                    try {
                                                                        if (item.customImage.startsWith('[')) {
                                                                            const imgs = JSON.parse(item.customImage);
                                                                            return imgs[0] || item.image;
                                                                        }
                                                                    } catch (e) { }
                                                                    return item.customImage;
                                                                }
                                                                return item.image;
                                                            })()}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                                                        />
                                                    </div>

                                                    <div className="flex-1 min-w-0 space-y-3">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h4>
                                                            <p className="text-sm text-primary font-bold">Qty: {item.quantity}</p>
                                                        </div>

                                                        {/* Specs Grid */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {item.selectedVariations && Object.entries(item.selectedVariations).length > 0 && (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {Object.entries(item.selectedVariations).map(([key, value]: [string, any]) => {
                                                                        // Clean up key name: size_variation -> Size
                                                                        const label = key.replace(/_variation$/i, '').replace(/_/g, ' ');
                                                                        const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);

                                                                        return (
                                                                            <span key={key} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                                                <span className="opacity-60 mr-1">{formattedLabel}:</span> {value.label}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}

                                                            {/* If no variations and no custom name, show standard badge */}
                                                            {(!item.selectedVariations || Object.keys(item.selectedVariations).length === 0) && !item.customName && (
                                                                <span className="inline-flex max-w-max px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">Standard Variant</span>
                                                            )}
                                                        </div>

                                                        {/* Customization Section */}
                                                        {(item.customName || item.customImage) && (
                                                            <div className="flex flex-wrap gap-3 mt-2">
                                                                {item.customName && (
                                                                    <div className="flex items-start gap-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 max-w-full">
                                                                        <div className="shrink-0 mt-0.5">
                                                                            <span className="block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-0.5">Custom Text</p>
                                                                            <p className="text-sm text-gray-700 italic font-medium">"{item.customName}"</p>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {item.customImage && (
                                                                    <div className="flex flex-col gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                                                        <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Photo{item.customImage.startsWith('[') && JSON.parse(item.customImage).length > 1 ? 's' : ''} Uploaded</p>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {(() => {
                                                                                try {
                                                                                    if (item.customImage?.startsWith('[')) {
                                                                                        const imgs = JSON.parse(item.customImage);
                                                                                        return imgs.map((img: string, i: number) => (
                                                                                            <div key={i} className="shrink-0 w-10 h-10 rounded-md overflow-hidden bg-gray-200 border border-blue-200 shadow-sm">
                                                                                                <img src={img} className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform" alt={`Custom ${i + 1}`} onClick={() => window.open(img, '_blank')} />
                                                                                            </div>
                                                                                        ));
                                                                                    }
                                                                                } catch (e) { }
                                                                                return (
                                                                                    <div className="shrink-0 w-10 h-10 rounded-md overflow-hidden bg-gray-200 border border-blue-200 shadow-sm">
                                                                                        <img src={item.customImage} className="w-full h-full object-cover" alt="Custom upload" />
                                                                                    </div>
                                                                                );
                                                                            })()}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-row sm:flex-col items-center sm:items-end w-full sm:w-auto gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:pl-6 sm:border-l sm:border-gray-100">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const message = `Hi, I would like to track my order #${order.orderId || order._id}.`;
                                                                window.open(`https://wa.me/916380016798?text=${encodeURIComponent(message)}`, '_blank');
                                                            }}
                                                            className="flex-1 sm:flex-none w-full sm:w-32 py-2 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Truck className="w-4 h-4" /> Track
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Simple invoice print view
                                                                const invoiceContent = `
                                                                    <html>
                                                                    <head>
                                                                        <title>Invoice #${order.orderId}</title>
                                                                        <style>
                                                                            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                                                                            .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                                                                            .logo { font-size: 24px; font-weight: bold; color: #5f259f; }
                                                                            .invoice-details { text-align: right; }
                                                                            .item { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 15px 0; }
                                                                            .total { text-align: right; margin-top: 30px; font-size: 20px; font-weight: bold; }
                                                                            .footer { margin-top: 50px; text-align: center; color: #888; font-size: 12px; }
                                                                        </style>
                                                                    </head>
                                                                    <body>
                                                                        <div class="header">
                                                                            <div class="logo">SIGN GALAXY</div>
                                                                            <div class="invoice-details">
                                                                                <p><strong>Order ID:</strong> ${order.orderId || order._id}</p>
                                                                                <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <h3>Order Summary</h3>
                                                                        
                                                                        ${order.items.map(i => `
                                                                            <div class="item">
                                                                                <div>
                                                                                    <strong>${i.name}</strong><br/>
                                                                                    <small>Qty: ${i.quantity}</small>
                                                                                </div>
                                                                                <div>₹${i.price}</div>
                                                                            </div>
                                                                        `).join('')}
                                                                        
                                                                        <div class="total">
                                                                            Total: ₹${order.total?.toLocaleString()}
                                                                        </div>

                                                                        <div class="footer">
                                                                            Thank you for shopping with Sign Galaxy!<br/>
                                                                            For support contact: 6380016798
                                                                        </div>
                                                                        <script>window.print();</script>
                                                                    </body>
                                                                    </html>
                                                                `;
                                                                const win = window.open('', '_blank');
                                                                win?.document.write(invoiceContent);
                                                                win?.document.close();
                                                            }}
                                                            className="flex-1 sm:flex-none w-full sm:w-32 py-2 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Package className="w-4 h-4" /> Invoice
                                                        </button>

                                                        {order.status === 'Delivered' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openReviewModal({ id: item.productId, name: item.name, image: item.image });
                                                                }}
                                                                className="flex-1 sm:flex-none w-full sm:w-32 py-2 px-4 bg-primary text-white border border-transparent rounded-lg font-bold text-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
                                                            >
                                                                <Star className="w-4 h-4" /> Review
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {isReviewModalOpen && selectedProductForReview && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-slide-up">
                        <button
                            onClick={() => setIsReviewModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Write a Review</h3>
                            <p className="text-sm text-gray-500">How would you rate your experience?</p>
                        </div>

                        <div className="flex items-center gap-4 mb-6 bg-gray-50 p-3 rounded-xl">
                            <img src={selectedProductForReview.image} alt="" className="w-12 h-12 object-cover rounded-lg" />
                            <div className="text-left">
                                <p className="font-bold text-gray-900 text-sm line-clamp-1">{selectedProductForReview.name}</p>
                                <p className="text-xs text-gray-500">Verified Purchase</p>
                            </div>
                        </div>

                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setReviewRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                >
                                    <Star
                                        className={`w-10 h-10 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'}`}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Your Location (Optional)</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                                        placeholder="e.g. Mumbai, India"
                                        value={reviewLocation}
                                        onChange={(e) => setReviewLocation(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Your Review</label>
                                <textarea
                                    className="w-full border border-gray-200 rounded-xl p-4 h-32 resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                                    placeholder="Tell us what you liked about the product..."
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleSubmitReview}
                                disabled={isSubmittingReview || !reviewComment.trim()}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
