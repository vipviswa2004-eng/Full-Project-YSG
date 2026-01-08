import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Phone } from 'lucide-react';
import { useCart } from '../context';

export const WhatsAppChat: React.FC = () => {
    const { isGiftAdvisorOpen } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Auto-open after location popup is closed
    useEffect(() => {
        const hasSeenChat = sessionStorage.getItem('whatsapp_chat_seen');
        if (!hasSeenChat) {
            // Check if location popup has been closed
            const checkLocationPopup = setInterval(() => {
                const locationPopupClosed = sessionStorage.getItem('location_popup_closed');
                if (locationPopupClosed) {
                    clearInterval(checkLocationPopup);
                    // Wait 2 seconds after location popup closes
                    setTimeout(() => {
                        setIsOpen(true);
                        sessionStorage.setItem('whatsapp_chat_seen', 'true');
                    }, 2000);
                }
            }, 500); // Check every 500ms

            // Cleanup interval after 30 seconds if location popup never shows
            const timeout = setTimeout(() => {
                clearInterval(checkLocationPopup);
                // If location popup never showed, open WhatsApp chat anyway after 7 seconds total
                if (!sessionStorage.getItem('whatsapp_chat_seen')) {
                    setIsOpen(true);
                    sessionStorage.setItem('whatsapp_chat_seen', 'true');
                }
            }, 30000);

            return () => {
                clearInterval(checkLocationPopup);
                clearTimeout(timeout);
            };
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Save to database
        try {
            await fetch('http://localhost:5000/api/whatsapp-leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber,
                    message
                })
            });
        } catch (error) {
            console.error('Error saving lead:', error);
            // Continue to redirect even if save fails
        }

        // Format the support number (your number)
        const supportNumber = '919342310194';

        // Construct the message
        const text = message
            ? `Hi, I need help with: ${message}. My number is: ${phoneNumber}`
            : `Hi, I need help. My number is: ${phoneNumber}`;

        // Redirect to WhatsApp
        const url = `https://wa.me/${supportNumber}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');

        setIsOpen(false);
        setHasInteracted(true);
    };

    if (isGiftAdvisorOpen) return null;

    return (
        <div className="fixed bottom-36 md:bottom-28 right-4 z-50 flex flex-col items-end font-sans">
            {/* Chat Popup */}
            {isOpen && (
                <div className="mb-3 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up border border-gray-100">
                    {/* Header */}
                    <div className="bg-[#25D366] p-3 flex justify-between items-center text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base leading-tight">Support Team</h3>
                                <p className="text-[10px] text-white/90 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                    Online 24/7
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-3 bg-gray-50">
                        <div className="bg-white p-2.5 rounded-lg rounded-tl-none shadow-sm mb-3 border border-gray-100 max-w-[95%]">
                            <p className="text-gray-700 text-xs">
                                Hi there! 👋 <br />
                                Welcome to Sign Galaxy. How can we help you today?
                            </p>
                            <span className="text-[9px] text-gray-400 mt-1 block text-right">Just now</span>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-2">
                            <div>
                                <label htmlFor="wa-phone" className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5 ml-1">
                                    Your WhatsApp Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-400" />
                                    <input
                                        id="wa-phone"
                                        type="tel"
                                        required
                                        placeholder="+91 98765 43210"
                                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition-all"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="wa-msg" className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5 ml-1">
                                    Message (Optional)
                                </label>
                                <textarea
                                    id="wa-msg"
                                    rows={2}
                                    placeholder="I have a question about..."
                                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition-all resize-none"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/20 text-xs"
                            >
                                <Send className="w-3.5 h-3.5" />
                                Start Chat
                            </button>
                        </form>
                    </div>

                    <div className="bg-gray-50 px-3 pb-2 text-center">
                        <p className="text-[9px] text-gray-400 flex items-center justify-center gap-1">
                            <ShieldCheckIcon className="w-2.5 h-2.5" />
                            Powered by WhatsApp
                        </p>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
          group relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300
          ${isOpen ? 'bg-gray-200 rotate-90' : 'bg-[#25D366] hover:bg-[#20bd5a] hover:scale-110'}
        `}
            >
                {isOpen ? (
                    <X className="w-5 h-5 text-gray-600" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white fill-current" />
                )}

                {/* Notification Badge */}
                {!isOpen && !hasInteracted && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-bounce"></span>
                )}

                {/* Tooltip */}
                {!isOpen && isHovered && (
                    <div className="absolute right-full mr-4 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap animate-fade-in">
                        Chat with us!
                        <div className="absolute top-1/2 -right-1 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                )}
            </button>
        </div>
    );
};

// Helper icon component
const ShieldCheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);
