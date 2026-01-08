import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context';
import { Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp, Star, X, MapPin } from 'lucide-react';

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    customization?: any;
}

interface Order {
    id: string;
    _id: string;
    date: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    total: number;
    items: OrderItem[];
    orderId: string;
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
                const response = await fetch('http://localhost:5000/api/my-orders', {
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

            const response = await fetch('http://localhost:5000/api/reviews', {
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
                            <div key={order._id || order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                                {/* Order Header */}
                                <div
                                    className="p-6 cursor-pointer bg-white hover:bg-gray-50/50 transition-colors"
                                    onClick={() => toggleOrder(order._id || order.id)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-gray-100 p-3 rounded-lg">
                                                <Package className="w-6 h-6 text-gray-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-baseline gap-3 mb-1">
                                                    <span className="font-bold text-lg text-gray-900">#{order.orderId || (order._id ? order._id.slice(-6).toUpperCase() : 'UNKNOWN')}</span>
                                                    <span className="text-sm text-gray-500">
                                                        Placed on {new Date(order.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                                    {order.status === 'Delivered' && <CheckCircle className="w-3.5 h-3.5" />}
                                                    {order.status === 'Shipped' && <Truck className="w-3.5 h-3.5" />}
                                                    {order.status === 'Processing' && <Clock className="w-3.5 h-3.5" />}
                                                    {order.status}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                                            <div className="text-right">
                                                {/* <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Total</p> */}
                                                <p className="font-bold text-gray-900 text-lg">₹{order.total?.toLocaleString()}</p>
                                            </div>
                                            {expandedOrders.includes(order._id || order.id) ? (
                                                <ChevronUp className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Details (Expanded) */}
                                {(expandedOrders.includes(order._id || order.id)) && (
                                    <div className="border-t border-gray-100 bg-gray-50/30 p-6">
                                        <div className="space-y-6">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row gap-6 items-start sm:items-center bg-white p-4 rounded-xl border border-gray-100">
                                                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-gray-900 mb-1">{item.name}</h4>
                                                        <p className="text-sm text-gray-500 mb-2">Variant: {item.customization ? 'Customized' : 'Standard'}</p>
                                                        {item.customization?.text && (
                                                            <p className="text-xs text-gray-500 italic mb-2">"{item.customization.text}"</p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                                                        {/* Actions */}
                                                        <div className="flex gap-4 text-sm font-medium text-blue-600">
                                                            <button className="hover:underline">Track Order</button>
                                                            <button className="hover:underline">Invoice</button>
                                                        </div>

                                                        {/* Write Review Button - ONLY if Delivered */}
                                                        {order.status === 'Delivered' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openReviewModal({ id: item.productId, name: item.name, image: item.image });
                                                                }}
                                                                className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors w-full sm:w-auto"
                                                            >
                                                                Write a Review
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
