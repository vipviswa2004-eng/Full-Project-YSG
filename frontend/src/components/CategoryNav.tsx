import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Zap, Layers, Sparkles, Award, X } from 'lucide-react';
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
    const navigate = useNavigate();
    const [sections, setSections] = useState<Section[]>([]);
    const [allSections, setAllSections] = useState<Section[]>([]);
    const [occasions, setOccasions] = useState<SpecialOccasion[]>([]);
    const [categories, setCategories] = useState<ShopCategory[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
    const [hoveredOccasionId, setHoveredOccasionId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const timeoutRef = useRef<any>(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNavMouseEnter = (id: string) => {
        if (!isMobile) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            setActiveDropdown(id);
        }
    };

    const handleNavMouseLeave = () => {
        if (!isMobile) {
            timeoutRef.current = setTimeout(() => {
                setActiveDropdown(null);
                timeoutRef.current = null;
            }, 150);
        }
    };

    const handleMenuMouseEnter = () => {
        if (!isMobile && timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const handleNavClick = (id: string) => {
        if (isMobile) {
            setActiveDropdown(activeDropdown === id ? null : id);
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
                const safeMap = (data: any) => Array.isArray(data) ? data : [];
                const processedSections = safeMap(secData).map((s: any) => {
                    const title = s.title || s.name;
                    let fallbackImage = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=150&auto=format&fit=crop';
                    if (title.toLowerCase().includes('personal')) fallbackImage = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=150&auto=format&fit=crop';
                    else if (title.toLowerCase().includes('corporate')) fallbackImage = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=150&auto=format&fit=crop';
                    return { id: s.id || s._id, title: title, image: s.image || fallbackImage };
                });
                setAllSections(processedSections);
                setSections(processedSections.filter((s: any) => s.title.toLowerCase().includes('personal') || s.title.toLowerCase().includes('corporate')));
                setOccasions(safeMap(occData).map((o: any) => ({ id: o.id || o._id, name: o.name, image: o.image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=150&auto=format&fit=crop', description: o.description, link: o.link })));
                setCategories(safeMap(catData).map((c: any) => ({ id: c.id || c._id, name: c.name, sectionIds: c.sectionIds || (c.sectionId ? [c.sectionId] : []), image: c.image })));
                setSubCategories(safeMap(subData).map((s: any) => ({ id: s.id || s._id, name: s.name, categoryId: s.categoryId })));
            } catch (error) { console.error('Failed to fetch navigation data:', error); } finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const closeMenu = () => { setActiveDropdown(null); setHoveredCategoryId(null); setHoveredOccasionId(null); };

    const getCategoriesForSection = (sectionId: string) => {
        let sectionCats = categories.filter(cat => cat.sectionIds?.includes(sectionId));
        if (sectionId === 'sec_personalised' && sectionCats.length < 29) {
            const diaries = categories.find(c => c.name === 'Diaries');
            if (diaries && !sectionCats.find(c => c.id === diaries.id)) sectionCats.push(diaries);
        }
        return sectionCats.sort((a, b) => a.name.localeCompare(b.name));
    };

    useEffect(() => {
        if (activeDropdown) {
            if (activeDropdown.startsWith('sec_')) {
                const sectionCats = getCategoriesForSection(activeDropdown);
                if (sectionCats.length > 0 && !hoveredCategoryId) setHoveredCategoryId(sectionCats[0].id);
            } else if (activeDropdown === 'occasions_all') {
                if (STATIC_OCCASIONS.length > 0 && !hoveredOccasionId) setHoveredOccasionId(STATIC_OCCASIONS[0].id);
            }
        } else {
            setHoveredCategoryId(null);
            setHoveredOccasionId(null);
        }
    }, [activeDropdown, allSections, occasions]);

    if (loading || sections.length === 0) return null;

    const NAV_ITEMS = [
        ...sections.map(s => ({ ...s, type: 'section' })),
        { id: 'occasions_all', name: 'Shop by Occasion', type: 'occasions', image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=200&auto=format&fit=crop' },
        { id: 'special_items', name: 'Special Occasions', type: 'special_occasions', image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=200&auto=format&fit=crop' }
    ];

    return (
        <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 sticky top-16 z-40 h-[74px] md:h-[84px] transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 lg:px-6 h-full relative">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-2 md:gap-6 lg:gap-10 overflow-x-auto no-scrollbar pb-1 md:pb-0 h-full scroll-smooth flex-1">
                        {NAV_ITEMS.map((item) => {
                            const title = (item as any).title || (item as any).name;
                            const isActive = activeDropdown === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className="relative group/nav-item h-full flex items-center shrink-0"
                                    onMouseEnter={() => handleNavMouseEnter(item.id)}
                                    onMouseLeave={handleNavMouseLeave}
                                    onClick={() => handleNavClick(item.id)}
                                >
                                    <div className={`flex items-center gap-2.5 md:gap-3 px-2 md:px-4 py-2 rounded-2xl transition-all duration-500 relative cursor-pointer ${isActive ? 'bg-primary/5' : 'hover:bg-gray-50/80'}`}>
                                        <div className="relative">
                                            <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-1.5xl overflow-hidden bg-white flex items-center justify-center border-2 transition-all duration-500 ${isActive ? 'border-primary shadow-lg ring-2 ring-primary/10' : 'border-white shadow-md ring-1 ring-gray-100'}`}>
                                                <img src={item.image} alt={title} className="w-full h-full object-cover" />
                                            </div>
                                            {isActive && <div className="absolute -bottom-1 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white scale-100 transition-transform"></div>}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-[11px] md:text-[13px] font-black tracking-tight leading-none flex items-center gap-1 ${isActive ? 'text-primary' : 'text-gray-900'}`}>
                                                {title}
                                                <ChevronDown className={`w-3 h-3 md:w-3.5 md:h-3.5 transition-all duration-500 ${isActive ? 'rotate-180 opacity-100' : 'opacity-40'}`} />
                                            </span>
                                            <span className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Explore</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Mobile Trending & Bestseller in the scroll bar */}
                        {isMobile && (
                            <>
                                <Link to="/products?filter=trending" className="flex items-center gap-2 px-3 py-2 shrink-0 group">
                                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100"><Zap className="w-4 h-4 text-orange-500 fill-orange-500" /></div>
                                    <div className="flex flex-col"><span className="text-[10px] font-black text-gray-900">TRENDING</span><span className="text-[8px] text-gray-400 font-bold">HOT NOW</span></div>
                                </Link>
                                <Link to="/products?filter=bestseller" className="flex items-center gap-2 px-3 py-2 shrink-0 group">
                                    <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center border border-yellow-100"><Award className="w-4 h-4 text-yellow-600 fill-yellow-600" /></div>
                                    <div className="flex flex-col"><span className="text-[10px] font-black text-gray-900">BESTSELLER</span><span className="text-[8px] text-gray-400 font-bold">TOP RATED</span></div>
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="hidden lg:flex items-center h-full ml-4">
                        <div className="w-[1px] h-8 bg-gray-100 mx-4"></div>
                        <Link to="/products?filter=trending" onClick={closeMenu} className="group flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-orange-50/50 transition-all">
                            <div className="w-10 h-10 rounded-1.5xl bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm"><Zap className="w-4.5 h-4.5 text-orange-500 fill-orange-500" /></div>
                            <div className="flex flex-col text-left"><span className="text-[10px] font-black text-gray-900 leading-none mb-0.5">TRENDING</span><span className="text-[8.5px] text-gray-400 font-bold">Hot Now</span></div>
                        </Link>
                        <Link to="/products?filter=bestseller" onClick={closeMenu} className="group flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-yellow-50/50 transition-all ml-2">
                            <div className="w-10 h-10 rounded-1.5xl bg-yellow-50 flex items-center justify-center border border-yellow-100 shadow-sm"><Award className="w-4.5 h-4.5 text-yellow-600 fill-yellow-600" /></div>
                            <div className="flex flex-col text-left"><span className="text-[10px] font-black text-gray-900 leading-none mb-0.5">BESTSELLER</span><span className="text-[8.5px] text-gray-400 font-bold">Top Rated</span></div>
                        </Link>
                    </div>

                    {/* MEGA MENU - Enhanced for Mobile Match */}
                    <div
                        className={`absolute top-full left-0 right-0 md:left-1/2 md:-translate-x-1/2 w-screen md:max-w-[1024px] bg-white shadow-2xl transition-all duration-500 origin-top z-50 flex flex-col md:flex-row overflow-hidden md:rounded-b-2xl border-x border-b border-gray-100
                            ${activeDropdown ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 invisible pointer-events-none'}`}
                        style={{ height: isMobile ? 'calc(100vh - 140px)' : '380px' }}
                        onMouseEnter={handleMenuMouseEnter}
                        onMouseLeave={handleNavMouseLeave}
                    >
                        {activeDropdown && (
                            <>
                                {NAV_ITEMS.find(i => i.id === activeDropdown)?.type === 'section' && (
                                    <>
                                        {/* Mobile Header for Categories */}
                                        {isMobile && (
                                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50 flex-shrink-0">
                                                <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Categories</h5>
                                                <button onClick={closeMenu} className="p-2"><X className="w-5 h-5 text-gray-400" /></button>
                                            </div>
                                        )}

                                        <div className="w-full md:w-[260px] bg-gray-50/30 md:bg-gray-50/80 border-r border-gray-100 overflow-y-auto no-scrollbar py-2 md:py-4 px-3 md:px-2 h-full">
                                            {!isMobile && (
                                                <div className="px-3 mb-3">
                                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categories</h5>
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                {getCategoriesForSection(activeDropdown).map((cat) => (
                                                    <React.Fragment key={cat.id}>
                                                        <div
                                                            onMouseEnter={() => !isMobile && setHoveredCategoryId(cat.id)}
                                                            onClick={() => {
                                                                if (isMobile) {
                                                                    setHoveredCategoryId(hoveredCategoryId === cat.id ? null : cat.id);
                                                                } else {
                                                                    if (hoveredCategoryId === cat.id) {
                                                                        closeMenu();
                                                                        navigate(`/products?category=${encodeURIComponent(cat.name)}`);
                                                                    } else {
                                                                        setHoveredCategoryId(cat.id);
                                                                    }
                                                                }
                                                            }}
                                                            className={`px-4 py-3 text-[14px] cursor-pointer rounded-xl md:rounded-2xl transition-all duration-300 flex items-center justify-between group
                                                                ${hoveredCategoryId === cat.id
                                                                    ? 'bg-white text-primary font-black shadow-lg shadow-primary/5 border border-primary/10'
                                                                    : 'text-gray-600 hover:bg-white'}
                                                            `}
                                                        >
                                                            <span className="truncate pr-2">{cat.name}</span>
                                                            <div className={`transition-transform duration-300 ${isMobile && hoveredCategoryId === cat.id ? 'rotate-90' : ''}`}>
                                                                <ChevronRight className={`w-4 h-4 transition-all ${hoveredCategoryId === cat.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                                                            </div>
                                                        </div>

                                                        {/* Mobile Accordion Content */}
                                                        {isMobile && hoveredCategoryId === cat.id && (
                                                            <div className="px-2 pb-2 animate-in slide-in-from-top-2 duration-200">
                                                                <div className="bg-white rounded-b-xl border-x border-b border-gray-100/50 p-3 pt-1 shadow-sm mx-1 mt-[-4px] relative z-0">
                                                                    <Link
                                                                        to={`/products?category=${encodeURIComponent(cat.name)}`}
                                                                        onClick={closeMenu}
                                                                        className="w-full flex items-center justify-between p-2.5 bg-gray-50 hover:bg-primary/5 rounded-lg border border-gray-100 transition-all group mb-3"
                                                                    >
                                                                        <span className="text-[12px] font-black text-gray-900 group-hover:text-primary">View All items</span>
                                                                        <ChevronRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-1 transition-all" />
                                                                    </Link>

                                                                    <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto overscroll-contain pr-1">
                                                                        {subCategories.filter(s => s.categoryId === cat.id).map(sub => (
                                                                            <Link
                                                                                key={sub.id}
                                                                                to={`/products?category=${encodeURIComponent(cat.name)}&subCategory=${encodeURIComponent(sub.name)}`}
                                                                                onClick={closeMenu}
                                                                                className="text-[11px] font-bold text-gray-500 bg-gray-50 border border-transparent hover:border-gray-200 p-2 rounded-lg text-center truncate hover:text-primary transition-colors"
                                                                            >
                                                                                {sub.name}
                                                                            </Link>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="hidden md:block flex-1 bg-white p-6 md:p-8 overflow-y-auto no-scrollbar h-full border-t border-gray-50 md:border-t-0 shadow-none">
                                            {hoveredCategoryId ? (
                                                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary shadow-sm">
                                                            <Layers className="w-5 h-5 md:w-6 md:h-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">{categories.find(c => c.id === hoveredCategoryId)?.name}</h4>
                                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Premium Gifts</span>
                                                        </div>
                                                    </div>

                                                    <Link
                                                        to={`/products?category=${encodeURIComponent(categories.find(c => c.id === hoveredCategoryId)?.name || '')}`}
                                                        onClick={closeMenu}
                                                        className="w-full flex items-center justify-between p-3 bg-[#fbfbfc] hover:bg-primary/5 rounded-xl border border-gray-100 transition-all group mb-4 shadow-sm"
                                                    >
                                                        <span className="text-[13px] font-black text-gray-900 group-hover:text-primary">View All items</span>
                                                        <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-all" />
                                                    </Link>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                                                        {subCategories.filter(sub => sub.categoryId === hoveredCategoryId).map((sub) => (
                                                            <Link
                                                                key={sub.id}
                                                                to={`/products?category=${encodeURIComponent(categories.find(c => c.id === hoveredCategoryId)?.name || '')}&subCategory=${encodeURIComponent(sub.name)}`}
                                                                onClick={closeMenu}
                                                                className="flex items-center gap-4 group/sub py-1"
                                                            >
                                                                <div className="w-2 h-2 rounded-full border-2 border-gray-100 group-hover/sub:bg-primary group-hover/sub:border-primary transition-all shadow-sm"></div>
                                                                <span className="text-[12px] text-gray-500 font-bold group-hover/sub:text-gray-950 transition-colors uppercase tracking-tight">{sub.name}</span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-gray-200 opacity-40"><Layers className="w-20 h-20 mb-4" /><p className="font-black text-xs uppercase tracking-widest">Select a Category</p></div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {NAV_ITEMS.find(i => i.id === activeDropdown)?.type === 'occasions' && (
                                    <>
                                        {isMobile && (
                                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50 flex-shrink-0">
                                                <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Occasions</h5>
                                                <button onClick={closeMenu} className="p-2"><X className="w-5 h-5 text-gray-400" /></button>
                                            </div>
                                        )}
                                        <div className="w-full md:w-[260px] bg-gray-50/30 md:bg-gray-50/80 border-r border-gray-100 overflow-y-auto no-scrollbar py-2 md:py-4 px-3 md:px-2 h-[40%] md:h-full">
                                            <div className="space-y-1">
                                                {STATIC_OCCASIONS.map((occ) => (
                                                    <div
                                                        key={occ.id}
                                                        onClick={() => {
                                                            if (hoveredOccasionId === occ.id) {
                                                                closeMenu();
                                                                navigate(`/products?occasion=${encodeURIComponent(occ.name)}`);
                                                            } else {
                                                                setHoveredOccasionId(occ.id);
                                                            }
                                                        }}
                                                        className={`px-4 py-3 text-[14px] cursor-pointer rounded-xl md:rounded-2xl transition-all duration-300 flex items-center justify-between group
                                                            ${hoveredOccasionId === occ.id ? 'bg-white text-primary font-black shadow-lg shadow-primary/5 border border-primary/10' : 'text-gray-600 hover:bg-white'}
                                                        `}
                                                    >
                                                        <span>{occ.name}</span>
                                                        <ChevronRight className={`w-4 h-4 transition-all ${hoveredOccasionId === occ.id ? 'opacity-100' : 'opacity-0 -translate-x-2'}`} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-white p-8 overflow-y-auto no-scrollbar flex items-center justify-center h-[60%] md:h-full border-t border-gray-50 md:border-t-0">
                                            {hoveredOccasionId && (
                                                <div className="text-center animate-in fade-in zoom-in-95 duration-500 max-w-sm">
                                                    <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-[2.5rem] overflow-hidden shadow-2xl mx-auto border-4 border-white mb-6 hover:scale-105 transition-transform duration-500">
                                                        <img src={STATIC_OCCASIONS.find(o => o.id === hoveredOccasionId)?.image} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <h4 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 truncate">{STATIC_OCCASIONS.find(o => o.id === hoveredOccasionId)?.name}</h4>
                                                    <p className="text-gray-400 text-sm mb-8 leading-relaxed px-4">{STATIC_OCCASIONS.find(o => o.id === hoveredOccasionId)?.description}</p>
                                                    <Link to={`/products?occasion=${encodeURIComponent(STATIC_OCCASIONS.find(o => o.id === hoveredOccasionId)?.name || '')}`} onClick={closeMenu} className="px-10 py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/30">Shop Gifts</Link>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {NAV_ITEMS.find(i => i.id === activeDropdown)?.type === 'special_occasions' && (
                                    <div className="w-full p-6 md:p-10 overflow-y-auto no-scrollbar bg-white">
                                        <div className="max-w-5xl mx-auto">
                                            <div className="mb-8 md:mb-10 text-center relative">
                                                <h4 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-3">
                                                    <Sparkles className="w-7 h-7 text-orange-400" /> Special Occasions
                                                </h4>
                                                <p className="text-gray-400 text-sm mt-2">Curated masterpieces for your most precious moments</p>
                                                {isMobile && <button onClick={closeMenu} className="absolute -top-2 right-0 p-2"><X className="w-6 h-6 text-gray-400" /></button>}
                                            </div>
                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 pb-10">
                                                {occasions.map(occ => (
                                                    <Link key={occ.id} to={`/products?occasion=${encodeURIComponent(occ.name)}`} onClick={closeMenu} className="group relative aspect-[3/2] md:aspect-[4/3] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-xl border-2 border-white hover:shadow-2xl transition-all duration-700">
                                                        <img src={occ.image} alt={occ.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"></div>
                                                        <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 right-4 md:right-8 text-white">
                                                            <p className="font-black text-lg md:text-2xl tracking-tight leading-none mb-1 md:mb-2">{occ.name}</p>
                                                            <div className="flex items-center gap-2 text-[8px] md:text-[11px] uppercase font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-500">Explore <ChevronRight className="w-3 h-3" /></div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Mobile Swipe-down indicator */}
                        {isMobile && activeDropdown && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full opacity-50"></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};