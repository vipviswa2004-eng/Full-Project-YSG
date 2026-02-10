import React, { useState, useEffect } from 'react';
import { Mail, ShieldCheck, CheckCircle2, Loader2, ArrowRight, Key, Phone } from 'lucide-react';
import { useCart } from '../context';

export const VerificationModal: React.FC = () => {
    const { user, setUser } = useCart();
    const [step, setStep] = useState<'info' | 'otp'>('info');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [phone, setPhone] = useState(user?.phone || '');

    // Auto-send OTP on mount or when user changes
    useEffect(() => {
        if (user && !user.emailVerified && step === 'info') {
            // We could auto-send here, but let's let them click a button to "Start Verification" 
            // to ensure they are ready to check their email.
        }
    }, [user]);

    const handleSendOTP = async () => {
        if (!user?.email) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/send-otp-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to send OTP');

            setStep('otp');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user?.email,
                    otp: otp,
                    phone: phone // Sync phone if updated/provided
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid OTP');
            }

            // Update user in context with new verification status and potential phone
            if (user) {
                await setUser({
                    ...user,
                    emailVerified: true,
                    phone: phone
                });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-left">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative animate-scale-in">
                {/* Modern Header */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-800 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Mail className="w-32 h-32 rotate-12" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/30">
                            {step === 'info' ? <Mail className="w-8 h-8 text-white" /> : <Key className="w-8 h-8 text-white" />}
                        </div>
                        <h2 className="text-2xl font-black tracking-tight leading-tight mb-2">
                            {step === 'info' ? 'Email Verification' : 'Verify OTP'}
                        </h2>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                            <ShieldCheck className="w-3 h-3 text-white" /> Secure Verification
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8">
                    {step === 'info' ? (
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-gray-500 font-medium leading-relaxed">
                                    We need to verify your email <span className="text-purple-600 font-bold">{user.email}</span> to secure your account and send order updates.
                                </p>
                            </div>

                            {/* Phone Collection if missing (especially for Google users) */}
                            {!user.phone && (
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                        Phone Number (Required)
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                        </div>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="91XXXXXXXX"
                                            className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent text-gray-900 font-bold rounded-xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 italic ml-1">Needed for delivery notifications.</p>
                                </div>
                            )}

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 animate-head-shake">
                                    <ShieldCheck className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-xs font-medium text-red-600">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleSendOTP}
                                disabled={loading || (!user.phone && !phone)}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Verification Code <ArrowRight className="w-5 h-5" /></>}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div className="text-center">
                                <p className="text-gray-500 font-medium">
                                    We've sent a 6-digit code to <br />
                                    <span className="text-gray-900 font-bold">{user.email}</span>
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                                    Enter 6-Digit Code
                                </label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    maxLength={6}
                                    placeholder="······"
                                    className="block w-full px-4 py-4 bg-gray-50 border border-transparent text-gray-900 text-3xl font-black tracking-[0.5em] rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none text-center"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                />
                                {error && (
                                    <div className="flex justify-center mt-2">
                                        <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" /> {error}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Complete <CheckCircle2 className="w-5 h-5" /></>}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('info')}
                                className="w-full py-2 text-xs font-bold text-gray-400 hover:text-purple-600 transition-colors"
                            >
                                Re-send email or change details
                            </button>
                        </form>
                    )}

                    <p className="mt-6 text-center text-[10px] text-gray-300 font-bold uppercase tracking-tighter italic">
                        "Your privacy is our priority. Your data is encrypted and secure."
                    </p>
                </div>
            </div>
        </div>
    );
};
