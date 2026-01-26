import React, { useState } from 'react';
import { Phone, ShieldCheck, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';
import { useCart } from '../context';

export const WhatsAppRequestModal: React.FC = () => {
    const { user, setUser } = useCart();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // This component will be conditionally rendered in App.tsx
    // so we don't need internal visibility logic here other than for the form submission.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone.trim() || phone.length < 10) {
            setError('Please enter a valid WhatsApp number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/update-phone`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user?.email,
                    phone: phone.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update phone number');
            }

            // Update user in context
            if (user) {
                await setUser({ ...user, phone: phone.trim() });
                // Note: The modal should disappear once user.phone is set
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative animate-scale-in">
                {/* Decorative Header */}
                <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <MessageSquare className="w-32 h-32 rotate-12" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/30">
                            <Phone className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight leading-tight mb-2">WhatsApp Verified</h2>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                            <ShieldCheck className="w-3 h-3 text-white" /> Trusted & Secure
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8">
                    <div className="mb-6 text-center">
                        <p className="text-gray-500 font-medium leading-relaxed">
                            To provide you with seamless order updates and personalized support, please verify your WhatsApp number.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                WhatsApp Number
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-bold group-focus-within:text-[#25D366] transition-colors">+91</span>
                                </div>
                                <input
                                    type="tel"
                                    required
                                    autoFocus
                                    placeholder="9876543210"
                                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent text-gray-900 text-lg font-bold rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all outline-none"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                />
                            </div>
                            {error && <p className="text-red-500 text-xs font-bold mt-1 ml-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 rotate-180" /> {error}</p>}
                        </div>

                        <ul className="space-y-2 mb-6">
                            <li className="flex items-start gap-3 text-xs text-gray-400 font-medium">
                                <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
                                <span>Get real-time order updates & approvals via WhatsApp</span>
                            </li>
                            <li className="flex items-start gap-3 text-xs text-gray-400 font-medium">
                                <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
                                <span>Real-time shipping notifications & tracking IDs</span>
                            </li>
                            <li className="flex items-start gap-3 text-xs text-gray-400 font-medium">
                                <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
                                <span>Direct access to our premium support team</span>
                            </li>
                        </ul>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-500/20 hover:shadow-green-500/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Save and Continue <CheckCircle2 className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-[10px] text-gray-300 font-bold uppercase tracking-tighter">
                        We value your privacy. No spam, only essential updates.
                    </p>
                </div>
            </div>
        </div>
    );
};
