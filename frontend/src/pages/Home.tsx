import React, { useState, useEffect } from 'react';
import { calculatePrice } from '../data/products';
import { Link } from 'react-router-dom';
import { useCart } from '../context';
import { Star, ChevronLeft, ChevronRight, Gift, Truck, ShieldCheck, Heart, Zap, User, Briefcase, Sparkles, History } from 'lucide-react';
import { ShopSection } from '../components/ShopSection';
import { Section, ShopCategory, SpecialOccasion } from '../types';

// CATEGORIES removed
// products import removed previously

const OCCASIONS = [
  { id: 'birthday', name: 'Birthday', image: 'https://images.unsplash.com/photo-1530103862676-de3c9fa59588?q=80&w=400&auto=format&fit=crop', color: 'from-pink-500 to-rose-500' },
  { id: 'anniversary', name: 'Wedding & Anniversary', image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?q=80&w=400&auto=format&fit=crop', color: 'from-red-500 to-pink-600' },
  { id: 'love', name: 'Love & Romance', image: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?q=80&w=400&auto=format&fit=crop', color: 'from-purple-500 to-indigo-500' },
  { id: 'kids', name: 'For Kids', image: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?q=80&w=400&auto=format&fit=crop', color: 'from-yellow-400 to-orange-500' },
];



const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1920&auto=format&fit=crop',
    title: 'Personalized Gifts',
    subtitle: 'Turn moments into memories with custom engravings.',
    cta: 'Start Personalizing',
    link: '/products'
  },

  {
    id: 3,
    image: 'src/assets/neon hero banner.png',
    title: 'Neon Vibes',
    subtitle: 'Brighten up their room with custom neon lights.',
    cta: 'View Neon',
    link: '/products'
  }
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
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recentProducts.map((product) => {
          const prices = calculatePrice(product);
          const productId = product.id || (product as any)._id;
          return (
            <div key={productId} className="min-w-[160px] md:min-w-[220px] snap-start relative group">
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
      className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
    >
      {children}
    </div>
  );
};

export const Home: React.FC = () => {
  const { currency, wishlist, toggleWishlist, setIsGiftAdvisorOpen, products: contextProducts } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);
  const [shopCategories, setShopCategories] = useState<ShopCategory[]>([]);

  // Use context products (from DB)
  const displayProducts = contextProducts;
  const [specialOccasions, setSpecialOccasions] = useState<SpecialOccasion[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch sections and shop categories
    const fetchShopData = async () => {
      try {
        const [sectionsRes, categoriesRes, occasionsRes] = await Promise.all([
          fetch('http://localhost:5000/api/sections'),
          fetch('http://localhost:5000/api/shop-categories'),
          fetch('http://localhost:5000/api/special-occasions')
        ]);
        const sectionsData = await sectionsRes.json();
        const categoriesData = await categoriesRes.json();
        const occasionsData = await occasionsRes.json();
        setSections(sectionsData);
        setShopCategories(categoriesData);
        setSpecialOccasions(occasionsData);
      } catch (error) {
        console.error('Failed to fetch shop data:', error);
      }
    };
    fetchShopData();
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

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
    <div className="min-h-screen bg-app-bg font-sans pb-16">
      {/* Moveable Hero Slider */}
      <div className="relative h-[250px] md:h-[400px] overflow-hidden group bg-gray-900 mt-6 mx-4 rounded-3xl shadow-2xl">
        {HERO_SLIDES.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${index === currentSlide ? 'scale-110' : 'scale-100'}`}
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-6 text-white">
              <span className="text-secondary font-bold text-xs md:text-sm uppercase tracking-[0.3em] mb-3 animate-fade-in-up">Exclusive Collection</span>
              <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter drop-shadow-2xl animate-fade-in-up leading-tight">{slide.title}</h2>
              <p className="text-sm md:text-2xl mb-6 text-gray-100 font-medium max-w-xl drop-shadow-md">{slide.subtitle}</p>
              <Link to={slide.link} className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold text-sm md:text-base hover:bg-accent hover:text-white transition-all shadow-xl flex items-center gap-2 transform hover:scale-105">{slide.cta} <ChevronRight className="w-4 h-4" /></Link>
            </div>
          </div>
        ))}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-accent w-8' : 'bg-white/50 w-2'}`} />
          ))}
        </div>
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-sm text-white transition-all opacity-0 group-hover:opacity-100"><ChevronLeft className="w-6 h-6 md:w-8 md:h-8" /></button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-sm text-white transition-all opacity-0 group-hover:opacity-100"><ChevronRight className="w-6 h-6 md:w-8 md:h-8" /></button>
      </div>

      {/* Quick Category Chips Mobile */}
      <div className="md:hidden flex gap-4 overflow-x-auto py-6 px-4 scrollbar-hide bg-white border-b border-gray-100">
        {shopCategories.length > 0 ? shopCategories.slice(0, 10).map(cat => (
          <Link
            key={cat.id}
            to={`/shop?category=${encodeURIComponent(cat.name)}`}
            className="flex-shrink-0 flex flex-col items-center gap-2 group w-16"
          >
            <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center p-0.5 border-2 border-primary/10 group-active:scale-90 transition-transform overflow-hidden shadow-inner">
              <img src={cat.image} alt="" className="w-full h-full object-cover rounded-xl" />
            </div>
            <span className="text-[10px] font-bold text-gray-800 text-center leading-tight truncate w-full">{cat.name.split(' & ')[0]}</span>
          </Link>
        )) : (
          [...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-xl bg-gray-100 animate-pulse" />
              <div className="w-10 h-2 bg-gray-100 animate-pulse rounded" />
            </div>
          ))
        )}
      </div>

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

      {/* Trust Strip */}
      <FadeInSection>
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border-y border-purple-100 py-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <div className="flex flex-col md:flex-row items-center justify-center gap-3 group cursor-pointer hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Truck className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <span className="text-sm md:text-base lg:text-lg font-bold text-gray-800 block">Free Delivery</span>
                  <span className="text-xs text-gray-500 hidden md:block">On all orders</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-3 group cursor-pointer hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <ShieldCheck className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <span className="text-sm md:text-base lg:text-lg font-bold text-gray-800 block">100% Quality</span>
                  <span className="text-xs text-gray-500 hidden md:block">Guaranteed</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-3 group cursor-pointer hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Gift className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <span className="text-sm md:text-base lg:text-lg font-bold text-gray-800 block">Premium Packaging</span>
                  <span className="text-xs text-gray-500 hidden md:block">Luxury boxes</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-3 group cursor-pointer hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-orange-400 to-amber-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <User className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <span className="text-sm md:text-base lg:text-lg font-bold text-gray-800 block">24/7 Support</span>
                  <span className="text-xs text-gray-500 hidden md:block">Always here</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* Special Occasions - NEW SECTION */}
      <FadeInSection>
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center justify-center gap-3">
              <Sparkles className="text-accent w-8 h-8" /> Special Occasions
            </h2>
            <p className="text-gray-500 mt-2 max-w-2xl mx-auto">Make your milestones unforgettable with our specially curated collections.</p>
            <div className="mt-4 w-24 h-1 bg-primary mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {specialOccasions.map((occasion) => (
              <Link
                key={occasion.id}
                to={occasion.link}
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
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* Occasions Grid */}
      <FadeInSection>
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Gift className="w-5 h-5 text-accent" /> Shop By Occasion</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {OCCASIONS.map(occ => (
              <Link to={`/products?q=${encodeURIComponent(occ.name)}`} key={occ.id} className="relative h-32 md:h-48 rounded-xl overflow-hidden cursor-pointer group shadow-md block">
                <img src={occ.image} alt={occ.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className={`absolute inset-0 bg-gradient-to-b ${occ.color} opacity-60 group-hover:opacity-50 transition-opacity`} />
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-white font-bold text-lg md:text-xl drop-shadow-md tracking-wide border-b-2 border-transparent group-hover:border-white transition-all pb-1">{occ.name}</span></div>
              </Link>
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* Best Sellers Grid (Trending & Best Sellers) */}
      <FadeInSection>
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-6">
            <div><h2 className="text-2xl md:text-3xl font-bold text-gray-900">Trending Gifts 🌟</h2><p className="text-sm text-gray-500 mt-1">Handpicked favorites just for you</p></div>
            <Link to="/products" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {displayProducts.filter(p => p.isTrending).map((product) => {
              const prices = calculatePrice(product);
              return (
                <div key={product.id} className="relative group">
                  <Link to={`/product/${product.id}`} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                    <div className="relative aspect-square bg-white overflow-hidden">
                      <img className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" src={product.image} alt={product.name} loading="lazy" />
                      {product.discount && <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg shadow-sm z-10">{product.discount}% OFF</div>}

                      <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm py-2 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
                        <span className="text-primary font-bold text-sm flex items-center justify-center gap-1"><Zap className="w-3 h-3" /> Personalize</span>
                      </div>
                    </div>

                    <div className="p-3 flex flex-col flex-grow">
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{product.category}</p>
                        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors h-10 leading-5">{product.name}</h3>
                        <div className="flex items-center gap-1 mt-1.5">
                          <div className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">4.8 <Star className="w-2 h-2 fill-current" /></div>
                          <span className="text-[10px] text-gray-400">(1.2k)</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-50 flex justify-between items-center">
                        <div><span className="text-lg font-bold text-gray-900">{formatPrice(prices.final)}</span><span className="text-xs text-gray-400 line-through ml-2">{formatPrice(prices.original)}</span></div>
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={(e) => handleWishlistToggle(e, product)}
                    className={`absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md transition-all transform hover:scale-110 z-20 ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bestsellers Grid */}
          <div className="py-8 mt-8">
            <div className="flex justify-between items-center mb-6">
              <div><h2 className="text-2xl md:text-3xl font-bold text-gray-900">Best Sellers 🏆</h2><p className="text-sm text-gray-500 mt-1">Our most popular products loved by everyone</p></div>
              <Link to="/products?sort=Bestsellers" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {displayProducts.filter(p => p.isBestseller).map((product) => {
                const prices = calculatePrice(product);
                return (
                  <div key={product.id} className="relative group">
                    <Link to={`/product/${product.id}`} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                      <div className="relative aspect-square bg-white overflow-hidden">
                        <img className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" src={product.image} alt={product.name} loading="lazy" />
                        {product.discount && <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg shadow-sm z-10">{product.discount}% OFF</div>}

                        <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm py-2 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
                          <span className="text-primary font-bold text-sm flex items-center justify-center gap-1"><Zap className="w-3 h-3" /> Personalize</span>
                        </div>
                      </div>

                      <div className="p-3 flex flex-col flex-grow">
                        <div className="flex-1">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{product.category}</p>
                          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors h-10 leading-5">{product.name}</h3>
                          <div className="flex items-center gap-1 mt-1.5">
                            <div className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">4.8 <Star className="w-2 h-2 fill-current" /></div>
                            <span className="text-[10px] text-gray-400">(1.2k)</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-gray-50 flex justify-between items-center">
                          <div><span className="text-lg font-bold text-gray-900">{formatPrice(prices.final)}</span><span className="text-xs text-gray-400 line-through ml-2">{formatPrice(prices.original)}</span></div>
                        </div>
                      </div>
                    </Link>

                    <button
                      onClick={(e) => handleWishlistToggle(e, product)}
                      className={`absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md transition-all transform hover:scale-110 z-20 ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* Dynamic Shop Sections */}
      {sections.map(section => (
        <FadeInSection key={section.id}>
          <ShopSection section={section} categories={shopCategories} />
        </FadeInSection>
      ))}




      {/* Recently Viewed */}
      <FadeInSection>
        <RecentlyViewed />
      </FadeInSection>

      {/* Corporate Banner */}
      <FadeInSection>
        <div className="bg-gray-900 py-12 mt-8">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-white text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center md:justify-start gap-3"><Briefcase className="w-8 h-8 text-accent" /> Corporate Gifting</h3>
              <p className="text-gray-400 max-w-lg">Looking for bulk orders? We create premium custom gifts for employees and clients with your company logo.</p>
            </div>
            <div className="flex gap-4">
              <Link to="/corporate" className="bg-white text-gray-900 px-6 py-3 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">Contact Sales</Link>
            </div>
          </div>
        </div>
      </FadeInSection>
    </div>
  );
};
