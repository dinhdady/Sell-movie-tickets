import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FilmIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  GlobeAltIcon,
  ChatBubbleLeftIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FilmIcon className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">CinemaHub</span>
            </div>
            <p className="text-gray-300 text-sm">
              Hệ thống rạp chiếu phim hiện đại với công nghệ tiên tiến, 
              mang đến trải nghiệm xem phim tuyệt vời nhất cho khán giả.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <GlobeAltIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <ChatBubbleLeftIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <ShareIcon className="h-6 w-6" />
              </a>
            </div>
          </div>
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/movies" className="text-gray-300 hover:text-white transition-colors">
                  Phim đang chiếu
                </Link>
              </li>
              <li>
                <Link to="/movies?category=coming-soon" className="text-gray-300 hover:text-white transition-colors">
                  Phim sắp chiếu
                </Link>
              </li>
              <li>
                <Link to="/cinemas" className="text-gray-300 hover:text-white transition-colors">
                  Rạp chiếu
                </Link>
              </li>
              <li>
                <Link to="/promotions" className="text-gray-300 hover:text-white transition-colors">
                  Khuyến mãi
                </Link>
              </li>
            </ul>
          </div>
          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white transition-colors">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-gray-300 hover:text-white transition-colors">
                  Chính sách hoàn vé
                </Link>
              </li>
            </ul>
          </div>
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Thông tin liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-primary-400 mt-0.5" />
                <div>
                  <p className="text-gray-300 text-sm">
                    123 Đường ABC, Quận 1<br />
                    TP. Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-primary-400" />
                <p className="text-gray-300 text-sm">1900 1234</p>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-primary-400" />
                <p className="text-gray-300 text-sm">support@cinemahub.com</p>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 CinemaHub. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Điều khoản
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Bảo mật
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
