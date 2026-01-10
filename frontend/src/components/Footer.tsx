import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div>
            <div className="flex items-center gap-0 -mb-10 -ml-[2rem] -mt-7">
              <img src="/logo-icon.jpg" alt="UC" className="h-48 w-auto object-contain mix-blend-screen brightness-110 -mr-12" />
              <div className="flex flex-col">
                <h3 className="text-2xl font-black tracking-tighter text-[#FFB300] leading-none">SIGN GALAXY</h3>
                <span className="text-[10px] text-gray-400 tracking-widest uppercase">Personalized Gifts</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm ml-6 max-w-[17rem]">
              Premium personalized gifts for every occasions.
              Turning moments into memories !
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p><span className="font-bold text-white">Phone:</span> 6380016798</p>
              <p><span className="font-bold text-white">Email:</span> signgalaxy31@gmail.com</p>
              <p><span className="font-bold text-white">Address:</span><br />
                150 Post Office Road,<br />
                Thirunagar Colony,<br />
                Erode, Tamil Nadu 638003</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/terms" className="hover:text-[#f5ebd0]">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-[#f5ebd0]">Privacy Policy</Link></li>
              <li><Link to="/shipping" className="hover:text-[#f5ebd0]">Shipping Info</Link></li>
              <li><Link to="/returns" className="hover:text-[#f5ebd0]">Return Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/ucgroups_yathessigngalaxy" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-[#f5ebd0] transition-colors group">
                <Instagram className="w-5 h-5 text-white group-hover:text-gray-900" />
              </a>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-[#f5ebd0] transition-colors group">
                <Facebook className="w-5 h-5 text-white group-hover:text-gray-900" />
              </a>
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-[#f5ebd0] transition-colors group">
                <Youtube className="w-5 h-5 text-white group-hover:text-gray-900" />
              </a>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Follow us on social media for updates, offers, and more!
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          <p className="mb-2 text-xs font-semibold text-gray-400">Protected with Advanced Cyber Security & Secure Encryption</p>
          <p>© 2026 SIGN GALAXY a unit of uc groups. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};