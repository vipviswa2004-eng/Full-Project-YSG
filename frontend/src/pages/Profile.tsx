import React, { useState } from 'react';
import { useCart } from '../context';
import { User, Mail, Phone, ShieldCheck, ClipboardCheck, Edit2, Camera, LogOut, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
    const { user, setUser } = useCart();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({}); // Use any for flexibility or User interface
    const [isLocating, setIsLocating] = useState(false);

    // Sync user data to local form state
    React.useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                phone: user.phone || '',
                address: user.address || '',
                pincode: user.pincode || '',
                state: user.state || '',
                city: user.city || '',
                addressType: user.addressType || 'Home',
                gender: user.gender || ''
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Using OpenStreetMap Nominatim for free reverse geocoding
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();

                if (data && data.address) {
                    setFormData((prev: any) => ({
                        ...prev,
                        pincode: data.address.postcode || prev.pincode,
                        state: data.address.state || prev.state,
                        city: data.address.city || data.address.town || data.address.county || prev.city,
                        address: [data.address.road, data.address.suburb, data.address.neighbourhood].filter(Boolean).join(', ') || prev.address
                    }));
                }
            } catch (error) {
                console.error("Error fetching location", error);
                alert('Unable to fetch address details. Please enter manually.');
            } finally {
                setIsLocating(false);
            }
        }, (error) => {
            console.error("Geolocation error", error);
            setIsLocating(false);
            alert('Unable to retrieve your location');
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            await setUser({
                ...user,
                displayName: formData.displayName,
                phone: formData.phone,
                address: formData.address,
                pincode: formData.pincode,
                state: formData.state,
                city: formData.city,
                addressType: formData.addressType,
                gender: formData.gender
            });
            setIsEditing(false);
            // Optional: Show success toast
        } catch (error) {
            console.error("Failed to update profile", error);
        }
    };

    // Mock function for logout (duplicate of Navbar one, ideally should be in context)
    const handleLogout = async () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
        window.location.href = `${import.meta.env.VITE_API_URL}/api/logout`;
    };

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <User className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Please Sign In</h2>
                <p className="text-gray-500 mb-6 text-center max-w-md">
                    Join the Galaxy to access your profile, track orders, and manage your preferences.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                    Sign In
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-app-bg py-8 animate-fade-in-up">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-600 relative">
                        <div className="absolute inset-0 pattern-grid-lg opacity-10"></div>
                    </div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-8 mb-6">
                            <div className="flex items-end">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full p-1 bg-white shadow-xl">
                                        <img
                                            src={user.image}
                                            alt={user.displayName}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                    <button className="absolute bottom-1 right-1 p-1.5 bg-gray-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                        <Camera className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="ml-4 mb-1 pt-6">
                                    <h1 className="text-2xl font-black text-gray-900 leading-tight">
                                        {user.displayName || 'Galaxy User'}
                                    </h1>
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3 text-green-500" />
                                        {user.isAdmin ? 'Super Administrator' : 'Verified Member'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {user.isAdmin && (
                                    <button
                                        onClick={() => navigate('/admin')}
                                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                        Admin Dashboard
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats / Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => navigate('/orders')}
                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-purple-50 hover:shadow-md transition-all border border-gray-100 group"
                            >
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-purple-600 group-hover:scale-110 transition-transform">
                                    <ClipboardCheck className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">My Activity</p>
                                    <p className="text-lg font-bold text-gray-900">Orders</p>
                                </div>
                            </button>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div className="text-left overflow-hidden">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                                    <p className="text-base font-bold text-gray-900 truncate" title={user.email}>{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-green-600">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                                    <p className="text-base font-bold text-gray-900">{user.phone || 'Not Added'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column - Menu */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-white rounded-2xl shadow-lg p-4">
                            <nav className="space-y-1">
                                <button className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-700 font-bold rounded-xl border-l-4 border-purple-600">
                                    <User className="w-5 h-5" />
                                    Personal Details
                                </button>
                                <button onClick={() => navigate('/orders')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors">
                                    <ClipboardCheck className="w-5 h-5" />
                                    My Orders
                                </button>
                                {/* Add more nav items as features grow: Addresses, Wishlist, Settings */}
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors mt-4">
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Right Column - Content */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-gray-900">Personal Details</h3>
                                {isEditing ? (
                                    <button
                                        onClick={handleUseCurrentLocation}
                                        type="button"
                                        disabled={isLocating}
                                        className="text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                                    >
                                        <MapPin className={`w-3.5 h-3.5 ${isLocating ? 'animate-pulse' : ''}`} />
                                        {isLocating ? 'Locating...' : 'Use Current Location'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="text-sm font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            <form className="space-y-6" onSubmit={handleSave}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                                        <input
                                            type="text"
                                            name="displayName"
                                            value={formData.displayName || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={user.email}
                                            disabled={true} // Email usually immutable or needs specific flow
                                            className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 font-medium cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="Add phone number"
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                                        <div className="flex items-center gap-4">
                                            <label className={`flex-1 cursor-pointer px-4 py-3 rounded-xl border-2 text-center font-bold transition-all ${formData.gender === 'Male' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="Male"
                                                    checked={formData.gender === 'Male'}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className="hidden"
                                                />
                                                Male
                                            </label>
                                            <label className={`flex-1 cursor-pointer px-4 py-3 rounded-xl border-2 text-center font-bold transition-all ${formData.gender === 'Female' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="Female"
                                                    checked={formData.gender === 'Female'}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className="hidden"
                                                />
                                                Female
                                            </label>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Address (House No, Street, Area)</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="Add your full address"
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">City / District / Town</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="e.g. Chennai"
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="e.g. Tamil Nadu"
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Pincode</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="Add pincode"
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Address Type</label>
                                        <div className="flex items-center gap-4">
                                            <label className={`flex-1 cursor-pointer px-4 py-3 rounded-xl border-2 text-center font-bold transition-all ${formData.addressType === 'Home' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                                <input
                                                    type="radio"
                                                    name="addressType"
                                                    value="Home"
                                                    checked={formData.addressType === 'Home'}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className="hidden"
                                                />
                                                Home
                                            </label>
                                            <label className={`flex-1 cursor-pointer px-4 py-3 rounded-xl border-2 text-center font-bold transition-all ${formData.addressType === 'Office' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                                <input
                                                    type="radio"
                                                    name="addressType"
                                                    value="Office"
                                                    checked={formData.addressType === 'Office'}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className="hidden"
                                                />
                                                Office
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                // Reset form
                                                if (user) {
                                                    setFormData({
                                                        displayName: user.displayName || '',
                                                        phone: user.phone || '',
                                                        address: user.address || '',
                                                        pincode: user.pincode || '',
                                                        state: user.state || '',
                                                        city: user.city || '',
                                                        addressType: user.addressType || 'Home',
                                                        gender: user.gender || ''
                                                    });
                                                }
                                            }}
                                            className="px-6 py-3 text-gray-600 font-bold hover:text-gray-900 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-all transform hover:scale-105">
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
