import React, { useEffect } from 'react';
import { useCart } from '../context';

export const LocationManager: React.FC = () => {
    const { setCurrency } = useCart();

    useEffect(() => {
        // 1. Check if we already have a stored preference
        const storedCurrency = localStorage.getItem('user_currency');
        if (storedCurrency === 'INR' || storedCurrency === 'USD') {
            setCurrency(storedCurrency);
            // We can still verify location in background if needed, but preference takes precedence
            return;
        }

        // 2. If User is logged in, maybe they have a preference saved in DB? 
        // (Current context doesn't seem to persist currency in DB, so we rely on IP)

        // 3. IP-based Detection
        const checkLocation = async () => {
            try {
                // Using ipapi.co free tier (limit 1000/day). 
                // Alternative: ip-api.com (limit 45/min) - http only for free, https requires key.
                // Since this is client side, https is needed if site is https. 
                // 'https://ipapi.co/json/' is good.

                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();

                if (data && data.country_code) {
                    const isIndia = data.country_code === 'IN';
                    const newCurrency = isIndia ? 'INR' : 'USD';

                    setCurrency(newCurrency);
                    localStorage.setItem('user_currency', newCurrency);
                    // Also store location data if useful later
                    sessionStorage.setItem('user_country', data.country_code);
                }
            } catch (error) {
                console.error("Failed to detect location:", error);
                // Default to INR or keep current default
                setCurrency('INR');
            }
        };

        checkLocation();
    }, [setCurrency]);

    return null; // Headless component
};
