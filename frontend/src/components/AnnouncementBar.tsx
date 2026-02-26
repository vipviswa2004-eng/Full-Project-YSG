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
            className="bg-gradient-to-r from-[#D32F2F] via-[#FF5252] to-[#D32F2F] text-white py-2 px-4 text-center relative z-[60] shadow-md cursor-pointer hover:brightness-110 transition-all group overflow-hidden"
        >
            {/* Elegant Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2.5s_infinite] pointer-events-none" />

            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
                <span className="text-sm animate-bounce duration-[2000ms] flex items-center shrink-0">🎁</span>
                <p className="text-[10px] md:text-[11px] font-black tracking-[0.15em] uppercase flex items-center gap-2 text-white">
                    Coupons Available
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-pulse"></span>
                    <span className="text-white/90 font-bold">Apply at Checkout & Save More</span>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-current animate-pulse shrink-0" />
                </p>

                <span className="hidden md:flex items-center gap-1 text-[9px] font-black text-white/80 group-hover:text-white transition-colors uppercase tracking-[0.2em] ml-2">
                    Shop Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
            </div>
        </div>
    );
};
