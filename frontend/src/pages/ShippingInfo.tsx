import React from 'react';
import { Truck, Clock, MapPin } from 'lucide-react';

export const ShippingInfo: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Shipping Information</h1>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                    <Truck className="w-8 h-8 text-purple-600 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Free Delivery</h3>
                    <p className="text-sm text-gray-600">On all orders above ₹999 within India.</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                    <Clock className="w-8 h-8 text-purple-600 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Processing Time</h3>
                    <p className="text-sm text-gray-600">Custom orders take 2-4 days to create before shipping.</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                    <MapPin className="w-8 h-8 text-purple-600 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Tracking</h3>
                    <p className="text-sm text-gray-600">Live tracking available once your order is dispatched.</p>
                </div>
            </div>

            <div className="prose prose-purple max-w-none text-gray-700 space-y-6">
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Delivery Estimates</h2>
                    <p>Once shipped, delivery times are as follows:</p>
                    <ul className="list-disc ml-5 space-y-1">
                        <li><strong>Domestic:</strong> 2-7 business days</li>
                        <li><strong>International:</strong> 5-14 business days</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Damages in Transit</h2>
                    <p>We take great care in packaging. However, if your item arrives damaged, please contact us within 24 hours of delivery with photos of the damaged product and box.</p>
                </section>
            </div>
        </div>
    );
};
