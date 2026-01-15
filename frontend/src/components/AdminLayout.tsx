import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  HomeIcon,
  FilmIcon,
  TicketIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  HomeModernIcon,
  Squares2X2Icon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  TagIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Phim', href: '/admin/movies', icon: FilmIcon },
    { name: 'Đặt vé', href: '/admin/bookings', icon: TicketIcon },
    { name: 'Người dùng', href: '/admin/users', icon: UserGroupIcon },
    { name: 'Rạp chiếu', href: '/admin/cinemas', icon: BuildingOfficeIcon },
    { name: 'Phòng chiếu', href: '/admin/rooms', icon: HomeModernIcon },
    { name: 'Quản lý ghế', href: '/admin/seats', icon: Squares2X2Icon },
    { name: 'Coupon', href: '/admin/coupons', icon: TagIcon },
    { name: 'Sự kiện', href: '/admin/events', icon: GiftIcon },
    { name: 'Thống kê', href: '/admin/statistics', icon: ChartBarIcon },
    { name: 'Cài đặt', href: '/admin/settings', icon: Cog6ToothIcon },
  ];
  const isCurrentPath = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isCurrentPath(item.href)
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.fullName?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700 truncate" title={user?.fullName || 'Admin'}>
                  {user?.fullName || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate" title={user?.email}>{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-3 flex w-full items-center px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isCurrentPath(item.href)
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.fullName?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700 truncate" title={user?.fullName || 'Admin'}>
                  {user?.fullName || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate" title={user?.email}>{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-3 flex w-full items-center px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <span className="text-sm text-gray-500 max-w-[200px] truncate inline-block" title={user?.fullName || 'Admin'}>
                  Xin chào, {user?.fullName || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;
