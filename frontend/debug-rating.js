// Debug script to check user authentication
console.log('=== DEBUG RATING AUTHENTICATION ===');

// Check localStorage
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));

// Parse user
try {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    console.log('Parsed User:', user);
    console.log('User ID:', user.id);
    console.log('User ID Type:', typeof user.id);
  } else {
    console.log('No user found in localStorage');
  }
} catch (error) {
  console.error('Error parsing user:', error);
}

// Check if user is authenticated
const isAuth = !!(localStorage.getItem('token') && localStorage.getItem('user'));
console.log('Is Authenticated:', isAuth);
