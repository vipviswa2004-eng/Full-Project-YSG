
import React, { useEffect } from 'react';
import { useCart } from '../context';
import { Trash2, Phone, QrCode, ArrowRight, Minus, Plus } from 'lucide-react';
import { WHATSAPP_NUMBERS, VariationOption } from '../types';
import { useSearchParams } from 'react-router-dom';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartItemQuantity, currency } = useCart();
  const [searchParams] = useSearchParams();

  const total = cart.reduce((acc, item) => acc + (item.calculatedPrice * item.quantity), 0);

  // UPI Configuration
  // UPI Configuration
  const UPI_ID = "Pos.11391465@indus";
  const PAYEE_NAME = "YATHES SIGN GALAXY";

  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${total}&cu=INR`;
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

  const handleCheckout = () => {
    let message = "NEW ORDER REQUEST - YATHES SIGN GALAXY\n\n";
    cart.forEach((item, idx) => {
      message += `${idx + 1}. ${item.name} (Qty: ${item.quantity})\n`;
      message += `   Custom Text: ${item.customName || 'None'}\n`;
      if (item.selectedVariations) {
        Object.entries(item.selectedVariations).forEach(([_key, opt]) => {
          const v = opt as VariationOption;
          message += `   ${v.label} (${formatPrice(v.priceAdjustment)})\n`;
        });
      }
      if (item.extraHeads && item.extraHeads > 0) {
        message += `   Extra Heads: ${item.extraHeads}\n`;
      }
      message += `   AI Swap Requested: Yes\n`;

      // Include Product Image URL
      const imgUrl = item.customImage || item.image;
      if (imgUrl && !imgUrl.startsWith('data:')) {
        const fullImgUrl = imgUrl.startsWith('http') ? imgUrl : `${window.location.origin}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
        message += `   Product Image: ${fullImgUrl}\n`;
      }

      message += `   Price: ${formatPrice(item.calculatedPrice)}\n\n`;
    });
    message += `TOTAL: ${formatPrice(total)}\n\n`;
    message += "Payment Status: PAID via UPI QR\n";
    message += "Please confirm order processing.";

    const encodedMsg = encodeURIComponent(message);
    const waLink = `https://wa.me/${WHATSAPP_NUMBERS[0]}?text=${encodedMsg}`;

    if (window.confirm("Have you completed the payment? Click OK to send order details via WhatsApp.")) {
      window.open(waLink, '_blank');
    }
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

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <section className="lg:col-span-7 space-y-4">
          <div className="bg-white shadow-sm overflow-hidden rounded-xl border border-gray-100">
            <ul className="divide-y divide-gray-100">
              {cart.map((item) => (
                <li key={item.cartId} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    <div className="h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                      <img
                        src={item.customDesign?.preview || item.customImage || item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center transform transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    <div className="flex-1 w-full relative">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{item.name}</h3>
                          <p className="text-sm text-gray-500 font-medium">{item.category}</p>
                        </div>
                        <p className="text-lg font-bold text-primary">{formatPrice(item.calculatedPrice * item.quantity)}</p>
                      </div>

                      <div className="space-y-2 mb-4">
                        {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {Object.values(item.selectedVariations).map((opt) => {
                              const v = opt as VariationOption;
                              return <span key={v.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">{v.label}</span>;
                            })}
                          </div>
                        )}
                        {item.customName && (
                          <div className="inline-block bg-yellow-50 px-3 py-1 rounded-md border border-yellow-200">
                            <p className="text-xs text-yellow-800 font-medium">Text: "{item.customName}"</p>
                          </div>
                        )}
                        {item.extraHeads && item.extraHeads > 0 && <p className="text-xs text-blue-600 font-medium">+ {item.extraHeads} Extra Persons</p>}
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
                  <a
                    href={`tez://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${total}&cu=INR`}
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
                    href={`phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${total}&cu=INR`}
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
                    href={`paytmmp://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${total}&cu=INR`}
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
                    href={`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${total}&cu=INR`}
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
                    href={upiLink}
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
                <p className="text-xs text-gray-500 mb-4 px-2">After successful payment, click below to share order details and delivery address on WhatsApp.</p>

                <button
                  onClick={handleCheckout}
                  className="w-full group relative flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-lg shadow-green-600/20 text-base font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:-translate-y-1 active:translate-y-0 overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  <Phone className="w-5 h-5 mr-2 animate-bounce-subtle" />
                  <span>Send Details via WhatsApp</span>
                </button>
                <p className="mt-3 text-[10px] text-gray-400">Order Ref: #{Date.now().toString().slice(-6)} • Secure & Encrypted</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
