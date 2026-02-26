import React, { useState, useEffect } from 'react';
import { SEO } from '../components/SEO';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context';
import { ChevronLeft, ChevronRight, Gift, Truck, ShieldCheck, Heart, Zap, User, Sparkles, ArrowRight, Wallet } from 'lucide-react';
import birthdayImg from '../assets/birthday.webp';
import corporateBg from '../assets/corporate_bg.webp';
import corporateProduct from '../assets/corporate_gift_product.webp';
import personalizedBg from '../assets/personalized_bg.webp';
import personalizedProduct from '../assets/personalized_product.webp';
import specialBg from '../assets/special_bg.webp';
import specialProduct from '../assets/special_product.webp';
import occasionBg from '../assets/occasion_bg.webp';
import anniversaryImg from '../assets/anniversary.webp';
import loveImg from '../assets/love.webp';
import kidsImg from '../assets/kids.webp';
import comboBg from '../assets/combo_bg.webp';

import { ShopSection } from '../components/ShopSection';
import { Section, ShopCategory, SpecialOccasion, ShopRecipient, ShopOccasion, SubCategory } from '../types';
import { RecentlyViewedDetails } from './RecentlyViewedDetails';
import { ProductCard } from '../components/ProductCard';

const OCCASIONS = [
  { id: 'birthday', name: 'Birthday', image: birthdayImg, color: 'from-pink-500 to-rose-500' },
  { id: 'anniversary', name: 'Wedding & Anniversary', image: anniversaryImg, color: 'from-red-500 to-pink-600' },
  { id: 'love', name: 'Love & Romance', image: loveImg, color: 'from-purple-500 to-indigo-500' },
  { id: 'kids', name: 'For Kids', image: kidsImg, color: 'from-yellow-400 to-orange-500' },
];

const RECIPIENTS = [
  { id: 'rec_him', name: 'Him', image: '/recipients/recipient_him.webp', link: '/products?recipient=Him' },
  { id: 'rec_her', name: 'Her', image: '/recipients/recipient_her.webp', link: '/products?recipient=Her' },
  { id: 'rec_couples', name: 'Couples', image: '/recipients/recipient_couples.webp', link: '/products?recipient=Couples' },
  { id: 'rec_kids', name: 'Kids', image: '/recipients/recipient_kids.webp', link: '/products?recipient=Kids' },
  { id: 'rec_parents', name: 'Parents', image: '/recipients/recipient_parents.webp', link: '/products?recipient=Parents' },
];

const HERO_SLIDES = [
  {
    id: 'personalized',
    image: personalizedBg,
    productImage: personalizedProduct,
    title: 'Personalized Gifts',
    subtitle: 'Hand-crafted masterpieces with your personal touch.',
    cta: 'Start Personalizing',
    type: 'action',
    tag: 'Custom Made',
    color: 'text-secondary'
  },
  {
    id: 'corporate',
    image: corporateBg,
    productImage: corporateProduct,
    title: 'Corporate Gifting',
    subtitle: 'Elevate your brand with premium personalized gift sets for clients and employees.',
    cta: 'Request Bulk Quote',
    type: 'link',
    link: '/corporate',
    tag: 'Professional Series',
    color: 'text-blue-400'
  },
  {
    id: 'special',
    image: specialBg,
    productImage: specialProduct,
    title: 'Special Occasions',
    subtitle: 'Celebrate life milestones with our curated collections.',
    cta: 'View Moments',
    type: 'scroll',
    target: 'special-occasions-section',
    tag: 'Milestones',
    color: 'text-orange-400'
  },
  {
    id: 'occasion',
    image: occasionBg,
    productImage: birthdayImg,
    title: 'Shop by Occasion',
    subtitle: 'Find the perfect gift for every celebration.',
    cta: 'Browse Occasions',
    type: 'scroll',
    target: 'shop-by-occasion-section',
    tag: 'Gifts for All',
    color: 'text-pink-400'
  },
  {
    id: 'recipient',
    image: personalizedBg,
    productImage: '/recipients/recipient_her.webp',
    title: 'Shop by Recipient',
    subtitle: 'Thoughtful gifts curated for everyone you love.',
    cta: 'Browse for Them',
    type: 'scroll',
    target: 'shop-by-recipient-section',
    tag: 'For Your Loved Ones',
    color: 'text-emerald-400'
  }
];

