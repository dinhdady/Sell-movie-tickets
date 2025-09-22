import React, { useState } from 'react';
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Cinema Booking System',
      siteDescription: 'Hệ thống đặt vé xem phim trực tuyến',
      timezone: 'Asia/Ho_Chi_Minh',
      currency: 'VND',
      language: 'vi'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      bookingConfirmations: true,
      paymentConfirmations: true,
      marketingEmails: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5
    },
    payment: {
      vnpayEnabled: true,
      vnpayMerchantId: 'MERCHANT123',
      vnpaySecretKey: 'SECRET_KEY_HERE',
      vnpayUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      vnpayReturnUrl: 'http://localhost:3000/payment/callback'
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      logLevel: 'INFO',
      backupFrequency: 'daily'
    }
  });
  const tabs = [
    { id: 'general', name: 'Cài đặt chung', icon: Cog6ToothIcon },
    { id: 'notifications', name: 'Thông báo', icon: BellIcon },
    { id: 'security', name: 'Bảo mật', icon: ShieldCheckIcon },
    { id: 'payment', name: 'Thanh toán', icon: CreditCardIcon },
    { id: 'system', name: 'Hệ thống', icon: GlobeAltIcon }
  ];
  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };
  const handleSave = () => {
    // Save settings to backend
    alert('Cài đặt đã được lưu thành công!');
  };
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Tên website</label>
        <input
          type="text"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={settings.general.siteName}
          onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Mô tả website</label>
        <textarea
          rows={3}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={settings.general.siteDescription}
          onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Múi giờ</label>
          <select
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
          >
            <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tiền tệ</label>
          <select
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={settings.general.currency}
            onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
          >
            <option value="VND">VND</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ngôn ngữ</label>
          <select
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={settings.general.language}
            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </div>
  );
  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Thông báo email</h4>
            <p className="text-sm text-gray-500">Gửi thông báo qua email</p>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.notifications.emailNotifications}
            onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Thông báo SMS</h4>
            <p className="text-sm text-gray-500">Gửi thông báo qua SMS</p>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.notifications.smsNotifications}
            onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Xác nhận đặt vé</h4>
            <p className="text-sm text-gray-500">Gửi email xác nhận khi đặt vé</p>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.notifications.bookingConfirmations}
            onChange={(e) => handleSettingChange('notifications', 'bookingConfirmations', e.target.checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Xác nhận thanh toán</h4>
            <p className="text-sm text-gray-500">Gửi email xác nhận khi thanh toán</p>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.notifications.paymentConfirmations}
            onChange={(e) => handleSettingChange('notifications', 'paymentConfirmations', e.target.checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Email marketing</h4>
            <p className="text-sm text-gray-500">Gửi email quảng cáo và khuyến mãi</p>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.notifications.marketingEmails}
            onChange={(e) => handleSettingChange('notifications', 'marketingEmails', e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Xác thực 2 yếu tố</h4>
          <p className="text-sm text-gray-500">Yêu cầu mã xác thực khi đăng nhập</p>
        </div>
        <input
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={settings.security.twoFactorAuth}
          onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Thời gian hết hạn phiên (phút)</label>
          <input
            type="number"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Thời gian hết hạn mật khẩu (ngày)</label>
          <input
            type="number"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={settings.security.passwordExpiry}
            onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Số lần đăng nhập sai tối đa</label>
          <input
            type="number"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={settings.security.loginAttempts}
            onChange={(e) => handleSettingChange('security', 'loginAttempts', parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Kích hoạt VNPay</h4>
          <p className="text-sm text-gray-500">Cho phép thanh toán qua VNPay</p>
        </div>
        <input
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={settings.payment.vnpayEnabled}
          onChange={(e) => handleSettingChange('payment', 'vnpayEnabled', e.target.checked)}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Merchant ID</label>
          <input
            type="text"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={settings.payment.vnpayMerchantId}
            onChange={(e) => handleSettingChange('payment', 'vnpayMerchantId', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Secret Key</label>
          <input
            type="password"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={settings.payment.vnpaySecretKey}
            onChange={(e) => handleSettingChange('payment', 'vnpaySecretKey', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">VNPay URL</label>
        <input
          type="url"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={settings.payment.vnpayUrl}
          onChange={(e) => handleSettingChange('payment', 'vnpayUrl', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Return URL</label>
        <input
          type="url"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={settings.payment.vnpayReturnUrl}
          onChange={(e) => handleSettingChange('payment', 'vnpayReturnUrl', e.target.value)}
        />
      </div>
    </div>
  );
  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Chế độ bảo trì</h4>
          <p className="text-sm text-gray-500">Tạm dừng hệ thống để bảo trì</p>
        </div>
        <input
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={settings.system.maintenanceMode}
          onChange={(e) => handleSettingChange('system', 'maintenanceMode', e.target.checked)}
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Chế độ debug</h4>
          <p className="text-sm text-gray-500">Hiển thị thông tin debug</p>
        </div>
        <input
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={settings.system.debugMode}
          onChange={(e) => handleSettingChange('system', 'debugMode', e.target.checked)}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Mức độ log</label>
          <select
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={settings.system.logLevel}
            onChange={(e) => handleSettingChange('system', 'logLevel', e.target.value)}
          >
            <option value="DEBUG">DEBUG</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tần suất sao lưu</label>
          <select
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={settings.system.backupFrequency}
            onChange={(e) => handleSettingChange('system', 'backupFrequency', e.target.value)}
          >
            <option value="hourly">Hàng giờ</option>
            <option value="daily">Hàng ngày</option>
            <option value="weekly">Hàng tuần</option>
            <option value="monthly">Hàng tháng</option>
          </select>
        </div>
      </div>
    </div>
  );
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'payment':
        return renderPaymentSettings();
      case 'system':
        return renderSystemSettings();
      default:
        return renderGeneralSettings();
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quản lý cấu hình và thiết lập hệ thống
        </p>
      </div>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex sm:space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group inline-flex items-center px-1 py-2 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="mr-2 h-5 w-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Lưu cài đặt
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};
export default Settings;
