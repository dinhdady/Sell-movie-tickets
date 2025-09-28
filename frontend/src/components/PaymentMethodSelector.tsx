import React, { useState, useEffect } from 'react';
import { paymentApi } from '../services/paymentApi';
import type { PaymentMethod } from '../types/payment';
import { 
  CreditCardIcon, 
  DevicePhoneMobileIcon,
  QrCodeIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface PaymentMethodSelectorProps {
  selectedMethod: string | null;
  onMethodSelect: (method: string) => void;
  amount: number;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodSelect,
  amount
}) => {
  const [methods, setMethods] = useState<Record<string, PaymentMethod>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methodsData = await paymentApi.getPaymentMethods();
      setMethods(methodsData);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (methodKey: string) => {
    switch (methodKey) {
      case 'VNPAY':
        return <QrCodeIcon className="h-6 w-6" />;
      case 'MOMO':
        return <DevicePhoneMobileIcon className="h-6 w-6" />;
      case 'ZALOPAY':
        return <DevicePhoneMobileIcon className="h-6 w-6" />;
      default:
        return <CreditCardIcon className="h-6 w-6" />;
    }
  };

  const getMethodColor = (methodKey: string) => {
    switch (methodKey) {
      case 'VNPAY':
        return 'border-blue-200 bg-blue-50 text-blue-700';
      case 'MOMO':
        return 'border-pink-200 bg-pink-50 text-pink-700';
      case 'ZALOPAY':
        return 'border-blue-200 bg-blue-50 text-blue-700';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Chọn phương thức thanh toán</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Chọn phương thức thanh toán</h3>
      <div className="space-y-3">
        {Object.entries(methods).map(([key, method]) => (
          <div
            key={key}
            onClick={() => method.enabled && onMethodSelect(key)}
            className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedMethod === key
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : method.enabled
                ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getMethodColor(key)}`}>
                  {getMethodIcon(key)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedMethod === key && (
                  <div className="flex items-center text-blue-600">
                    <CheckIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Đã chọn</span>
                  </div>
                )}
                
                {!method.enabled && (
                  <span className="text-xs text-gray-400">Tạm thời không khả dụng</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tổng thanh toán:</span>
          <span className="text-lg font-semibold text-gray-900">
            {amount.toLocaleString('vi-VN')} VNĐ
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
