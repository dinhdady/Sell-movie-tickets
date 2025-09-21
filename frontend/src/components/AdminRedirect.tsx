import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('🔄 [ADMIN_REDIRECT] Checking redirect...');
    console.log('🔄 [ADMIN_REDIRECT] Loading:', loading);
    console.log('🔄 [ADMIN_REDIRECT] User:', user);
    console.log('🔄 [ADMIN_REDIRECT] User role:', user?.role);

    if (!loading) {
      if (!user) {
        console.log('🔄 [ADMIN_REDIRECT] No user, redirecting to login');
        navigate('/login');
      } else if (user.role === 'ADMIN' || user.role === 'admin' || user.role?.toString().toUpperCase() === 'ADMIN') {
        console.log('🔄 [ADMIN_REDIRECT] Admin user, redirecting to dashboard');
        navigate('/admin');
      } else {
        console.log('🔄 [ADMIN_REDIRECT] Not admin, redirecting to home');
        navigate('/');
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang điều hướng...</p>
      </div>
    </div>
  );
};

export default AdminRedirect;
