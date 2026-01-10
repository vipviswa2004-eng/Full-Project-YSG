
import React, { useEffect } from 'react';
import { useCart } from '../context';
import { Trash2, Phone, QrCode, ArrowRight, Minus, Plus, MapPin, PenBox, AlertTriangle, User } from 'lucide-react';
import { WHATSAPP_NUMBERS, VariationOption } from '../types';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartItemQuantity, currency, user, clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isPaymentConfirmed, setIsPaymentConfirmed] = React.useState(false);
  const [missingDetails, setMissingDetails] = React.useState<string[]>([]);
  const [showMissingDetailsModal, setShowMissingDetailsModal] = React.useState(false);

  const total = cart.reduce((acc, item) => acc + (item.calculatedPrice * item.quantity), 0);

  // UPI Configuration
  const UPI_ID = "Pos.11391465@indus";
  const PAYEE_NAME = "SIGN GALAXY";


  // Use static QR code image instead of dynamically generated one
  const qrCodeUrl = "/upi-qr-code-only.jpg";

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
    if (!window.confirm("Have you completed the payment? Click OK to confirm order and send details.")) {
      return;
    }

    try {
      // 1. Create Order in Database
      const orderData = {
        user: user ? {
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          phone: user.phone || ''
        } : {
          email: 'guest@signgalaxy.com',
          name: 'Guest User'
        },
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
        status: 'Design Pending',
        paymentMethod: 'UPI',
        orderId: `ORD-${Date.now()}`,
        date: new Date()
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        console.error("Failed to save order to database");
        // Check if we should proceed anyway? 
        // Yes, user priority is WhatsApp. But we should log it.
      } else {
        console.log("Order saved to database");
        // Only clear cart if order saved successfully
        clearCart();
      }

    } catch (error) {
      console.error("Error creating order:", error);
    }

    // 2. Send Details via WhatsApp (Original Logic)
    let message = "Hello Sign Galaxy 👋\n";
    message += "I’ve placed an order successfully.\n\n";
    message += "*ORDER DETAILS*\n";
    message += "--------------------------------\n";

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
      const imgUrl = item.customImage || item.image;
      if (imgUrl && !imgUrl.startsWith('data:')) {
        const fullImgUrl = imgUrl.startsWith('http') ? imgUrl : `${window.location.origin}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
        // Custom image logic: if customImage exists, it's an uploaded photo
        const imageLabel = item.customImage ? "Uploaded Photo" : "Product Image";
        message += `• ${imageLabel}: ${fullImgUrl}\n`;
      }

      message += "\n";
    });

    message += "--------------------------------\n";
    message += `*💰 Grand Total: ${formatPrice(total)}*\n`;
    message += "✅ *Payment Status:* Paid via UPI\n";
    message += "--------------------------------\n\n";
    message += "📍 *Delivery Details:*\n";
    if (user) {
      message += `Name: ${user.displayName || 'Guest User'}\n`;
      message += `Phone: ${user.phone || 'N/A'}\n`;
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
    const waLink = `https://wa.me/${WHATSAPP_NUMBERS[0]}?text=${encodedMsg}`;

    window.open(waLink, '_blank');
    navigate('/orders');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="mt-4 text-gray-500">Add some personalized gifts to start!</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
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
            <PenBox className="w-4 h-4Group-hover:text-indigo-600" />
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
                        src={item.customDesign?.preview || item.customImage || item.image}
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
                        <p className="text-lg font-bold text-primary">{formatPrice(item.calculatedPrice * item.quantity)}</p>
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
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-primary/20">1</span>
                  <h3 className="font-bold text-gray-900">Scan to Pay</h3>
                </div>

                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 inline-block mb-3">
                  <img src={qrCodeUrl} alt="Payment QR Code" className="w-40 h-40 object-contain mx-auto" />
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Total Amount</p>
                  <p className="text-3xl font-extrabold text-primary">{formatPrice(total)}</p>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200 max-w-[240px] mx-auto">
                  <QrCode className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-mono select-all truncate">{UPI_ID}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
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
                          className="flex flex-col items-center justify-center bg-white border border-gray-200 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-bold text-blue-600">GPay</span>
                        </a>
                        <a
                          href={`phonepe://pay?${commonParams}`}
                          onClick={(e) => {
                            if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                              e.preventDefault();
                              alert('This feature works on mobile devices with the PhonePe app installed. On desktop, please scan the QR code.');
                            }
                          }}
                          className="flex flex-col items-center justify-center bg-white border border-gray-200 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-bold text-[#5f259f]">PhonePe</span>
                        </a>
                        <a
                          href={`paytmmp://pay?${commonParams}`}
                          onClick={(e) => {
                            if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                              e.preventDefault();
                              alert('This feature works on mobile devices with the Paytm app installed. On desktop, please scan the QR code.');
                            }
                          }}
                          className="flex flex-col items-center justify-center bg-white border border-gray-200 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-bold text-[#00b9f1]">Paytm</span>
                        </a>
                        <a
                          href={`upi://pay?${commonParams}`}
                          onClick={(e) => {
                            if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                              e.preventDefault();
                              alert('This feature works on mobile devices with UPI apps installed. On desktop, please scan the QR code.');
                            }
                          }}
                          className="flex flex-col items-center justify-center bg-white border border-gray-200 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-bold text-[#FF9900]">Amazon Pay</span>
                        </a>
                        <a
                          href={`upi://pay?${commonParams}`}
                          onClick={(e) => {
                            if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                              e.preventDefault();
                              alert('This feature works on mobile devices with UPI apps installed. On desktop, please scan the QR code.');
                            }
                          }}
                          className="col-span-2 flex items-center justify-center bg-gray-900 text-white font-bold text-sm py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Other UPI Apps <ArrowRight className="w-4 h-4 ml-1" />
                        </a>
                      </>
                    );
                  })()}
                </div>
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
                <div className="flex items-center justify-center gap-2 mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                  <input
                    type="checkbox"
                    id="payment-confirmed"
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300"
                    checked={isPaymentConfirmed}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (!user) {
                          setMissingDetails(["Please login to proceed with your order"]);
                          setShowMissingDetailsModal(true);
                          return;
                        }

                        const missing = [];
                        if (!user.displayName) missing.push("Display Name");
                        if (!user.email) missing.push("Email Address");
                        if (!user.phone) missing.push("Phone Number");
                        if (!user.gender) missing.push("Gender");
                        if (!user.address) missing.push("Street Address");
                        if (!user.city) missing.push("City");
                        if (!user.state) missing.push("State");
                        if (!user.pincode) missing.push("Pincode");
                        if (!user.addressType) missing.push("Address Type");

                        if (missing.length > 0) {
                          setMissingDetails(missing);
                          setShowMissingDetailsModal(true);
                          return;
                        }
                      }
                      setIsPaymentConfirmed(e.target.checked);
                    }}
                  />
                  <label htmlFor="payment-confirmed" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                    I have completed the payment of <span className="font-bold text-gray-900">{formatPrice(total)}</span>
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


                <button
                  onClick={handleCheckout}
                  disabled={!isPaymentConfirmed}
                  className={`w-full group relative flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white transition-all transform overflow-hidden ${isPaymentConfirmed ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20 hover:-translate-y-1 active:translate-y-0' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  {isPaymentConfirmed && (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  )}
                  <Phone className={`w-5 h-5 mr-2 ${isPaymentConfirmed ? 'animate-bounce-subtle' : ''}`} />
                  <span>Confirm Payment & Order</span>
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
