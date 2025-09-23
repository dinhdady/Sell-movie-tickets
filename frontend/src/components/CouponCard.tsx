import React from 'react';
import type { Coupon } from '../types/coupon';
import { 
  TagIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface CouponCardProps {
  coupon: Coupon;
  onSelect?: (coupon: Coupon) => void;
  selected?: boolean;
  showSelectButton?: boolean;
}

const CouponCard: React.FC<CouponCardProps> = ({ 
  coupon, 
  onSelect, 
  selected = false, 
  showSelectButton = true 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'EXHAUSTED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeDisplay = (type: string) => {
    return type === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền cố định';
  };

  const getDiscountDisplay = () => {
    if (coupon.type === 'PERCENTAGE') {
      return `${coupon.discountValue}%`;
    } else {
      return formatPrice(coupon.discountValue);
    }
  };

  const isUsable = coupon.status === 'ACTIVE' && coupon.remainingQuantity > 0;

  return (
    <div className={`bg-white rounded-lg shadow-md border-2 transition-all duration-200 ${
      selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    } ${!isUsable ? 'opacity-60' : ''}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {coupon.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {coupon.description}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(coupon.status)}`}>
              {coupon.status === 'ACTIVE' ? 'Hoạt động' : 
               coupon.status === 'INACTIVE' ? 'Không hoạt động' :
               coupon.status === 'EXPIRED' ? 'Hết hạn' : 'Hết số lượng'}
            </span>
            {!isUsable && (
              <span className="text-xs text-red-500 mt-1">
                {coupon.status === 'EXPIRED' ? 'Đã hết hạn' : 'Hết số lượng'}
              </span>
            )}
          </div>
        </div>

        {/* Discount Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TagIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm text-gray-600">Giảm giá:</span>
            </div>
            <span className="text-xl font-bold text-blue-600">
              {getDiscountDisplay()}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {coupon.type === 'PERCENTAGE' ? 'Tối đa ' + formatPrice(coupon.maximumDiscountAmount) : 'Giảm cố định'}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
            <span>Đơn tối thiểu: {formatPrice(coupon.minimumOrderAmount)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 mr-2" />
            <span>Hạn sử dụng: {formatDate(coupon.endDate)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">Loại:</span>
            <span>{getTypeDisplay(coupon.type)}</span>
          </div>
        </div>

        {/* Usage Info */}
        <div className="bg-gray-50 rounded-lg p-2 mb-3">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Đã sử dụng: {coupon.usedQuantity}/{coupon.totalQuantity}</span>
            <span>Còn lại: {coupon.remainingQuantity}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(coupon.usedQuantity / coupon.totalQuantity) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Action Button */}
        {showSelectButton && (
          <button
            onClick={() => onSelect?.(coupon)}
            disabled={!isUsable}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isUsable
                ? selected
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selected ? (
              <div className="flex items-center justify-center">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Đã chọn
              </div>
            ) : isUsable ? (
              'Chọn coupon'
            ) : (
              <div className="flex items-center justify-center">
                <XCircleIcon className="h-4 w-4 mr-2" />
                Không thể sử dụng
              </div>
            )}
          </button>
        )}

        {/* Code Display */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-center">
            <span className="text-xs text-gray-500">Mã coupon:</span>
            <div className="font-mono text-sm font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded mt-1">
              {coupon.code}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponCard;
