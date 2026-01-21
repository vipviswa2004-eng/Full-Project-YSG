import React, { useState, useEffect } from 'react';
import { SEO } from '../components/SEO';
import { calculatePrice } from '../data/products';
import { Link } from 'react-router-dom';
import { useCart } from '../context';
import { Star, ChevronLeft, ChevronRight, Gift, Truck, ShieldCheck, Heart, Zap, User, Sparkles, History, ArrowRight, Wallet } from 'lucide-react';
import birthdayImg from '../assets/birthday.png';
import corporateBg from '../assets/corporate_bg.png';
import corporateProduct from '../assets/corporate_gift_product.png';
import personalizedBg from '../assets/personalized_bg.png';
import personalizedProduct from '../assets/personalized_product.png';
import specialBg from '../assets/special_bg.png';
import specialProduct from '../assets/special_product.png';
import occasionBg from '../assets/occasion_bg.png';


import { ShopSection } from '../components/ShopSection';
import { Section, ShopCategory, SpecialOccasion, ShopRecipient, ShopOccasion } from '../types';

// CATEGORIES removed
// products import removed previously

const OCCASIONS = [
  { id: 'birthday', name: 'Birthday', image: birthdayImg, color: 'from-pink-500 to-rose-500' },

  { id: 'anniversary', name: 'Wedding & Anniversary', image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?q=80&w=400&auto=format&fit=crop', color: 'from-red-500 to-pink-600' },
  { id: 'love', name: 'Love & Romance', image: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?q=80&w=400&auto=format&fit=crop', color: 'from-purple-500 to-indigo-500' },
  { id: 'kids', name: 'For Kids', image: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?q=80&w=400&auto=format&fit=crop', color: 'from-yellow-400 to-orange-500' },
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
  }
];

const BUDGET_OPTIONS = [
  { label: 'Under ₹499', value: '0-499', color: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600' },
  { label: '₹500 - ₹999', value: '500-999', color: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600' },
  { label: '₹1000 - ₹1999', value: '1000-1999', color: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-600 hover:text-white hover:border-purple-600' },
  { label: 'Luxury Gifts', value: '2000-max', color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-600 hover:text-white hover:border-amber-600' }
];





const RecentlyViewed: React.FC = () => {
  const { products: allProducts, currency, wishlist, toggleWishlist } = useCart();
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        const ids = JSON.parse(stored);
        // Map IDs to products, maintaining order
        const viewed = ids
          .map((id: string) => allProducts.find(p => p.id === id || (p as any)._id === id))
          .filter(Boolean);
        setRecentProducts(viewed);
      }
    } catch (e) {
      console.error(e);
    }
  }, [allProducts]);

  if (recentProducts.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const formatPrice = (price: number) => {
    return currency === 'INR'
      ? `₹${price.toLocaleString('en-IN')}`
      : `$${(price * 0.012).toFixed(2)}`;
  };

  const isInWishlist = (id: string) => wishlist.some(p => p.id === id);

  const handleWishlistToggle = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 border-t border-gray-100 relative group/section">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <History className="w-6 h-6 text-gray-700" /> Recently Viewed
        </h2>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 bg-white transition-colors"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 bg-white transition-colors"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <Link to="/products?filter=recent" className="text-primary font-bold text-sm hover:underline flex items-center gap-1 ml-2">View All <ChevronRight className="w-4 h-4" /></Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2 md:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recentProducts.map((product) => {
          const prices = calculatePrice(product);
          const productId = product.id || (product as any)._id;
          return (
            <div key={productId} className="w-[30vw] min-w-[30vw] max-w-[30vw] md:w-[240px] md:min-w-[240px] md:max-w-[240px] flex-none snap-start relative group">
              <Link to={`/product/${productId}`} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                <div className="relative aspect-square bg-white overflow-hidden">
                  <img className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105" src={product.image} alt={product.name} loading="lazy" />
                  {product.discount && <div className="absolute top-0 left-0 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-lg shadow-sm z-10">{product.discount}% OFF</div>}
                </div>

                <div className="p-2.5 flex flex-col flex-grow">
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 h-8 leading-4 group-hover:text-primary transition-colors">{product.name}</h3>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-gray-900">{formatPrice(prices.final)}</span>
                    {(product.discount !== undefined && product.discount > 0) && (
                      <span className="text-[10px] text-gray-400 line-through">{formatPrice(prices.original)}</span>
                    )}
                  </div>
                </div>
              </Link>

              <button
                onClick={(e) => handleWishlistToggle(e, product)}
                className={`absolute top-1.5 right-1.5 p-1 bg-white rounded-full shadow-sm transition-all hover:scale-110 z-20 ${isInWishlist(productId) ? 'text-red-500' : 'text-gray-300 hover:text-red-500'}`}
              >
                <Heart className={`w-3.5 h-3.5 ${isInWishlist(productId) ? 'fill-current' : ''}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Simple Fade-in Observer Component
const FadeInSection = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setIsVisible(entry.isIntersecting));
    }, { threshold: 0.1 });
    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-500 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
    >
      {children}
    </div>
  );
};

const ScrollableProductSection: React.FC<{
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  products: any[];
  viewAllLink: string;
  currency: string;
  isInWishlist: (id: string) => boolean;
  onWishlistToggle: (e: React.MouseEvent, product: any) => void;
  formatPrice: (price: number) => string;
}> = ({ title, subtitle, icon, products, viewAllLink, isInWishlist, onWishlistToggle, formatPrice }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -800 : 800;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 relative group/section">
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

      <div
        ref={scrollRef}
        className="flex gap-2 md:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => {
          const prices = calculatePrice(product);
          return (
            <div key={product.id} className="w-[30vw] min-w-[30vw] max-w-[30vw] md:w-[240px] md:min-w-[240px] md:max-w-[240px] flex-none snap-start relative group">
              <Link to={`/product/${product.id}`} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden">
                <div className="relative aspect-square bg-white overflow-hidden">
                  <img className="w-full h-full object-contain p-0 md:p-3 transition-transform duration-500 group-hover:scale-105" src={product.image} alt={product.name} loading="lazy" />
                  {product.discount && <div className="absolute top-0 left-0 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-lg shadow-sm z-10">{product.discount}% OFF</div>}

                  <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm py-2 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
                    <span className="text-primary font-bold text-sm flex items-center justify-center gap-1"><Zap className="w-3 h-3" /> Personalize</span>
                  </div>
                </div>

                <div className="p-1.5 md:p-3 flex flex-col flex-grow">
                  <div className="flex-1">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1 line-clamp-1">{product.category}</p>
                    <h3 className="text-[10px] md:text-sm font-semibold text-gray-800 line-clamp-2 h-7 md:h-9 leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">4.8 <Star className="w-2 h-2 fill-current" /></div>
                      <span className="text-[10px] text-gray-400 hidden md:inline">(1.2k)</span>
                    </div>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1 border-t border-gray-50 pt-1">
                    <span className="text-xs md:text-lg font-bold text-gray-900">{formatPrice(prices.final)}</span>
                    {(product.discount !== undefined && product.discount > 0) && (
                      <span className="text-[10px] text-gray-400 line-through">{formatPrice(prices.original)}</span>
                    )}
                  </div>
                </div>
              </Link>
              <button
                onClick={(e) => onWishlistToggle(e, product)}
                className={`absolute top-1 right-1 p-1 md:p-1.5 bg-white rounded-full shadow-md transition-all transform hover:scale-110 z-20 ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-300 hover:text-red-500'}`}
              >
                <Heart className={`w-3 h-3 md:w-4 md:h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Home: React.FC = () => {
  const { currency, wishlist, toggleWishlist, setIsGiftAdvisorOpen, products: contextProducts } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);
  const [shopCategories, setShopCategories] = useState<ShopCategory[]>([]);
  const [shopRecipients, setShopRecipients] = useState<ShopRecipient[]>([]);

  // Use context products (from DB)
  const displayProducts = contextProducts;
  const [specialOccasions, setSpecialOccasions] = useState<SpecialOccasion[]>([]);
  const [shopOccasions, setShopOccasions] = useState<ShopOccasion[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [activeHeroView, setActiveHeroView] = useState<string | null>(null);

  useEffect(() => {
    // 1. Try to load from cache first for instant display
    try {
      const cachedSections = localStorage.getItem('cache_sections');
      const cachedCategories = localStorage.getItem('cache_shopCategories');
      const cachedSpecial = localStorage.getItem('cache_specialOccasions');
      const cachedShopOccasions = localStorage.getItem('cache_shopOccasions');
      const cachedRecipients = localStorage.getItem('cache_shopRecipients');

      if (cachedSections) setSections(JSON.parse(cachedSections));
      if (cachedCategories) setShopCategories(JSON.parse(cachedCategories));
      if (cachedSpecial) setSpecialOccasions(JSON.parse(cachedSpecial));
      if (cachedShopOccasions) setShopOccasions(JSON.parse(cachedShopOccasions));
      if (cachedRecipients) setShopRecipients(JSON.parse(cachedRecipients));
    } catch (e) {
      console.warn("Error reading from cache", e);
    }

    // 2. Fetch fresh data
    const fetchShopData = async () => {
      try {
        const [sectionsRes, categoriesRes, occasionsRes, shopOccasionsRes, subRes, recipientsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/sections`),
          fetch(`${import.meta.env.VITE_API_URL}/api/shop-categories`),
          fetch(`${import.meta.env.VITE_API_URL}/api/special-occasions`),
          fetch(`${import.meta.env.VITE_API_URL}/api/shop-occasions`),
          fetch(`${import.meta.env.VITE_API_URL}/api/sub-categories`),
          fetch(`${import.meta.env.VITE_API_URL}/api/shop-recipients`)
        ]);

        const sectionsData = await sectionsRes.json();
        const categoriesData = await categoriesRes.json();
        const occasionsData = await occasionsRes.json();
        const shopOccasionsData = await shopOccasionsRes.json();
        const subCategoriesData = await subRes.json();
        const recipientsData = await recipientsRes.json();

        // Update state
        setSections(sectionsData);
        setShopCategories(categoriesData);
        setSpecialOccasions(occasionsData);
        setShopOccasions(shopOccasionsData);
        setSubCategories(subCategoriesData);
        setShopRecipients(recipientsData);

        // Update cache
        try {
          localStorage.setItem('cache_sections', JSON.stringify(sectionsData));
          localStorage.setItem('cache_shopCategories', JSON.stringify(categoriesData));
          localStorage.setItem('cache_specialOccasions', JSON.stringify(occasionsData));
          localStorage.setItem('cache_shopOccasions', JSON.stringify(shopOccasionsData));
          localStorage.setItem('cache_shopRecipients', JSON.stringify(recipientsData));
        } catch (e) {
          console.warn("Cache quota exceeded, skipping cache update", e);
          // Optional: clear old cache to free space
          // localStorage.clear(); 
        }

      } catch (error) {
        console.error('Failed to fetch shop data:', error);
      }
    };
    fetchShopData();
  }, []);

  useEffect(() => {
    if (activeHeroView) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeHeroView]);

  const isInWishlist = (id: string) => wishlist.some(p => p.id === id);

  const formatPrice = (price: number) => {
    return currency === 'INR'
      ? `₹${price.toLocaleString('en-IN')}`
      : `$${(price * 0.012).toFixed(2)}`;
  };

  const handleWishlistToggle = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="min-h-screen bg-app-bg font-sans pb-0 md:pb-16">
      <SEO
        keywords={['custom gifts', 'personalized neon', 'home decor', 'corporate gifts']}
      />
      {!activeHeroView ? (
        <div className="relative h-[180px] md:h-[320px] overflow-hidden group bg-gray-900 mt-4 mx-3 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border-2 md:border-4 border-white">
          {HERO_SLIDES.map((slide, index) => (
            <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10 z-10" />
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${index === currentSlide ? 'scale-110' : 'scale-100'}`}
              />
              <div className="absolute inset-0 z-20 flex items-center justify-between px-6 md:px-20 text-white">
                <div className="flex flex-col items-start text-left max-w-xl">
                  <span className={`${slide.color} font-black text-[9px] md:text-xs uppercase tracking-[0.3em] mb-1 md:mb-3 animate-fade-in-up drop-shadow-sm`}>{slide.tag}</span>
                  <h2 className="text-2xl md:text-5xl font-black mb-2 md:mb-3 tracking-tighter drop-shadow-2xl animate-fade-in-up leading-tight">{slide.title}</h2>
                  <p className="text-[10px] md:text-lg mb-4 md:mb-6 text-gray-200 font-medium drop-shadow-md animate-fade-in-up delay-100 max-w-[200px] md:max-w-full leading-tight">{slide.subtitle}</p>

                  {slide.type === 'link' ? (
                    <Link to={slide.link!} className="bg-white text-gray-900 px-5 py-2 md:px-8 md:py-3 rounded-lg md:rounded-xl font-black text-[10px] md:text-sm hover:bg-black hover:text-white transition-all shadow-xl flex items-center gap-1 md:gap-2 transform hover:scale-105 active:scale-95 animate-fade-in-up delay-200">
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
                      className="bg-white text-gray-900 px-5 py-2 md:px-8 md:py-3 rounded-lg md:rounded-xl font-black text-[10px] md:text-sm hover:bg-black hover:text-white transition-all shadow-xl flex items-center gap-1 md:gap-2 transform hover:scale-105 active:scale-95 animate-fade-in-up delay-200"
                    >
                      {slide.cta} <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  )}
                </div>

                {/* Featured Product Image */}
                <div className="hidden md:flex relative w-1/3 aspect-square items-center justify-center animate-fade-in-right">
                  <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full" />
                  <img
                    src={slide.productImage}
                    alt=""
                    className="relative max-h-full max-w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform hover:rotate-3 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Slider Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${idx === currentSlide ? 'bg-white w-10 shadow-lg' : 'bg-white/30 w-2 hover:bg-white/50'}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white p-3 rounded-2xl backdrop-blur-md text-white hover:text-black transition-all border border-white/20 opacity-0 group-hover:opacity-100 hidden md:block"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white p-3 rounded-2xl backdrop-blur-md text-white hover:text-black transition-all border border-white/20 opacity-0 group-hover:opacity-100 hidden md:block"
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
                <div key={cat.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-white">
                      <img src={cat.image} alt="" className="w-full h-full object-cover" />
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





      {/* Special Occasions - NEW SECTION */}
      <FadeInSection>
        <div id="special-occasions-section" className="max-w-7xl mx-auto py-8 md:py-12 px-4">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-xl md:text-4xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
              <Sparkles className="text-accent w-6 h-6 md:w-8 md:h-8" /> Special Occasions
            </h2>
            <p className="text-gray-500 mt-2 max-w-2xl mx-auto text-xs md:text-base">Make your milestones unforgettable with our specially curated collections.</p>
            <div className="mt-3 w-16 md:w-24 h-1 bg-primary mx-auto"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
            {specialOccasions.map((occasion) => {
              const getLink = () => {
                if (occasion.link && occasion.link.trim() !== '' && occasion.link !== '#') return occasion.link;
                return `/products?occasion=${encodeURIComponent(occasion.name)}`;
              };

              return (
                <Link
                  key={occasion.id}
                  to={getLink()}
                  className="group relative overflow-hidden rounded-2xl aspect-[16/9] shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  <img
                    src={occasion.image}
                    alt={occasion.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-2xl font-bold text-white mb-2 transform transition-transform duration-500 group-hover:-translate-y-1">{occasion.name}</h3>
                    <p className="text-gray-200 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      {occasion.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </FadeInSection>

      {/* Occasions Grid */}
      <FadeInSection>
        <div id="shop-by-occasion-section" className="max-w-7xl mx-auto py-4 md:py-6 px-4">
          <h3 className="text-base md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2"><Gift className="w-5 h-5 text-accent" /> Shop By Occasion</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {shopOccasions.length > 0 ? shopOccasions.slice(0, 4).map((occ, idx) => {
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

      {/* Shop By Recipient Section - HIGH CONVERSION */}
      {!activeHeroView && (
        <FadeInSection>
          <div className="max-w-7xl mx-auto py-8 md:py-12 px-4">
            <div className="flex justify-between items-end mb-4 md:mb-8">
              <div>
                <h2 className="text-xl md:text-3xl font-bold text-gray-900">Shop by Recipient</h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Find the perfect match for your loved ones</p>
              </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-6">
              {shopRecipients.length > 0 ? (
                shopRecipients.map((recipient) => (
                  <Link
                    key={recipient.id}
                    to={recipient.link}
                    className="group"
                  >
                    <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-all duration-500">
                      <img
                        src={recipient.image}
                        alt={recipient.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          // Fallback to placeholder if image fails
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400x500/e2e8f0/1e293b?text=' + recipient.name;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      <div className="absolute bottom-4 inset-x-0 text-center">
                        <span className="text-white font-bold text-sm md:text-lg tracking-tight uppercase">{recipient.name}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                ['Him', 'Her', 'Couples', 'Kids', 'Parents'].map((rec) => (
                  <Link
                    key={rec}
                    to={`/products?recipient=${rec}`}
                    className="group"
                  >
                    <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-all duration-500 bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <span className="text-gray-900 font-bold text-lg md:text-xl">For {rec}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </FadeInSection>
      )}





      {/* Trust Strip */}
      <FadeInSection>
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border-y border-purple-100 py-6 md:py-10 mt-6 md:mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-4 md:mb-10">
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 block mb-2 md:mb-3">Trusted by 10,000+ Customers</span>
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-6 text-[8px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                <span className="flex items-center gap-1 md:gap-2"><ShieldCheck className="w-2.5 h-2.5 md:w-4 md:h-4 text-green-500" /> Secure UPI Payments</span>
                <span className="hidden md:inline text-gray-200">|</span>
                <span className="flex items-center gap-1 md:gap-2"><Truck className="w-2.5 h-2.5 md:w-4 md:h-4 text-blue-500" /> Trusted Delivery</span>
                <span className="hidden md:inline text-gray-200">|</span>
                <span className="flex items-center gap-1 md:gap-2"><Zap className="w-2.5 h-2.5 md:w-4 md:h-4 text-amber-500" /> SSL Secured</span>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 group cursor-pointer hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-2 md:p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Truck className="w-5 h-5 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <span className="text-xs md:text-lg font-bold text-gray-800 block">Free Delivery</span>
                  <span className="text-xs text-gray-500 hidden md:block">On all orders</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 group cursor-pointer hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-2 md:p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <ShieldCheck className="w-5 h-5 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <span className="text-xs md:text-lg font-bold text-gray-800 block">100% Quality</span>
                  <span className="text-xs text-gray-500 hidden md:block">Guaranteed</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 group cursor-pointer hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-2 md:p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Gift className="w-5 h-5 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <span className="text-xs md:text-lg font-bold text-gray-800 block">Premium Packaging</span>
                  <span className="text-xs text-gray-500 hidden md:block">Luxury boxes</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 group cursor-pointer hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-orange-400 to-amber-500 p-2 md:p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <User className="w-5 h-5 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <span className="text-xs md:text-lg font-bold text-gray-800 block">24/7 Support</span>
                  <span className="text-xs text-gray-500 hidden md:block">Always here</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>



      {/* Trending Gifts - NEW SECTION */}
      <FadeInSection>
        <ScrollableProductSection
          title="Trending Gifts 🔥"
          subtitle="Latest favorites everyone is talking about"
          products={displayProducts.filter(p => p.isTrending)}
          viewAllLink="/products?filter=trending"
          currency={currency}
          isInWishlist={isInWishlist}
          onWishlistToggle={handleWishlistToggle}
          formatPrice={formatPrice}
        />
      </FadeInSection>

      {/* Best Sellers - NEW SCROLLABLE SECTION */}
      <FadeInSection>
        <ScrollableProductSection
          title="Best Sellers 🏆"
          subtitle="Our most popular products loved by everyone"
          products={displayProducts.filter(p => p.isBestseller)}
          viewAllLink="/products?filter=bestseller"
          currency={currency}
          isInWishlist={isInWishlist}
          onWishlistToggle={handleWishlistToggle}
          formatPrice={formatPrice}
        />
      </FadeInSection>

      {/* Gifts by Budget - Quick Access */}
      {!activeHeroView && (
        <div className="max-w-7xl mx-auto px-4 mt-8 md:mt-16 mb-8 md:mb-12 text-center">
          <div className="mb-6 md:mb-10 animate-fade-in-up">
            <h2 className="text-xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-2 md:gap-3">
              <Wallet className="w-6 h-6 md:w-10 md:h-10 text-primary" /> Find Gifts by Budget
            </h2>
            <p className="text-gray-500 font-bold mt-2 text-sm md:text-lg">Quick picks that fit your pocket</p>
            <div className="mt-4 w-16 md:w-20 h-1.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 mx-auto rounded-full"></div>
          </div>
          <div className="flex flex-wrap gap-3 md:gap-6 justify-center">
            {BUDGET_OPTIONS.map((opt, idx) => (
              <Link
                key={opt.value}
                to={`/products?budget=${opt.value}`}
                className={`group px-5 py-3 md:px-8 md:py-5 rounded-2xl md:rounded-[2rem] text-xs md:text-lg font-black border-2 transition-all hover:shadow-2xl hover:-translate-y-1.5 active:scale-95 flex items-center gap-2 md:gap-3 shadow-sm animate-fade-in-up ${opt.color}`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {opt.label}
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-3 group-hover:translate-x-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

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
                <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
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
        <RecentlyViewed />
      </FadeInSection>



    </div >
  );
};
