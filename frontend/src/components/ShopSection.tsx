import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Section, ShopCategory } from '../types';

interface ShopSectionProps {
    section: Section;
    categories: ShopCategory[];
}

export const ShopSection: React.FC<ShopSectionProps> = ({ section, categories }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScrollButtons = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            // Use a small threshold (10px) to prevent flickering or showing arrow when practically at start
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScrollButtons();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollButtons);
            window.addEventListener('resize', checkScrollButtons);
            return () => {
                container.removeEventListener('scroll', checkScrollButtons);
                window.removeEventListener('resize', checkScrollButtons);
            };
        }
    }, [categories]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            // Calculate precise stride based on media query
            // Desktop: w-200px + gap-10 (40px) = 240px
            // Mobile: w-120px + gap-6 (24px) = 144px
            const isDesktop = window.matchMedia('(min-width: 768px)').matches;
            const itemStride = isDesktop ? 240 : 144;
            // Scroll 5 items on desktop, 2 on mobile
            const count = isDesktop ? 5 : 2;

            const scrollAmount = itemStride * count;
            const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    const sectionCategories = categories.filter(cat => cat.sectionIds?.includes(section.id) || cat.sectionId === section.id);

    if (sectionCategories.length === 0) return null;

    // Group categories into pairs for 2-row layout
    const columns = [];
    for (let i = 0; i < Math.ceil(sectionCategories.length / 2); i++) {
        columns.push(sectionCategories.slice(i * 2, i * 2 + 2));
    }

    return (
        <div className="mb-8 group/section relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                {section.title && (
                    <div className="flex justify-center items-center mb-8 relative">
                        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent z-0"></div>
                        <h2 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-widest relative z-10 px-6 bg-app-bg">
                            {section.title}
                        </h2>
                        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent z-0"></div>
                    </div>
                )}

                {/* Categories Carousel */}
                <div className="relative group/carousel px-4">
                    {/* Left Arrow */}
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white/95 shadow-xl rounded-full p-3 transition-all duration-300 border border-gray-100 hidden md:flex items-center justify-center -ml-4 ${!canScrollLeft
                            ? 'opacity-50 cursor-not-allowed text-gray-300'
                            : 'hover:bg-primary hover:text-white text-gray-800 hover:scale-110 group-hover/section:opacity-100 opacity-0'
                            }`}
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Right Arrow */}
                    {canScrollRight && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white/95 shadow-xl rounded-full p-3 hover:bg-primary hover:text-white transition-all duration-300 border border-gray-100 hidden md:flex items-center justify-center -mr-4"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}

                    {/* Categories Container */}
                    <div
                        ref={scrollContainerRef}
                        className="grid grid-rows-2 grid-flow-col gap-x-6 md:gap-x-10 gap-y-12 overflow-x-auto scrollbar-hide scroll-smooth px-2 pb-10 snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {sectionCategories.map((category) => (
                            <Link
                                key={category._id || category.id}
                                to={`/products?category=${encodeURIComponent(category.name)}`}
                                className="flex flex-col items-center w-[120px] md:w-[200px] group cursor-pointer snap-start"
                            >
                                <div className="relative w-full aspect-square">
                                    {/* Square Image Card */}
                                    <div className="w-full h-full rounded-[3rem] overflow-hidden border-2 border-white group-hover:border-primary transition-all duration-500 bg-white">
                                        <div className="absolute inset-0 p-1">
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="w-full h-full object-cover rounded-[2.8rem] transform group-hover:scale-110 transition-transform duration-700"
                                                loading="lazy"
                                            />
                                        </div>
                                        {/* Subtle overlay */}
                                    </div>
                                </div>
                                {/* Category Name */}
                                <h3 className="mt-5 text-center font-extrabold text-gray-800 text-xs md:text-sm group-hover:text-primary transition-colors tracking-tight line-clamp-2 h-10 px-1 leading-tight uppercase">
                                    {category.name}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
