import React from 'react';
import type { Event } from '../types/event';
import { 
  CalendarIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface EventCardProps {
  event: Event;
  onSelect?: (event: Event) => void;
  selected?: boolean;
  showSelectButton?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
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
      case 'CANCELLED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'HOLIDAY': 'Lễ hội',
      'SEASONAL': 'Theo mùa',
      'SPECIAL': 'Đặc biệt',
      'PROMOTION': 'Khuyến mãi',
      'NEW_YEAR': 'Tết',
      'VALENTINE': 'Valentine',
      'WOMEN_DAY': 'Ngày Quốc tế Phụ nữ',
      'CHILDREN_DAY': 'Ngày Quốc tế Thiếu nhi',
      'INDEPENDENCE_DAY': 'Ngày Quốc khánh',
      'CHRISTMAS': 'Giáng sinh'
    };
    return typeMap[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'NEW_YEAR': 'bg-red-100 text-red-800',
      'VALENTINE': 'bg-pink-100 text-pink-800',
      'WOMEN_DAY': 'bg-purple-100 text-purple-800',
      'CHILDREN_DAY': 'bg-yellow-100 text-yellow-800',
      'CHRISTMAS': 'bg-green-100 text-green-800',
      'HOLIDAY': 'bg-blue-100 text-blue-800',
      'SEASONAL': 'bg-orange-100 text-orange-800',
      'SPECIAL': 'bg-indigo-100 text-indigo-800',
      'PROMOTION': 'bg-cyan-100 text-cyan-800',
      'INDEPENDENCE_DAY': 'bg-red-100 text-red-800'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  const isActive = event.status === 'ACTIVE';

  return (
    <div className={`bg-white rounded-lg shadow-md border-2 transition-all duration-200 ${
      selected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
    } ${!isActive ? 'opacity-60' : ''}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {event.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {event.description}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
              {event.status === 'ACTIVE' ? 'Hoạt động' : 
               event.status === 'INACTIVE' ? 'Không hoạt động' :
               event.status === 'EXPIRED' ? 'Hết hạn' : 'Đã hủy'}
            </span>
            {!isActive && (
              <span className="text-xs text-red-500 mt-1">
                {event.status === 'EXPIRED' ? 'Đã hết hạn' : 'Đã hủy'}
              </span>
            )}
          </div>
        </div>

        {/* Event Type */}
        <div className="mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
            {getTypeDisplay(event.type)}
          </span>
        </div>

        {/* Discount Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-sm text-gray-600">Giảm giá:</span>
            </div>
            <span className="text-xl font-bold text-purple-600">
              {event.discountPercentage}%
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Tối đa {formatPrice(event.maximumDiscountAmount)}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
            <span>Đơn tối thiểu: {formatPrice(event.minimumOrderAmount)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>Từ: {formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 mr-2" />
            <span>Đến: {formatDate(event.endDate)}</span>
          </div>
        </div>

        {/* Banner Image */}
        {event.bannerUrl && (
          <div className="mb-3">
            <img 
              src={event.bannerUrl} 
              alt={event.name}
              className="w-full h-24 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Action Button */}
        {showSelectButton && (
          <button
            onClick={() => onSelect?.(event)}
            disabled={!isActive}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isActive
                ? selected
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selected ? (
              <div className="flex items-center justify-center">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Đã chọn
              </div>
            ) : isActive ? (
              'Tham gia sự kiện'
            ) : (
              <div className="flex items-center justify-center">
                <XCircleIcon className="h-4 w-4 mr-2" />
                Không thể tham gia
              </div>
            )}
          </button>
        )}

        {/* Time Status */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-center">
            <span className="text-xs text-gray-500">
              {new Date() > new Date(event.endDate) ? 'Đã kết thúc' :
               new Date() < new Date(event.startDate) ? 'Sắp diễn ra' : 'Đang diễn ra'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
