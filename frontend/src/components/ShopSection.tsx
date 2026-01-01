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
            setCanScrollLeft(scrollLeft > 0);
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
            const scrollAmount = 600; // Scroll ~5 items at a time
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
        <div className="py-12 bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Title */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-widest relative inline-block">
                        {section.title}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-primary via-accent to-primary rounded-full"></div>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    </h2>
                </div>

                {/* Categories Carousel */}
                <div className="relative group/carousel px-4">
                    {/* Left Arrow */}
                    <button
                        onClick={() => scroll('left')}
                        className={`absolute -left-2 top-1/2 -translate-y-1/2 z-30 bg-white/95 shadow-xl rounded-full p-3 hover:bg-primary hover:text-white transition-all duration-300 border border-gray-100 ${!canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100'} hidden md:flex items-center justify-center`}
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Categories Container */}
                    <div
                        ref={scrollContainerRef}
                        className="grid grid-rows-2 grid-flow-col gap-x-6 md:gap-x-10 gap-y-12 overflow-x-auto scrollbar-hide scroll-smooth px-2 pb-10"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {sectionCategories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/shop?category=${encodeURIComponent(category.name)}`}
                                className="flex flex-col items-center w-[120px] md:w-[150px] group cursor-pointer"
                            >
                                <div className="relative w-full aspect-square">
                                    {/* Square Image Card - Styled like the image */}
                                    <div className="w-full h-full rounded-[3rem] overflow-hidden border-2 border-white group-hover:border-primary transition-all duration-500 shadow-[0_15px_30px_-12px_rgba(0,0,0,0.12)] group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] bg-white">
                                        <div className="absolute inset-0 p-1">
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="w-full h-full object-cover rounded-[2.8rem] transform group-hover:scale-110 transition-transform duration-700"
                                                loading="lazy"
                                            />
                                        </div>
                                        {/* Subtle overlay */}
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>
                                </div>
                                {/* Category Name */}
                                <h3 className="mt-5 text-center font-extrabold text-gray-800 text-xs md:text-sm group-hover:text-primary transition-colors tracking-tight line-clamp-2 h-10 px-1 leading-tight uppercase">
                                    {category.name}
                                </h3>
                            </Link>
                        ))}
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={() => scroll('right')}
                        className={`absolute -right-2 top-1/2 -translate-y-1/2 z-30 bg-white/95 shadow-xl rounded-full p-3 hover:bg-primary hover:text-white transition-all duration-300 border border-gray-100 ${!canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100'} hidden md:flex items-center justify-center`}
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
