import api from './api';
import { getCurrentUserId } from '../utils/auth';

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface OTPVerificationRequest {
  otp: string;
}

export interface ChangePasswordResponse {
  message: string;
  otpSent: boolean;
  email: string;
}

export const passwordAPI = {
  // Request password change (sends OTP)
  requestPasswordChange: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const response = await api.post('/auth/change-password-request', data, {
      headers: {
        'X-User-Id': userId
      }
    });
    return response.data.object;
  },

  // Verify OTP and complete password change
  verifyOTPAndChangePassword: async (data: OTPVerificationRequest): Promise<{ message: string }> => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const response = await api.post('/auth/change-password-verify', data, {
      headers: {
        'X-User-Id': userId
      }
    });
    return response.data.object;
  },

  // Resend OTP
  resendOTP: async (): Promise<{ message: string }> => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const response = await api.post('/auth/resend-otp', {}, {
      headers: {
        'X-User-Id': userId
      }
    });
    return response.data.object;
  }
};

export default passwordAPI;
