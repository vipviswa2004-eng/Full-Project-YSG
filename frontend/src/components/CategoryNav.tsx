import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Gift, Briefcase, Star, Zap, User, Heart, Layers, Image as ImageIcon } from 'lucide-react';

interface SubCategoryLink {
    name: string;
    link: string;
}

interface CategoryGroup {
    id: string;
    title: string;
    items: SubCategoryLink[];
}

interface NavItem {
    id: string;
    label: string;
    icon: any;
    color: string;
    bgColor: string;
    groups: CategoryGroup[];
    image?: string;
}

const NAV_ITEMS: NavItem[] = [
    {
        id: 'personalized',
        label: 'Personalized Gifts',
        icon: Gift,
        color: 'text-pink-500',
        bgColor: 'bg-pink-50',
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop',
        groups: [
            {
                id: 'recipient',
                title: 'By Recipient',
                items: [
                    { name: 'For Him', link: '/products?q=him' },
                    { name: 'For Her', link: '/products?q=her' },
                    { name: 'Couples', link: '/products?q=couple' },
                    { name: 'Kids', link: '/products?q=kids' },
                ]
            },
            {
                id: 'material',
                title: 'By Material',
                items: [
                    { name: 'Wooden Engraving', link: '/products?q=wood' },
                    { name: '3D Crystals', link: '/products?q=crystal' },
                    { name: 'Acrylic Art', link: '/products?q=acrylic' },
                    { name: 'Metal & Steel', link: '/products?q=metal' },
                ]
            },
            {
                id: 'type',
                title: 'Popular Types',
                items: [
                    { name: 'Photo Frames', link: '/products?q=frame' },
                    { name: 'LED Lamps', link: '/products?q=lamp' },
                    { name: 'Caricatures', link: '/products?q=caricature' },
                    { name: 'Name Plates', link: '/products?q=name' },
                ]
            }
        ]
    },
    {
        id: 'corporate',
        label: 'Corporate Buying',
        icon: Briefcase,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop',
        groups: [
            {
                id: 'branding',
                title: 'Office Branding',
                items: [
                    { name: 'Desktop Organizers', link: '/products?q=desktop' },
                    { name: 'Custom Pens', link: '/products?q=pen' },
                    { name: 'Diaries & Planners', link: '/products?q=diary' },
                    { name: 'ID Card Holders', link: '/products?q=card' },
                ]
            },
            {
                id: 'awards',
                title: 'Awards & Recognition',
                items: [
                    { name: 'Crystal Trophies', link: '/products?q=trophy' },
                    { name: 'Wooden Plaques', link: '/products?q=plaque' },
                    { name: 'Service Awards', link: '/products?q=award' },
                    { name: 'Medals', link: '/products?q=medal' },
                ]
            },
            {
                id: 'bulk',
                title: 'Bulk Gifting',
                items: [
                    { name: 'Welcome Kits', link: '/products?q=welcome' },
                    { name: 'Festive Hampers', link: '/products?q=hamper' },
                    { name: 'Clients Gifts', link: '/products?q=client' },
                    { name: 'Event Giveaways', link: '/products?q=event' },
                ]
            }
        ]
    },
    {
        id: 'neon',
        label: 'Neon & Decor',
        icon: Zap,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&auto=format&fit=crop',
        groups: [
            {
                id: 'signs',
                title: 'Neon Signs',
                items: [
                    { name: 'Custom Text', link: '/products?q=neon%20text' },
                    { name: 'Wall Art', link: '/products?q=neon%20art' },
                    { name: 'Business Logos', link: '/products?q=neon%20logo' },
                ]
            },
            {
                id: 'home',
                title: 'Home Decor',
                items: [
                    { name: 'Wall Clocks', link: '/products?q=clock' },
                    { name: 'Name Plates', link: '/products?q=nameplate' },
                    { name: 'Canvas Prints', link: '/products?q=canvas' },
                ]
            }
        ]
    },
    {
        id: 'occasions',
        label: 'Shop By Occasion',
        icon: Star,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        image: 'https://images.unsplash.com/photo-1530103862676-de3c9fa59588?q=80&w=400&auto=format&fit=crop',
        groups: [
            {
                id: 'milestones',
                title: 'Life Events',
                items: [
                    { name: 'Birthday', link: '/products?q=birthday' },
                    { name: 'Anniversary', link: '/products?q=anniversary' },
                    { name: 'Wedding', link: '/products?q=wedding' },
                    { name: 'Housewarming', link: '/products?q=housewarming' },
                ]
            },
            {
                id: 'special',
                title: 'Special Days',
                items: [
                    { name: 'Valentine\'s Day', link: '/products?q=love' },
                    { name: 'Mother\'s Day', link: '/products?q=mom' },
                    { name: 'Father\'s Day', link: '/products?q=dad' },
                    { name: 'Friendship Day', link: '/products?q=friend' },
                ]
            }
        ]
    }
];

