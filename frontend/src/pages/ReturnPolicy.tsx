import React from 'react';

export const ReturnPolicy: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Replacement Policy</h1>

            <div className="prose prose-purple max-w-none text-gray-700 space-y-6">
                <section>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <p className="font-medium text-yellow-800">
                            <strong>Note:</strong> Personalized items are not eligible for return or refund. Replacement is applicable only if the product arrives damaged or defective.
                            <br /><br />
                            <strong>Important:</strong> You must attach a clear unboxing video (opening the package) to claim a replacement for damage.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Eligibility for Replacement</h2>
                    <p>We accept replacements only under the following conditions:</p>
                    <ul className="list-disc ml-5 mb-2">
                        <li>Product arrived damaged or broken.</li>
                        <li>Wrong product was delivered.</li>
                        <li>Printing/engraving error caused by us (i.e., mismatch with the approved content provided by you).</li>
                        <li>No replacement will be provided for errors in text, photos, or details approved by the customer.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How to Request a Replacement</h2>
                    <p>Please email us at signgalaxy31@gmail.com within 48 hours of delivery. Include your order number, clear photos of the issue, and the <strong>mandatory unboxing video</strong>.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Replacement Process</h2>
                    <p>We do not offer refunds. Instead, we provide free replacements for valid claims:</p>
                    <ul className="list-disc ml-5 mb-2">
                        <li>Once your complaint is verified, we will dispatch a brand new replacement product at no extra cost.</li>
                        <li>The replacement will process within 2-4 business days.</li>
                    </ul>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                        <p className="font-medium text-blue-800">
                            <strong>Note:</strong> Delivery Estimates after the replacement process:
                            <br />
                            <span className="ml-4">• <strong>Domestic:</strong> 2-7 business days</span>
                            <br />
                            <span className="ml-4">• <strong>International:</strong> 5-14 business days</span>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};
