/**
 * Cookie Service for secure token storage
 * Provides methods to set, get, and remove cookies with security options
 */

interface CookieOptions {
  expires?: Date;
  maxAge?: number; // in seconds
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

class CookieService {
  /**
   * Set a cookie with given name, value and options
   */
  setCookie(name: string, value: string, options: CookieOptions = {}): void {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }

    if (options.maxAge) {
      cookieString += `; max-age=${options.maxAge}`;
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += `; secure`;
    }

    if (options.httpOnly) {
      cookieString += `; httpOnly`;
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  }

  /**
   * Get a cookie value by name
   */
  getCookie(name: string): string | null {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      let c = cookie.trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  }

  /**
   * Remove a cookie by name
   */
  removeCookie(name: string, path: string = '/'): void {
    this.setCookie(name, '', {
      expires: new Date(0),
      path: path
    });
  }

  /**
   * Check if a cookie exists
   */
  hasCookie(name: string): boolean {
    return this.getCookie(name) !== null;
  }

  /**
   * Set JWT token with secure options
   */
  setToken(token: string, expiresInHours: number = 24): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (expiresInHours * 60 * 60 * 1000));
    
    this.setCookie('auth_token', token, {
      expires: expires,
      path: '/',
      secure: window.location.protocol === 'https:', // Only secure in HTTPS
      sameSite: 'lax', // CSRF protection
      httpOnly: false // Allow JavaScript access for API calls
    });
  }

  /**
   * Get JWT token
   */
  getToken(): string | null {
    return this.getCookie('auth_token');
  }

  /**
   * Set refresh token with secure options
   */
  setRefreshToken(token: string, expiresInDays: number = 7): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (expiresInDays * 24 * 60 * 60 * 1000));
    
    this.setCookie('refresh_token', token, {
      expires: expires,
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'lax',
      httpOnly: false
    });
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.getCookie('refresh_token');
  }

  /**
   * Set user data
   */
  setUser(user: any): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000)); // 24 hours
    
    this.setCookie('user_data', JSON.stringify(user), {
      expires: expires,
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'lax',
      httpOnly: false
    });
  }

  /**
   * Get user data
   */
  getUser(): any | null {
    const userData = this.getCookie('user_data');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data from cookie:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Clear all authentication cookies
   */
  clearAuth(): void {
    this.removeCookie('auth_token');
    this.removeCookie('refresh_token');
    this.removeCookie('user_data');
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user && user.id);
  }

  /**
   * Set temporary data (like txnRef) with short expiration
   */
  setTempData(key: string, value: string, expiresInMinutes: number = 30): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (expiresInMinutes * 60 * 1000));
    
    this.setCookie(`temp_${key}`, value, {
      expires: expires,
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'lax',
      httpOnly: false
    });
  }

  /**
   * Get temporary data
   */
  getTempData(key: string): string | null {
    return this.getCookie(`temp_${key}`);
  }

  /**
   * Remove temporary data
   */
  removeTempData(key: string): void {
    this.removeCookie(`temp_${key}`);
  }
}

export const cookieService = new CookieService();
export default cookieService;
