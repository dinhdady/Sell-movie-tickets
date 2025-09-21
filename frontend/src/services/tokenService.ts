import { authAPI } from './api';

class TokenService {
  private refreshPromise: Promise<string> | null = null;
  private isRefreshing = false;

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      console.log('🔄 [TokenService] Refreshing access token...');
      const response = await authAPI.refreshToken(refreshToken);
      
      if (response.state === 'SUCCESS' && response.object) {
        const authResponse = response.object;
        const newAccessToken = authResponse.accessToken;
        const newRefreshToken = authResponse.refreshToken;
        
        // Update tokens in localStorage
        localStorage.setItem('token', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        console.log('✅ [TokenService] Token refreshed successfully');
        return newAccessToken;
      } else {
        throw new Error(response.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('❌ [TokenService] Token refresh failed:', error);
      // Clear invalid tokens
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Check if token is expired (basic check)
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Assume expired if can't parse
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  /**
   * Check if user has valid tokens
   */
  hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    if (!accessToken || !refreshToken) {
      return false;
    }

    // If access token is not expired, we're good
    if (!this.isTokenExpired(accessToken)) {
      return true;
    }

    // If access token is expired but we have refresh token, we can try to refresh
    return !!refreshToken;
  }
}

export const tokenService = new TokenService();
export default tokenService;