export const CategoryNav: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    return (
        <div className="bg-white shadow-sm border-b border-gray-100 hidden md:block sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    <ul className="flex items-center gap-8 h-full">
                        {NAV_ITEMS.map((item) => (
                            <li
                                key={item.id}
                                className="group h-full flex items-center"
                                onMouseEnter={() => setActiveCategory(item.id)}
                                onMouseLeave={() => setActiveCategory(null)}
                            >
                                <Link
                                    to={item.groups[0]?.items[0]?.link || '#'}
                                    className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-primary transition-colors py-4 relative"
                                >
                                    <span className={`w-8 h-8 rounded-full ${item.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                        <item.icon className={`w-4 h-4 ${item.color}`} />
                                    </span>
                                    {item.label}
                                    <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${activeCategory === item.id ? 'rotate-180' : ''}`} />

                                    {/* Current Active Indicator */}
                                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300 ${activeCategory === item.id ? 'scale-x-100' : 'scale-x-0'}`} />
                                </Link>

                                {/* Mega Menu Dropdown */}
                                <div
                                    className={`absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 transform transition-all duration-300 origin-top z-50
                    ${activeCategory === item.id ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible pointer-events-none'}
                  `}
                                >
                                    <div className="max-w-7xl mx-auto flex">
                                        {/* Content Columns */}
                                        <div className="flex-1 flex p-8 gap-12">
                                            {item.groups.map((group) => (
                                                <div key={group.id} className="min-w-[160px]">
                                                    <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                                                        {/* Optional: Add icons for groups specific to context if needed, for now just text */}
                                                        {group.id === 'recipient' && <User className="w-3.5 h-3.5 text-gray-400" />}
                                                        {group.id === 'material' && <Layers className="w-3.5 h-3.5 text-gray-400" />}
                                                        {group.id === 'branding' && <Briefcase className="w-3.5 h-3.5 text-gray-400" />}
                                                        {group.title}
                                                    </h4>
                                                    <ul className="space-y-2.5">
                                                        {group.items.map((sub, idx) => (
                                                            <li key={idx}>
                                                                <Link
                                                                    to={sub.link}
                                                                    className="text-sm text-gray-500 hover:text-primary hover:font-medium transition-all flex items-center gap-1.5 group/link"
                                                                >
                                                                    <ChevronRight className="w-3 h-3 opacity-0 -ml-3 group-hover/link:opacity-100 group-hover/link:ml-0 transition-all text-primary" />
                                                                    {sub.name}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Featured Image Section */}
                                        {item.image && (
                                            <div className="w-1/4 bg-gray-50 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group/image">
                                                <div className="absolute inset-0">
                                                    <img src={item.image} alt={item.label} className="w-full h-full object-cover opacity-80 group-hover/image:scale-105 transition-transform duration-700" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                                                </div>
                                                <div className="relative z-10 p-4">
                                                    <h3 className="text-white font-bold text-xl mb-2">{item.label}</h3>
                                                    <p className="text-gray-200 text-xs mb-4 opacity-90">Explore our premium collection customized just for you.</p>
                                                    <Link
                                                        to="/products"
                                                        className="inline-block px-4 py-2 bg-white text-gray-900 text-xs font-bold rounded-full hover:bg-primary hover:text-white transition-colors"
                                                    >
                                                        View All Collection
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Special Links */}
                    <div className="flex items-center gap-6 ml-auto">
                        <Link to="/products?filter=trending" className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-orange-500 transition-colors">
                            <Zap className="w-3.5 h-3.5 text-orange-500" />
                            Trending
                        </Link>
                        <Link to="/products?filter=new" className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-green-500 transition-colors">
                            <Star className="w-3.5 h-3.5 text-green-500" />
                            New Arrivals
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
