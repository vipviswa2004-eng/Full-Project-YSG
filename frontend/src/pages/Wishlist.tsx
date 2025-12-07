
import React from 'react';
import { useCart } from '../context';
import { calculatePrice } from '../data/products';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const { wishlist, toggleWishlist, currency } = useCart();

  const formatPrice = (price: number) => {
    return currency === 'INR' 
      ? `₹${price.toLocaleString('en-IN')}` 
      : `$${(price * 0.012).toFixed(2)}`;
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't saved any items yet. Start exploring and save your favorites!</p>
            <Link to="/products" className="bg-primary text-white px-8 py-3 rounded-full font-bold inline-flex items-center gap-2 hover:bg-purple-800 transition-colors">
                Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-current" /> My Wishlist ({wishlist.length})
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map(product => {
                const prices = calculatePrice(product);
                return (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-all">
                        <Link to={`/product/${product.id}`} className="relative aspect-square bg-gray-50 p-6">
                            <img src={product.image} alt={product.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleWishlist(product);
                                }}
                                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm text-red-500 hover:bg-red-50 transition-colors"
                                title="Remove from Wishlist"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </Link>
                        
                        <div className="p-4 flex flex-col flex-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{product.category}</p>
                            <Link to={`/product/${product.id}`} className="text-lg font-bold text-gray-900 line-clamp-1 hover:text-primary transition-colors">
                                {product.name}
                            </Link>
                            
                            <div className="mt-auto pt-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xl font-bold text-gray-900">{formatPrice(prices.final)}</p>
                                    <p className="text-xs text-gray-400 line-through">{formatPrice(prices.original)}</p>
                                </div>
                                <Link to={`/product/${product.id}`} className="bg-primary text-white p-2.5 rounded-lg hover:bg-purple-800 transition-colors shadow-sm">
                                    <ShoppingCart className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};
