// Google OAuth Configuration
import { GOOGLE_CLIENT_ID } from './googleAuthCredentials';

// Google OAuth configuration
export const googleAuthConfig = {
  clientId: GOOGLE_CLIENT_ID,
  scope: 'openid email profile',
  redirectUri: window.location.origin,
  responseType: 'code',
  accessType: 'offline',
  prompt: 'consent'
};

// Validate Google Client ID
export const isGoogleAuthConfigured = (): boolean => {
  return GOOGLE_CLIENT_ID.length > 0;
};

// Google OAuth error messages
export const GOOGLE_AUTH_ERRORS = {
  POPUP_CLOSED: 'Đăng nhập Google bị hủy bởi người dùng',
  ACCESS_DENIED: 'Truy cập Google bị từ chối',
  INVALID_CLIENT: 'Cấu hình Google OAuth không hợp lệ',
  NETWORK_ERROR: 'Lỗi kết nối mạng',
  UNKNOWN_ERROR: 'Lỗi không xác định'
};
