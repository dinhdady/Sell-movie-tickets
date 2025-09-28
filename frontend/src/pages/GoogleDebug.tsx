import React, { useState, useEffect } from 'react';
import googleAuthService from '../services/googleAuthService';
import { isGoogleAuthConfigured } from '../config/googleAuth';

const GoogleDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkConfiguration = () => {
      const info = {
        isConfigured: isGoogleAuthConfigured(),
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'Not set',
        currentUrl: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      setDebugInfo(info);
    };

    checkConfiguration();
  }, []);

  const testGoogleAuth = async () => {
    try {
      setError('');
      console.log('Testing Google Auth...');
      
      // Test configuration
      if (!isGoogleAuthConfigured()) {
        throw new Error('Google OAuth not configured');
      }

      // Test OAuth URL generation
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/google-auth-callback')}&response_type=code&scope=openid email profile&access_type=offline&prompt=consent`;
      
      console.log('Generated Auth URL:', authUrl);
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
      
    } catch (err: any) {
      console.error('Google Auth Test Error:', err);
      setError(err.message);
    }
  };

  const testCallback = async () => {
    try {
      setError('');
      console.log('Testing Google Auth Callback...');
      
      const authResponse = await googleAuthService.handleCallback();
      console.log('Auth Response:', authResponse);
      
      setDebugInfo(prev => ({
        ...prev,
        authResponse,
        callbackSuccess: true
      }));
      
    } catch (err: any) {
      console.error('Google Auth Callback Error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Google OAuth Debug</h1>
        
        {/* Configuration Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-4">
            <button
              onClick={testGoogleAuth}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
            >
              Test Google OAuth
            </button>
            
            <button
              onClick={testCallback}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Test Callback Handler
            </button>
          </div>
        </div>

        {/* URL Parameters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">URL Parameters</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(Object.fromEntries(new URLSearchParams(window.location.search)), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default GoogleDebug;
