import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate('/shop')}
            className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white py-1.5 px-4 text-center relative z-[60] border-b border-white/10 shadow-md cursor-pointer hover:via-purple-700 transition-all group overflow-hidden"
        >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
                <span className="text-sm animate-bounce duration-[2000ms] flex items-center shrink-0">🎁</span>
                <p className="text-[10px] md:text-[11px] font-black tracking-[0.12em] uppercase flex items-center gap-2 text-white drop-shadow-sm">
                    Coupons Available
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"></span>
                    <span className="text-purple-100">Apply at Checkout & Save More</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current animate-pulse shrink-0" />
                </p>

                <span className="hidden md:flex items-center gap-1 text-[9px] font-black text-white/60 group-hover:text-white transition-colors uppercase tracking-[0.2em] ml-2">
                    Shop Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
            </div>
        </div>
    );
};
