import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { CategoryNav } from './components/CategoryNav';
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';
import { GiftAdvisor } from './components/GiftAdvisor';
import { WhatsAppChat } from './components/WhatsAppChat';
import { VerificationModal } from './components/VerificationModal';
import { LocationManager } from './components/LocationManager';
import { MobileBottomNav } from './components/MobileBottomNav';
import { VersionControl } from './components/VersionControl';
import { CartProvider, useCart } from './context';
import { Loader2 } from 'lucide-react';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Shop = lazy(() => import('./pages/Shop').then(module => ({ default: module.Shop })));
const Customize = lazy(() => import('./pages/Customize').then(module => ({ default: module.Customize })));
const ProductDetails = lazy(() => import('./pages/ProductDetails').then(module => ({ default: module.ProductDetails })));
const Cart = lazy(() => import('./pages/Cart').then(module => ({ default: module.Cart })));
const Admin = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));
const Orders = lazy(() => import('./pages/Orders').then(module => ({ default: module.Orders })));
const Wishlist = lazy(() => import('./pages/Wishlist').then(module => ({ default: module.Wishlist })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const CorporateGifting = lazy(() => import('./pages/CorporateGifting').then(module => ({ default: module.CorporateGifting })));
const TermsConditions = lazy(() => import('./pages/TermsConditions').then(module => ({ default: module.TermsConditions })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const ShippingInfo = lazy(() => import('./pages/ShippingInfo').then(module => ({ default: module.ShippingInfo })));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy').then(module => ({ default: module.ReturnPolicy })));
const OccasionLanding = lazy(() => import('./pages/OccasionLanding').then(module => ({ default: module.OccasionLanding })));


const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-gray-500 font-medium animate-pulse">Loading Universe...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { setUser, user } = useCart();
  const navType = useNavigationType();

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
    <div className={`flex flex-col min-h-screen bg-app-bg`}>
      <SEO />
      <Navbar />
      {!isAdminRoute && <CategoryNav />}
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/occasion/:occasionId" element={<OccasionLanding />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </main>
      <GiftAdvisor />
      <WhatsAppChat />
      {user && (!user.emailVerified || !user.phone) && <VerificationModal />}
      <LocationManager />
      <VersionControl />
      {!isAdminRoute && !location.pathname.startsWith('/product/') && <MobileBottomNav />}
      {!isAdminRoute && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;