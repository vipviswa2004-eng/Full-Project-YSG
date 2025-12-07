import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, User, Product } from './types';
// Use local data as fallback/initial state until DB fetch works
import { products as localProducts } from './data/products';

interface AppContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartId: string) => void;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  user: User | null;
  setUser: (newUser: User | null) => Promise<void>;
  currency: 'INR' | 'USD';
  setCurrency: (currency: 'INR' | 'USD') => void;
  isGiftAdvisorOpen: boolean;
  setIsGiftAdvisorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  products: Product[]; // Exposed products from DB
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize cart and wishlist from localStorage immediately to prevent empty cart on refresh
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (e) {
      console.error('Failed to load wishlist from localStorage:', e);
      return [];
    }
  });

  const [user, setUserState] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Failed to load user from localStorage:', e);
      return null;
    }
  });
  const [dbProducts, setDbProducts] = useState<Product[]>(localProducts); // Default to local

  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [isGiftAdvisorOpen, setIsGiftAdvisorOpen] = useState(false);

  // API Base URL
  const API_URL = 'http://localhost:5000/api';

  // Fetch Products from DB on Mount // Initial Data Load
  useEffect(() => {
    fetch(`${API_URL}/products?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setDbProducts(data);
      })
      .catch(err => console.log("Backend not connected, using local data.", err));

    // Check for Session User (Google Auth)
    fetch(`${API_URL}/current_user`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (data && (data.email || data.googleId)) {
          setUserState(data);
          localStorage.setItem("user", JSON.stringify(data));

          // Fetch cart and wishlist from database
          try {
            const userDataRes = await fetch(`${API_URL}/user/${data.email}`);
            const userData = await userDataRes.json();

            // Hydrate cart from DB
            if (userData.cart && userData.cart.length > 0) {
              // Fetch full product details for each cart item
              const cartItems: CartItem[] = await Promise.all(
                userData.cart.map(async (dbItem: any) => {
                  // Find the product in the products list
                  const product = dbProducts.find(p => p.id === dbItem.productId);

                  if (!product) {
                    console.warn(`Product ${dbItem.productId} not found for cart item`);
                    return null;
                  }

                  // Reconstruct full CartItem with product data + saved cart data
                  return {
                    ...product, // Spread all product fields
                    cartId: `${dbItem.productId}-${Date.now()}-${Math.random()}`,
                    quantity: dbItem.quantity || 1,
                    customName: dbItem.customName || '',
                    customImage: dbItem.customImage || null,
                    customDesign: dbItem.customDesign || null,
                    calculatedPrice: dbItem.calculatedPrice || product.pdfPrice,
                    originalPrice: dbItem.originalPrice || product.pdfPrice,
                    extraHeads: dbItem.extraHeads || 0,
                    selectedVariations: dbItem.selectedVariations || {}
                  } as CartItem;
                })
              );

              // Filter out null items (products that don't exist anymore)
              const validCartItems = cartItems.filter(item => item !== null) as CartItem[];
              setCart(validCartItems);
              console.log('✅ Cart loaded from MongoDB:', validCartItems.length, 'items');
            }

            // Hydrate wishlist from DB
            if (userData.wishlist && userData.wishlist.length > 0) {
              const wishlistProducts = localProducts.filter(p =>
                userData.wishlist.includes(p.id)
              );
              setWishlist(wishlistProducts);
            }
          } catch (e) {
            console.error("Failed to fetch user data", e);
          }
        } else {
          // No user logged in - cart and wishlist already loaded from localStorage in state initialization
          console.log('No user session found, using localStorage data');
        }
      })
      .catch(() => {
        // No user logged in - cart and wishlist already loaded from localStorage in state initialization
        console.log('User check failed, using localStorage data');
      });
  }, []);

  // Wrapper for setUser to sync with DB
  const setUser = async (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      // Sync login with DB
      try {
        const res = await fetch(`${API_URL}/user/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: newUser.email })
        });
        const dbUser = await res.json();

        // Hydrate cart/wishlist from DB
        if (dbUser.cart && dbUser.cart.length > 0) {
          // Reconstruct full CartItem objects with product data
          const cartItems: CartItem[] = await Promise.all(
            dbUser.cart.map(async (dbItem: any) => {
              const product = dbProducts.find(p => p.id === dbItem.productId);

              if (!product) {
                console.warn(`Product ${dbItem.productId} not found for cart item`);
                return null;
              }

              return {
                ...product,
                cartId: `${dbItem.productId}-${Date.now()}-${Math.random()}`,
                quantity: dbItem.quantity || 1,
                customName: dbItem.customName || '',
                customImage: dbItem.customImage || null,
                customDesign: dbItem.customDesign || null,
                calculatedPrice: dbItem.calculatedPrice || product.pdfPrice,
                originalPrice: dbItem.originalPrice || product.pdfPrice,
                extraHeads: dbItem.extraHeads || 0,
                selectedVariations: dbItem.selectedVariations || {}
              } as CartItem;
            })
          );

          const validCartItems = cartItems.filter(item => item !== null) as CartItem[];
          setCart(validCartItems);
        }

        if (dbUser.wishlist && dbUser.wishlist.length > 0) {
          // Fetch full product details for wishlist items
          const wishlistProducts = localProducts.filter(p =>
            dbUser.wishlist.includes(p.id)
          );
          setWishlist(wishlistProducts);
        }

        // Update user state with admin status from DB
        setUserState({ ...newUser, isAdmin: dbUser.isAdmin });
        localStorage.setItem("user", JSON.stringify({ ...newUser, isAdmin: dbUser.isAdmin }));
      } catch (e) {
        console.error("Login sync failed", e);
      }
    } else {
      // Clear cart and wishlist on logout
      setCart([]);
      setWishlist([]);
    }
  };

  // Sync Cart Changes to DB
  useEffect(() => {
    if (user && user.email) {
      // Convert CartItem format to DB format - include ALL fields for complete persistence
      const dbCart = cart.map(item => ({
        productId: item.id, // CartItem has 'id' field from Product
        quantity: item.quantity,
        customName: item.customName,
        customImage: item.customImage,
        customDesign: item.customDesign, // Fabric.js design JSON + preview
        calculatedPrice: item.calculatedPrice,
        originalPrice: item.originalPrice,
        extraHeads: item.extraHeads,
        selectedVariations: item.selectedVariations
      }));

      console.log('💾 Syncing cart to database for user:', user.email, 'Cart items:', cart.length);
      fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, cart: dbCart })
      })
        .then(() => console.log('✅ Cart synced successfully'))
        .catch((e) => console.error('❌ Cart sync failed:', e));
    } else {
      console.log('⚠️ Not logged in - cart saved to localStorage only');
    }
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart, user]);

  // Sync Wishlist Changes to DB
  useEffect(() => {
    if (user) {
      // Map objects to IDs for DB storage if schema requires, or store full objects
      const wishlistIds = wishlist.map(p => p.id);
      console.log('💾 Syncing wishlist to database for user:', user.email, 'Wishlist items:', wishlist.length);
      fetch(`${API_URL}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, wishlist: wishlistIds })
      })
        .then(() => console.log('✅ Wishlist synced successfully'))
        .catch((e) => console.error('❌ Wishlist sync failed:', e));
    } else {
      console.log('⚠️ Not logged in - wishlist saved to localStorage only');
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist, user]);



  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  return (
    <AppContext.Provider value={{ cart, addToCart, removeFromCart, wishlist, toggleWishlist, user, setUser, currency, setCurrency, isGiftAdvisorOpen, setIsGiftAdvisorOpen, products: dbProducts }}>
      {children}
    </AppContext.Provider>
  );
};