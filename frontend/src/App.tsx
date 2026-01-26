import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { CategoryNav } from './components/CategoryNav';
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';
import { GiftAdvisor } from './components/GiftAdvisor';
import { WhatsAppChat } from './components/WhatsAppChat';
import { LocationRequester } from './components/LocationRequester';
import { MobileBottomNav } from './components/MobileBottomNav';
import { GalaxyCursor } from './components/GalaxyCursor';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Customize } from './pages/Customize';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Admin } from './pages/Admin';
import { Orders } from './pages/Orders';
import { Wishlist } from './pages/Wishlist';
import { CorporateGifting } from './pages/CorporateGifting';
import { TermsConditions } from './pages/TermsConditions';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { ShippingInfo } from './pages/ShippingInfo';
import { ReturnPolicy } from './pages/ReturnPolicy';
import { Profile } from './pages/Profile';
import { CartProvider, useCart } from './context';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { setUser } = useCart();
  const navType = useNavigationType();

  // Detect Touch to disable custom cursor CSS
  const [isTouch, setIsTouch] = React.useState(false);
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Disable browser scroll restoration to avoid conflicts
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    // Skip scroll to top if it's a 'POP' action (back/forward) AND we are going to the shop
    // This allows Shop.tsx to restore its own scroll position
    const isShop = location.pathname === '/shop' || location.pathname === '/products';
    if (isShop && navType === 'POP') {
      return;
    }

    // Default behavior: scroll to top
    window.scrollTo(0, 0);
  }, [location.pathname, location.search, navType]);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'success') {
      // Fetch current user from backend
      fetch(`${import.meta.env.VITE_API_URL}/api/current_user`, { credentials: 'include' })
        .then(res => res.json())
        .then(userData => {
          if (userData && userData.email) {
            setUser(userData);
            // Remove query parameter from URL
            window.history.replaceState({}, '', window.location.pathname);
            // Force reload to ensure context is updated
            window.location.reload();
          }
        })
        .catch(err => console.error('Failed to fetch user after OAuth:', err));
    }
  }, [setUser]);

  return (
    <div className={`flex flex-col min-h-screen bg-app-bg ${!isTouch ? 'cursor-none' : ''}`}>
      <SEO />
      <GalaxyCursor />
      <Navbar />
      {!isAdminRoute && <CategoryNav />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Shop />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/corporate" element={<CorporateGifting />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/shipping" element={<ShippingInfo />} />
          <Route path="/returns" element={<ReturnPolicy />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <GiftAdvisor />
      <WhatsAppChat />
      <LocationRequester />
      {!isAdminRoute && !location.pathname.startsWith('/product/') && <MobileBottomNav />}
      {!isAdminRoute && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <CartProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </CartProvider>
  );
};

export default App;