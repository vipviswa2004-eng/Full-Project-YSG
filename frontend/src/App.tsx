import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GiftAdvisor } from './components/GiftAdvisor';
import { WhatsAppChat } from './components/WhatsAppChat';
import { LocationRequester } from './components/LocationRequester';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Customize } from './pages/Customize';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Admin } from './pages/Admin';
import { Wishlist } from './pages/Wishlist';
import { CartProvider } from './context';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Shop />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <GiftAdvisor />
      <WhatsAppChat />
      <LocationRequester />
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