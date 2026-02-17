
import React, { useEffect } from 'react';
import { useCart } from '../context';
import { Trash2, Phone, QrCode, ArrowRight, Minus, Plus, MapPin, PenBox, AlertTriangle, User, Loader2, Upload, Percent, Tag, Gift, Banknote, Wallet, Truck } from 'lucide-react';
import { VariationOption, Coupon } from '../types';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPaymentAmount } from '../services/gemini';
import { SEO } from '../components/SEO';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartItemQuantity, currency, user, clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isPaymentConfirmed, setIsPaymentConfirmed] = React.useState(false);
  const [missingDetails, setMissingDetails] = React.useState<string[]>([]);
  const [showMissingDetailsModal, setShowMissingDetailsModal] = React.useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = React.useState<string | null>(null);
  const [paymentUTR, setPaymentUTR] = React.useState('');
  const [isUploadingPayment, setIsUploadingPayment] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verificationAlert, setVerificationAlert] = React.useState<{ title: string; message: string; details?: string } | null>(null);

  // Coupon State
  const [couponCode, setCouponCode] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState<{ code: string; discount: number; type: 'flat' | 'percentage' | 'B2G1'; maxDiscount?: number; maxPurchase?: number } | null>(null);
  const [couponMessage, setCouponMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = React.useState<'UPI' | 'COD'>('UPI');

  const COD_FEE = 70;

  const [availableCoupons, setAvailableCoupons] = React.useState<Coupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = React.useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/coupons`);
        const data = await response.json();
        if (Array.isArray(data)) {
          // Only show active and non-expired coupons
          const now = new Date();
          const active = data.filter(c =>
            c.status === 'Active' &&
            new Date(c.expiryDate) > now &&
            (c.usageLimit > c.usedCount)
          );
          setAvailableCoupons(active);
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
      } finally {
        setIsLoadingCoupons(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleApplyCoupon = (overrideCode?: string) => {
    const codeToApply = (overrideCode || couponCode).trim().toUpperCase();
    if (!codeToApply) return;

    setCouponMessage(null);

    const coupon = availableCoupons.find(c => c.code.toUpperCase() === codeToApply);

    // Rule: Don't allow coupons if cart has any Special Combo Offer
    const hasComboOffer = cart.some(item => item.isComboOffer);
    if (hasComboOffer) {
      setAppliedCoupon(null);
      setCouponMessage({
        type: 'error',
        text: `Coupons cannot be applied to Special Combo Offers.`
      });
      return;
    }

    if (coupon) {
      // Check for Minimum & Maximum Purchase Requirements
      // If code is WELCOME26, it requires 1500. Otherwise use coupon.minPurchase if exists.
      const minRequired = (codeToApply === 'WELCOME26') ? 1500 : (coupon.minPurchase || 0);
      const maxAllowed = coupon.maxPurchase || 0;

      if (subtotal < minRequired) {
        setAppliedCoupon(null);
        setCouponMessage({
          type: 'error',
          text: `Minimum purchase of ₹${minRequired} required for this coupon. Your subtotal is ₹${subtotal}.`
        });
        return;
      }

      if (maxAllowed > 0 && subtotal > maxAllowed) {
        setAppliedCoupon(null);
        setCouponMessage({
          type: 'error',
          text: `This coupon is only valid for orders up to ₹${maxAllowed}. Your order is ₹${subtotal}.`
        });
        return;
      }

      const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

      if (coupon.discountType === 'B2G1' && totalQuantity < 3) {
        setAppliedCoupon(null);
        setCouponMessage({
          type: 'error',
          text: `Buy 2 Get 1 requires at least 3 items in your cart. You have ${totalQuantity}.`
        });
        return;
      }

      setAppliedCoupon({
        code: coupon.code,
        discount: coupon.value,
        type: coupon.discountType === 'B2G1' ? 'B2G1' : (coupon.discountType === 'PERCENTAGE' ? 'percentage' : 'flat'),
        maxDiscount: coupon.maxDiscount,
        maxPurchase: coupon.maxPurchase
      });
      setCouponMessage({
        type: 'success',
        text: coupon.discountType === 'B2G1'
          ? `'${coupon.code}' applied! Your cheapest item(s) will be free.`
          : `'${coupon.code}' applied! ${coupon.discountType === 'PERCENTAGE' ? `${coupon.value}%` : `₹${coupon.value}`} discount applied.`
      });
    } else {
      setAppliedCoupon(null);
      setCouponMessage({ type: 'error', text: "Invalid or expired coupon code" });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMessage(null);
  };


  const handlePaymentScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert("Invalid file type. Please upload a valid image screenshot (JPG, PNG) of your payment.");
      e.target.value = '';
      return;
    }

    // Validate file size (e.g., max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Please upload an image smaller than 10MB.");
      e.target.value = '';
      return;
    }

    setIsUploadingPayment(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.url) {
        setPaymentScreenshot(data.url);
        setIsPaymentConfirmed(false); // Reset confirmation if they change image
      } else {
        alert('Failed to upload screenshot. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading payment screenshot:', error);
      alert('Error uploading screenshot.');
    } finally {
      setIsUploadingPayment(false);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.calculatedPrice * item.quantity), 0);

  // Calculate Discount
  let discountAmount = 0;
  const b2g1FreeCounts: Record<string, number> = {};

  if (appliedCoupon) {
    if (appliedCoupon.type === 'flat') {
      discountAmount = appliedCoupon.discount;
    } else if (appliedCoupon.type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discount) / 100;
    } else if (appliedCoupon.type === 'B2G1') {
      const allItems = cart.flatMap(item =>
        Array.from({ length: item.quantity }, () => ({ id: item.cartId, price: item.calculatedPrice }))
      );
      allItems.sort((a, b) => a.price - b.price);
      const numFree = Math.floor(allItems.length / 3);
      const freeOnes = allItems.slice(0, numFree);

      freeOnes.forEach(f => {
        b2g1FreeCounts[f.id] = (b2g1FreeCounts[f.id] || 0) + 1;
      });

      discountAmount = freeOnes.reduce((sum, p) => sum + p.price, 0);
    }

    // Cap with Maximum Discount limit
    if (appliedCoupon.maxDiscount && appliedCoupon.maxDiscount > 0) {
      discountAmount = Math.min(discountAmount, appliedCoupon.maxDiscount);
    }
  }

  const total = Math.max(0, subtotal - discountAmount + (paymentMethod === 'COD' ? COD_FEE : 0));

  // UPI Configuration
  const UPI_ID = "Pos.11391465@indus";
  const PAYEE_NAME = "SIGN GALAXY";


  // Use static QR code image instead of dynamically generated one
  const qrCodeUrl = "/upi-qr-code-updated.jpg";

  const formatPrice = (price: number) => {
    return currency === 'INR'
      ? `₹${price.toLocaleString('en-IN')}`
      : `$${(price * 0.012).toFixed(2)}`;
  };

  useEffect(() => {
    if (searchParams.get('buyNow') === 'true') {
      const paymentSection = document.getElementById('payment-section');
      if (paymentSection) {
        paymentSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchParams]);

  const handleCheckout = async () => {
    const confirmMessage = paymentMethod === 'COD'
      ? "Confirm your order with Cash on Delivery?"
      : "Have you completed the payment? Click OK to confirm order and send details.";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    const generatedOrderId = `ORD-${Date.now()}`;

    try {
      // 1. Create Order in Database
      const orderData = {
        user: user ? {
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          phone: user.phone || ''
        } : {
          email: 'guest@ucgoc.com',
          name: 'Guest User'
        },
        shippingAddress: user ? {
          name: user.displayName || user.email.split('@')[0],
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          pincode: user.pincode || '',
          addressType: user.addressType || '',
          phone: user.phone || ''
        } : null,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.calculatedPrice,
          quantity: item.quantity,
          image: item.image,
          customImage: item.customImage,
          customName: item.customName,
          selectedVariations: item.selectedVariations
        })),
        total: total,
        status: paymentMethod === 'COD' ? 'COD Pending Confirmation' : 'Design Pending',
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'Unpaid' : 'Paid',
        paymentScreenshot: paymentMethod === 'COD' ? null : paymentScreenshot,
        paymentId: paymentMethod === 'UPI' ? paymentUTR : null,
        orderId: generatedOrderId,
        date: new Date()
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        console.error("Failed to save order to database");
      } else {
        console.log("Order saved to database");
        clearCart();
      }

    } catch (error) {
      console.error("Error creating order:", error);
    }

    // 2. Send Details via WhatsApp to MULTIPLE numbers
    const adminNumbers = ['916380016798']; // Admin phone numbers

    let message = `Hello Sign Galaxy 👋\n`;
    message += `I’ve placed a *${paymentMethod}* order successfully.\n\n`;
    message += `*ORDER ID:* ${generatedOrderId}\n`;
    message += `*ORDER DETAILS*\n`;
    message += `--------------------------------\n`;
    if (paymentMethod === 'COD') {
      message += `⚠️ *PAYMENT METHOD: CASH ON DELIVERY*\n`;
      message += `--------------------------------\n`;
    }

    cart.forEach((item, idx) => {
      message += `*Item ${idx + 1}: ${item.name}*\n`;
      message += `• Qty: ${item.quantity}\n`;
      message += `• Price: ${formatPrice(item.calculatedPrice)}\n`;

      if (item.customName) {
        message += `• Custom Text: "${item.customName}"\n`;
      }

      if (item.symbolNumber) {
        message += `• Symbol Number: ${item.symbolNumber}\n`;
      }

      if (item.selectedVariations) {
        Object.entries(item.selectedVariations).forEach(([name, opt]) => {
          message += `• ${name}: ${(opt as VariationOption).label}\n`;
        });
      }

      if (item.extraHeads && item.extraHeads > 0) {
        message += `• Extra Persons: ${item.extraHeads}\n`;
      }

      // Include Image URL
      const customImgValue = item.customImage;
      if (customImgValue) {
        try {
          if (customImgValue.startsWith('[')) {
            const imgs = JSON.parse(customImgValue);
            imgs.forEach((img: string, i: number) => {
              const fullImgUrl = img.startsWith('http') ? img : `${window.location.origin}${img.startsWith('/') ? '' : '/'}${img}`;
              message += `• Uploaded Photo ${i + 1}: ${fullImgUrl}\n`;
            });
          } else {
            const fullImgUrl = customImgValue.startsWith('http') ? customImgValue : `${window.location.origin}${customImgValue.startsWith('/') ? '' : '/'}${customImgValue}`;
            message += `• Uploaded Photo: ${fullImgUrl}\n`;
          }
        } catch (e) {
          message += `• Uploaded Photo: ${customImgValue}\n`;
        }
      } else if (item.image) {
        const fullImgUrl = item.image.startsWith('http') ? item.image : `${window.location.origin}${item.image.startsWith('/') ? '' : '/'}${item.image}`;
        message += `• Product Image: ${fullImgUrl}\n`;
      }

      message += "\n";
    });

    message += "--------------------------------\n";
    message += `*Subtotal: ${formatPrice(subtotal)}*\n`;

    if (appliedCoupon && discountAmount > 0) {
      const couponLabel = appliedCoupon.type === 'percentage'
        ? `${appliedCoupon.code} (${appliedCoupon.discount}%)`
        : appliedCoupon.code;
      message += `*Coupon Applied:* ${couponLabel}\n`;
      message += `*Discount:* -${formatPrice(discountAmount)}\n`;
    }

    if (paymentMethod === 'COD') {
      message += `*COD Handling Fee:* +${formatPrice(70)}\n`;
    }

    message += `*💰 Grand Total: ${formatPrice(total)}*\n`;

    if (paymentMethod === 'COD') {
      message += "⏳ *Payment Status:* COD (Pending Verification)\n";
    } else {
      message += "✅ *Payment Status:* Paid via UPI\n";
      if (paymentScreenshot) {
        message += `📄 *Payment Proof:* ${paymentScreenshot}\n`;
      }
    }

    message += "--------------------------------\n\n";
    message += "📍 *Delivery Details:*\n";
    if (user) {
      message += `Name: ${user.displayName || 'Guest User'}\n`;
      message += `Phone: ${user.phone || 'N/A'}\n`;
      message += `Email: ${user.email || 'N/A'}\n`; // Added Email
      message += `Address: ${user.address || 'N/A'}\n`;
      const location = [user.city, user.state, user.pincode].filter(Boolean).join(', ');
      if (location) message += `${location}\n`;
      if (user.addressType) message += `Type: ${user.addressType}\n`;
    } else {
      message += "Name: [Type Name]\n";
      message += "Address: [Type Address]\n";
    }
    message += "\n";

    message += "Please share the design preview for my approval.\n";
    message += "Thank you 😊";

    const encodedMsg = encodeURIComponent(message);

    // Open WhatsApp for each admin number
    adminNumbers.forEach(num => {
      window.open(`https://wa.me/${num}?text=${encodedMsg}`, '_blank');
    });

    navigate('/orders');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 text-center">
        <SEO title="Shopping Cart" noindex={true} />
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="mt-4 text-gray-500">Add some personalized gifts to start!</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="Shopping Cart" noindex={true} />
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
        Shopping Cart <span className="text-lg font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{cart.length} items</span>
      </h1>

      {/* Delivery Address Section */}
      <div className="bg-white rounded-2xl p-5 mb-8 shadow-xl shadow-indigo-100/50 border border-indigo-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-fade-in-up relative overflow-hidden group">

        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-50 to-purple-50 rounded-bl-[100px] -z-10 opacity-50 transition-transform duration-700 group-hover:scale-110"></div>

        <div className="flex items-start gap-5 w-full">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0 transform transition-transform group-hover:rotate-3">
            <MapPin className="w-7 h-7" />
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deliver To</p>
              <div className="h-px w-8 bg-gray-200"></div>
            </div>

            {user ? (
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">{user.displayName || user.email.split('@')[0]}</h3>
                  {user.addressType && (
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm ${user.addressType === 'Home'
                      ? 'bg-purple-50 text-purple-700 border-purple-100'
                      : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                      {user.addressType}
                    </span>
                  )}
                </div>

                <div className="text-sm font-medium text-gray-500 leading-relaxed max-w-2xl">
                  {(user.address || user.pincode) ? (
                    <span className="flex flex-wrap gap-1">
                      {user.address && <span className="text-gray-700">{user.address}</span>}
                      {user.city && <span className="text-gray-500">, {user.city}</span>}
                      {user.state && <span className="text-gray-500">, {user.state}</span>}
                      {user.pincode && <span className="text-gray-900 font-bold"> - {user.pincode}</span>}
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1 font-semibold animate-pulse">
                      Please add your full delivery address to proceed
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Please Sign In</h3>
                <p className="text-sm text-gray-500">Login to manage your saved delivery addresses</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/profile')}
          className="group/btn relative px-6 py-2.5 bg-white text-indigo-600 font-bold text-sm rounded-xl border-2 border-indigo-100 hover:border-indigo-600 hover:text-indigo-700 transition-all shadow-sm hover:shadow-md shrink-0 self-start sm:self-center"
        >
          <span className="flex items-center gap-2">
            <PenBox className="w-4 h-4 group-hover:text-indigo-600" />
            {user ? 'Change' : 'Login'}
          </span>
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <section className="lg:col-span-7 space-y-4">
          <div className="bg-white shadow-sm overflow-hidden rounded-xl border border-gray-100">
            <ul className="divide-y divide-gray-100">
              {cart.map((item) => (
                <li key={item.cartId} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    <div className="h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                      <img
                        src={(() => {
                          if (item.customDesign?.preview) return item.customDesign.preview;
                          if (item.customImage) {
                            try {
                              if (item.customImage.startsWith('[')) {
                                const imgs = JSON.parse(item.customImage);
                                return imgs[0] || item.image;
                              }
                            } catch (e) { }
                            return item.customImage;
                          }
                          return item.image;
                        })()}
                        alt={item.name}
                        className="h-full w-full object-cover object-center transform transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    <div className="flex-1 w-full relative">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 mb-2">
                        <div>
                          <h3
                            className="text-lg font-bold text-gray-900 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => navigate(`/product/${item.id}`)}
                          >
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500 font-medium">{item.category}</p>
                        </div>
                        <div className="text-right">
                          {(() => {
                            const freeCount = b2g1FreeCounts[item.cartId] || 0;
                            const itemTotalNormal = item.calculatedPrice * item.quantity;
                            const itemTotalDiscounted = item.calculatedPrice * (item.quantity - freeCount);

                            if (freeCount > 0) {
                              return (
                                <div className="flex flex-col items-end">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400 line-through font-medium">{formatPrice(itemTotalNormal)}</span>
                                    <span className="text-lg font-black text-green-600">{itemTotalDiscounted === 0 ? 'FREE' : formatPrice(itemTotalDiscounted)}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <Gift className="w-3 h-3 text-green-500" />
                                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-md border border-green-100 shadow-sm">
                                      {freeCount} {freeCount === 1 ? 'Item' : 'Items'} FREE
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                            return <p className="text-lg font-bold text-primary">{formatPrice(itemTotalNormal)}</p>;
                          })()}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(item.selectedVariations).map(([key, opt]) => {
                              const v = opt as VariationOption;
                              const label = key.replace(/_variation$/i, '').replace(/_/g, ' ');
                              const formattedKey = label.charAt(0).toUpperCase() + label.slice(1);
                              return <span key={v.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"><span className="opacity-60 mr-1">{formattedKey}:</span>{v.label}</span>;
                            })}
                          </div>
                        )}
                        {item.customName && (
                          <div className="inline-block bg-yellow-50 px-3 py-1 rounded-md border border-yellow-200">
                            <p className="text-xs text-yellow-800 font-medium">Text: "{item.customName}"</p>
                          </div>
                        )}
                        {item.symbolNumber && (
                          <div className="inline-block bg-purple-50 px-3 py-1 rounded-md border border-purple-200">
                            <p className="text-xs text-purple-800 font-medium">Symbol: #{item.symbolNumber}</p>
                          </div>
                        )}
                        {(item.extraHeads || 0) > 0 && <p className="text-xs text-blue-600 font-medium">+ {item.extraHeads} Extra Persons</p>}
                      </div>

                      <div className="flex flex-row items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shrink-0">
                          <button
                            type="button"
                            onClick={() => updateCartItemQuantity(item.cartId, Math.max(1, item.quantity - 1))}
                            className="p-2 hover:bg-gray-100 text-gray-600 disabled:opacity-50 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold text-gray-900 border-x border-gray-100">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartItemQuantity(item.cartId, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 text-gray-600 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.cartId)}
                          className="font-medium text-red-500 hover:text-red-700 flex items-center gap-1.5 text-sm transition-colors group"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm font-medium">Subtotal ({cart.length} items)</p>
                <p className="text-xl font-bold text-gray-900">{formatPrice(total)}</p>
              </div>
              <p className="mt-1 text-xs text-center sm:text-right text-gray-400">Shipping & taxes calculated at checkout</p>
            </div>
          </div>
        </section>

        <section id="payment-section" className="lg:col-span-5 mt-8 lg:mt-0 sticky top-24">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 bg-gray-900 text-white flex justify-between items-center">
              <h2 className="text-lg font-bold">Order Summary</h2>
              <span className="text-xs bg-white/20 px-2 py-1 rounded text-white font-medium">Secure</span>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center bg-gray-50 rounded-xl p-6 border border-gray-200">
                {/* Payment Method Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-primary/20">1</span>
                    <h3 className="font-bold text-gray-900">Select Payment Method</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('UPI');
                        setIsPaymentConfirmed(false);
                      }}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'UPI' ? 'border-primary bg-purple-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                    >
                      <QrCode className={`w-6 h-6 mb-2 ${paymentMethod === 'UPI' ? 'text-primary' : 'text-gray-400'}`} />
                      <span className={`text-xs font-bold ${paymentMethod === 'UPI' ? 'text-primary' : 'text-gray-600'}`}>Online UPI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('COD');
                        setIsPaymentConfirmed(false);
                        setPaymentScreenshot(null);
                      }}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'COD'
                          ? 'border-primary bg-purple-50'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                    >
                      <Wallet className={`w-6 h-6 mb-2 ${paymentMethod === 'COD' ? 'text-primary' : 'text-gray-400'}`} />
                      <span className={`text-xs font-bold ${paymentMethod === 'COD' ? 'text-primary' : 'text-gray-600'}`}>
                        Cash on Delivery
                      </span>
                    </button>

                  </div>

                </div>

                {paymentMethod === 'UPI' ? (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-primary/20 text-[10px]">2</span>
                      <h3 className="font-bold text-gray-900">Scan to Pay</h3>
                    </div>

                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 inline-block mb-3">
                      <img src={qrCodeUrl} alt="Payment QR Code" className="w-40 h-40 object-contain mx-auto" />
                    </div>
                  </>
                ) : (
                  <div className="bg-purple-50 rounded-xl p-5 border border-purple-100 mb-6 text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Banknote className="w-4 h-4 text-primary" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">COD Benefits</h4>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-xs text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0"></div>
                        Pay only when you receive your order
                      </li>
                      <li className="flex items-start gap-2 text-xs text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0"></div>
                        Quality check at your doorstep
                      </li>
                      <li className="flex items-start gap-2 text-xs text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0"></div>
                        Handling fee of ₹{COD_FEE} applies for COD orders
                      </li>
                    </ul>
                  </div>
                )}

                {/* Coupon Section */}
                <div className="mb-6 text-left border-b border-gray-200 pb-6">
                  <div className="bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] rounded-xl p-5 border border-green-100 relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute right-0 top-0 w-24 h-24 bg-green-200/40 rounded-bl-full -mr-4 -mt-4 transition-transform hover:scale-110 duration-700"></div>

                    <div className="flex items-center gap-2 mb-4 relative z-10">
                      <div className="bg-white p-1.5 rounded-lg shadow-sm">
                        <Percent className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">Offers & Coupons</h3>
                    </div>

                    {!appliedCoupon ? (
                      <>
                        <div className="flex gap-2 mb-4 relative z-10">
                          <div className="relative flex-1 group">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="Enter Coupon Code"
                              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none uppercase font-bold placeholder:font-normal placeholder:capitalize transition-all shadow-sm group-hover:border-green-300"
                            />
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                          </div>
                          <button
                            onClick={() => handleApplyCoupon()}
                            className="bg-gray-900 text-white font-bold text-xs px-5 rounded-lg hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-95"
                          >
                            APPLY
                          </button>
                        </div>

                        {/* Available Coupons List */}
                        <div className="space-y-2.5 relative z-10">
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Available Coupons</p>

                          {isLoadingCoupons ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                            </div>
                          ) : availableCoupons.length > 0 ? (
                            availableCoupons.map((coupon) => {
                              const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

                              const minRequired = (coupon.code.toUpperCase() === 'WELCOME26') ? 1500 : (coupon.minPurchase || 0);
                              const maxAllowed = coupon.maxPurchase || 0;

                              let isApplicable = subtotal >= minRequired && (maxAllowed === 0 || subtotal <= maxAllowed);

                              // Check quantity for B2G1
                              if (coupon.discountType === 'B2G1' && totalQuantity < 3) {
                                isApplicable = false;
                              }

                              return (
                                <div
                                  key={coupon.id || coupon._id}
                                  onClick={() => {
                                    if (isApplicable) {
                                      setCouponCode(coupon.code);
                                      handleApplyCoupon(coupon.code);
                                    }
                                  }}
                                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all shadow-sm ${isApplicable
                                    ? 'bg-white/80 border-green-100 hover:border-green-300 hover:bg-white cursor-pointer group'
                                    : 'bg-gray-50/50 border-gray-100 cursor-not-allowed opacity-60'}`}
                                >
                                  <div className={`mt-0.5 p-1.5 rounded-lg transition-colors ${isApplicable ? 'bg-green-50 group-hover:bg-green-100' : 'bg-gray-100'}`}>
                                    <Tag className={`w-3.5 h-3.5 ${isApplicable ? 'text-green-600' : 'text-gray-400'}`} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className={`font-black text-xs px-2 py-0.5 rounded border border-dashed ${isApplicable ? 'text-gray-800 bg-gray-100 border-gray-200' : 'text-gray-400 bg-gray-50 border-gray-200'}`}>{coupon.code}</span>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isApplicable ? 'text-green-700 bg-green-100' : 'text-gray-500 bg-gray-100'}`}>
                                        {coupon.discountType === 'PERCENTAGE' ? `${coupon.value}% OFF` : coupon.discountType === 'B2G1' ? 'FREE ITEM' : `₹${coupon.value} OFF`}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 font-medium leading-tight mb-1">
                                      {coupon.discountType === 'PERCENTAGE'
                                        ? `${coupon.value}% off on your purchase.`
                                        : coupon.discountType === 'B2G1' ? 'Buy 2 Get 1 Free (cheapest item)' : `Flat ₹${coupon.value} off on your purchase.`}
                                    </p>

                                    {/* Availability Status Messages */}
                                    {coupon.discountType === 'B2G1' && totalQuantity < 3 ? (
                                      <p className="text-[9px] text-red-500 font-bold flex items-center gap-1">
                                        <AlertTriangle className="w-2.5 h-2.5" />
                                        Add {3 - totalQuantity} more item(s) to unlock
                                      </p>
                                    ) : subtotal < minRequired ? (
                                      <p className="text-[9px] text-red-500 font-bold flex items-center gap-1">
                                        <AlertTriangle className="w-2.5 h-2.5" />
                                        Add ₹{minRequired - subtotal} more to unlock
                                      </p>
                                    ) : maxAllowed > 0 && subtotal > maxAllowed ? (
                                      <p className="text-[9px] text-amber-600 font-bold flex items-center gap-1">
                                        <AlertTriangle className="w-2.5 h-2.5" />
                                        Only for orders below ₹{maxAllowed}
                                      </p>
                                    ) : (
                                      <p className="text-[9px] text-green-600 font-bold">
                                        {maxAllowed > 0
                                          ? `Valid on orders ₹${minRequired} - ₹${maxAllowed}`
                                          : `Valid on orders above ₹${minRequired}`}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-[11px] text-gray-400 italic">No coupons available at the moment.</p>
                          )}


                        </div>
                      </>
                    ) : (
                      <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500"></div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                              <Percent className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <span className="text-sm font-black text-gray-900 block">{appliedCoupon.code}</span>
                              <span className="text-xs text-green-600 font-bold">
                                Coupon Applied Successfully!
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-xs font-bold text-red-500 hover:text-red-700 underline decoration-red-200 hover:decoration-red-500 underline-offset-2 transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    {couponMessage && (
                      <div className={`mt-3 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-2 animate-fade-in ${couponMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {couponMessage.type === 'success' ? (
                          <div className="w-4 h-4 rounded-full bg-green-200 flex items-center justify-center shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                          </div>
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        {couponMessage.text}
                      </div>
                    )}
                  </div>
                </div>


                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-green-600 font-medium">Coupon Discount</span>
                      <span className="font-bold text-green-600">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  {/* Shipping & Handling Breakup */}
                  <div className="space-y-1 mt-4 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Shipping Charges</span>
                      <span className="font-bold text-green-600 uppercase text-[10px]">Free</span>
                    </div>
                    {paymentMethod === 'COD' && (
                      <div className="flex justify-between items-center text-sm animate-fade-in">
                        <span className="text-gray-500">COD Handling Fee</span>
                        <span className="font-bold text-gray-900">{formatPrice(COD_FEE)}</span>
                      </div>
                    )}
                  </div>

                  {/* Additional Charges Notice */}
                  <div className="mb-4 bg-amber-50/50 border border-amber-100/60 rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-amber-600 text-sm">⚠️</span>
                      <h4 className="font-bold text-amber-900/80 text-[10px] uppercase tracking-wider">Additional Charges (if applicable)</h4>
                    </div>
                    <p className="text-[10px] text-amber-800/70 leading-relaxed font-medium">
                      Extra images or custom text, if added, may include additional charges.
                      The final price will be confirmed during WhatsApp design approval.
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Total Amount</p>
                    <p className="text-3xl font-extrabold text-primary">{formatPrice(total)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200 max-w-[240px] mx-auto">
                  <QrCode className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-mono select-all truncate">{UPI_ID}</span>
                </div>

                {paymentMethod === 'UPI' && (
                  <div className="mt-4 grid grid-cols-2 gap-3 lg:hidden">
                    {(() => {
                      // Generate a unique transaction ref
                      const tr = `TRX${Date.now()}`;
                      const tn = `Order Payment`;
                      const amount = total.toFixed(2);
                      const commonParams = `pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(tn)}&tr=${tr}`;

                      return (
                        <>
                          <a
                            href={`tez://upi/pay?${commonParams}`}
                            onClick={(e) => {
                              if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                                e.preventDefault();
                                alert('This feature works on mobile devices with the Google Pay app installed. On desktop, please scan the QR code.');
                              }
                            }}
                            className="flex flex-col items-center justify-center bg-white border border-gray-200 p-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png"
                              alt="Google Pay"
                              className="h-6 object-contain"
                            />
                          </a>
                          <a
                            href={`phonepe://pay?${commonParams}`}
                            onClick={(e) => {
                              if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                                e.preventDefault();
                                alert('This feature works on mobile devices with the PhonePe app installed. On desktop, please scan the QR code.');
                              }
                            }}
                            className="flex flex-col items-center justify-center bg-white border border-gray-200 p-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/1280px-PhonePe_Logo.svg.png"
                              alt="PhonePe"
                              className="h-6 object-contain"
                            />
                          </a>
                          <a
                            href={`paytmmp://pay?${commonParams}`}
                            onClick={(e) => {
                              if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                                e.preventDefault();
                                alert('This feature works on mobile devices with the Paytm app installed. On desktop, please scan the QR code.');
                              }
                            }}
                            className="flex flex-col items-center justify-center bg-white border border-gray-200 p-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png"
                              alt="Paytm"
                              className="h-5 object-contain"
                            />
                          </a>
                          <a
                            href={`upi://pay?${commonParams}`}
                            onClick={(e) => {
                              if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                                e.preventDefault();
                                alert('This feature works on mobile devices with UPI apps installed. On desktop, please scan the QR code.');
                              }
                            }}
                            className="flex flex-col items-center justify-center bg-white border border-gray-200 p-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Amazon_Pay_logo.svg/1024px-Amazon_Pay_logo.svg.png"
                              alt="Amazon Pay"
                              className="h-4 object-contain" // Adjusted height for Amazon Pay's wide logo
                            />
                          </a>
                          <a
                            href={`upi://pay?${commonParams}`}
                            onClick={(e) => {
                              if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                                e.preventDefault();
                                alert('This feature works on mobile devices with UPI apps installed. On desktop, please scan the QR code.');
                              }
                            }}
                            className="col-span-2 flex items-center justify-center bg-gray-900 text-white font-bold text-sm py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-md gap-2"
                          >
                            <span>Other UPI Apps</span>
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/512px-UPI-Logo-vector.svg.png"
                              alt="UPI"
                              className="h-4 bg-white rounded p-0.5"
                            />
                          </a>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-x-0 -top-3 flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm z-10">
                    <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
                  </div>
                </div>
                <div className="border-t border-gray-100 my-0"></div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-green-600/20">2</span>
                  <h3 className="font-bold text-gray-900">Confirm Order</h3>
                </div>

                {/* Payment Screenshot Upload (Only for UPI) */}
                {paymentMethod === 'UPI' && (
                  <div className="mb-4 text-left">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Payment Screenshot <span className="text-red-500">*</span></label>
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="payment-screenshot" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${paymentScreenshot ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {isUploadingPayment ? (
                              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                            ) : paymentScreenshot ? (
                              <>
                                <img src={paymentScreenshot} alt="Payment Proof" className="h-20 object-contain mb-1 rounded shadow-sm" />
                                <p className="text-xs text-green-600 font-semibold">Screenshot Uploaded!</p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-xs text-gray-500"><span className="font-semibold">Click to upload</span> payment proof</p>
                              </>
                            )}
                          </div>
                          <input
                            id="payment-screenshot"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePaymentScreenshotUpload}
                            disabled={isUploadingPayment}
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID / UTR Number (Optional)</label>
                      <input
                        type="text"
                        value={paymentUTR}
                        onChange={(e) => setPaymentUTR(e.target.value)}
                        placeholder="e.g. 132456789012"
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <p className="text-[10px] text-gray-500 mt-1 italic">Providing the UTR number helps us confirm your payment faster.</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100 relative">
                  {isVerifying && (
                    <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center gap-2 rounded-lg">
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      <span className="text-sm font-bold text-indigo-600">Verifying Amount...</span>
                    </div>
                  )}
                  <input
                    type="checkbox"
                    id="payment-confirmed"
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300"
                    checked={isPaymentConfirmed}
                    onChange={async (e) => {
                      if (e.target.checked) {
                        if (paymentMethod === 'UPI' && !paymentScreenshot) {
                          alert("Please upload the payment screenshot first!");
                          e.target.checked = false;
                          return;
                        }
                        if (!user) {
                          setMissingDetails(["Please login to proceed with your order"]);
                          setShowMissingDetailsModal(true);
                          e.target.checked = false;
                          return;
                        }

                        const missing = [];
                        if (!user.displayName) missing.push("Name");
                        if (!user.phone) missing.push("Phone Number");

                        // Address Details - Crucial for delivery
                        if (!user.address) missing.push("Street Address");
                        if (!user.city) missing.push("City");
                        if (!user.state) missing.push("State");
                        if (!user.pincode) missing.push("Pincode");
                        if (!user.addressType) missing.push("Address Type (Home/Work)");

                        if (missing.length > 0) {
                          setMissingDetails(missing);
                          setShowMissingDetailsModal(true);
                          e.target.checked = false; // Prevent checking the box
                          return;
                        }

                        if (paymentMethod === 'UPI') {
                          // Verify Payment Amount
                          setIsVerifying(true);
                          const result = await verifyPaymentAmount(paymentScreenshot!, total);
                          setIsVerifying(false);

                          if (!result.verified) {
                            setVerificationAlert({
                              title: "Payment couldn't be verified yet",
                              message: "Don't worry— sometimes this happens if the screenshot isn't clear.",
                              details: "Please upload a screenshot where:\n1. The paid amount matches your order total.\n2. The recipient name 'YATHES SIGN GALAXY' is visible.\n3. The payment details are not blurred or cropped."
                            });
                            e.target.checked = false; // Uncheck
                            return;
                          }
                        }
                        setIsPaymentConfirmed(true);
                      } else {
                        setIsPaymentConfirmed(false);
                      }
                    }}
                  />
                  <label htmlFor="payment-confirmed" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                    {paymentMethod === 'COD' ? 'I agree to pay on delivery & confirmed my address' : 'I have completed the payment with correct amount'}
                  </label>
                </div>

                {/* Missing Details Modal */}
                {showMissingDetailsModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden scale-100 animate-scale-in relative">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-pink-500"></div>

                      <div className="p-6">
                        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                          <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>

                        <h3 className="text-xl font-black text-gray-900 text-center mb-2">Complete Your Profile</h3>
                        <p className="text-center text-gray-500 text-sm mb-6">
                          To ensure accurate delivery and updates, please provide the following missing details:
                        </p>

                        <div className="bg-red-50/50 rounded-xl p-4 mb-6 border border-red-100 max-h-[200px] overflow-y-auto custom-scrollbar">
                          <ul className="space-y-2">
                            {missingDetails.map((field, idx) => (
                              <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                                {field}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowMissingDetailsModal(false)}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              setShowMissingDetailsModal(false);
                              if (!user) {
                                alert("Please use the login button in the navbar.");
                              } else {
                                navigate('/profile');
                              }
                            }}
                            className="flex-1 px-4 py-3 bg-primary hover:bg-purple-700 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
                          >
                            <User className="w-4 h-4" /> Go to Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Alert Modal */}
                {verificationAlert && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden scale-100 animate-scale-in relative">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
                      <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                          <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{verificationAlert.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {verificationAlert.message}
                        </p>
                        {verificationAlert.details && (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs text-gray-500 text-left mb-5 whitespace-pre-wrap">
                            {verificationAlert.details}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setVerificationAlert(null);
                            setPaymentScreenshot(null); // Clear previous screenshot to encourage re-upload
                            setIsPaymentConfirmed(false);
                          }}
                          className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors text-sm shadow-lg"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                )}


                <button
                  onClick={handleCheckout}
                  disabled={!isPaymentConfirmed}
                  className={`w-full group relative flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white transition-all transform overflow-hidden ${isPaymentConfirmed ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20 hover:-translate-y-1 active:translate-y-0' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  {isPaymentConfirmed && (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  )}
                  {paymentMethod === 'COD' ? (
                    <Truck className={`w-5 h-5 mr-2 ${isPaymentConfirmed ? 'animate-bounce-subtle' : ''}`} />
                  ) : (
                    <Phone className={`w-5 h-5 mr-2 ${isPaymentConfirmed ? 'animate-bounce-subtle' : ''}`} />
                  )}
                  <span>{paymentMethod === 'COD' ? 'Confirm COD Order' : 'Confirm Payment & Order'}</span>
                </button>
                <p className="mt-3 text-[10px] text-gray-400">Order Ref: #{Date.now().toString().slice(-6)} • Protected with Advanced Cyber Security & Secure Encryption</p>
              </div>
            </div>
          </div>
        </section>
      </div >
    </div >
  );
};
