import React, { useState, useEffect } from 'react';
import { couponAPI } from '../services/couponApi';
import { eventAPI } from '../services/eventApi';
import CouponCard from './CouponCard';
import EventCard from './EventCard';
import type { Coupon } from '../types/coupon';
import type { Event } from '../types/event';
import { 
  TagIcon, 
  SparklesIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface DiscountSelectorProps {
  orderAmount: number;
  userId?: number;
  onCouponSelect?: (coupon: Coupon | null) => void;
  onEventSelect?: (event: Event | null) => void;
  selectedCoupon?: Coupon | null;
  selectedEvent?: Event | null;
  showBoth?: boolean;
}

const DiscountSelector: React.FC<DiscountSelectorProps> = ({
  orderAmount,
  userId = 1, // Default user ID for demo purposes
  onCouponSelect,
  onEventSelect,
  selectedCoupon,
  selectedEvent,
  showBoth = true
}) => {
  const [activeTab, setActiveTab] = useState<'coupon' | 'event'>('coupon');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [orderAmount]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [couponsResponse, eventsResponse] = await Promise.all([
        couponAPI.getApplicable(orderAmount),
        eventAPI.getApplicable(orderAmount)
      ]);

      if (couponsResponse.state === '200' && couponsResponse.object) {
        setCoupons(couponsResponse.object);
      }

      if (eventsResponse.state === '200' && eventsResponse.object) {
        setEvents(eventsResponse.object);
      }
    } catch (err) {
      setError('Không thể tải danh sách khuyến mãi');
      console.error('Error loading discounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCouponSelect = async (coupon: Coupon) => {
    try {
      // Validate coupon before selecting
      if (userId) {
        const validation = await couponAPI.validate(coupon.code, orderAmount, userId);
        if (validation.object?.valid) {
          onCouponSelect?.(coupon);
        } else {
          setError(validation.object?.message || 'Coupon không hợp lệ');
        }
      } else {
        onCouponSelect?.(coupon);
      }
    } catch (err) {
      setError('Không thể validate coupon');
    }
  };

  const handleEventSelect = async (event: Event) => {
    try {
      // Validate event before selecting
      if (userId) {
        const validation = await eventAPI.validate(event.id, orderAmount, userId);
        if (validation.object?.valid) {
          onEventSelect?.(event);
        } else {
          setError(validation.object?.message || 'Event không hợp lệ');
        }
      } else {
        onEventSelect?.(event);
      }
    } catch (err) {
      setError('Không thể validate event');
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Chọn khuyến mãi
        </h2>
        <p className="text-sm text-gray-600">
          Đơn hàng của bạn: <span className="font-semibold">{formatPrice(orderAmount)}</span>
        </p>
      </div>

      {/* Tabs */}
      {showBoth && (
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('coupon')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'coupon'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center">
              <TagIcon className="h-5 w-5 mr-2" />
              Coupon ({coupons.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('event')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'event'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center">
              <SparklesIcon className="h-5 w-5 mr-2" />
              Sự kiện ({events.length})
            </div>
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Coupon Tab */}
        {(!showBoth || activeTab === 'coupon') && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Coupon có thể sử dụng
              </h3>
              {selectedCoupon && (
                <button
                  onClick={() => onCouponSelect?.(null)}
                  className="flex items-center text-sm text-red-600 hover:text-red-700"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Bỏ chọn
                </button>
              )}
            </div>

            {coupons.length === 0 ? (
              <div className="text-center py-8">
                <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Không có coupon nào phù hợp</p>
                <p className="text-sm text-gray-400 mt-1">
                  Đơn hàng của bạn chưa đạt điều kiện tối thiểu
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coupons.map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    onSelect={handleCouponSelect}
                    selected={selectedCoupon?.id === coupon.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Event Tab */}
        {(!showBoth || activeTab === 'event') && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Sự kiện đang diễn ra
              </h3>
              {selectedEvent && (
                <button
                  onClick={() => onEventSelect?.(null)}
                  className="flex items-center text-sm text-red-600 hover:text-red-700"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Bỏ chọn
                </button>
              )}
            </div>

            {events.length === 0 ? (
              <div className="text-center py-8">
                <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Không có sự kiện nào phù hợp</p>
                <p className="text-sm text-gray-400 mt-1">
                  Đơn hàng của bạn chưa đạt điều kiện tối thiểu
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onSelect={handleEventSelect}
                    selected={selectedEvent?.id === event.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Summary */}
        {(selectedCoupon || selectedEvent) && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-800">Đã chọn khuyến mãi</h4>
            </div>
            <div className="space-y-2">
              {selectedCoupon && (
                <div className="text-sm text-green-700">
                  <span className="font-medium">Coupon:</span> {selectedCoupon.name} ({selectedCoupon.code})
                </div>
              )}
              {selectedEvent && (
                <div className="text-sm text-green-700">
                  <span className="font-medium">Sự kiện:</span> {selectedEvent.name}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountSelector;
