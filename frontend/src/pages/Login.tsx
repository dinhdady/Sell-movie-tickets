import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/solid';
import Notification from '../components/Notification';
import { cookieService } from '../services/cookieService';
import googleAuthService from '../services/googleAuthService';
import { isGoogleAuthConfigured } from '../config/googleAuth';

/**
 * Login page — polished cinema theme
 * - Full-bleed gradient backdrop with subtle grid pattern
 * - Centered card with glass effect, soft ring & shadow
 * - Larger, accessible inputs with leading icons
 * - Clean header with brand, subtitle and link to register
 * - Primary button with loading state + keyboard focus styles
 * - Remember-me aligned and reachable; password toggle is accessible
 */

const Login: React.FC = () => {
  const { login, googleLogin, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const from = location.state?.from?.pathname || '/';

  // Check for Google OAuth error in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const googleError = urlParams.get('error');
    if (googleError) {
      setError(decodeURIComponent(googleError));
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search]);

  // Load remember me preference from cookie
  useEffect(() => {
    const savedRememberMe = cookieService.getTempData('rememberMe');
    if (savedRememberMe === 'true') setRememberMe(true);
  }, []);

  // Auto-hide notifications after 3 seconds
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.username || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const result = await login(formData);

      // Save remember me preference
      if (rememberMe) cookieService.setTempData('rememberMe', 'true', 30 * 24 * 60);
      else cookieService.removeTempData('rememberMe');

      if (result.success) {
        setSuccess('Đăng nhập thành công! Đang chuyển hướng...');
        setTimeout(() => navigate(from, { replace: true }), 1200);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      const errorMessage = error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      if (errorMessage.includes('xác thực email')) setError('Hãy xác thực email để đăng nhập. Kiểm tra hộp thư của bạn.');
      else if (errorMessage.includes('mật khẩu') || errorMessage.includes('password')) setError('Mật khẩu không chính xác. Vui lòng thử lại.');
      else if (errorMessage.includes('không tồn tại') || errorMessage.includes('not found')) setError('Tên đăng nhập không tồn tại. Vui lòng kiểm tra lại.');
      else setError(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setSuccess('');

      // Check if Google OAuth is configured
      if (!isGoogleAuthConfigured()) {
        setError('Google OAuth chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
        return;
      }

      // Authenticate with Google
      const authResponse = await googleAuthService.authenticate();
      
      // Prepare data for backend
      const googleData = {
        googleIdToken: authResponse.id_token,
        email: authResponse.userInfo.email,
        name: authResponse.userInfo.name,
        picture: authResponse.userInfo.picture,
        birthday: '', // Google doesn't provide birthday by default
        phone: '' // Google doesn't provide phone by default
      };

      const result = await googleLogin(googleData);
      if (result.success) {
        setSuccess('Đăng nhập Google thành công! Đang chuyển hướng...');
        setTimeout(() => navigate(from, { replace: true }), 1200);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Đăng nhập Google thất bại');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900">
      {/* Subtle grid pattern */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(theme(colors.white/5)_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="relative w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-white/10 ring-1 ring-white/20 shadow-md mb-3">
            {/* Simple ticket icon using CSS */}
            <div className="h-6 w-8 bg-white/80 rounded-md relative">
              <div className="absolute -left-1 top-1 h-4 w-2 bg-slate-900 rounded-r-full" />
              <div className="absolute -right-1 top-1 h-4 w-2 bg-slate-900 rounded-l-full" />
            </div>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Cinema Booking</h1>
          <p className="mt-1 text-indigo-100 text-sm">Đăng nhập để đặt vé nhanh chóng và nhận ưu đãi</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="space-y-5">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-indigo-100">
                  Tên đăng nhập
                </label>
                <div className="mt-1 relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <UserIcon className="h-5 w-5 text-indigo-200" />
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Nhập tên đăng nhập"
                    className="block w-full rounded-xl border-0 bg-white/80 text-slate-900 placeholder-slate-500 pl-10 pr-3 py-2.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-indigo-100">
                  Mật khẩu
                </label>
                <div className="mt-1 relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <LockClosedIcon className="h-5 w-5 text-indigo-200" />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu"
                    className="block w-full rounded-xl border-0 bg-white/80 text-slate-900 placeholder-slate-500 pl-10 pr-11 py-2.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            {error && (
              <Notification type="error" message={error} onClose={() => setError('')} autoHide duration={3000} />
            )}
            {success && (
              <Notification type="success" message={success} onClose={() => setSuccess('')} autoHide duration={3000} />
            )}

            {/* Options */}
            <div className="flex items-center justify-between">
              <label htmlFor="remember-me" className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-indigo-100">Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-indigo-200 hover:text-white">
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Đang đăng nhập…
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </div>

            {/* Google Login */}
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="group relative w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 focus-visible:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Đăng nhập với Google
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/20" /></div>
              <div className="relative flex justify-center">
                <span className="bg-transparent px-2 text-xs text-indigo-100">Chưa có tài khoản?</span>
              </div>
            </div>

            <div className="text-center">
              <Link to="/register" className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-indigo-100 ring-1 ring-inset ring-white/30 hover:bg-white/10">
                Tạo tài khoản mới
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;