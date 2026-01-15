import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/solid';
import Notification from '../components/Notification';
import { cookieService } from '../services/cookieService';
import googleAuthService from '../services/googleAuthService';
import { isGoogleAuthConfigured } from '../config/googleAuth';

import '../styles/app-theme.css';

const Login: React.FC = () => {
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const googleError = urlParams.get('error');
    if (googleError) {
      setError(decodeURIComponent(googleError));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search]);

  useEffect(() => {
    const savedRememberMe = cookieService.getTempData('rememberMe');
    if (savedRememberMe === 'true') setRememberMe(true);
  }, []);

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

      if (rememberMe) cookieService.setTempData('rememberMe', 'true', 30 * 24 * 60);
      else cookieService.removeTempData('rememberMe');

      if (result?.success) {
        setSuccess('Đăng nhập thành công! Đang chuyển hướng...');
        setTimeout(() => navigate(from, { replace: true }), 1200);
      }
    } catch (err: unknown) {
      const eobj = err as { message?: string };
      const msg = eobj.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      if (msg.includes('xác thực email')) setError('Hãy xác thực email để đăng nhập. Kiểm tra hộp thư của bạn.');
      else if (msg.includes('mật khẩu') || msg.includes('password')) setError('Mật khẩu không chính xác. Vui lòng thử lại.');
      else if (msg.includes('không tồn tại') || msg.includes('not found')) setError('Tên đăng nhập không tồn tại. Vui lòng kiểm tra lại.');
      else setError(msg);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setSuccess('');

      if (!isGoogleAuthConfigured()) {
        setError('Google OAuth chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
        return;
      }

      await googleAuthService.authenticate();
    } catch (err: unknown) {
      const eobj = err as { message?: string };
      setError(eobj.message || 'Đăng nhập Google thất bại');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      {/* Light clean backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_10%,rgba(99,102,241,0.14),transparent_60%),radial-gradient(900px_600px_at_80%_20%,rgba(56,189,248,0.10),transparent_55%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:70px_70px]" />
        <div className="film-grain-light absolute inset-0 opacity-[0.10]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
          {/* LEFT (desktop) */}
          <div className="hidden lg:flex items-center">
            <div className="w-full rounded-3xl border border-slate-200 bg-white/70 backdrop-blur p-10 shadow-[0_20px_60px_-30px_rgba(2,6,23,0.18)]">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2">
                <div className="h-10 w-10 rounded-2xl bg-indigo-600/10 ring-1 ring-indigo-600/15 flex items-center justify-center">
                  <div className="h-5 w-7 bg-indigo-600/80 rounded-md relative">
                    <div className="absolute -left-1 top-1 h-3 w-2 bg-white rounded-r-full" />
                    <div className="absolute -right-1 top-1 h-3 w-2 bg-white rounded-l-full" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold">Cinema Booking</p>
                  <p className="text-xs text-slate-500">Đặt vé nhanh • QR check-in • Ưu đãi</p>
                </div>
              </div>

              <h2 className="mt-8 text-4xl font-bold tracking-tight text-slate-900">
                Đặt vé xem phim <span className="text-indigo-600">nhanh</span> và tiện.
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Trải nghiệm sạch, tối giản và hiện đại — phù hợp thị trường.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <InfoTile title="Ưu đãi" desc="Voucher theo suất chiếu" />
                <InfoTile title="Thanh toán" desc="Nhanh & an toàn" />
                <InfoTile title="QR Ticket" desc="Check-in siêu tiện" />
                <InfoTile title="Tối ưu" desc="Mượt trên mobile" />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="mb-6 text-center lg:hidden">
                <h1 className="text-2xl font-bold">Cinema Booking</h1>
                <p className="mt-1 text-sm text-slate-600">Đăng nhập để đặt vé nhanh chóng</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-6 sm:p-8 shadow-[0_20px_60px_-30px_rgba(2,6,23,0.18)]">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Đăng nhập</h2>
                  <p className="text-sm text-slate-600">Chào mừng quay lại.</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  {/* username */}
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-slate-700">
                      Tên đăng nhập
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                        <UserIcon className="h-5 w-5 text-slate-400" />
                      </span>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Nhập tên đăng nhập"
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-10 py-3 text-sm
                                   placeholder:text-slate-400 outline-none transition
                                   focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  {/* password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                        <LockClosedIcon className="h-5 w-5 text-slate-400" />
                      </span>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu"
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-10 py-3 pr-12 text-sm
                                   placeholder:text-slate-400 outline-none transition
                                   focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700"
                      >
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* notifications */}
                  {error && (
                    <Notification type="error" message={error} onClose={() => setError('')} autoHide duration={3000} />
                  )}
                  {success && (
                    <Notification type="success" message={success} onClose={() => setSuccess('')} autoHide duration={3000} />
                  )}

                  {/* options */}
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
                      <span className="text-sm text-slate-600">Ghi nhớ đăng nhập</span>
                    </label>
                    <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                      Quên mật khẩu?
                    </Link>
                  </div>

                  {/* submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition
                               bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                               shadow-[0_14px_35px_-18px_rgba(99,102,241,0.6)]
                               focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                               disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Đang đăng nhập…
                      </span>
                    ) : (
                      'Đăng nhập'
                    )}
                  </button>

                  {/* google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition
                               hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10
                               disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Đăng nhập với Google
                  </button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-2 text-xs text-slate-500">Chưa có tài khoản?</span>
                    </div>
                  </div>

                  <Link
                    to="/register"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition
                               hover:bg-slate-50 inline-flex items-center justify-center"
                  >
                    Tạo tài khoản mới
                  </Link>
                </form>
              </div>

              <p className="mt-5 text-center text-xs text-slate-500">
                Bằng việc đăng nhập, bạn đồng ý với điều khoản & chính sách của Cinema Booking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

const InfoTile: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <p className="text-xs text-slate-500">{title}</p>
    <p className="mt-1 text-sm font-semibold text-slate-800">{desc}</p>
  </div>
);
