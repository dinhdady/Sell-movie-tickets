import React, { useEffect } from 'react';

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  autoHide?: boolean;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  onClose,
  autoHide = true,
  duration = 3000
}) => {
  useEffect(() => {
    if (autoHide && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, onClose, duration]);

  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-100 border-l-4 border-green-500 text-green-700',
          icon: 'text-green-400',
          iconPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
        };
      case 'error':
        return {
          container: 'bg-red-100 border-l-4 border-red-500 text-red-700',
          icon: 'text-red-400',
          iconPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
        };
      case 'warning':
        return {
          container: 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700',
          icon: 'text-yellow-400',
          iconPath: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
        };
      case 'info':
        return {
          container: 'bg-blue-100 border-l-4 border-blue-500 text-blue-700',
          icon: 'text-blue-400',
          iconPath: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
        };
      default:
        return {
          container: 'bg-gray-100 border-l-4 border-gray-500 text-gray-700',
          icon: 'text-gray-400',
          iconPath: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
        };
    }
  };

  const styles = getNotificationStyles();

  return (
    <div className={`${styles.container} px-4 py-3 rounded-lg text-sm font-medium animate-pulse`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className={`h-5 w-5 ${styles.icon}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d={styles.iconPath} clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          {message}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex ${styles.icon} hover:opacity-75 focus:outline-none`}
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
