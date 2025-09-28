import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { LockClosedIcon, UserIcon, EnvelopeIcon, PhoneIcon, IdentificationIcon } from '@heroicons/react/24/solid';

/**
 * Register page — polished cinema theme
 * - Matches Login styling (gradient + grid pattern, glass card, icons)
 * - Clear required fields, helper texts, and password strength indicator
 * - Accessible controls, focus rings, and responsive spacing
 */

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
    return Math.min(score, 4); // 0..4
  }, [formData.password]);

  const strengthLabel = ['Yếu', 'Trung bình', 'Khá', 'Mạnh', 'Rất mạnh'][passwordScore] || 'Yếu';

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
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900">
      {/* Subtle grid pattern */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(theme(colors.white/5)_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="relative w-full max-w-xl">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-white/10 ring-1 ring-white/20 shadow-md mb-3">
            <div className="h-6 w-8 bg-white/80 rounded-md relative">
              <div className="absolute -left-1 top-1 h-4 w-2 bg-slate-900 rounded-r-full" />
              <div className="absolute -right-1 top-1 h-4 w-2 bg-slate-900 rounded-l-full" />
            </div>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Tạo tài khoản</h1>
          <p className="mt-1 text-indigo-100 text-sm">Đăng ký để đặt vé nhanh và nhận khuyến mãi sớm</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full name */}
              <div className="sm:col-span-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-indigo-100">Họ và tên *</label>
                <div className="mt-1 relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <IdentificationIcon className="h-5 w-5 text-indigo-200" />
                  </span>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên"
                    className="block w-full rounded-xl border-0 bg-white/80 text-slate-900 placeholder-slate-500 pl-10 pr-3 py-2.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-indigo-100">Tên đăng nhập *</label>
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

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-indigo-100">Email *</label>
                <div className="mt-1 relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-indigo-200" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập email"
                    className={`block w-full rounded-xl border-0 bg-white/80 text-slate-900 placeholder-slate-500 pl-10 pr-3 py-2.5 shadow-sm ring-1 ring-inset focus:bg-white transition ${emailValid ? 'ring-slate-300 focus:ring-indigo-500' : 'ring-red-300 focus:ring-red-500'}`}
                    autoComplete="email"
                  />
                </div>
                {!emailValid && formData.email.length > 0 && (
                  <p className="mt-1 text-xs text-red-200">Định dạng email chưa đúng</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-indigo-100">Số điện thoại</label>
                <div className="mt-1 relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <PhoneIcon className="h-5 w-5 text-indigo-200" />
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    className="block w-full rounded-xl border-0 bg-white/80 text-slate-900 placeholder-slate-500 pl-10 pr-3 py-2.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Birthday */}
              <div>
                <label htmlFor="birthday" className="block text-sm font-medium text-indigo-100">Ngày sinh</label>
                <div className="mt-1 relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <IdentificationIcon className="h-5 w-5 text-indigo-200" />
                  </span>
                  <input
                    id="birthday"
                    name="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-0 bg-white/80 text-slate-900 placeholder-slate-500 pl-10 pr-3 py-2.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    autoComplete="bday"
                  />
                </div>
                <p className="mt-1 text-xs text-indigo-200">Chọn ngày sinh của bạn (không bắt buộc)</p>
              </div>

              {/* Password */}
              <div className="sm:col-span-2">
                <label htmlFor="password" className="block text-sm font-medium text-indigo-100">Mật khẩu *</label>
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
                {/* Strength bar */}
                <div className="mt-2">
                  <div className="h-1.5 w-full rounded-full bg-white/30 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${[
                        'w-1/5 bg-red-400',
                        'w-2/5 bg-orange-400',
                        'w-3/5 bg-yellow-400',
                        'w-4/5 bg-emerald-400',
                        'w-full bg-green-500',
                      ][passwordScore]}`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-indigo-100">Độ mạnh mật khẩu: <span className="font-medium">{strengthLabel}</span></p>
                </div>
                <p className="mt-1 text-xs text-indigo-200">Tối thiểu 6 ký tự, nên có chữ hoa, số và ký tự đặc biệt.</p>
              </div>

              {/* Confirm Password */}
              <div className="sm:col-span-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-indigo-100">Xác nhận mật khẩu *</label>
                <div className="mt-1 relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <LockClosedIcon className="h-5 w-5 text-indigo-200" />
                  </span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                    className={`block w-full rounded-xl border-0 bg-white/80 text-slate-900 placeholder-slate-500 pl-10 pr-11 py-2.5 shadow-sm ring-1 ring-inset focus:bg-white transition ${formData.confirmPassword && formData.confirmPassword !== formData.password ? 'ring-red-300 focus:ring-red-500' : 'ring-slate-300 focus:ring-indigo-500'}`}
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
                  <p className="mt-1 text-xs text-red-200">Mật khẩu xác nhận chưa khớp</p>
                )}
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="bg-red-500/10 ring-1 ring-red-400/30 text-red-100 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/10 ring-1 ring-emerald-400/30 text-emerald-100 px-4 py-3 rounded-xl text-sm">
                <div className="font-medium">{success}</div>
                {verificationEmail && (
                  <div className="mt-2 text-xs">Email đã gửi đến: <span className="font-semibold">{verificationEmail}</span></div>
                )}
                <div className="mt-3 flex flex-wrap gap-3">
                  <button onClick={() => navigate('/verify-email')} className="text-emerald-200 hover:text-white text-sm font-medium">Xác thực email ngay →</button>
                  <button onClick={() => navigate('/login')} className="text-indigo-200 hover:text-white text-sm font-medium">Đăng nhập →</button>
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input id="agree-terms" name="agree-terms" type="checkbox" required className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="agree-terms" className="text-sm text-indigo-100">
                Tôi đồng ý với{' '}
                <Link to="/terms" className="text-white underline decoration-white/40 underline-offset-2 hover:decoration-white">Điều khoản sử dụng</Link>{' '}
                và{' '}
                <Link to="/privacy" className="text-white underline decoration-white/40 underline-offset-2 hover:decoration-white">Chính sách bảo mật</Link>
              </label>
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
                    Đang đăng ký…
                  </>
                ) : (
                  'Đăng ký'
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/20" /></div>
              <div className="relative flex justify-center">
                <span className="bg-transparent px-2 text-xs text-indigo-100">Đã có tài khoản?</span>
              </div>
            </div>

            <div className="text-center">
              <Link to="/login" className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-indigo-100 ring-1 ring-inset ring-white/30 hover:bg-white/10">
                Đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;