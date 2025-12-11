import React, { useState, useEffect } from 'react';
import { products, calculatePrice } from '../data/products';
import { Link } from 'react-router-dom';
import { useCart } from '../context';
import { Star, ChevronLeft, ChevronRight, Gift, Truck, ShieldCheck, Heart, Zap, User, Briefcase, Sparkles, History } from 'lucide-react';
import { ShopSection } from '../components/ShopSection';
import { Section, ShopCategory } from '../types';

const CATEGORIES = [
  { id: '3d-crystal', name: '3D Crystals', image: 'src/assets/heart-shaped_3D.png' },
  { id: 'wood-engraving', name: 'Wood Art', image: 'src/assets/wooden art.png' },
  { id: 'neon-gifts', name: 'Neon Lights', image: 'src/assets/neon light.png' },
  { id: 'wallets', name: 'Wallets', image: 'src/assets/wallet.png' },
  { id: 'pillows', name: 'Pillows', image: 'src/assets/pillow.png' },
  { id: 'mugs', name: 'Mugs', image: 'src/assets/mug.png' },
  { id: 'clocks', name: 'Clocks', image: 'src/assets/clock.png' },
];

const OCCASIONS = [
  { id: 'birthday', name: 'Birthday', image: 'https://images.unsplash.com/photo-1530103862676-de3c9fa59588?q=80&w=400&auto=format&fit=crop', color: 'from-pink-500 to-rose-500' },
  { id: 'anniversary', name: 'Anniversary', image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?q=80&w=400&auto=format&fit=crop', color: 'from-red-500 to-pink-600' },
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
    id: 2,
    image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1920&auto=format&fit=crop',
    title: '3D Crystal Art',
    subtitle: 'Laser engraved crystals that last a lifetime.',
    cta: 'Shop Crystals',
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

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        const ids = JSON.parse(stored);
        // Map IDs to products, maintaining order
        const viewed = ids
          .map((id: string) => allProducts.find(p => p.id === id || (p as any)._id === id) || products.find(p => p.id === id))
          .filter(Boolean);
        setRecentProducts(viewed);
      }
    } catch (e) {
      console.error(e);
    }
  }, [allProducts]);

  if (recentProducts.length === 0) return null;

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
    <div className="max-w-7xl mx-auto py-8 px-4 border-t border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <History className="w-6 h-6 text-gray-700" /> Recently Viewed
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {recentProducts.slice(0, 5).map((product) => {
          const prices = calculatePrice(product);
          const productId = product.id || (product as any)._id;
          return (
            <div key={productId} className="relative group">
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

export const Home: React.FC = () => {
  const { currency, wishlist, toggleWishlist, setIsGiftAdvisorOpen, products: contextProducts } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);
  const [shopCategories, setShopCategories] = useState<ShopCategory[]>([]);

  // Use context products if available, fallback to local
  const displayProducts = contextProducts.length > 0 ? contextProducts : products;

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
        const [sectionsRes, categoriesRes] = await Promise.all([
          fetch('http://localhost:5000/api/sections'),
          fetch('http://localhost:5000/api/shop-categories')
        ]);
        const sectionsData = await sectionsRes.json();
        const categoriesData = await categoriesRes.json();
        setSections(sectionsData);
        setShopCategories(categoriesData);
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
    <div className="min-h-screen bg-white font-sans pb-16">
      {/* Moveable Hero Slider */}
      <div className="relative h-[280px] md:h-[500px] overflow-hidden group bg-gray-900">
        {HERO_SLIDES.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-10" />
            <img src={slide.image} alt={slide.title} className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${index === currentSlide ? 'scale-110' : 'scale-100'}`} />
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4 text-white">
              <h2 className="text-3xl md:text-6xl font-extrabold mb-2 tracking-tight drop-shadow-lg animate-fade-in-up">{slide.title}</h2>
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

      {/* Gift Genie Promo Banner */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-gradient-to-r from-purple-900 via-indigo-800 to-purple-900 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-purple-700/50">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white">Confused what to buy?</h3>
              <p className="text-purple-200 text-sm md:text-base">Ask our AI Gift Genie for perfect recommendations!</p>
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

      {/* Trust Strip */}
      <div className="bg-gray-50 border-b border-gray-100 py-8 pt-12">
        <div className="max-w-7xl mx-auto px-4 flex justify-between md:justify-center md:gap-16 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max"><Truck className="w-5 h-5 text-primary" /><span className="text-xs md:text-sm font-medium text-gray-700">Free Delivery</span></div>
          <div className="flex items-center gap-2 min-w-max"><ShieldCheck className="w-5 h-5 text-primary" /><span className="text-xs md:text-sm font-medium text-gray-700">100% Quality</span></div>
          <div className="flex items-center gap-2 min-w-max"><Gift className="w-5 h-5 text-primary" /><span className="text-xs md:text-sm font-medium text-gray-700">Premium Packaging</span></div>
          <div className="flex items-center gap-2 min-w-max"><User className="w-5 h-5 text-primary" /><span className="text-xs md:text-sm font-medium text-gray-700">24/7 Support</span></div>
        </div>
      </div>

      {/* Dynamic Shop Sections */}
      {sections.map(section => (
        <ShopSection key={section.id} section={section} categories={shopCategories} />
      ))}

      {/* Occasions Grid */}
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Gift className="w-5 h-5 text-accent" /> Shop By Occasion</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {OCCASIONS.map(occ => (
            <Link to={`/products?q=${occ.name}`} key={occ.id} className="relative h-32 md:h-48 rounded-xl overflow-hidden cursor-pointer group shadow-md block">
              <img src={occ.image} alt={occ.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className={`absolute inset-0 bg-gradient-to-b ${occ.color} opacity-60 group-hover:opacity-50 transition-opacity`} />
              <div className="absolute inset-0 flex items-center justify-center"><span className="text-white font-bold text-lg md:text-xl drop-shadow-md tracking-wide border-b-2 border-transparent group-hover:border-white transition-all pb-1">{occ.name}</span></div>
            </Link>
          ))}
        </div>
      </div>

      {/* Signature Collections */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-64 rounded-2xl overflow-hidden group shadow-lg">
            <img src="https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=800&auto=format&fit=crop" alt="3D Crystal" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <h4 className="text-2xl font-bold mb-2">3D Laser Crystals</h4>
              <p className="text-gray-200 mb-4 text-sm">Your photos etched in glass forever.</p>
              <Link to="/products?q=Crystal" className="inline-block bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-accent hover:text-white transition-colors">Explore Now</Link>
            </div>
          </div>
          <div className="relative h-64 rounded-2xl overflow-hidden group shadow-lg">
            <img src="https://images.unsplash.com/photo-1621262780557-b3201b83d245?q=80&w=800&auto=format&fit=crop" alt="Wood Engraving" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <h4 className="text-2xl font-bold mb-2">Wooden Masterpieces</h4>
              <p className="text-gray-200 mb-4 text-sm">Rustic elegance tailored for you.</p>
              <Link to="/products?q=Wood" className="inline-block bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-accent hover:text-white transition-colors">Shop Wood</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Best Sellers Grid */}
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

                {/* Wishlist Button - Sibling to Link */}
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
        <div className="max-w-7xl mx-auto py-8 px-4 mt-8">
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

        <div className="mt-8 text-center md:hidden">
          <Link to="/products" className="inline-block border border-gray-300 bg-white text-gray-800 px-8 py-3 rounded-full font-bold text-sm shadow-sm">Browse All Products</Link>
        </div>
      </div>

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* Corporate Banner */}
      <div className="bg-gray-900 py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center md:justify-start gap-3"><Briefcase className="w-8 h-8 text-accent" /> Corporate Gifting</h3>
            <p className="text-gray-400 max-w-lg">Looking for bulk orders? We create premium custom gifts for employees and clients with your company logo.</p>
          </div>
          <div className="flex gap-4">
            <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">Contact Sales</button>
          </div>
        </div>
      </div>
    </div>
  );
};