const COMBO_BANNER_BG = comboBg;

const BUDGET_OPTIONS = [
  { label: 'Under ₹499', value: '0-499', color: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600' },
  { label: '₹500 - ₹999', value: '500-999', color: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600' },
  { label: '₹1000 - ₹1999', value: '1000-1999', color: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-600 hover:text-white hover:border-purple-600' },
  { label: 'Luxury Gifts', value: '2000-max', color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-600 hover:text-white hover:border-amber-600' }
];

import { motion } from 'framer-motion';

// Enhanced Fade-in Section with Framer Motion
const FadeInSection = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, type: "spring", bounce: 0.4 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const ScrollableProductSection: React.FC<{
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  products: any[];
  viewAllLink: string;
  formatPrice: (price: number) => string;
}> = ({ title, subtitle, icon, products, viewAllLink, formatPrice }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -800 : 800;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="py-8 relative group/section overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              {icon} {title}
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex gap-2 opacity-0 group-hover/section:opacity-100 transition-opacity">
              <button onClick={() => scroll('left')} className="p-2 rounded-full border border-gray-100 bg-white hover:bg-gray-50 shadow-sm transition-all text-gray-600 hover:text-primary"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => scroll('right')} className="p-2 rounded-full border border-gray-100 bg-white hover:bg-gray-50 shadow-sm transition-all text-gray-600 hover:text-primary"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <Link to={viewAllLink} className="text-primary font-bold text-xs md:text-sm hover:underline flex items-center gap-1">View All <ChevronRight className="w-3 h-3 md:w-4 md:h-4" /></Link>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div
          ref={scrollRef}
          className="flex gap-2 md:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x px-4 md:px-[max(1rem,calc((100vw-80rem)/2+1rem))]"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {products.map((product) => (
            <div key={product.id} className="w-[30vw] min-w-[30vw] max-w-[30vw] md:w-[240px] md:min-w-[240px] md:max-w-[240px] flex-none snap-start relative group">
              <ProductCard
                product={product}
                formatPrice={formatPrice}
                onProductClick={(id) => navigate(`/product/${id}`)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Home: React.FC = () => {
  const { currency, setIsGiftAdvisorOpen, products: contextProducts } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Shop Data State - No LocalStorage
  const [sections, setSections] = useState<Section[]>([]);
  const [shopCategories, setShopCategories] = useState<ShopCategory[]>([]);
  const [shopRecipients, setShopRecipients] = useState<ShopRecipient[]>([]);
  const [specialOccasions, setSpecialOccasions] = useState<SpecialOccasion[]>([]);
  const [shopOccasions, setShopOccasions] = useState<ShopOccasion[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  const [activeHeroView, setActiveHeroView] = useState<string | null>(null);


  // Use context products (from DB)
  const displayProducts = contextProducts || [];

  // Get Combo Offer Products
  const comboOffers = displayProducts.filter(p => !!p.isComboOffer);
  // console.log('🔍 Home Debug - Total Products:', displayProducts.length, 'Combo Offers:', comboOffers.length);
  // Dynamically build hero slides including combo offers
  const dynamicHeroSlides = [...HERO_SLIDES];

  // Add generic Combo Offer slide if combos exist
  if (comboOffers.length > 0) {
    const firstCombo = comboOffers[0];
    dynamicHeroSlides.splice(1, 0, {
      id: "special-combo-offers",
      image: COMBO_BANNER_BG,
      productImage: firstCombo.image,
      title: "Special Combo Offers",
      subtitle: "Amazing savings on our hand-picked curated gift combo sets.",
      cta: 'View All Combos',
      type: 'link',
      link: `/shop?filter=combo`,
      tag: 'Limited Time Offer',
      color: 'text-amber-400'
    } as any);
  }

  // Centralized Data Fetching
  useEffect(() => {
    let isMounted = true;

    const fetchHomeData = async () => {
      try {

        const [
          sectionsRes,
          categoriesRes,
          occasionsRes,
          shopOccasionsRes,
          subRes,
          recipientsRes
        ] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/sections`),
          fetch(`${import.meta.env.VITE_API_URL}/api/shop-categories`),
          fetch(`${import.meta.env.VITE_API_URL}/api/special-occasions`),
          fetch(`${import.meta.env.VITE_API_URL}/api/shop-occasions`),
          fetch(`${import.meta.env.VITE_API_URL}/api/sub-categories`),
          fetch(`${import.meta.env.VITE_API_URL}/api/shop-recipients`)
        ]);

        if (isMounted) {
          if (sectionsRes.ok) setSections(await sectionsRes.json());
          if (categoriesRes.ok) setShopCategories(await categoriesRes.json());
          if (occasionsRes.ok) setSpecialOccasions(await occasionsRes.json());
          if (shopOccasionsRes.ok) setShopOccasions(await shopOccasionsRes.json());
          if (subRes.ok) setSubCategories(await subRes.json());
          if (recipientsRes.ok) setShopRecipients(await recipientsRes.json());
        }
      } catch (error) {
        console.error('Failed to fetch home shop data:', error);
      }
    };

    fetchHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeHeroView) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % dynamicHeroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeHeroView, dynamicHeroSlides.length]);


  const formatPrice = (price: number) => {
    return currency === 'INR'
      ? `₹${price.toLocaleString('en-IN')}`
      : `$${(price * 0.012).toFixed(2)}`;
  };

  // Mobile Swipe Handlers
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Next Slide
      setCurrentSlide((prev) => (prev + 1) % dynamicHeroSlides.length);
    }
    if (isRightSwipe) {
      // Prev Slide
      setCurrentSlide((prev) => (prev - 1 + dynamicHeroSlides.length) % dynamicHeroSlides.length);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg font-sans pb-0 md:pb-16">
      <SEO
        description="Shop premium customized & personalized gifts, custom neon lights, photo frames, and unique handmade gifts online at Sign Galaxy. Discover customized gifts for birthdays, anniversaries, and special occasions with fast and secure delivery."
        keywords={['custom gifts', 'personalized items', 'home decor', 'corporate gifts', 'gift shop india', 'unique gifts', 'neon signs india', 'custom photo frames']}
      />
      {!activeHeroView ? (
        <div
          className="relative h-[240px] md:h-[400px] overflow-hidden group bg-gray-900 mt-4 mx-3 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border-2 md:border-4 border-white touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {dynamicHeroSlides.map((slide, index) => (
            <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10" />
              <img
                src={slide.image}
                alt={slide.title}
                loading={index === 0 ? "eager" : "lazy"}
                className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${index === currentSlide ? 'scale-110' : 'scale-100'}`}
              />
              {index === currentSlide && (
                <div className="absolute inset-0 z-20 flex items-center justify-between px-6 md:px-28 text-white">
                  <div className="flex flex-col items-start text-left max-w-[85%] md:max-w-xl">
                    <motion.span
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      className={`${slide.color} font-black text-[10px] md:text-xs uppercase tracking-[0.2em] mb-2 md:mb-3 drop-shadow-sm`}
                    >
                      {slide.tag}
                    </motion.span>
                    <motion.h2
                      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: "spring" }}
                      className="text-3xl md:text-6xl font-black mb-2 md:mb-4 tracking-tighter drop-shadow-2xl leading-[0.9]"
                    >
                      {slide.title}
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                      className="text-xs md:text-lg mb-4 md:mb-8 text-gray-200 font-medium drop-shadow-md leading-relaxed line-clamp-2 md:line-clamp-none"
                    >
                      {slide.subtitle}
                    </motion.p>

                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: "spring" }}>
                      {slide.type === 'link' ? (
                        <Link
                          to={slide.link!}
                          className="bg-white text-gray-900 px-5 py-2 md:px-8 md:py-3 rounded-full md:rounded-xl font-bold md:font-black text-[10px] md:text-sm hover:bg-black hover:text-white transition-all shadow-lg md:shadow-xl flex items-center gap-1 md:gap-2 transform hover:scale-105 active:scale-95"
                        >
                          {slide.cta} <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            if (slide.type === 'action' && (slide as any).id === 'personalized') {
                              setActiveHeroView('personalized');
                            } else if (slide.type === 'scroll') {
                              const el = document.getElementById((slide as any).target!);
                              el?.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          className="bg-white text-gray-900 px-5 py-2 md:px-8 md:py-3 rounded-full md:rounded-xl font-bold md:font-black text-[10px] md:text-sm hover:bg-black hover:text-white transition-all shadow-lg md:shadow-xl flex items-center gap-1 md:gap-2 transform hover:scale-105 active:scale-95"
                        >
                          {slide.cta} <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      )}
                    </motion.div>
                  </div>

                  {/* Featured Product Image */}
                  <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: 0.4, type: "spring" }}
                    className="hidden md:flex relative w-1/3 aspect-square items-center justify-center"
                  >
                    <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full" />
                    <img
                      src={slide.productImage}
                      alt=""
                      className="relative max-h-full max-w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform hover:rotate-3 transition-transform duration-500"
                    />
                  </motion.div>
                </div>
              )}
            </div>
          ))}

          {/* Slider Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {dynamicHeroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'bg-white w-6 md:w-10 shadow-lg' : 'bg-white/30 w-1.5 hover:bg-white/50'}`}
              />
            ))}
          </div>

          {/* Navigation Arrows - Hidden on Mobile */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + dynamicHeroSlides.length) % dynamicHeroSlides.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white p-3 rounded-full backdrop-blur-md text-white hover:text-black transition-all border border-white/20 hidden md:flex items-center justify-center shadow-lg group-hover:scale-110"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % dynamicHeroSlides.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white p-3 rounded-full backdrop-blur-md text-white hover:text-black transition-all border border-white/20 hidden md:flex items-center justify-center shadow-lg group-hover:scale-110"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      ) : (
        /* Detailed Section View (e.g. Personalized) */
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveHeroView(null)}
                className="p-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Personalized Gifts</h2>
                <p className="text-gray-500 text-sm">Explore categories and subcategories</p>
              </div>
            </div>
            <Link
              to="/products?section=sec_personalised"
              className="hidden md:flex items-center gap-2 text-primary font-bold hover:underline"
            >
              View All Personalized <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopCategories
              .filter(cat => cat.sectionIds?.includes('sec_personalised') || cat.sectionId === 'sec_personalised')
              .map(cat => (
                <div key={cat.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <img src={cat.image} alt="" className="w-full h-full object-contain p-1" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 leading-tight">{cat.name}</h4>
                      <Link
                        to={`/products?category=${encodeURIComponent(cat.name)}`}
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-purple-700 mt-1 block"
                      >
                        Explore Category
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {subCategories
                      .filter(sub => sub.categoryId === cat.id || sub.categoryId === (cat as any)._id)
                      .map(sub => (
                        <Link
                          key={sub.id || sub._id}
                          to={`/products?category=${encodeURIComponent(cat.name)}&subCategory=${encodeURIComponent(sub.name)}`}
                          className="bg-gray-50 hover:bg-primary/10 text-gray-600 hover:text-primary px-3 py-1.5 rounded-full text-xs font-semibold transition-all border border-transparent hover:border-primary/20"
                        >
                          {sub.name}
                        </Link>
                      ))
                    }
                    {subCategories.filter(sub => sub.categoryId === cat.id || sub.categoryId === (cat as any)._id).length === 0 && (
                      <span className="text-[10px] text-gray-400 italic">No subcategories</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}





      {/* Special Occasions */}
      {
        specialOccasions.length > 0 ? (
          <FadeInSection>
            <div id="special-occasions-section" className="max-w-7xl mx-auto py-8 md:py-12 px-4 text-center">
              <div className="text-center mb-6 md:mb-10">
                <h2 className="text-xl md:text-4xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
                  <Sparkles className="text-accent w-6 h-6 md:w-8 md:h-8" /> Special Occasions
                </h2>
                <p className="text-gray-500 mt-2 max-w-2xl mx-auto text-xs md:text-base">Make your milestones unforgettable with our specially curated collections.</p>
                <div className="mt-3 w-16 md:w-24 h-1 bg-primary mx-auto"></div>
              </div>

              <div className={`grid gap-3 md:gap-8 ${specialOccasions.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' :
                specialOccasions.length === 2 ? 'grid-cols-2' :
                  'grid-cols-2 md:grid-cols-3'
                }`}>
                {specialOccasions.map((occasion) => {
                  return (
                    <motion.div
                      key={occasion.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group"
                    >
                      <Link
                        to={`/occasion/${occasion.id}`}
                        className="w-full block text-left group relative overflow-hidden rounded-3xl aspect-[16/9] shadow-lg hover:shadow-2xl transition-all duration-500"
                      >
                        <img
                          src={occasion.image}
                          alt={occasion.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-12">
                          <h3 className={`${specialOccasions.length === 1 ? 'text-3xl md:text-6xl' : 'text-xl md:text-3xl'} font-black text-white mb-2 transform transition-transform duration-500 group-hover:-translate-y-2 tracking-tight`}>
                            {occasion.name}
                          </h3>
                          <p className={`text-gray-300 ${specialOccasions.length === 1 ? 'text-sm md:text-lg' : 'text-[10px] md:text-sm'} opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 line-clamp-2 font-medium max-w-2xl`}>
                            {occasion.description}
                          </p>
                          <div className="mt-4 flex items-center gap-2 text-white text-[10px] md:text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            Explore Now <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                          </div>
                        </div>
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-5 h-5 text-white" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </FadeInSection>
        ) : (
          /* Breakthrough spacer when Special Occasions is empty */
          <div className="py-4 md:py-10" />
        )
      }


      {/* Occasions Grid */}
      <FadeInSection>
        <div id="shop-by-occasion-section" className="max-w-7xl mx-auto py-4 md:py-6 px-4">
          <h3 className="text-base md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2"><Gift className="w-5 h-5 text-accent" /> Shop By Occasion</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {shopOccasions.length > 0 ? [...shopOccasions].sort((a, b) => (a.order || 0) - (b.order || 0)).slice(0, 4).map((occ, idx) => {
              const staticOcc = OCCASIONS.find(o => o.name === occ.name) || OCCASIONS[idx % OCCASIONS.length];
              return (
                <Link to={`/products?occasion=${encodeURIComponent(occ.name)}`} key={occ.id} className="relative h-24 md:h-48 rounded-xl overflow-hidden cursor-pointer group shadow-md block">
                  <img src={occ.image} alt={occ.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className={`absolute inset-0 bg-gradient-to-b ${staticOcc?.color || 'from-gray-500 to-gray-700'} opacity-60 group-hover:opacity-50 transition-opacity`} />
                  <div className="absolute inset-0 flex items-center justify-center"><span className="text-white font-bold text-sm md:text-xl drop-shadow-md tracking-wide border-b-2 border-transparent group-hover:border-white transition-all pb-1 text-center px-1">{occ.name}</span></div>
                </Link>
              );
            }) : OCCASIONS.map(occ => (
              <Link to={`/products?occasion=${encodeURIComponent(occ.name)}`} key={occ.id} className="relative h-24 md:h-48 rounded-xl overflow-hidden cursor-pointer group shadow-md block">
                <img src={occ.image} alt={occ.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className={`absolute inset-0 bg-gradient-to-b ${occ.color} opacity-60 group-hover:opacity-50 transition-opacity`} />
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-white font-bold text-sm md:text-xl drop-shadow-md tracking-wide border-b-2 border-transparent group-hover:border-white transition-all pb-1 text-center px-1">{occ.name}</span></div>
              </Link>
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* Shop By Recipient Section - Positioned prominently after Shop By Occasion */}
      {
        !activeHeroView && (
          <FadeInSection>
            <div id="shop-by-recipient-section" className="py-6 md:py-10 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-end mb-4 md:mb-6">
                  <div>
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5 md:w-8 md:h-8 text-primary" /> Shop by Recipient
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">Find the perfect match for your loved ones</p>
                  </div>
                </div>
              </div>
              <div className="w-full md:max-w-7xl md:mx-auto md:px-0">
                <div className="flex md:grid md:grid-cols-5 gap-3 md:gap-5 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scrollbar-hide snap-x px-4 md:px-0">
                  {shopRecipients.length > 0 ? (
                    shopRecipients.map((recipient) => (
                      <motion.div
                        key={recipient.id}
                        className="min-w-[28%] md:min-w-0 snap-start"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Link to={recipient.link} className="group block h-full">
                          <div className="relative aspect-[4/5] rounded-[1.2rem] md:rounded-[1.8rem] overflow-hidden mb-2 shadow-md group-hover:shadow-xl transition-all duration-500">
                            <img
                              src={recipient.image}
                              alt={recipient.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x500/e2e8f0/1e293b?text=' + recipient.name;
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                            <div className="absolute bottom-3 md:bottom-5 inset-x-0 text-center">
                              <span className="text-white font-bold text-[11px] md:text-xl tracking-tight uppercase px-1">{recipient.name}</span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  ) : (
                    RECIPIENTS.map((rec, i) => (
                      <motion.div
                        key={rec.id}
                        className="min-w-[28%] md:min-w-0 snap-start"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Link to={rec.link} className="group block h-full">
                          <div className="relative aspect-[4/5] rounded-[1.2rem] md:rounded-[1.8rem] overflow-hidden mb-2 shadow-md group-hover:shadow-xl transition-all duration-500">
                            <img
                              src={rec.image}
                              alt={rec.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                            <div className="absolute bottom-3 md:bottom-5 inset-x-0 text-center">
                              <span className="text-white font-bold text-[11px] md:text-xl tracking-tight uppercase px-1">{rec.name}</span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </FadeInSection>
        )
      }



      {/* Trust Strip */}
      <FadeInSection>
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border-y border-purple-100 py-4 md:py-10 mt-4 md:mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-3 md:mb-10">
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 block mb-1 md:mb-3">Trusted by 10,000+ Customers</span>
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-6 text-[8px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                <span className="flex items-center gap-1 md:gap-2"><ShieldCheck className="w-2.5 h-2.5 md:w-4 md:h-4 text-green-500" /> Secure UPI</span>
                <span className="hidden md:inline text-gray-200">|</span>
                <span className="flex items-center gap-1 md:gap-2"><Truck className="w-2.5 h-2.5 md:w-4 md:h-4 text-blue-500" /> Fast Delivery</span>
                <span className="hidden md:inline text-gray-200">|</span>
                <span className="flex items-center gap-1 md:gap-2"><Zap className="w-2.5 h-2.5 md:w-4 md:h-4 text-amber-500" /> SSL Secured</span>
              </div>
            </div>
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.15 } }
              }}
            >
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-3 group cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-1.5 md:p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Truck className="w-4 h-4 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <span className="text-[10px] md:text-lg font-bold text-gray-800 block">Free Delivery</span>
                  <span className="text-[9px] md:text-xs text-gray-500 hidden md:block">On all orders</span>
                </div>
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-3 group cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-1.5 md:p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <ShieldCheck className="w-4 h-4 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <span className="text-[10px] md:text-lg font-bold text-gray-800 block">100% Quality</span>
                  <span className="text-[9px] md:text-xs text-gray-500 hidden md:block">Guaranteed</span>
                </div>
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-3 group cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-1.5 md:p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Gift className="w-4 h-4 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <span className="text-[10px] md:text-lg font-bold text-gray-800 block">Premium Pack</span>
                  <span className="text-[9px] md:text-xs text-gray-500 hidden md:block">Luxury boxes</span>
                </div>
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-3 group cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                <div className="bg-gradient-to-br from-orange-400 to-amber-500 p-1.5 md:p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <User className="w-4 h-4 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <span className="text-[10px] md:text-lg font-bold text-gray-800 block">24/7 Support</span>
                  <span className="text-[9px] md:text-xs text-gray-500 hidden md:block">Always here</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </FadeInSection>

      {/* Trending Gifts */}
      <FadeInSection>
        <ScrollableProductSection
          title="Trending Gifts 🔥"
          subtitle="Latest favorites everyone is talking about"
          products={displayProducts.filter(p => p.isTrending)}
          viewAllLink="/products?filter=trending"
          formatPrice={formatPrice}
        />
      </FadeInSection>
      {/* Special Combo Offer Banner Card - Enhanced */}
      {comboOffers.length > 0 && !activeHeroView && (
        <FadeInSection>
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
            <div className="relative group overflow-hidden rounded-[1.5rem] md:rounded-[2rem] shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-pink-900/40 z-10" />
              <img
                src={COMBO_BANNER_BG}
                alt="Combo Offer Background"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[10s]"
              />

              <div className="relative z-20 p-6 md:p-16 flex flex-col xl:flex-row items-center gap-4 md:gap-8">
                <div className="flex-1 text-center xl:text-left">
                  <Link to="/shop?filter=combo" className="block hover:opacity-90 transition-opacity">
                    <span className="inline-block bg-rose-500 text-white text-[10px] md:text-xs font-black px-3 py-1 md:px-4 md:py-1 rounded-full uppercase tracking-widest mb-2 md:mb-4 shadow-lg animate-bounce">
                      Combo Offer Exclusive
                    </span>
                    <h2 className="text-2xl md:text-6xl font-black text-white mb-2 md:mb-4 tracking-tighter leading-tight drop-shadow-lg">
                      Special <span className="text-rose-400">Combo</span> Offers!
                    </h2>
                  </Link>
                  <p className="text-white/80 text-sm md:text-xl font-medium mb-4 md:mb-8 max-w-xl mx-auto xl:mx-0 line-clamp-2 md:line-clamp-none">
                    Double the joy with our hand-picked combo sets. Exclusive designs at unbelievable prices.
                  </p>

                  {/* Dynamic Combo Buttons */}
                  <div className="flex flex-wrap gap-2 md:gap-3 justify-center xl:justify-start">
                    {comboOffers.slice(0, 6).map(combo => (
                      <Link
                        key={combo.id}
                        to={`/product/${combo.id}`}
                        className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white hover:text-rose-600 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all transform hover:scale-105 hover:shadow-lg flex items-center gap-1.5 md:gap-2"
                      >
                        <Heart className="w-3 h-3 md:w-4 md:h-4 fill-current" /> {combo.name}
                      </Link>
                    ))}
                    <Link
                      to="/shop?filter=combo"
                      className="bg-rose-500 text-white border border-rose-500 hover:bg-white hover:text-rose-600 px-3 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-black text-xs md:text-sm transition-all transform hover:scale-105 hover:shadow-lg flex items-center gap-1.5 md:gap-2"
                    >
                      View All <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                    </Link>
                  </div>
                </div>

                {/* Enhanced Right Side - Showcase */}
                <div className="flex-1 w-full max-w-2xl mt-4 md:mt-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400/20 blur-[100px] rounded-full animate-pulse" />
                    {/* Display up to 3 combo images in an attractive grid/layout */}
                    <div className="relative grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                      {comboOffers.slice(0, 3).map((combo, i) => (
                        <motion.div
                          key={combo.id}
                          initial={{ opacity: 0, y: 50 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.2 }}
                          className={`bg-white rounded-xl md:rounded-2xl p-1.5 md:p-2 shadow-2xl transform hover:scale-105 transition-transform cursor-pointer overflow-hidden ${i === 1 ? 'md:-translate-y-8' : ''} ${i === 2 ? 'hidden md:block' : ''}`}
                        >
                          <Link to={`/product/${combo.id}`} className="block">
                            <div className="aspect-square relative overflow-hidden rounded-lg md:rounded-xl bg-gray-50">
                              <img src={combo.image} alt={combo.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="mt-2 md:mt-3 text-center px-2 pb-1 md:pb-2">
                              <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest line-clamp-1 mb-0.5 md:mb-1">{combo.name}</p>
                              <p className="text-primary font-black text-xs md:text-sm">₹{combo.finalPrice}</p>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      )}

      {/* Best Sellers */}
      <FadeInSection>
        <ScrollableProductSection
          title="Best Sellers 🏆"
          subtitle="Our most popular products loved by everyone"
          products={displayProducts.filter(p => p.isBestseller)}
          viewAllLink="/products?filter=bestseller"
          formatPrice={formatPrice}
        />
      </FadeInSection>

      {/* Gifts by Budget */}
      {/* Gifts by Budget */}
      {
        !activeHeroView && (
          <div className="max-w-7xl mx-auto px-4 mt-8 md:mt-16 mb-8 md:mb-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 md:mb-10"
            >
              <h2 className="text-xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-2 md:gap-3">
                <Wallet className="w-6 h-6 md:w-10 md:h-10 text-primary" /> Find Gifts by Budget
              </h2>
              <p className="text-gray-500 font-bold mt-2 text-sm md:text-lg">Quick picks that fit your pocket</p>
              <div className="mt-4 w-16 md:w-20 h-1.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 mx-auto rounded-full"></div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
              className="flex flex-wrap gap-3 md:gap-6 justify-center"
            >
              {BUDGET_OPTIONS.map((opt) => (
                <motion.div
                  key={opt.value}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8, y: 20 },
                    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
                  }}
                >
                  <Link
                    to={`/products?budget=${opt.value}`}
                    className={`group px-5 py-3 md:px-8 md:py-5 rounded-2xl md:rounded-[2rem] text-xs md:text-lg font-black border-2 transition-all hover:shadow-2xl hover:-translate-y-1.5 active:scale-95 flex items-center gap-2 md:gap-3 shadow-sm ${opt.color}`}
                  >
                    {opt.label}
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-3 group-hover:translate-x-0" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )
      }

      {/* Dynamic Shop Sections */}
      {
        sections.map(section => (
          <FadeInSection key={section.id}>
            <ShopSection section={section} categories={shopCategories} />
          </FadeInSection>
        ))
      }

      {/* Gift Genie Promo Banner */}
      <FadeInSection>
        <div className="max-w-7xl mx-auto px-4 py-12 relative">
          <div className="bg-gradient-to-r from-purple-900 via-indigo-800 to-purple-900 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-purple-700/50">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white">Confused what to buy?</h3>
                <p className="text-purple-200 text-sm md:text-base">Ask our Gift Genie for perfect recommendations!</p>
              </div>
            </div>
            <button
              onClick={() => setIsGiftAdvisorOpen(true)}
              className="bg-white text-purple-900 px-8 py-3 rounded-full font-bold text-sm md:text-base hover:bg-yellow-400 hover:text-purple-900 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
            >
              <Gift className="w-5 h-5" /> Launch Gift Genie
            </button>
          </div>
        </div>
      </FadeInSection>

      {/* Recently Viewed */}
      <FadeInSection>
        <RecentlyViewedDetails />
      </FadeInSection>

    </div >
  );
};
