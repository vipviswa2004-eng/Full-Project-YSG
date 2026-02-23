import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useCart } from '../context';

export const AnnouncementBar: React.FC = () => {
    const navigate = useNavigate();
    const { isMobileSearchOpen } = useCart();

    if (isMobileSearchOpen) return null;

    return (
        <div
            onClick={() => navigate('/shop')}
            className="bg-white text-red-600 py-1.5 px-4 text-center relative z-[60] border-b border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50 transition-all group overflow-hidden"
        >
            {/* Subtle Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/[0.05] to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
                <span className="text-sm animate-bounce duration-[2000ms] flex items-center shrink-0">🎁</span>
                <p className="text-[10px] md:text-[11px] font-black tracking-[0.12em] uppercase flex items-center gap-2 text-red-600">
                    Coupons Available
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.3)]"></span>
                    <span className="text-red-500 font-bold">Apply at Checkout & Save More</span>
                    <Sparkles className="w-3.5 h-3.5 text-red-500 fill-current animate-pulse shrink-0" />
                </p>

                <span className="hidden md:flex items-center gap-1 text-[9px] font-black text-red-400 group-hover:text-red-700 transition-colors uppercase tracking-[0.2em] ml-2">
                    Shop Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
            </div>
        </div>
    );
};
