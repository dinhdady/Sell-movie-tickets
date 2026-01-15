import { googleAuthConfig } from '../config/googleAuth';
import { GOOGLE_CLIENT_SECRET } from "../config/googleAuth";

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
}

export interface GoogleAuthResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  userInfo?: GoogleUserInfo;
}

class GoogleAuthService {
  private clientId: string;
  private redirectUri: string;
  private isProcessing: boolean = false;

  constructor() {
    this.clientId = googleAuthConfig.clientId;
    this.redirectUri = googleAuthConfig.redirectUri;
  }

  /**
   * Initialize Google OAuth redirect
   */
  async authenticate(): Promise<GoogleAuthResponse> {
    return new Promise((resolve, reject) => {
      if (!this.clientId) {
        reject(new Error('Google Client ID not configured'));
        return;
      }

      // Create OAuth URL with callback
      const authUrl = this.buildAuthUrl();
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    });
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(): Promise<GoogleAuthResponse> {
    console.log('[GoogleAuthService] Handling OAuth callback...');
    console.log('[GoogleAuthService] Current URL:', window.location.href);
    
    // Prevent multiple simultaneous calls
    if (this.isProcessing) {
      console.log('[GoogleAuthService] Already processing, skipping...');
      throw new Error('OAuth callback already being processed');
    }
    
    this.isProcessing = true;
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const state = urlParams.get('state');

      console.log('[GoogleAuthService] URL params:', {
        code: code ? 'present' : 'missing',
        error,
        state
      });

      if (error) {
        console.error('[GoogleAuthService] OAuth error:', error);
        throw new Error(error === 'access_denied' ? 'Truy cập bị từ chối' : 'Lỗi đăng nhập Google');
      }

      if (!code) {
        console.error('[GoogleAuthService] No authorization code received');
        throw new Error('Không nhận được mã xác thực từ Google');
      }

      console.log('[GoogleAuthService] Exchanging code for tokens...');
      // Exchange code for tokens
      const authResponse = await this.exchangeCodeForTokens(code);
      console.log('[GoogleAuthService] Token exchange successful');
      
      console.log('[GoogleAuthService] Getting user info...');
      // Get user info
      const userInfo = await this.getUserInfo(authResponse.access_token);
      console.log('[GoogleAuthService] User info retrieved:', userInfo);

      return {
        ...authResponse,
        userInfo
      };
    } catch (error: unknown) {
      console.error('[GoogleAuthService] Callback error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Lỗi xử lý đăng nhập Google: ${errorMessage}`);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Build Google OAuth URL
   */
  private buildAuthUrl(): string {
    // Use current origin to handle dynamic ports
    const currentOrigin = window.location.origin;
    const redirectUri = `${currentOrigin}/google-auth-callback`;
    
    console.log('[GoogleAuthService] Building OAuth URL with redirect_uri:', redirectUri);
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: googleAuthConfig.scope,
      access_type: googleAuthConfig.accessType,
      prompt: googleAuthConfig.prompt,
      state: this.generateState()
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Generate random state parameter for security
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleAuthResponse> {
    console.log('[GoogleAuthService] Exchanging code for tokens...');
    console.log('[GoogleAuthService] Client ID:', this.clientId);
    
    // Use current origin for redirect URI
    const currentOrigin = window.location.origin;
    const redirectUri = `${currentOrigin}/google-auth-callback`;
    console.log('[GoogleAuthService] Redirect URI:', redirectUri);
    
    const requestBody = new URLSearchParams({
      client_id: this.clientId,
      client_secret: GOOGLE_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    console.log('[GoogleAuthService] Request body:', {
      client_id: this.clientId,
      client_secret: '***',
      code: code.substring(0, 10) + '...',
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });
    
    console.log('[GoogleAuthService] Code details:', {
      length: code.length,
      preview: code.substring(0, 20) + '...',
      fullCode: code
    });

    console.log('[GoogleAuthService] Making token exchange request...');
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody.toString(),
    });

    console.log('[GoogleAuthService] Token exchange response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GoogleAuthService] Token exchange error:', errorText);
      console.error('[GoogleAuthService] Response status:', response.status);
      console.error('[GoogleAuthService] Response headers:', Object.fromEntries(response.headers.entries()));
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error('[GoogleAuthService] Parsed error:', errorJson);
      } catch {
        console.error('[GoogleAuthService] Could not parse error as JSON');
      }
      
      throw new Error(`Failed to exchange code for tokens: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('[GoogleAuthService] Token exchange successful');
    return result;
  }

  /**
   * Get user info from Google
   */
  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  /**
   * Verify ID token with Google
   */
  async verifyIdToken(idToken: string): Promise<unknown> {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    
    if (!response.ok) {
      throw new Error('Failed to verify ID token');
    }

    return response.json();
  }
}

export const googleAuthService = new GoogleAuthService();
export default googleAuthService;
