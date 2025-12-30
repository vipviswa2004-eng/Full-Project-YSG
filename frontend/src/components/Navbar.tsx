import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Sparkles, LogIn, LogOut, ShieldCheck, UserPlus, Search, Clock, ArrowUpRight, Gift, Heart, ArrowLeft } from 'lucide-react';
import { useCart } from '../context';
// import { products } from '../data/products';
import { Product } from '../types';

export const Navbar: React.FC = () => {
  const { cart, wishlist, user, setUser, setIsGiftAdvisorOpen, products } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);


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

        const response = await fetch('http://localhost:5000/api/auth/register', {
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

        const response = await fetch('http://localhost:5000/api/auth/login', {
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
    window.location.href = "http://localhost:5000/api/logout";
  };

  const openLoginModal = () => {
    setIsMenuOpen(false);
    setIsLoginModalOpen(true);
    setAuthMode('login');
    setEmailInput('');
    setPhoneInput('');
    setPasswordInput('');
    setAuthError('');
  };

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'register' : 'login');
    setEmailInput('');
    setPhoneInput('');
    setPasswordInput('');
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
              <Link to="/" className="flex-shrink-0 flex items-center gap-1.5 focus:outline-none">
                <Sparkles className="h-7 w-7 md:h-8 md:w-8 text-accent shrink-0" />
                <div className="flex flex-col">
                  <span className="font-black text-base md:text-xl tracking-tighter text-accent leading-none block">SIGN GALAXY</span>
                  <span className="text-[8px] md:text-[10px] text-gray-400 tracking-widest uppercase hidden sm:block">Yathes Personalized Gifts</span>
                </div>
              </Link>
            </div>

            <div className="hidden md:flex flex-1 mx-8 items-center justify-center" ref={desktopSearchRef}>
              <div className="relative w-full max-w-lg">
                <input type="text" placeholder="Search for gifts..." className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:bg-gray-700 focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} onFocus={() => setShowSuggestions(true)} />
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
                  {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-bounce">{wishlist.length}</span>}
                </Link>
                <button type="button" onClick={openLoginModal} className="text-white hover:text-[#f5ebd0] flex items-center gap-2 transition-colors">
                  {user ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs md:text-sm font-bold text-[#f5ebd0] max-w-[80px] truncate hidden md:block">
                        {user.email.split('@')[0]}
                      </span>
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
                <Link to="/cart" className="relative text-white hover:text-[#f5ebd0] p-1">
                  <ShoppingCart className="h-6 w-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-bounce">
                      {cart.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  )}
                </Link>
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
                  placeholder="Search for gifts..."
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
                  <input type="text" placeholder="Search gifts..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} onFocus={() => setShowSuggestions(true)} />
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
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsLoginModalOpen(false)}></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start justify-center">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                          {user ? 'User Profile' : (authMode === 'login' ? 'Welcome Back' : 'Create Account')}
                        </h3>
                        <button
                          onClick={() => setIsLoginModalOpen(false)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Close modal"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      {user ? (
                        <div className="text-center py-4">
                          <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
                            <img src={user.image} alt="User" className="rounded-full" />
                          </div>
                          <p className="text-gray-900 font-medium text-lg">{user.email}</p>
                          {user.isAdmin && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Administrator
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2">
                          <a
                            href="http://localhost:5000/auth/google"
                            className="w-full inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 mb-4 transition-colors"
                          >
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                              <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                              />
                              <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                              />
                              <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                                fill="#FBBC05"
                              />
                              <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                              />
                            </svg>
                            Sign in with Google
                          </a>

                          <div className="relative mb-4">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                            </div>
                          </div>

                          <form onSubmit={handleLoginSubmit}>
                            {/* Error Message */}
                            {authError && (
                              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600 text-center">{authError}</p>
                              </div>
                            )}

                            <p className="text-sm text-gray-600 mb-4 text-center">
                              {authMode === 'login'
                                ? "Welcome back! Please enter your details to sign in. 👋"
                                : "Create your account to start shopping! 🎉"
                              }
                            </p>

                            {/* Email Field */}
                            <div className="mb-4">
                              <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left mb-1">
                                {authMode === 'login' ? 'Email or Phone Number *' : 'Email Address *'}
                              </label>
                              <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <input
                                  type={authMode === 'login' ? 'text' : 'email'}
                                  name="email"
                                  id="email"
                                  required
                                  className="focus:ring-primary focus:border-primary block w-full pl-10 pr-3 sm:text-sm border-gray-300 rounded-md py-2.5 border"
                                  placeholder={authMode === 'login' ? 'you@example.com or +91 98765 43210' : 'you@example.com'}
                                  value={emailInput}
                                  onChange={(e) => setEmailInput(e.target.value)}
                                  autoFocus
                                />
                              </div>
                            </div>

                            {/* Phone Number Field (Register only) */}
                            {authMode === 'register' && (
                              <div className="mb-4">
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 text-left mb-1">
                                  Phone Number *
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                  </div>
                                  <input
                                    type="tel"
                                    name="phone"
                                    id="phone"
                                    required
                                    className="focus:ring-primary focus:border-primary block w-full pl-10 pr-3 sm:text-sm border-gray-300 rounded-md py-2.5 border"
                                    placeholder="+91 98765 43210"
                                    pattern="[0-9+\s-]+"
                                    value={phoneInput}
                                    onChange={(e) => setPhoneInput(e.target.value)}
                                  />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">We'll use this for order updates</p>
                              </div>
                            )}

                            {/* Password Field */}
                            <div className="mb-4">
                              <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left mb-1">
                                Password *
                              </label>
                              <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                </div>
                                <input
                                  type="password"
                                  name="password"
                                  id="password"
                                  required
                                  minLength={6}
                                  className="focus:ring-primary focus:border-primary block w-full pl-10 pr-3 sm:text-sm border-gray-300 rounded-md py-2.5 border"
                                  placeholder={authMode === 'login' ? "Enter your password" : "Create a password (min 6 characters)"}
                                  value={passwordInput}
                                  onChange={(e) => setPasswordInput(e.target.value)}
                                />
                              </div>
                              {authMode === 'register' && (
                                <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                              )}
                            </div>

                            {/* Remember Me / Forgot Password */}
                            {authMode === 'login' && (
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                  <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                  />
                                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                  </label>
                                </div>
                                <div className="text-sm">
                                  <a href="#" className="font-medium text-primary hover:text-purple-800">
                                    Forgot password?
                                  </a>
                                </div>
                              </div>
                            )}

                            {/* Submit Button */}
                            <div className="mt-5">
                              <button
                                type="submit"
                                disabled={authLoading}
                                className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-base font-medium text-white hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {authLoading ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {authMode === 'login' ? 'Signing In...' : 'Creating Account...'}
                                  </>
                                ) : (
                                  <>
                                    {authMode === 'login' ? <LogIn className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Toggle Auth Mode */}
                            <div className="mt-4 text-center">
                              <button
                                type="button"
                                onClick={toggleAuthMode}
                                className="text-sm text-primary hover:text-purple-800 font-medium hover:underline focus:outline-none"
                              >
                                {authMode === 'login'
                                  ? "Don't have an account? Register →"
                                  : "Already have an account? Sign In →"
                                }
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {user && (
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setIsLoginModalOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}