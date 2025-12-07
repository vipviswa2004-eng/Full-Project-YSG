
import React, { useEffect } from 'react';
import { useCart } from '../context';
import { Trash2, Phone, QrCode, ArrowRight } from 'lucide-react';
import { WHATSAPP_NUMBERS, VariationOption } from '../types';
import { useSearchParams } from 'react-router-dom';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, currency } = useCart();
  const [searchParams] = useSearchParams();

  const total = cart.reduce((acc, item) => acc + (item.calculatedPrice * item.quantity), 0);

  // UPI Configuration
  const UPI_ID = "vipviswa2004@okicici";
  const PAYEE_NAME = "YATHES SIGN GALAXY";

  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${total}&cu=INR`;
  // Use static QR code image instead of dynamically generated one
  const qrCodeUrl = "/upi-qr-code.png";

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
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <section className="lg:col-span-7">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {cart.map((item) => (
                <li key={item.cartId} className="p-6 flex items-center">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.customDesign?.preview || item.customImage || item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex-1 flex flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.name}</h3>
                        <p className="ml-4">{formatPrice(item.calculatedPrice)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                      {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {Object.values(item.selectedVariations).map((opt) => {
                            const v = opt as VariationOption;
                            return <span key={v.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{v.label}</span>;
                          })}
                        </div>
                      )}
                      {item.customName && <p className="mt-1 text-sm text-indigo-600">Text: "{item.customName}"</p>}
                      {item.extraHeads && item.extraHeads > 0 && <p className="mt-1 text-xs text-blue-500">+ {item.extraHeads} Extra Persons</p>}
                    </div>
                    <div className="flex-1 flex items-end justify-between text-sm">
                      <p className="text-gray-500">Qty {item.quantity}</p>
                      <div className="flex">
                        <button type="button" onClick={() => removeFromCart(item.cartId)} className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1"><Trash2 className="w-4 h-4" /> Remove</button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 px-4 py-6 sm:px-6 bg-gray-50">
              <div className="flex justify-between text-base font-medium text-gray-900"><p>Subtotal</p><p>{formatPrice(total)}</p></div>
              <p className="mt-0.5 text-sm text-gray-500">Includes all customization charges.</p>
            </div>
          </div>
        </section>

        <section id="payment-section" className="lg:col-span-5 mt-16 lg:mt-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden scroll-mt-24">
          <div className="px-4 py-6 sm:px-6 bg-gray-900 text-white"><h2 className="text-lg font-medium">Order Summary & Payment</h2></div>
          <div className="p-6 space-y-8">
            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center justify-center gap-2"><span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>Scan to Pay</h3>
              <p className="text-sm text-gray-500 mb-4">Scan using GPay, PhonePe, Paytm or any UPI App</p>
              <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                <div className="bg-white p-2 rounded-lg shadow-sm mb-3"><img src={qrCodeUrl} alt="Payment QR Code" className="w-48 h-48" /></div>
                <p className="text-2xl font-extrabold text-gray-900 mb-1">{formatPrice(total)}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1 rounded border border-gray-200"><QrCode className="w-4 h-4" /><span className="font-mono select-all">{UPI_ID}</span></div>
                <a href={upiLink} className="mt-4 md:hidden inline-flex items-center text-primary font-bold text-sm hover:underline">Pay on this device <ArrowRight className="w-4 h-4 ml-1" /></a>
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center justify-center gap-2"><span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>Confirm Order</h3>
              <p className="text-sm text-center text-gray-500 mb-4">After payment, click below to send your order details and delivery address via WhatsApp.</p>
              <button onClick={handleCheckout} className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:-translate-y-0.5"><Phone className="w-5 h-5 mr-2" /> Send Order Details via WhatsApp</button>
              <p className="mt-3 text-center text-xs text-gray-400">By clicking, you will be redirected to WhatsApp to share order #{Date.now().toString().slice(-6)}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
