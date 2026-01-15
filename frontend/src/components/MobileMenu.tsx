import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  FilmIcon,
  BuildingOfficeIcon,
  UserIcon,
  TicketIcon
} from '@heroicons/react/24/outline';

const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Trang chủ', href: '/', icon: HomeIcon },
    { name: 'Phim', href: '/movies', icon: FilmIcon },
    { name: 'Rạp chiếu', href: '/cinemas', icon: BuildingOfficeIcon },
    { name: 'Vé của tôi', href: '/profile', icon: TicketIcon },
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsOpen(false)} />
          
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* User section */}
              <div className="border-t border-gray-200 p-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UserIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate" title={user.fullName || user.username}>
                          {user.fullName || user.username}
                        </p>
                        <p className="text-sm text-gray-500 truncate" title={user.email}>{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                      >
                        Thông tin cá nhân
                      </Link>
                      <Link
                        to="/cart"
                        onClick={() => setIsOpen(false)}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                      >
                        Giỏ hàng
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
