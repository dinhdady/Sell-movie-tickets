import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import MobileMenu from './MobileMenu';
import {
  FilmIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';

import '../styles/app-theme.css';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // ✅ đồng bộ với Movies page (đang đọc query param q)
    navigate(`/movies?q=${encodeURIComponent(q)}`);
    setSearchQuery('');
  };

  const isAdmin =
    user?.role === 'ADMIN' ||
    user?.role === 'admin' ||
    user?.role?.toString?.().toUpperCase?.() === 'ADMIN';

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Glass bar */}
      <div className="bg-white/75 backdrop-blur border-b border-slate-200 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-indigo-600 text-white shadow-sm group-hover:shadow transition">
                <FilmIcon className="h-6 w-6" />
              </span>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                CinemaHub
              </span>
            </Link>

            {/* Search - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm phim theo tên…"
                  className="w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-24 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Tìm
                </button>
              </div>
            </form>

            {/* Nav - Desktop */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLink to="/" active={isActive('/')}>
                Trang chủ
              </NavLink>
              <NavLink to="/movies" active={isActive('/movies')}>
                Phim
              </NavLink>
              <NavLink to="/cinemas" active={isActive('/cinemas')}>
                Rạp chiếu
              </NavLink>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative ml-2 inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                aria-label="Giỏ hàng"
                title="Giỏ hàng"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1.5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* User */}
              {isAuthenticated ? (
                <div className="ml-2 flex items-center gap-2">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="inline-flex items-center rounded-2xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition shadow-sm"
                    >
                      Admin
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                    title={user?.fullName || user?.username}
                  >
                    <UserIcon className="h-5 w-5 text-slate-500" />
                    <span className="max-w-[140px] truncate">
                      {user?.fullName || user?.username}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center rounded-2xl bg-rose-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition shadow-sm"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="ml-2 flex items-center gap-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center rounded-2xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

/* ---------------- helpers ---------------- */

const NavLink: React.FC<{ to: string; active?: boolean; children: React.ReactNode }> = ({
  to,
  active,
  children,
}) => {
  return (
    <Link
      to={to}
      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      {children}
    </Link>
  );
};
