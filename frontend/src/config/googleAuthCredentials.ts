// Google OAuth Credentials
// This file contains the actual Google OAuth credentials
// In production, these should be moved to environment variables

export const GOOGLE_OAUTH_CREDENTIALS = {
  CLIENT_ID: '***REMOVED***',
  CLIENT_SECRET: '***REMOVED***'
};

// Export for use in other files
export const GOOGLE_CLIENT_ID = GOOGLE_OAUTH_CREDENTIALS.CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = GOOGLE_OAUTH_CREDENTIALS.CLIENT_SECRET;
