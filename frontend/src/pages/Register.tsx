import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { LockClosedIcon, UserIcon, EnvelopeIcon, PhoneIcon, IdentificationIcon } from '@heroicons/react/24/solid';

import '../styles/app-theme.css';

const Register: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    birthday: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false); // ✅ chỉ hiện strength khi focus

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const emailValid = useMemo(() => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(formData.email), [formData.email]);

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.fullName) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return false;
    }
    if (!emailValid) {
      setError('Email không hợp lệ');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    return true;
  };

  const passwordScore = useMemo(() => {
    const p = formData.password;
    let score = 0;
    if (p.length >= 6) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (p.length >= 10) score++;
    return Math.min(score, 4);
  }, [formData.password]);

  const strengthLabel = ['Yếu', 'Trung bình', 'Khá', 'Mạnh', 'Rất mạnh'][passwordScore] || 'Yếu';

  const strengthBarClass = [
    'w-1/5 bg-red-400',
    'w-2/5 bg-orange-400',
    'w-3/5 bg-yellow-400',
    'w-4/5 bg-emerald-400',
    'w-full bg-green-500',
  ][passwordScore];

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 3500);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 4500);
      return () => clearTimeout(t);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;

    try {
      const { confirmPassword, ...registerData } = formData as any;
      const response = await register(registerData);

      if (response?.verificationRequired) {
        setVerificationEmail(response.email || formData.email);
        setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_10%,rgba(99,102,241,0.14),transparent_60%),radial-gradient(900px_600px_at_80%_20%,rgba(56,189,248,0.10),transparent_55%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:70px_70px]" />
        <div className="film-grain-light absolute inset-0 opacity-[0.10]" />
      </div>

      <div className="relative mx-auto flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-xl">
          {/* header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Tạo tài khoản</h1>
            <p className="mt-1 text-sm text-slate-600">Đăng ký để đặt vé nhanh và nhận khuyến mãi</p>
          </div>

          {/* card */}
          <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-6 sm:p-8 shadow-[0_20px_60px_-30px_rgba(2,6,23,0.18)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Họ và tên *</label>
                  <div className="mt-1 relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                      <IdentificationIcon className="h-5 w-5 text-slate-400" />
                    </span>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Nhập họ và tên"
                      className="block w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-3 py-3 text-sm
                                 placeholder:text-slate-400 outline-none transition
                                 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700">Tên đăng nhập *</label>
                  <div className="mt-1 relative">
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
                      className="block w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-3 py-3 text-sm
                                 placeholder:text-slate-400 outline-none transition
                                 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email *</label>
                  <div className="mt-1 relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Nhập email"
                      className={[
                        'block w-full rounded-2xl border bg-slate-50 pl-10 pr-3 py-3 text-sm placeholder:text-slate-400 outline-none transition',
                        emailValid ? 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                                  : 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/20',
                      ].join(' ')}
                      autoComplete="email"
                    />
                  </div>
                  {!emailValid && formData.email.length > 0 && (
                    <p className="mt-1 text-xs text-red-600">Định dạng email chưa đúng</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Số điện thoại</label>
                  <div className="mt-1 relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                      <PhoneIcon className="h-5 w-5 text-slate-400" />
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại"
                      className="block w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-3 py-3 text-sm
                                 placeholder:text-slate-400 outline-none transition
                                 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Birthday */}
                <div>
                  <label htmlFor="birthday" className="block text-sm font-medium text-slate-700">Ngày sinh</label>
                  <div className="mt-1 relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                      <IdentificationIcon className="h-5 w-5 text-slate-400" />
                    </span>
                    <input
                      id="birthday"
                      name="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={handleChange}
                      className="block w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-3 py-3 text-sm
                                 outline-none transition
                                 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      autoComplete="bday"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Không bắt buộc</p>
                </div>

                {/* Password */}
                <div className="sm:col-span-2">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">Mật khẩu *</label>
                  <div className="mt-1 relative">
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
                      onFocus={() => setPasswordFocused(true)} // ✅ chỉ hiện khi focus
                      onBlur={() => setPasswordFocused(false)}
                      placeholder="Nhập mật khẩu"
                      className="block w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-11 py-3 text-sm
                                 placeholder:text-slate-400 outline-none transition
                                 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      autoComplete="new-password"
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

                  {/* ✅ Strength only when focusing password */}
                  {passwordFocused && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${strengthBarClass}`} />
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        Độ mạnh mật khẩu: <span className="font-medium text-slate-800">{strengthLabel}</span>
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Tối thiểu 6 ký tự, nên có chữ hoa, số và ký tự đặc biệt.
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="sm:col-span-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Xác nhận mật khẩu *</label>
                  <div className="mt-1 relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                      <LockClosedIcon className="h-5 w-5 text-slate-400" />
                    </span>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Nhập lại mật khẩu"
                      className={`block w-full rounded-2xl border bg-slate-50 pl-10 pr-11 py-3 text-sm
                                  placeholder:text-slate-400 outline-none transition
                                  ${
                                    formData.confirmPassword && formData.confirmPassword !== formData.password
                                      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                                      : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                                  }`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700"
                    >
                      {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>

                  {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                    <p className="mt-1 text-xs text-red-600">Mật khẩu xác nhận chưa khớp</p>
                  )}
                </div>
              </div>

              {/* Alerts */}
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <div className="font-medium">{success}</div>
                  {verificationEmail && (
                    <div className="mt-1 text-xs text-emerald-700">
                      Email đã gửi đến: <span className="font-semibold">{verificationEmail}</span>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button onClick={() => navigate('/verify-email')} className="text-emerald-700 hover:text-emerald-900 text-sm font-medium">
                      Xác thực email ngay →
                    </button>
                    <button onClick={() => navigate('/login')} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      Đăng nhập →
                    </button>
                  </div>
                </div>
              )}

              {/* Terms */}
              <div className="flex items-start gap-2">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="agree-terms" className="text-sm text-slate-600">
                  Tôi đồng ý với{' '}
                  <Link to="/terms" className="text-indigo-600 hover:text-indigo-800 font-medium">Điều khoản sử dụng</Link>{' '}
                  và{' '}
                  <Link to="/privacy" className="text-indigo-600 hover:text-indigo-800 font-medium">Chính sách bảo mật</Link>
                </label>
              </div>

              {/* Submit */}
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
                    Đang đăng ký…
                  </span>
                ) : (
                  'Đăng ký'
                )}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-xs text-slate-500">Đã có tài khoản?</span>
                </div>
              </div>

              <Link
                to="/login"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition
                           hover:bg-slate-50 inline-flex items-center justify-center"
              >
                Đăng nhập
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
