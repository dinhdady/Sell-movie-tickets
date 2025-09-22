import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);
  const preventRedirectRef = useRef(false);
  useEffect(() => {
    // Lấy token từ URL params nếu có
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setIsAutoVerifying(true);
      preventRedirectRef.current = true; // Ngăn redirect
      // Tự động xác thực khi có token từ URL
      handleVerifyEmail(tokenFromUrl);
    }
  }, [searchParams]);
  // Ngăn auto-redirect khi đang auto-verifying
  useEffect(() => {
    if (isAutoVerifying) {
    }
  }, [isAutoVerifying]);
  // Override navigate để ngăn redirect khi đang auto-verifying
  // const safeNavigate = (path: string) => {
  //   if (preventRedirectRef.current && isAutoVerifying) {
  //     return;
  //   }
  //   navigate(path);
  // };
  const handleVerifyEmail = async (verificationToken: string) => {
    if (!verificationToken.trim()) {
      setMessage('Vui lòng nhập mã xác thực');
      setVerificationStatus('error');
      return;
    }
    try {
      setVerificationStatus('verifying');
      setMessage('Đang xác thực email...');
      const response = await authAPI.verifyEmail(verificationToken);
      if (response.state === 'SUCCESS') {
        setVerificationStatus('success');
        setMessage('🎉 Email đã được xác thực thành công! Tài khoản của bạn đã sẵn sàng sử dụng.');
        setIsAutoVerifying(false);
        // Không tự động redirect, để user có thể click button
      } else {
        setVerificationStatus('error');
        setMessage(response.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn');
      }
    } catch (error: any) {
      setVerificationStatus('error');
      setMessage('Lỗi xác thực email: ' + (error.response?.data?.message || error.message));
    }
  };
  const handleResendVerification = async () => {
    if (!email.trim()) {
      setResendMessage('Vui lòng nhập email');
      setResendStatus('error');
      return;
    }
    try {
      setResendStatus('sending');
      setResendMessage('Đang gửi lại email xác thực...');
      const response = await authAPI.resendVerification(email);
      if (response.state === 'SUCCESS') {
        setResendStatus('success');
        setResendMessage('Email xác thực đã được gửi lại thành công!');
      } else {
        setResendStatus('error');
        setResendMessage(response.message || 'Không thể gửi lại email xác thực');
      }
    } catch (error: any) {
      setResendStatus('error');
      setResendMessage('Lỗi gửi email: ' + (error.response?.data?.message || error.message));
    }
  };
  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verifying':
        return <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircleIcon className="h-12 w-12 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-12 w-12 text-red-500" />;
      default:
        return <EnvelopeIcon className="h-12 w-12 text-gray-400" />;
    }
  };
  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {getStatusIcon()}
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Xác thực Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Vui lòng xác thực email để hoàn tất đăng ký tài khoản
          </p>
        </div>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Verification Form */}
          {verificationStatus !== 'success' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                  Mã xác thực
                </label>
                <div className="mt-1">
                  <input
                    id="token"
                    name="token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Nhập mã xác thực từ email"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={verificationStatus === 'verifying'}
                  />
                </div>
              </div>
              <div>
                <button
                  onClick={() => handleVerifyEmail(token)}
                  disabled={verificationStatus === 'verifying' || !token.trim()}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verificationStatus === 'verifying' ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    'Xác thực Email'
                  )}
                </button>
              </div>
            </div>
          )}
          {/* Success Actions */}
          {verificationStatus === 'success' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Xác thực thành công!
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Tài khoản của bạn đã được xác thực. Bây giờ bạn có thể đăng nhập và sử dụng tất cả tính năng.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    preventRedirectRef.current = false; // Cho phép redirect
                    navigate('/login');
                  }}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  <span className="mr-2">🚀</span>
                  Tiếp tục đăng nhập
                </button>
                <button
                  onClick={() => {
                    preventRedirectRef.current = false; // Cho phép redirect
                    navigate('/');
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Về trang chủ
                </button>
              </div>
            </div>
          )}
          {/* Status Message */}
          {message && (
            <div className={`mt-4 p-4 rounded-md ${verificationStatus === 'success' ? 'bg-green-50' : verificationStatus === 'error' ? 'bg-red-50' : 'bg-blue-50'}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {verificationStatus === 'success' ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  ) : verificationStatus === 'error' ? (
                    <XCircleIcon className="h-5 w-5 text-red-400" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${getStatusColor()}`}>
                    {message}
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Resend Verification */}
          {verificationStatus === 'error' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Không nhận được email xác thực?
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email đăng ký
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email đã đăng ký"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={handleResendVerification}
                  disabled={resendStatus === 'sending' || !email.trim()}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendStatus === 'sending' ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi lại Email Xác thực'
                  )}
                </button>
                {resendMessage && (
                  <div className={`p-3 rounded-md text-sm ${
                    resendStatus === 'success' ? 'bg-green-50 text-green-700' : 
                    resendStatus === 'error' ? 'bg-red-50 text-red-700' : 
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {resendMessage}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Navigation - chỉ hiển thị khi chưa xác thực thành công */}
          {verificationStatus !== 'success' && (
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => {
                  preventRedirectRef.current = false; // Cho phép redirect
                  navigate('/login');
                }}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Quay lại đăng nhập
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => {
                  preventRedirectRef.current = false; // Cho phép redirect
                  navigate('/register');
                }}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Đăng ký tài khoản mới
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default EmailVerification;
