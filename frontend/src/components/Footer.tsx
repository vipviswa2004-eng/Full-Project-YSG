import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-accent">YATHES SIGN GALAXY</h3>
            <p className="text-gray-400 text-sm">
              Premium personalized gifts for every occasion.
              Turn your memories into timeless art with our 3D crystals and engravings.
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
              <li><Link to="/terms" className="hover:text-accent">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-accent">Privacy Policy</Link></li>
              <li><Link to="/shipping" className="hover:text-accent">Shipping Info</Link></li>
              <li><Link to="/returns" className="hover:text-accent">Return Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/ucgroups_yathessigngalaxy" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-pink-600 transition-colors group">
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition-colors group">
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-red-600 transition-colors group">
                <Youtube className="w-5 h-5 text-white" />
              </a>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Follow us on social media for updates, offers, and more!
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          <p>© 2025 YATHES SIGN GALAXY a unit of uc groups. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};