import React from 'react';

export const PrivacyPolicy: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Privacy Policy</h1>

            <div className="prose prose-purple max-w-none text-gray-700 space-y-6">
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
                    <p>We collect information necessary to process your order, including your name, shipping address, email address, phone number, and any personalization details (photos, text) shared for custom products.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
                    <p>Your information is used solely for:</p>
                    <ul className="list-disc ml-5 mb-2">
                        <li>Processing and delivering your orders.</li>
                        <li>Communicating with you regarding your order status.</li>
                        <li>Improving our products and services.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Security</h2>
                    <p>We implement security measures to protect your personal information. We do not sell or share your data with third parties for marketing purposes.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cookies</h2>
                    <p>Our website uses cookies to enhance your browsing experience and analyze site traffic.</p>
                </section>
            </div>
        </div>
    );
};
