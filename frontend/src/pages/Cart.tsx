import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { 
  ShoppingCartIcon,
  TrashIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon,
  TicketIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const Cart: React.FC = () => {
  const { items, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

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

  // Handle checkbox selection - only one item can be selected at a time
  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(selectedItemId === itemId ? null : itemId);
  };

  const handleSelectMovie = (item: any) => {
    // Chuyển đến trang booking để chọn ghế
    navigate(`/booking/${item.movie.id}?fromCart=true`);
  };

  const handleCheckout = (item: any) => {
    // Đã có ghế, chuyển đến booking form để thanh toán
    navigate('/booking-form', {
      state: {
        movie: item.movie,
        showtime: item.showtime,
        selectedSeats: item.seats,
        totalPrice: item.totalPrice
      }
    });
  };

  const handleContinueShopping = () => {
    if (selectedItemId) {
      const selectedItem = items.find(item => item.id === selectedItemId);
      if (selectedItem) {
        handleSelectMovie(selectedItem);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Giỏ hàng của bạn
            </h1>
            <p className="text-gray-600">
              {items.length} phim đã chọn
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearCart}
              className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Xóa tất cả
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 flex items-start">
                    <input
                      type="checkbox"
                      id={`item-${item.id}`}
                      checked={selectedItemId === item.id}
                      onChange={() => handleItemSelect(item.id)}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>

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

                    {/* Price and Action */}
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-blue-600">
                        {formatPrice(item.totalPrice)}
                      </div>
                      
                      {selectedItemId === item.id && (
                        <div className="flex gap-2">
                          {!item.seats || item.seats.length === 0 ? (
                            <button
                              onClick={() => handleSelectMovie(item)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                            >
                              <CheckIcon className="h-4 w-4" />
                              Chọn ghế
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCheckout(item)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              Thanh toán
                            </button>
                          )}
                        </div>
                      )}
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
                  <span className="text-gray-600">Số phim:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Lưu ý:</span>
                  <span>Thanh toán từng phim riêng biệt</span>
                </div>
                
                <hr className="border-gray-200" />
                
                <div className="text-center text-sm text-gray-600">
                  <p>Chọn 1 phim để tiếp tục mua vé</p>
                  <p className="mt-1">Click checkbox để chọn phim</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleContinueShopping}
                  disabled={!selectedItemId}
                  className={`block w-full text-center py-3 rounded-lg transition-colors font-medium ${
                    selectedItemId 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Tiếp tục mua vé
                </button>
                
                <Link
                  to="/movies"
                  className="block w-full text-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                >
                  Thêm phim khác
                </Link>
                
                <button
                  onClick={clearCart}
                  className="w-full text-center py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Xóa tất cả
                </button>
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
