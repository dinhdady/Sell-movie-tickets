import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { 
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon,
  TicketIcon
} from '@heroicons/react/24/outline';

const Cart: React.FC = () => {
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (items.length > 0) {
      // Navigate to checkout or booking form
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingCartIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Giỏ hàng trống
            </h1>
            <p className="text-gray-600 mb-8">
              Bạn chưa thêm vé phim nào vào giỏ hàng
            </p>
            <Link
              to="/movies"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <TicketIcon className="h-5 w-5 mr-2" />
              Khám phá phim
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Giỏ hàng của bạn
            </h1>
            <p className="text-gray-600">
              {totalItems} vé phim đã chọn
            </p>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Xóa tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  {/* Movie Poster */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.movie.posterUrl || '/placeholder-movie.jpg'}
                      alt={item.movie.title}
                      className="w-24 h-36 object-cover rounded-lg"
                    />
                  </div>

                  {/* Movie Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {item.movie.title}
                    </h3>
                    
                    {/* Showtime Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>{formatDate(item.showtime.startTime)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>{formatTime(item.showtime.startTime)} - {formatTime(item.showtime.endTime)}</span>
                      </div>
                      {item.showtime.room && (
                        <div className="flex items-center text-gray-600">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          <span>Phòng {item.showtime.room.name}</span>
                          {item.showtime.room.cinema && (
                            <span> - {item.showtime.room.cinema.name}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Seats */}
                    {item.seats && item.seats.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Ghế đã chọn:</p>
                        <div className="flex flex-wrap gap-2">
                          {item.seats.map((seat, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                            >
                              {seat.seatNumber || `${seat.rowNumber}${seat.columnNumber}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">Số lượng:</span>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 rounded-l-lg"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="px-3 py-1 border-x border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded-r-lg"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          {formatPrice(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa khỏi giỏ hàng"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Tóm tắt đơn hàng
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số lượng vé:</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Phí dịch vụ:</span>
                  <span>Miễn phí</span>
                </div>
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{formatPrice(totalPrice)}</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Tiến hành thanh toán
                </button>
                
                <Link
                  to="/movies"
                  className="block w-full text-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Tiếp tục mua vé
                </Link>
              </div>
              
              {/* Security Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                  🔒 Thanh toán an toàn và bảo mật
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
