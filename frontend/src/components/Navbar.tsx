
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogIn, LogOut, ShieldCheck, UserPlus, Search, Clock, ArrowUpRight, Gift, Heart, ArrowLeft, Briefcase, ArrowRight, ClipboardCheck, Eye, EyeOff } from 'lucide-react';
import { useCart } from '../context';
// import { products } from '../data/products';
import { Product } from '../types';

export const Navbar: React.FC = () => {
  const { cart, wishlist, user, setUser, setIsGiftAdvisorOpen, products, isLoginModalOpen, setIsLoginModalOpen } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Moving Placeholder Logic
  const [placeholderText, setPlaceholderText] = useState('Search for gifts...');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const phrases = React.useMemo(() => {
    const staticPhrases = ["Search for Wallets...", "Search for Keychains...", "Search for Photo Gifts...", "Search for Water Bottles...", "Search for Gifts..."];
    if (!products || products.length === 0) return staticPhrases;
    const categories = Array.from(new Set(products.map(p => p.category))).filter((c): c is string => !!c);
    return categories.length > 0 ? categories.map(c => `Search for ${c}...`) : staticPhrases;
  }, [products]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentPhrase = phrases[placeholderIndex % phrases.length];

      if (!isDeleting) {
        setPlaceholderText(currentPhrase.substring(0, placeholderText.length + 1));
        setTypingSpeed(150);
        if (placeholderText === currentPhrase) {
          setIsDeleting(true);
          setTypingSpeed(2000); // Pause at end
        }
      } else {
        setPlaceholderText(currentPhrase.substring(0, placeholderText.length - 1));
        setTypingSpeed(50);
        if (placeholderText === '') {
          setIsDeleting(false);
          setPlaceholderIndex(prev => prev + 1);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, placeholderIndex, typingSpeed, phrases]);


  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem('recentSearches');
      if (savedSearches) {
        const parsed = JSON.parse(savedSearches);
        if (Array.isArray(parsed)) setRecentSearches(parsed);
      }
    } catch (e) { setRecentSearches([]); }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const outsideDesktop = desktopSearchRef.current && !desktopSearchRef.current.contains(target);
      const outsideMobile = mobileSearchRef.current && !mobileSearchRef.current.contains(target);
      if (outsideDesktop && outsideMobile) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() && products.length > 0) {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query))
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(true);
    }
  }, [searchQuery, products]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        // Register new user
        if (!emailInput.trim() || !passwordInput.trim() || !phoneInput.trim()) {
          setAuthError('Email, phone number, and password are required');
          setAuthLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: emailInput.trim(),
            phone: phoneInput.trim(),
            password: passwordInput
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        setUser(data.user);
        setIsLoginModalOpen(false);
        setEmailInput('');
        setPhoneInput('');
        setPasswordInput('');
      } else {
        // Login existing user
        if (!emailInput.trim() || !passwordInput.trim()) {
          setAuthError('Email/phone and password are required');
          setAuthLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            identifier: emailInput.trim(), // Can be email or phone
            password: passwordInput
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        setUser(data.user);
        setIsLoginModalOpen(false);
        setEmailInput('');
        setPasswordInput('');
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    // Clear local state first
    await setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    setIsLoginModalOpen(false);

    // Redirect to backend logout to clear session
    window.location.href = `${import.meta.env.VITE_API_URL}/api/logout`;
  };

  const openLoginModal = () => {
    setIsMenuOpen(false);
    setIsLoginModalOpen(true);
    setAuthMode('login');
    setEmailInput('');
    setPhoneInput('');
    setPasswordInput('');
    setShowPassword(false);
    setAuthError('');
  };

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'register' : 'login');
    setEmailInput('');
    setPhoneInput('');
    setPasswordInput('');
    setShowPassword(false);
    setAuthError('');
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement> | { key: string }) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId: string) => { navigate(`/product/${productId}`); setSearchQuery(''); setShowSuggestions(false); setIsMenuOpen(false); };
  const handleRecentSearchClick = (term: string) => { setSearchQuery(term); saveRecentSearch(term); navigate(`/products?q=${encodeURIComponent(term)}`); setShowSuggestions(false); };
  const clearRecentSearches = (e: React.MouseEvent) => { e.stopPropagation(); setRecentSearches([]); localStorage.removeItem('recentSearches'); };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gray-900 shadow-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white hover:text-[#f5ebd0] md:hidden p-1" title="Open menu">
                <Menu className="h-6 w-6" />
              </button>
              <Link to="/" className="flex-shrink-0 flex items-center gap-0 focus:outline-none -ml-4">
                <img src="/logo-icon.jpg" alt="UC" className="h-16 w-auto object-contain mix-blend-screen brightness-110 -mr-4" />
                <div className="flex flex-col">
                  <span className="font-black text-xl tracking-tighter text-[#FFB300] leading-none block">SIGN GALAXY</span>
                  <span className="text-[10px] text-gray-400 tracking-widest uppercase block">Personalized Gifts</span>
                </div>
              </Link>
            </div>

            <div className="hidden md:flex flex-1 mx-8 items-center justify-center" ref={desktopSearchRef}>
              <div className="relative w-full max-w-lg">
                <input type="text" placeholder={placeholderText} className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:bg-gray-700 focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} onFocus={() => setShowSuggestions(true)} />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden z-50 animate-fade-in-down">
                    {suggestions.length > 0 && (
                      <div className="py-2">
                        <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Top Suggestions
                        </p>
                        {suggestions.map(product => (
                          <div
                            key={product.id}
                            onClick={() => handleSuggestionClick(product.id)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 cursor-pointer transition-colors"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded-md object-cover border border-gray-700"
                            />
                            <div>
                              <p className="text-sm font-medium text-white line-clamp-1">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {product.category}
                              </p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-gray-500" />
                          </div>
                        ))}
                      </div>
                    )}
                    {searchQuery === '' && recentSearches.length > 0 && (
                      <div className="py-2 border-t border-gray-100">
                        <div className="flex justify-between items-center px-4 py-2">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Recent Searches
                          </p>
                          <button
                            onClick={clearRecentSearches}
                            className="text-[10px] text-red-500 hover:underline font-bold"
                          >
                            Clear
                          </button>
                        </div>
                        {recentSearches.map((term, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleRecentSearchClick(term)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors text-sm text-gray-700"
                          >
                            <Clock className="w-4 h-4 text-gray-400" />
                            {term}
                          </div>
                        ))}
                      </div>
                    )}
                    {searchQuery !== '' && (
                      <div
                        onClick={() => handleSearch({ key: 'Enter' } as React.KeyboardEvent<HTMLInputElement>)}
                        className="bg-gray-900 px-4 py-3 text-center text-sm text-accent font-bold cursor-pointer hover:bg-black border-t border-gray-700"
                      >
                        View all results for "{searchQuery}"
                      </div>
                    )}
                    {searchQuery !== '' && suggestions.length === 0 && (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No products found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4 md:space-x-8">
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-white hover:text-[#f5ebd0] font-medium transition-colors">Home</Link>
                <Link to="/products" className="text-white hover:text-[#f5ebd0] font-medium transition-colors">Shop</Link>
                <Link to="/corporate" className="text-white hover:text-[#f5ebd0] font-medium transition-colors">Corporate</Link>
                {user?.isAdmin && <Link to="/admin" className="text-red-500 hover:text-red-400 font-medium transition-colors">Admin</Link>}
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} className="text-white hover:text-[#f5ebd0] p-1 md:hidden" title="Search"><Search className="h-6 w-6" /></button>
                <button onClick={() => setIsGiftAdvisorOpen(true)} className="text-white hover:text-[#f5ebd0] p-1 hidden md:block" title="Gift Genie"><Gift className="h-6 w-6" /></button>
                <Link to="/wishlist" className="relative text-white hover:text-[#f5ebd0] p-1 hidden md:block">
                  <Heart className="h-6 w-6" />
                  {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">{wishlist.length}</span>}
                </Link>
                <Link to="/cart" className="relative text-white hover:text-[#f5ebd0] p-1 hidden md:block">
                  <ShoppingCart className="h-6 w-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {cart.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  )}
                </Link>
                <Link to="/orders" className="text-white hover:text-[#f5ebd0] p-1 hidden md:block" title="Orders">
                  <ClipboardCheck className="h-6 w-6" />
                </Link>
                <button type="button" onClick={openLoginModal} className="text-white hover:text-[#f5ebd0] items-center gap-2 transition-colors hidden md:flex">
                  {user ? (
                    <div className="flex items-center gap-1">
                      {/* <span className="text-xs md:text-sm font-bold text-[#f5ebd0] max-w-[80px] truncate hidden md:block">
                        {user.email.split('@')[0]}
                      </span> */}
                      <div className="w-8 h-8 bg-purple-900 rounded-full flex items-center justify-center text-white font-bold border border-purple-700">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <User className="h-6 w-6" />
                      <span className="text-sm font-medium hidden md:block">Login</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isMobileSearchOpen && (
          <div className="fixed inset-0 z-[60] bg-gray-900 animate-fade-in flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b">
              <button onClick={() => setIsMobileSearchOpen(false)} className="p-1" title="Back"><ArrowLeft className="w-6 h-6" /></button>
              <div className="relative flex-1">
                <input
                  type="text"
                  autoFocus
                  placeholder={placeholderText}
                  className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(e as any);
                      setIsMobileSearchOpen(false);
                    }
                  }}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {suggestions.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Suggestions</p>
                  {suggestions.map(product => (
                    <div
                      key={product.id}
                      onClick={() => {
                        handleSuggestionClick(product.id);
                        setIsMobileSearchOpen(false);
                      }}
                      className="flex items-center gap-4 p-2 active:bg-gray-50 rounded-xl"
                    >
                      <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover border" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No results found for "{searchQuery}"</p>
                </div>
              ) : recentSearches.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent Searches</p>
                    <button onClick={clearRecentSearches} className="text-[10px] text-red-500 font-bold uppercase">Clear</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          handleRecentSearchClick(term);
                          setIsMobileSearchOpen(false);
                        }}
                        className="px-4 py-2 bg-gray-100 rounded-full text-xs font-bold text-gray-700 active:bg-primary active:text-white transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm italic">What are you looking for today?</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="fixed inset-0 bg-black/70" onClick={() => setIsMenuOpen(false)}></div>
            <div className="relative w-3/4 max-w-xs bg-gray-900 h-full shadow-xl flex flex-col animate-slide-in-left">
              <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
                <span className="font-bold text-lg">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} title="Close menu">
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="p-4 border-b border-gray-100 relative" ref={mobileSearchRef}>
                <div className="relative">
                  <input type="text" placeholder={placeholderText} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} onFocus={() => setShowSuggestions(true)} />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
                  <div className="absolute left-4 right-4 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                    {suggestions.map(product => (
                      <div
                        key={product.id}
                        onClick={() => handleSuggestionClick(product.id)}
                        className="flex items-center gap-3 px-3 py-2 border-b border-gray-50 last:border-0"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                        <p className="text-sm text-gray-800 truncate">
                          {product.name}
                        </p>
                      </div>
                    ))}
                    {searchQuery === '' && recentSearches.map((term, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleRecentSearchClick(term)}
                        className="flex items-center gap-3 px-3 py-2 border-b border-gray-50 text-sm text-gray-600"
                      >
                        <Clock className="w-3 h-3 text-gray-400" />
                        {term}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto py-4 space-y-2">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 text-white hover:bg-gray-800 font-medium">Home</Link>
                <Link to="/products" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 text-white hover:bg-gray-800 font-medium">Shop All</Link>
                <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 text-white hover:bg-gray-800 font-medium">My Orders</Link>
                <Link to="/corporate" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 text-white hover:bg-gray-800 font-medium">Corporate Orders</Link>
                <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 text-white hover:bg-gray-800 font-medium">My Cart ({cart.length})</Link>
                <Link
                  to="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-6 py-3 text-white hover:bg-gray-800 font-medium flex items-center gap-2"
                >
                  My Wishlist
                  {wishlist.length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => { setIsGiftAdvisorOpen(true); setIsMenuOpen(false); }}
                  className="w-full text-left px-6 py-3 text-accent font-medium flex items-center gap-2"
                >
                  <Gift className="w-5 h-5" />
                  Gift Genie
                </button>
                {user?.isAdmin && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 text-red-400 bg-red-900/20 font-medium">Admin Panel</Link>}
                <div className="border-t border-gray-800 mt-4 pt-4 px-6">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Account</p>
                  <button
                    type="button"
                    onClick={openLoginModal}
                    className="w-full text-left py-2 text-accent font-bold"
                  >
                    {user ? `Logout (${user.email.split('@')[0]})` : 'Login / Register'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Modal */}
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 p-4 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={() => setIsLoginModalOpen(false)}
              ></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full relative animate-scale-in">
                {/* Modern Header Pattern */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-purple-600 to-indigo-800 opacity-10 pattern-grid-lg"></div>

                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => setIsLoginModalOpen(false)}
                    className="p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-gray-600 hover:bg-white shadow-sm transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-6 pt-1 pb-6 relative z-0">
                  <div className="text-center mb-3">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4 animate-bounce-short">
                      {authMode === 'login' ? <LogIn className="h-6 w-6 text-purple-600" /> : <UserPlus className="h-6 w-6 text-purple-600" />}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight" id="modal-title">
                      {user ? 'Welcome Back!' : (authMode === 'login' ? 'Sign In' : 'Join the Galaxy')}
                    </h3>
                    {!user && (
                      <p className="mt-1 text-sm text-gray-500 font-medium">
                        {authMode === 'login'
                          ? "Access your personalized dashboard"
                          : "Create an account to start your journey"}
                      </p>
                    )}
                  </div>

                  {user ? (
                    <div className="text-center py-4">
                      <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-yellow-400 to-purple-600 mx-auto mb-3 relative">
                        <img src={user.image} alt="User" className="w-full h-full rounded-full object-cover border-4 border-white" />
                        {user.isAdmin && (
                          <div className="absolute bottom-0 right-0 bg-red-500 text-white p-1 rounded-full border-2 border-white shadow-md" title="Admin">
                            <ShieldCheck className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">{user.displayName || 'Galaxy User'}</h4>
                      <p className="text-gray-500 font-medium mb-5">{user.email}</p>

                      <div className="space-y-2.5">
                        <button
                          type="button"
                          onClick={() => { setIsLoginModalOpen(false); navigate('/orders'); }}
                          className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-gray-200"
                        >
                          <ClipboardCheck className="w-4 h-4 text-gray-500" /> My Orders
                        </button>

                        <button
                          type="button"
                          onClick={() => { setIsLoginModalOpen(false); navigate('/profile'); }}
                          className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-gray-200"
                        >
                          <User className="w-4 h-4 text-gray-500" /> User Profile
                        </button>

                        {user.isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsLoginModalOpen(false);
                              navigate('/admin');
                            }}
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4" /> Admin Dashboard
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full py-2.5 px-4 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <a
                        href={`${import.meta.env.VITE_API_URL}/auth/google`}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm group"
                      >
                        <svg className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                      </a>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold text-gray-400 bg-white px-4">
                          Or via Email
                        </div>
                      </div>

                      <form onSubmit={handleLoginSubmit} className="space-y-4">
                        {authError && (
                          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 animate-head-shake">
                            <div className="text-red-500 shrink-0 mt-0.5">
                              <ShieldCheck className="w-4 h-4 text-red-500" />
                            </div>
                            <p className="text-xs font-medium text-red-600">{authError}</p>
                          </div>
                        )}

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">
                              {authMode === 'login' ? 'Email or Mobile' : 'Email Address'}
                            </label>
                            <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                              </div>
                              <input
                                type={authMode === 'login' ? 'text' : 'email'}
                                required
                                className="block w-full pl-9 pr-3 py-3 bg-gray-50 border border-transparent text-gray-900 text-sm rounded-xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium placeholder-gray-400"
                                placeholder={authMode === 'login' ? "john@example.com" : "john@example.com"}
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                              />
                            </div>
                          </div>

                          {authMode === 'register' && (
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Mobile Number</label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Briefcase className="h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                </div>
                                <input
                                  type="tel"
                                  required
                                  className="block w-full pl-9 pr-3 py-3 bg-gray-50 border border-transparent text-gray-900 text-sm rounded-xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium placeholder-gray-400"
                                  placeholder="+91 99999 99999"
                                  value={phoneInput}
                                  onChange={(e) => setPhoneInput(e.target.value)}
                                />
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Password</label>
                            <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ShieldCheck className="h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                              </div>
                              <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="block w-full pl-9 pr-10 py-3 bg-gray-50 border border-transparent text-gray-900 text-sm rounded-xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium placeholder-gray-400"
                                placeholder="••••••••"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 focus:outline-none transition-colors"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                  <Eye className="h-4 w-4" aria-hidden="true" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {authMode === 'login' && (
                          <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                              <input type="checkbox" className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer" />
                              <span className="ml-2 text-xs text-gray-600 font-medium">Remember me</span>
                            </label>
                            <a href="#" className="text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors">
                              Forgot Password?
                            </a>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full flex justify-center items-center py-3.5 px-6 border border-transparent rounded-xl shadow-lg shadow-purple-500/30 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-500/30 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          {authLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Processing...</span>
                            </div>
                          ) : (
                            <span className="flex items-center gap-2">
                              {authMode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                            </span>
                          )}
                        </button>

                        <div className="text-center mt-4">
                          <p className="text-xs text-gray-500 font-medium">
                            {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                            <button
                              type="button"
                              onClick={toggleAuthMode}
                              className="text-purple-600 font-bold hover:underline transition-all"
                            >
                              {authMode === 'login' ? 'Register Now' : 'Sign In'}
                            </button>
                          </p>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
