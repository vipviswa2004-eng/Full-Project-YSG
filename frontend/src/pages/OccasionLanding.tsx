import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Gift, ChevronRight, ArrowRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { SEO } from '../components/SEO';
import { SpecialOccasion, ShopCategory } from '../types';
import valentineBanner from '../assets/valentine_banner.png';

export const OccasionLanding: React.FC = () => {
    const { occasionId } = useParams();
    const [occasion, setOccasion] = useState<SpecialOccasion | null>(null);
    const [categories, setCategories] = useState<ShopCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [occRes, catRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/special-occasions`),
                    fetch(`${import.meta.env.VITE_API_URL}/api/shop-categories`)
                ]);

                if (occRes.ok && catRes.ok) {
                    const occs: SpecialOccasion[] = await occRes.json();
                    const cats: ShopCategory[] = await catRes.json();

                    const currentOcc = occs.find(o => o.id === occasionId);
                    setOccasion(currentOcc || null);

                    if (currentOcc) {
                        const filteredCats = cats.filter(cat =>
                            cat.specialOccasionIds?.includes(currentOcc.id)
                        ).sort((a, b) => (a.order || 0) - (b.order || 0));
                        setCategories(filteredCats);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch occasion data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        window.scrollTo(0, 0);
    }, [occasionId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!occasion) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Occasion not found</h2>
                <Link to="/" className="text-primary font-bold hover:underline flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5" /> Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-app-bg pb-20">
            <SEO
                title={`${occasion.name} Collections | Sign Galaxy`}
                description={`Explore our curated gift collections for ${occasion.name}. Hand-crafted with love.`}
            />

            {/* Hero Section - Matching Home Page Moving Banner Style */}
            <div className="relative h-[400px] md:h-[500px] overflow-hidden bg-gray-900 mt-4 mx-3 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border-2 md:border-4 border-white">
                <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, ease: "linear" }}
                    src={occasion.name.toLowerCase().includes('valentine')
                        ? 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=2074&auto=format&fit=crop'
                        : (occasion.id === 'valentine' ? valentineBanner : occasion.image)}
                    alt={occasion.name}
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Dynamic Gradients */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />

                {/* Floating Decorative Hearts/Sparkles (Conditional for Valentine's) */}
                {occasion.name.toLowerCase().includes('valentine') && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    opacity: 0,
                                    y: 500,
                                    x: Math.random() * 800
                                }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    y: -200,
                                    x: `calc(${Math.random() * 100}vw + ${Math.sin(i) * 50}px)`
                                }}
                                transition={{
                                    duration: Math.random() * 5 + 5,
                                    repeat: Infinity,
                                    delay: Math.random() * 10,
                                    ease: "easeInOut"
                                }}
                                className="absolute text-primary/40 text-2xl"
                            >
                                ❤️
                            </motion.div>
                        ))}
                    </div>
                )}

                <div className="absolute inset-0 z-20 flex items-center justify-between px-6 md:px-20 text-white">
                    <div className="flex flex-col items-start text-left max-w-xl">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-primary/20 backdrop-blur-md border border-primary/30 text-white px-3 py-1 rounded-full font-black text-[9px] md:text-xs uppercase tracking-[0.3em] mb-3 shadow-xl"
                        >
                            Special Edition Collection
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: "spring" }}
                            className="text-4xl md:text-7xl font-black mb-3 tracking-tighter drop-shadow-2xl leading-tight uppercase italic"
                        >
                            {occasion.name}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="text-xs md:text-xl mb-6 text-gray-200 font-medium drop-shadow-md max-w-lg leading-tight"
                        >
                            {occasion.description}
                        </motion.p>

                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: "spring" }}>
                            {occasion.name.toLowerCase().includes('valentine') ? (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <button
                                        onClick={() => document.getElementById('curated-categories')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="bg-primary text-white px-8 py-3 rounded-xl font-black text-xs md:text-sm hover:bg-white hover:text-primary transition-all shadow-xl flex items-center gap-2 transform hover:scale-105 active:scale-95 group"
                                    >
                                        Explore Gifts <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => document.getElementById('curated-categories')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="bg-white text-gray-900 px-8 py-3 rounded-xl font-black text-xs md:text-sm hover:bg-black hover:text-white transition-all shadow-xl flex items-center gap-2 transform hover:scale-105 active:scale-95 group"
                                >
                                    View Collection <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </motion.div>
                    </div>

                    {/* Featured Product Image - Conditional for Valentine's or default */}
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ delay: 0.6, type: "spring" }}
                        className="hidden lg:flex relative w-1/3 aspect-square items-center justify-center p-8"
                    >
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
                        <img
                            src={occasion.name.toLowerCase().includes('valentine')
                                ? "https://images.unsplash.com/photo-1549465220-1d8c9d9c6703?q=80&w=400&auto=format&fit=crop"
                                : occasion.image}
                            alt=""
                            className="relative max-h-full max-w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)] transform hover:rotate-6 transition-transform duration-700"
                        />
                    </motion.div>
                </div>

                {/* Bottom Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 z-30"
                >
                    <ChevronDown className="w-6 h-6" />
                </motion.div>
            </div>

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-500">
                    <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900">{occasion.name}</span>
                </div>
            </div>

            {/* Categories Section */}
            <div id="curated-categories" className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Curated Categories</h2>
                            <p className="text-gray-500 text-sm md:text-base font-medium">Perfectly handpicked for your milestone</p>
                        </div>
                    </div>
                </div>

                {categories.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
                        {categories.map((cat, idx) => (
                            <motion.div
                                key={cat.id || cat._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Link
                                    to={`/products?category=${encodeURIComponent(cat.name)}&occasion=${encodeURIComponent(occasion.name)}`}
                                    className="group flex flex-col items-center"
                                >
                                    <div className="relative w-full aspect-square bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm border border-gray-50 overflow-hidden group-hover:shadow-2xl group-hover:border-primary/20 group-hover:-translate-y-3 transition-all duration-500">
                                        <div className="absolute inset-0 p-4 md:p-8">
                                            <img
                                                src={cat.image}
                                                alt={cat.name}
                                                className="w-full h-full object-contain transform group-hover:scale-110 group-hover:rotate-2 transition-transform duration-700"
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Shine Effect */}
                                        <div className="absolute inset-0 bg-white/40 -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
                                    </div>
                                    <h4 className="mt-5 text-center font-black text-gray-800 text-xs md:text-sm group-hover:text-primary transition-colors tracking-tight uppercase px-2 leading-tight h-10 line-clamp-2">
                                        {cat.name}
                                    </h4>
                                    <div className="mt-1 flex items-center gap-1 text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                        Explore <ArrowRight className="w-3 h-3" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-sm px-6">
                        <Gift className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Something Special is Coming!</h3>
                        <p className="text-gray-500 max-w-md mx-auto">We're currently handcrafting a specific collection for {occasion.name}. Check back soon or explore our other collections.</p>
                        <Link to="/" className="inline-flex items-center gap-2 mt-8 bg-primary text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all">
                            Explore All Gifts <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                )}
            </div>

            {/* Promo Banner */}
            <div className="max-w-7xl mx-auto px-4 mt-20">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl md:text-4xl font-black text-white mb-2">Need a custom touch?</h3>
                            <p className="text-gray-400 font-medium">Talk to our design experts for personalized bulk orders or unique creations.</p>
                        </div>
                        <a
                            href="https://wa.me/919944744447"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-gray-900 px-10 py-4 rounded-full font-black hover:bg-primary hover:text-white transition-all shadow-xl flex items-center gap-2"
                        >
                            Connect on WhatsApp <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -ml-32 -mb-32" />
                </div>
            </div>
        </div>
    );
};
