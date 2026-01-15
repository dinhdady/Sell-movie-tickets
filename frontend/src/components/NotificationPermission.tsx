import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

const NotificationPermission: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        setShowBanner(true);
      }
    }
  };

  const requestPermission = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      setPermission('granted');
      setShowBanner(false);
      
      // Show welcome notification
      await notificationService.showNotification('Thông báo đã được bật!', {
        body: 'Bạn sẽ nhận được thông báo về đặt vé và phim mới',
        tag: 'permission-granted'
      });
    } else {
      setPermission('denied');
      setShowBanner(false);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
  };

  if (!showBanner || permission !== 'default') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <BellIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              Bật thông báo
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Nhận thông báo về đặt vé, thanh toán và phim mới
            </p>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={requestPermission}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Bật thông báo
              </button>
              <button
                onClick={dismissBanner}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Không, cảm ơn
              </button>
            </div>
          </div>
          <div className="flex-shrink-0 ml-2">
            <button
              onClick={dismissBanner}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermission;
