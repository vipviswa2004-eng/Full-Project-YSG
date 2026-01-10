import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context';

export const MobileBottomNav: React.FC = () => {
    const location = useLocation();
    const { cart, wishlist, setIsLoginModalOpen } = useCart();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50 px-2 py-1 shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.3)]">
            <div className="flex justify-around items-center h-16">
                <Link to="/" className={`flex flex-col items-center justify-center w-1/5 gap-1 transition-all ${isActive('/') ? 'text-accent' : 'text-gray-500'}`}>
                    <div className={`p-1 rounded-xl ${isActive('/') ? 'bg-accent/10' : ''}`}>
                        <Home className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold">Home</span>
                </Link>

                <Link to="/products" className={`flex flex-col items-center justify-center w-1/5 gap-1 transition-all ${isActive('/products') || isActive('/shop') ? 'text-accent' : 'text-gray-500'}`}>
                    <div className={`p-1 rounded-xl ${isActive('/products') || isActive('/shop') ? 'bg-accent/10' : ''}`}>
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold">Shop</span>
                </Link>

                <Link to="/wishlist" className={`flex flex-col items-center justify-center w-1/5 gap-1 transition-all ${isActive('/wishlist') ? 'text-accent' : 'text-gray-500'}`}>
                    <div className={`p-1 rounded-xl relative ${isActive('/wishlist') ? 'bg-accent/10' : ''}`}>
                        <Heart className="w-6 h-6" />
                        {wishlist.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                {wishlist.length}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] font-bold">Wishlist</span>
                </Link>

                <Link to="/cart" className={`flex flex-col items-center justify-center w-1/5 gap-1 transition-all ${isActive('/cart') ? 'text-accent' : 'text-gray-500'}`}>
                    <div className={`p-1 rounded-xl relative ${isActive('/cart') ? 'bg-accent/10' : ''}`}>
                        <ShoppingCart className="w-6 h-6" />
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                {cart.reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] font-bold">Cart</span>
                </Link>

                <button onClick={() => setIsLoginModalOpen(true)} className={`flex flex-col items-center justify-center w-1/5 gap-1 transition-all ${isActive('/profile') ? 'text-accent' : 'text-gray-500'}`}>
                    <div className={`p-1 rounded-xl ${isActive('/profile') ? 'bg-accent/10' : ''}`}>
                        <User className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold">Account</span>
                </button>
            </div>
        </div>
    );
};
