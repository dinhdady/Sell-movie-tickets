// Google OAuth Configuration
// Uses environment variables for security
// Fallback to backend client ID if env variable is not set
const DEFAULT_CLIENT_ID = '736049328651-5qk366aq1j3qbfvmm1nkd6m31ea2tu81.apps.googleusercontent.com';

export const googleAuthConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID,
  redirectUri: `${window.location.origin}/google-auth-callback`,
  scope: 'openid email profile',
  accessType: 'offline',
  prompt: 'consent'
};

// Export for use in other files
export const GOOGLE_CLIENT_ID = googleAuthConfig.clientId;
export const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';

// Google OAuth Error Messages
export const GOOGLE_AUTH_ERRORS = {
  ACCESS_DENIED: 'Truy cập bị từ chối',
  INVALID_REQUEST: 'Yêu cầu không hợp lệ',
  UNAUTHORIZED_CLIENT: 'Ứng dụng không được ủy quyền',
  UNSUPPORTED_RESPONSE_TYPE: 'Loại phản hồi không được hỗ trợ',
  INVALID_SCOPE: 'Phạm vi không hợp lệ',
  SERVER_ERROR: 'Lỗi máy chủ',
  TEMPORARILY_UNAVAILABLE: 'Tạm thời không khả dụng'
};

export const isGoogleAuthConfigured = () => {
  return GOOGLE_CLIENT_ID.trim().length > 0;
};