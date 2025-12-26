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

    const sectionCategories = categories.filter(cat => cat.sectionId === section.id);

    if (sectionCategories.length === 0) return null;

    return (
        <div className="py-12 bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Title */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 uppercase tracking-wide">
                        {section.title}
                    </h2>
                    <div className="mt-2 w-24 h-1 bg-primary mx-auto"></div>
                </div>

                {/* Categories Carousel */}
                <div className="relative">
                    {/* Left Arrow */}
                    {canScrollLeft && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition-all"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-700" />
                        </button>
                    )}

                    {/* Categories Container */}
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-2"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {sectionCategories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/shop?category=${encodeURIComponent(category.name)}`}
                                className="flex-shrink-0 w-40 group cursor-pointer"
                            >
                                <div className="relative">
                                    {/* Circular Image */}
                                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-transparent group-hover:border-primary transition-all duration-300 shadow-lg">
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    </div>
                                </div>
                                {/* Category Name */}
                                <h3 className="mt-4 text-center font-bold text-gray-800 group-hover:text-primary transition-colors">
                                    {category.name}
                                </h3>
                            </Link>
                        ))}
                    </div>

                    {/* Right Arrow */}
                    {canScrollRight && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition-all"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-6 h-6 text-gray-700" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
