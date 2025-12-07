import React, { useEffect, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { useCart } from '../context';

export const LocationRequester: React.FC = () => {
    const { setCurrency } = useCart();
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        // Check if we've already asked or if permission is granted
        const hasAsked = localStorage.getItem('location_asked');

        if (!hasAsked) {
            // Show popup after a short delay
            const timer = setTimeout(() => {
                setShowPopup(true);
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            // If already asked and granted, we might want to check again silently to update currency
            // But for now, we'll respect the previous interaction
            if (localStorage.getItem('location_granted') === 'true') {
                checkLocation();
            }
        }
    }, []);

    const checkLocation = () => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // Rough bounding box for India
                // Latitude: 8°N to 37°N
                // Longitude: 68°E to 97°E
                const isIndia =
                    latitude >= 8 && latitude <= 37 &&
                    longitude >= 68 && longitude <= 97;

                if (isIndia) {
                    setCurrency('INR');
                } else {
                    setCurrency('USD');
                }

                localStorage.setItem('location_granted', 'true');
            },
            (error) => {
                console.error("Location error:", error);
                // Default to INR if location fails/denied
                setCurrency('INR');
            }
        );
    };

    const handleEnableLocation = () => {
        localStorage.setItem('location_asked', 'true');
        sessionStorage.setItem('location_popup_closed', 'true');
        setShowPopup(false);
        checkLocation();
    };

    const handleClose = () => {
        localStorage.setItem('location_asked', 'true');
        sessionStorage.setItem('location_popup_closed', 'true');
        setShowPopup(false);
    };

    if (!showPopup) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 border border-gray-100 relative overflow-hidden transform transition-all scale-100 animate-fade-in-up">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-bl-full -mr-10 -mt-10 opacity-50"></div>

                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center gap-4">
                    <div className="bg-purple-100 p-4 rounded-full flex-shrink-0 mb-2">
                        <MapPin className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-2">Enable Location?</h3>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            Turn on location to see prices in your local currency. We use this only to customize your experience.
                        </p>
                        <div className="flex gap-3 justify-center w-full">
                            <button
                                onClick={handleEnableLocation}
                                className="flex-1 bg-primary text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 transform hover:scale-105 active:scale-95"
                            >
                                Enable Location
                            </button>
                            <button
                                onClick={handleClose}
                                className="flex-1 text-gray-500 text-sm font-bold px-6 py-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                            >
                                Not Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
