import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Star, Zap, Layers, Sparkles, Award } from 'lucide-react';
import birthdayImg from '../assets/birthday.png';


interface SubCategory {
    id: string;
    name: string;
    categoryId: string;
}

interface ShopCategory {
    id: string;
    name: string;
    sectionIds?: string[];
    sectionId?: string;
    image?: string;
}

interface Section {
    id: string;
    title: string;
    image?: string;
}

interface SpecialOccasion {
    id: string;
    name: string;
    image?: string;
    description?: string;
    link?: string;
}

const STATIC_OCCASIONS = [
    { id: 'birthday', name: 'Birthday', image: birthdayImg, description: 'Celebrate another year of greatness with a gift that shines as bright as they do.' },

    { id: 'love', name: 'Love & Romance', image: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?q=80&w=400&auto=format&fit=crop', description: 'Express your deepest feelings with keepsakes that say what words cannot.' },
    { id: 'kids', name: 'For Kids', image: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?q=80&w=400&auto=format&fit=crop', description: 'Magical moments and playful wonders for the little ones in your life.' },
    { id: 'wedding', name: 'Wedding & Anniversary', image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?q=80&w=400&auto=format&fit=crop', description: 'Honor a lifetime of love with elegant, timeless custom masterpieces.' }
];

export const CategoryNav: React.FC = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const [allSections, setAllSections] = useState<Section[]>([]); // Full list including ones not in main nav shortcuts
    const [occasions, setOccasions] = useState<SpecialOccasion[]>([]);
    const [categories, setCategories] = useState<ShopCategory[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null); // Unified state for sec_*, occ_*, or special_items
    const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
    const [hoveredOccasionId, setHoveredOccasionId] = useState<string | null>(null);
    const timeoutRef = useRef<any>(null);

    const handleNavMouseEnter = (id: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setActiveDropdown(id);
    };

    const handleNavMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
            timeoutRef.current = null;
        }, 150); // Small grace period to move mouse to dropdown
    };

    const handleMenuMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [secRes, catRes, subRes, occRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/sections`),
                    fetch(`${import.meta.env.VITE_API_URL}/api/shop-categories`),
                    fetch(`${import.meta.env.VITE_API_URL}/api/sub-categories`),
                    fetch(`${import.meta.env.VITE_API_URL}/api/special-occasions`)
                ]);

                const secData = await secRes.json();
                const catData = await catRes.json();
                const subData = await subRes.json();
                const occData = await occRes.json();

                // Standardize sections
                const processedSections = secData.map((s: any) => {
                    const title = s.title || s.name;
                    let fallbackImage = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=150&auto=format&fit=crop';
                    if (title.toLowerCase().includes('personal')) {
                        fallbackImage = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=150&auto=format&fit=crop';
                    } else if (title.toLowerCase().includes('corporate')) {
                        fallbackImage = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=150&auto=format&fit=crop';
                    }

                    return {
                        id: s.id || s._id,
                        title: title,
                        image: s.image || fallbackImage
                    };
                });

                setAllSections(processedSections);
                setSections(processedSections.filter((s: any) =>
                    s.title.toLowerCase().includes('personal') ||
                    s.title.toLowerCase().includes('corporate')
                ));
                setOccasions(occData.map((o: any) => ({
                    id: o.id || o._id,
                    name: o.name,
                    image: o.image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=150&auto=format&fit=crop',
                    description: o.description,
                    link: o.link
                })));
                setCategories(catData.map((c: any) => ({
                    id: c.id || c._id,
                    name: c.name,
                    sectionIds: c.sectionIds || (c.sectionId ? [c.sectionId] : []),
                    image: c.image
                })));
                setSubCategories(subData.map((s: any) => ({
                    id: s.id || s._id,
                    name: s.name,
                    categoryId: s.categoryId
                })));

            } catch (error) {
                console.error('Failed to fetch navigation data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const closeMenu = () => {
        setActiveDropdown(null);
        setHoveredCategoryId(null);
        setHoveredOccasionId(null);
    };

    // Helper to get categories for a section
    const getCategoriesForSection = (sectionId: string) => {
        let sectionCats = categories.filter(cat => cat.sectionIds?.includes(sectionId));

        if (sectionId === 'sec_personalised' && sectionCats.length < 29) {
            const diaries = categories.find(c => c.name === 'Diaries');
            if (diaries && !sectionCats.find(c => c.id === diaries.id)) {
                sectionCats.push(diaries);
            }
        }

        return sectionCats.sort((a, b) => a.name.localeCompare(b.name));
    };

    // Set initial hovered state when selection changes
    useEffect(() => {
        if (activeDropdown) {
            if (activeDropdown.startsWith('sec_')) {
                const sectionCats = getCategoriesForSection(activeDropdown);
                if (sectionCats.length > 0) setHoveredCategoryId(sectionCats[0].id);
            } else if (activeDropdown === 'occasions_all') {
                if (STATIC_OCCASIONS.length > 0) setHoveredOccasionId(STATIC_OCCASIONS[0].id);
            }
        } else {
            setHoveredCategoryId(null);
            setHoveredOccasionId(null);
        }
    }, [activeDropdown, allSections, occasions]); // Added dependencies

    if (loading || sections.length === 0) return null;

    const NAV_ITEMS = [
        ...sections.map(s => ({ ...s, type: 'section' })),
        {
            id: 'occasions_all',
            name: 'Shop by Occasion',
            type: 'occasions',
            image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=200&auto=format&fit=crop'
        },
        {
            id: 'special_items',
            name: 'Special Occasions',
            type: 'special_occasions',
            image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=200&auto=format&fit=crop'
        }
    ];

    return (
        <div className="bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-gray-100 hidden md:block sticky top-16 z-40 h-[84px] transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 lg:px-6 h-full relative"> {/* Added relative for mega-menu anchoring */}
                <div className="flex items-center justify-between h-full">
                    {/* Main Sections */}
                    <div className="flex items-center gap-6 lg:gap-10">
                        {NAV_ITEMS.map((item) => {
                            const title = (item as any).title || (item as any).name;
                            return (
                                <div
                                    key={item.id}
                                    className="relative group/nav-item h-full flex items-center"
                                    onMouseEnter={() => handleNavMouseEnter(item.id)}
                                    onMouseLeave={handleNavMouseLeave}
                                >
                                    <div
                                        className={`flex items-center gap-3 px-3 lg:px-4 py-2 rounded-2xl transition-all duration-500 relative cursor-default
                                            ${activeDropdown === item.id ? 'bg-primary/5 shadow-inner' : 'hover:bg-gray-50/80'}
                                        `}
                                    >
                                        <div className="relative">
                                            <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-1.5xl overflow-hidden bg-white flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.1)] border-2 border-white ring-1 ring-gray-100 group-hover/nav-item:shadow-[0_12px_25px_rgba(0,0,0,0.15)] group-hover/nav-item:-translate-y-1 transition-all duration-500">
                                                <img src={item.image} alt={title} className="w-full h-full object-cover scale-100 group-hover/nav-item:scale-110 transition-transform duration-700" />
                                            </div>
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-white scale-0 transition-transform duration-500 ${activeDropdown === item.id ? 'scale-100' : ''}`}></div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-[12px] lg:text-[13px] font-black tracking-tight transition-colors duration-300 flex items-center gap-1.5
                                                ${activeDropdown === item.id ? 'text-primary' : 'text-gray-900'}
                                            `}>
                                                {title}
                                                <ChevronDown className={`w-3.5 h-3.5 transition-all duration-500 opacity-50 ${activeDropdown === item.id ? 'rotate-180 opacity-100' : ''}`} />
                                            </span>
                                            <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-[0.1em] leading-none mt-0.5 group-hover/nav-item:text-primary/70 transition-colors">Explore</span>
                                        </div>

                                        <div className={`absolute bottom-0 left-6 right-6 h-1 bg-primary rounded-full transition-all duration-500 transform origin-left
                                            ${activeDropdown === item.id ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}
                                        `}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Shared Mega Menu - Now anchored to the container to fit screen perfectly */}
                    <div
                        className={`absolute top-full left-1/2 -translate-x-1/2 w-full max-w-[1024px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.15)] transition-all duration-500 origin-top z-50 flex overflow-hidden rounded-b-2xl border-x border-b border-gray-100 backdrop-blur-sm
                            ${activeDropdown ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 invisible pointer-events-none'}`}
                        style={{ height: '380px' }}
                        onMouseEnter={handleMenuMouseEnter}
                        onMouseLeave={handleNavMouseLeave}
                    >
                        {activeDropdown && (
                            <>
                                {/* Handle Sections (Personalized, Corporate) */}
                                {NAV_ITEMS.find(i => i.id === activeDropdown)?.type === 'section' && (
                                    <>
                                        <div className="w-[240px] bg-gray-50/80 border-r border-gray-100/50 overflow-y-auto no-scrollbar py-4 px-2">
                                            <div className="px-3 mb-3">
                                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em] mb-1">Categories</h5>
                                                <div className="h-0.5 w-6 bg-primary/20 rounded-full"></div>
                                            </div>
                                            <div className="space-y-1">
                                                {getCategoriesForSection(activeDropdown).map((cat) => (
                                                    <Link
                                                        key={cat.id}
                                                        to={`/products?category=${encodeURIComponent(cat.name)}`}
                                                        onClick={closeMenu}
                                                        onMouseEnter={() => setHoveredCategoryId(cat.id)}
                                                        className={`px-3 py-2.5 text-[13px] cursor-pointer rounded-xl transition-all duration-300 flex items-center justify-between group/cat-link
                                                            ${hoveredCategoryId === cat.id ? 'bg-white text-primary font-bold shadow-md shadow-black/5 -translate-x-1' : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'}
                                                        `}
                                                    >
                                                        <span className="truncate pr-2">{cat.name}</span>
                                                        <ChevronRight className={`w-3.5 h-3.5 transition-all duration-500 ${hoveredCategoryId === cat.id ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-2'}`} />
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-white p-6 overflow-y-auto no-scrollbar bg-gradient-to-br from-white to-gray-50/30">
                                            {hoveredCategoryId && (
                                                <CategoryDetails
                                                    category={categories.find(c => c.id === hoveredCategoryId)!}
                                                    subCategories={subCategories}
                                                    closeMenu={closeMenu}
                                                />
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Handle Occasions Dropdown */}
                                {NAV_ITEMS.find(i => i.id === activeDropdown)?.type === 'occasions' && (
                                    <>
                                        <div className="w-[240px] bg-gray-50/80 border-r border-gray-100/50 overflow-y-auto no-scrollbar py-4 px-2">
                                            <div className="px-3 mb-3">
                                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em] mb-1">Occasions</h5>
                                                <div className="h-0.5 w-6 bg-primary/20 rounded-full"></div>
                                            </div>
                                            <div className="space-y-1">
                                                {STATIC_OCCASIONS.map((occ) => (
                                                    <Link
                                                        key={occ.id}
                                                        to={`/products?occasion=${encodeURIComponent(occ.name)}`}
                                                        onClick={closeMenu}
                                                        onMouseEnter={() => setHoveredOccasionId(occ.id)}
                                                        className={`px-3 py-2.5 text-[13px] cursor-pointer rounded-xl transition-all duration-300 flex items-center justify-between group/occ-link
                                                            ${hoveredOccasionId === occ.id ? 'bg-white text-primary font-bold shadow-md shadow-black/5 -translate-x-1' : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'}
                                                        `}
                                                    >
                                                        <span className="truncate pr-2">{occ.name}</span>
                                                        <ChevronRight className={`w-3.5 h-3.5 transition-all duration-500 ${hoveredOccasionId === occ.id ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-2'}`} />
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-white p-6 overflow-y-auto no-scrollbar flex items-center justify-center bg-gradient-to-br from-white to-gray-50/50">
                                            {hoveredOccasionId && (
                                                <div className="text-center animate-in fade-in zoom-in duration-500 max-w-md">
                                                    <div className="relative group/occ-img mb-6">
                                                        <div className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-3xl group-hover/occ-img:bg-primary/20 transition-all duration-700"></div>
                                                        <div className="relative w-40 h-40 rounded-[2rem] overflow-hidden shadow-2xl mx-auto border-4 border-white group-hover/occ-img:scale-105 transition-transform duration-500">
                                                            <img
                                                                src={STATIC_OCCASIONS.find(o => o.id === hoveredOccasionId)?.image || ''}
                                                                alt="Occasion"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    </div>
                                                    <h4 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{STATIC_OCCASIONS.find(o => o.id === hoveredOccasionId)?.name}</h4>
                                                    <p className="text-gray-400 text-sm leading-relaxed mb-6">{STATIC_OCCASIONS.find(o => o.id === hoveredOccasionId)?.description}</p>
                                                    <Link
                                                        to={`/products?occasion=${encodeURIComponent(STATIC_OCCASIONS.find(o => o.id === hoveredOccasionId)?.name || '')}`}
                                                        onClick={closeMenu}
                                                        className="px-8 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/30 hover:shadow-black/30 hover:-translate-y-1"
                                                    >
                                                        Shop Collection
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </>

                                )}

                                {/* Dedicated Special Occasions Mega Menu - Global backend dynamic list */}
                                {NAV_ITEMS.find(i => i.id === activeDropdown)?.type === 'special_occasions' && (
                                    <div className="w-full p-6 overflow-y-auto no-scrollbar bg-gradient-to-br from-white to-orange-50/20">
                                        <div className="max-w-4xl mx-auto">
                                            <div className="mb-6 text-center">
                                                <h4 className="text-2xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-2">
                                                    <Sparkles className="w-6 h-6 text-orange-400" />
                                                    Special Occasions
                                                </h4>
                                                <p className="text-gray-400 text-sm mt-1">Curated collections for life's most beautiful milestones</p>
                                                <div className="h-1 w-12 bg-primary/20 rounded-full mx-auto mt-3"></div>
                                            </div>
                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                                                {occasions.map(occ => (
                                                    <Link
                                                        key={occ.id}
                                                        to={`/products?occasion=${encodeURIComponent(occ.name)}`}
                                                        onClick={closeMenu}
                                                        className="group/occ-card relative aspect-[3/2] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border-2 border-white"
                                                    >
                                                        <img src={occ.image} alt={occ.name} className="w-full h-full object-cover group-hover/occ-card:scale-110 transition-transform duration-1000" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                                                        <div className="absolute bottom-4 left-4 right-4">
                                                            <p className="text-white font-black text-lg tracking-tight leading-tight mb-1">{occ.name}</p>
                                                            <div className="flex items-center gap-2 text-white/70 text-[9px] uppercase font-bold tracking-[0.2em] opacity-0 group-hover/occ-card:opacity-100 transform translate-y-2 group-hover/occ-card:translate-y-0 transition-all duration-500">
                                                                Explore <ChevronRight className="w-3 h-3" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Bestseller Mega Menu */}

                            </>
                        )}
                    </div>

                    {/* Trending & New Secondary Nav */}
                    <div className="flex items-center h-full">
                        <div className="w-[1px] h-8 bg-gray-100 mx-4"></div>
                        <div className="flex items-center gap-2 lg:gap-3">
                            <Link to="/products?filter=trending" onClick={closeMenu} className="group flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-orange-50/50 transition-all duration-500 border border-transparent hover:border-orange-100">
                                <div className="relative">
                                    <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-1.5xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors duration-500 shadow-sm border border-orange-100/50">
                                        <Zap className="w-4.5 h-4.5 text-orange-500 fill-orange-500" />
                                    </div>
                                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] lg:text-[11px] font-black text-gray-900 tracking-tight leading-none mb-0.5">TRENDING</span>
                                    <span className="text-[8.5px] lg:text-[9.5px] text-gray-400 font-bold tracking-wider">Hot Now</span>
                                </div>
                            </Link>

                            <div className="relative">
                                <Link
                                    to="/products?filter=bestseller"
                                    onClick={closeMenu}
                                    className="group flex items-center gap-3 px-3 py-2 rounded-2xl transition-all duration-500 border border-transparent hover:bg-yellow-50/50 hover:border-yellow-100"
                                >
                                    <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-1.5xl bg-yellow-50 flex items-center justify-center group-hover:bg-yellow-100 transition-colors duration-500 shadow-sm border border-yellow-100/50">
                                        <Award className="w-4.5 h-4.5 text-yellow-600 fill-yellow-600" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] lg:text-[11px] font-black text-gray-900 tracking-tight leading-none mb-0.5">BESTSELLER</span>
                                        <span className="text-[8.5px] lg:text-[9.5px] text-gray-400 font-bold tracking-wider">Top Rated</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-component for Category Details to keep main code clean
const CategoryDetails: React.FC<{ category: ShopCategory, subCategories: SubCategory[], closeMenu: () => void }> = ({ category, subCategories, closeMenu }) => {
    return (
        <div className="animate-in fade-in slide-in-from-left-6 duration-500">
            <div className="mb-6">
                <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shadow-sm">
                        <Layers className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="text-gray-900 font-black text-xl tracking-tight leading-none">{category.name}</h4>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-1 w-12 bg-primary rounded-full shadow-[0_1px_6px_rgba(var(--primary-rgb),0.3)]"></div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.15em]">Curated Collections</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <Link
                    to={`/products?category=${encodeURIComponent(category.name)}`}
                    onClick={closeMenu}
                    className="col-span-2 text-[13px] font-black text-gray-900 hover:text-white transition-all py-2.5 px-4 rounded-xl border-2 border-gray-50 bg-gray-50/50 hover:bg-primary hover:border-primary flex items-center justify-between group/all shadow-sm hover:shadow-[0_8px_20px_rgba(var(--primary-rgb),0.3)] hover:-translate-y-0.5"
                >
                    <span>View Full Collection</span>
                    <div className="w-6 h-6 rounded-full bg-white group-hover/all:bg-white/20 flex items-center justify-center transition-colors">
                        <ChevronRight className="w-3 h-3 text-primary group-hover/all:text-white" />
                    </div>
                </Link>

                {subCategories
                    .filter(sub => sub.categoryId === category.id)
                    .map((sub) => (
                        <Link
                            key={sub.id}
                            to={`/products?category=${encodeURIComponent(category.name)}&subCategory=${encodeURIComponent(sub.name)}`}
                            onClick={closeMenu}
                            className="text-[12px] font-bold text-gray-600 hover:text-primary transition-all py-1.5 px-2.5 rounded-lg flex items-center gap-2 hover:bg-primary/5 group/sub border border-transparent hover:border-primary/10"
                        >
                            <div className="w-1.5 h-1.5 rounded-full border border-gray-200 group-hover/sub:scale-110 group-hover/sub:border-primary group-hover/sub:bg-primary transition-all duration-300 shadow-sm"></div>
                            <span className="group-hover/sub:translate-x-0.5 transition-transform duration-300">{sub.name}</span>
                        </Link>
                    ))
                }
            </div>

            {subCategories.filter(sub => sub.categoryId === category.id).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 rounded-[1.5rem] mt-3 border-2 border-dashed border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center mb-3">
                        <Star className="w-4 h-4 text-primary shadow-sm" />
                    </div>
                    <h5 className="text-gray-900 font-black text-[14px] mb-1">Exclusive Series</h5>
                    <p className="text-gray-400 text-[10px] mb-4 max-w-[180px]">Hand-crafted masterpieces waiting for you</p>
                    <Link
                        to={`/products?category=${encodeURIComponent(category.name)}`}
                        onClick={closeMenu}
                        className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-[0.1em] rounded-lg hover:bg-black transition-all shadow-[0_8px_20px_rgba(var(--primary-rgb),0.2)] hover:shadow-black/20 hover:-translate-y-0.5"
                    >
                        Explore Now
                    </Link>
                </div>
            )}
        </div>
    );
};
