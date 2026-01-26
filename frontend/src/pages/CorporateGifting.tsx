import React, { useState } from 'react';
import { SEO } from '../components/SEO';
import { Mail, Phone, Building, CheckCircle, Gift, Award, Users } from 'lucide-react';

export const CorporateGifting: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        quantity: '',
        requirements: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        console.log('Corporate Inquiry:', formData);
        setIsSubmitted(true);
        // Reset form after delay or immediately? Let's leave it as submitted state.
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-app-bg">
            <SEO
                title="Corporate Gifting & Bulk Orders"
                description="Premium corporate gifts and bulk orders. Custom branding for businesses with personalized products. Get a quote today."
                keywords={['corporate gifts', 'bulk orders', 'business gifts', 'custom branding', 'office decor']}
            />
            {/* Hero Section */}
            <div className="relative bg-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
                        alt="Corporate Office"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-transparent"></div>
                </div>

                <div className="relative max-w-7xl mx-auto">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                            Premium Corporate <span className="text-accent text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Gifting Solutions</span>
                        </h1>
                        <p className="text-xl text-gray-300 mb-8">
                            Elevate your brand with personalized gifts for employees, clients, and partners.
                            From bulk orders to custom logo engravings, we deliver excellence.
                        </p>
                        <a href="#inquiry-form" className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-gray-900 bg-white hover:bg-gray-100 transition-colors">
                            Request a Quote
                        </a>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Why Choose Sign Galaxy?</h2>
                        <p className="mt-4 text-gray-600">We specialize in turning corporate gifts into memorable experiences.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                                <Gift className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Custom Branding</h3>
                            <p className="text-gray-600">
                                Your logo, perfectly engraved or printed on our premium products.
                                Maintain brand consistency with elegance.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Bulk Order Benefits</h3>
                            <p className="text-gray-600">
                                Exclusive tiered pricing for bulk orders. The more you gift, the more you save.
                                Perfect for large teams and events.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                                <Award className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Quality</h3>
                            <p className="text-gray-600">
                                Guaranteed high-quality materials and craftsmanship.
                                Leave a lasting impression with gifts that last.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact/Inquiry Form Section */}
            <div id="inquiry-form" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                            <p className="text-gray-600 mb-8">
                                Ready to start your corporate gifting journey? Fill out the form, and our dedicated team will get back to you within 24 hours with a tailored proposal.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <Phone className="w-6 h-6 text-purple-600 mt-1" />
                                    <div className="ml-4">
                                        <p className="font-medium text-gray-900">Call Us</p>
                                        <p className="text-gray-600">+91 63800 16798</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Mail className="w-6 h-6 text-purple-600 mt-1" />
                                    <div className="ml-4">
                                        <p className="font-medium text-gray-900">Email Us</p>
                                        <p className="text-gray-600">signgalaxy31@gmail.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Building className="w-6 h-6 text-purple-600 mt-1" />
                                    <div className="ml-4">
                                        <p className="font-medium text-gray-900">Visit Us</p>
                                        <p className="text-gray-600">
                                            150 Post Office Road, Thirunagar Colony,<br />
                                            Erode, Tamil Nadu 638003
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-lg">
                            {isSubmitted ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                                    <p className="text-gray-600">
                                        We have received your inquiry. Our team will contact you shortly to discuss your requirements.
                                    </p>
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="mt-6 text-purple-600 font-medium hover:text-purple-700"
                                    >
                                        Send another inquiry
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                            <input
                                                type="text"
                                                name="company"
                                                id="company"
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                                value={formData.company}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                id="phone"
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Estimated Quantity</label>
                                        <select
                                            name="quantity"
                                            id="quantity"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select quantity</option>
                                            <option value="10-50">10 - 50</option>
                                            <option value="51-100">51 - 100</option>
                                            <option value="101-500">101 - 500</option>
                                            <option value="500+">500+</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">Specific Requirements</label>
                                        <textarea
                                            name="requirements"
                                            id="requirements"
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="Tell us about the occasion, preferred products, or any specific ideas you have..."
                                            value={formData.requirements}
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-md hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] shadow-md"
                                    >
                                        Send Inquiry
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
