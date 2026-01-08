import React from 'react';
import { SEO } from '../components/SEO';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Customize: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-app-bg py-8">
            <SEO
                title="Customize Your Neon Sign - Online Designer"
                description="Design your custom neon sign with our easy-to-use online tool. Preview text, fonts, and colors instantly."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Customize Your Product</h1>
                    <p className="text-gray-600 mb-8">
                        Product customization feature is being set up. This page will allow you to personalize your gifts with photos and text.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-blue-900 mb-2">Coming Soon</h2>
                        <p className="text-blue-700">
                            Our advanced customization editor with Fabric.js integration is currently being configured.
                            You'll soon be able to:
                        </p>
                        <ul className="mt-4 space-y-2 text-blue-700">
                            <li>• Upload your photos</li>
                            <li>• Add custom text</li>
                            <li>• Preview your design</li>
                            <li>• Choose from different shapes and sizes</li>
                        </ul>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={() => navigate('/products')}
                            className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors"
                        >
                            Browse Products
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
