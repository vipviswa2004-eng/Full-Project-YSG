import React from 'react';

export const TermsConditions: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Terms & Conditions</h1>

            <div className="prose prose-purple max-w-none text-gray-700 space-y-6">
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
                    <p>Welcome to Yathes Sign Galaxy. By accessing our website and placing an order, you agree to be bound by these Terms and Conditions.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Products and Customization</h2>
                    <p>We specialize in personalized gifts. Please ensure all customization details (names, dates, photos) are accurate before submitting your order. We are not responsible for errors in information provided by the customer.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Pricing and Payment</h2>
                    <p>All prices are listed in Indian Rupees (INR) and are subject to change without notice. Payment must be made in full at the time of ordering.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Intellectual Property</h2>
                    <p>All content on this website, including images, designs, and text, is the property of Yathes Sign Galaxy and is protected by copyright laws.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Contact Us</h2>
                    <p>If you have any questions about these Terms, please contact us at support@yathessigngalaxy.com.</p>
                </section>
            </div>
        </div>
    );
};
