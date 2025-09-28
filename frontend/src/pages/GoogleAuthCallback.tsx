import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import googleAuthService from '../services/googleAuthService';

const GoogleAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple calls
    if (hasProcessed.current) {
      console.log('GoogleAuthCallback: Already processed, skipping...');
      return;
    }
    
    hasProcessed.current = true;
    
    const handleCallback = async () => {
      try {
        console.log('GoogleAuthCallback: Starting OAuth callback processing...');
        
        // Handle OAuth callback
        const authResponse = await googleAuthService.handleCallback();
        
        // Prepare data for backend
        const googleData = {
          googleIdToken: authResponse.id_token,
          email: authResponse.userInfo.email,
          name: authResponse.userInfo.name,
          picture: authResponse.userInfo.picture,
          birthday: '', // Google doesn't provide birthday by default
          phone: '' // Google doesn't provide phone by default
        };

        console.log('GoogleAuthCallback: Calling googleLogin...');
        // Login with Google data
        await googleLogin(googleData);
        
        console.log('GoogleAuthCallback: Redirecting to home...');
        // Redirect to home page
        navigate('/', { replace: true });

      } catch (error) {
        console.error('Google auth callback error:', error);
        // Redirect to login page with error
        navigate('/login?error=' + encodeURIComponent(error instanceof Error ? error.message : 'Lỗi đăng nhập Google'), { replace: true });
      }
    };

    handleCallback();
  }, []); // Empty dependency array to run only once

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang xử lý đăng nhập Google...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
