import React, { useState, useEffect } from 'react';
import {
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ClockIcon,
  TicketIcon,
  UserIcon,
  FilmIcon,
  BuildingOfficeIcon,
  QrCodeIcon,
  XMarkIcon as CloseIcon
} from '@heroicons/react/24/outline';
import { bookingAPI, type ApiBooking } from '../../services/api';

type BookingWithExtras = ApiBooking & {
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  totalPrice?: number;
  seat?: {
    seatNumber: string;
    seatType: string;
    rowNumber: string;
    columnNumber: number;
  };
  ticket?: {
    id: number;
    token: string;
    price: number;
    status: string;
    qrCodeUrl: string;
  };
};

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<BookingWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('🎯 [Admin] Fetching all bookings...');
      
      // Sử dụng test API làm primary source (vì database chưa có dữ liệu)
      try {
        console.log('🎯 [Admin] Trying test bookings API...');
        const testResponse = await bookingAPI.testAdminBookings();
        console.log('🎯 [Admin] Test bookings response:', testResponse);
        
        if (testResponse && Array.isArray(testResponse) && testResponse.length > 0) {
          console.log('🎯 [Admin] Test bookings count:', testResponse.length);
          setBookings(testResponse as BookingWithExtras[]);
          return;
        }
      } catch (testError: any) {
        console.log('🎯 [Admin] Test API failed:', testError);
      }
      
      // Fallback to admin API (cần authentication)
      try {
        console.log('🎯 [Admin] Trying admin bookings API...');
        const response = await bookingAPI.getAllWithDetails();
        console.log('🎯 [Admin] Admin bookings response:', response);
        
        if (response && Array.isArray(response) && response.length > 0) {
          console.log('🎯 [Admin] Admin bookings count:', response.length);
          setBookings(response as BookingWithExtras[]);
          return;
        }
      } catch (adminError: any) {
        console.log('🎯 [Admin] Admin API failed:', adminError);
      }
      
      // Fallback to main booking API (cần authentication)
      try {
        console.log('🎯 [Admin] Trying main booking API...');
        const mainResponse = await bookingAPI.getAll();
        console.log('🎯 [Admin] Main API response:', mainResponse);
        
        if (mainResponse && Array.isArray(mainResponse) && mainResponse.length > 0) {
          console.log('🎯 [Admin] Main API count:', mainResponse.length);
          setBookings((mainResponse || []) as BookingWithExtras[]);
          return;
        }
      } catch (mainError: any) {
        console.log('🎯 [Admin] Main API failed:', mainError);
      }
      
      // No data found from any source
      console.log('🎯 [Admin] No data found from any API');
      setBookings([]);
      
    } catch (error) {
      console.error('🎯 [Admin] Error fetching data:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (booking: any) => {
    try {
      console.log('🎯 [Admin] Fetching booking detail for ID:', booking.id);
      
      // Fetch detailed booking information using the same API as Profile
      const response = await bookingAPI.getDetailsById(booking.id);
      console.log('🎯 [Admin] Booking detail response:', response);
      
      if (response.state === 'SUCCESS' && response.object) {
        console.log('✅ [Admin] Using detailed booking data');
        setSelectedBooking(response.object as BookingWithExtras);
        setShowModal(true);
      } else {
        // Fallback to basic booking info if detailed API fails
        console.log('⚠️ [Admin] Detailed API failed, using basic booking info');
        setSelectedBooking(booking);
        setShowModal(true);
      }
    } catch (error) {
      console.error('❌ [Admin] Error fetching booking detail:', error);
      // Fallback to basic booking info
      console.log('⚠️ [Admin] API error, using basic booking info');
      setSelectedBooking(booking);
      setShowModal(true);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      // Update booking status
      await bookingAPI.update(id, { paymentStatus: newStatus });
      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, status: newStatus } : booking
      ));
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const filteredBookings = bookings
    .filter(booking => {
      const matchesSearch = 
        (booking.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.customerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.movie?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || (booking.paymentStatus || booking.status) === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by createdAt descending (newest first)
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'paid':
      case 'success':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ xử lý';
      case 'cancelled':
      case 'failed':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      case 'expired':
        return 'Hết hạn';
      default:
        return status || 'Không xác định';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý đặt vé</h1>
            <p className="mt-1 text-sm text-gray-500">
              Quản lý và theo dõi các đơn đặt vé
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Tổng số: <span className="font-medium text-gray-900">{filteredBookings.length}</span> đặt vé
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-blue-500">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng đặt vé
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {bookings.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-green-500">
                  <CheckIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Đã xác nhận
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {bookings.filter(b => {
                      const status = b.paymentStatus || b.status;
                      return status === 'CONFIRMED' || status === 'PAID' || status === 'SUCCESS';
                    }).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-yellow-500">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Chờ xác nhận
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {bookings.filter(b => {
                      const status = b.paymentStatus || b.status;
                      return status === 'PENDING' || status === 'PROCESSING';
                    }).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-purple-500">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Doanh thu
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {(() => {
                      const totalRevenue = bookings
                        .filter(b => {
                          const status = b.paymentStatus || b.status;
                          return status === 'CONFIRMED' || status === 'PAID' || status === 'SUCCESS';
                        })
                        .reduce((sum, b) => {
                          const price = b.totalPrice || b.order?.totalPrice || 0;
                          console.log('🎯 [Admin] Revenue - Booking:', b.id, 'Price:', price, 'Status:', b.paymentStatus || b.status);
                          return sum + price;
                        }, 0);
                      console.log('🎯 [Admin] Total revenue:', totalRevenue);
                      return totalRevenue.toLocaleString();
                    })()} VNĐ
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Tìm kiếm
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Tìm theo tên, email, phim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Trạng thái
            </label>
            <select
              id="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tất cả</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('ALL');
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rạp & Phòng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ghế
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.movie?.title || 'Chưa cập nhật'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.showtime?.startTime ? new Date(booking.showtime.startTime).toLocaleString('vi-VN') : 'Chưa cập nhật'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.showtime?.room?.cinema?.name || 'Chưa cập nhật'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Phòng {booking.showtime?.room?.name || 'Chưa cập nhật'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.seat?.seatNumber || booking.order?.tickets?.map((t: any) => t.seat?.seatNumber).join(', ') || 'Chưa cập nhật'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(booking.totalPrice || booking.order?.totalPrice || 0).toLocaleString()} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.paymentStatus || booking.status || 'UNKNOWN')}`}>
                        {getStatusText(booking.paymentStatus || booking.status || 'UNKNOWN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {booking.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                              className="text-green-600 hover:text-green-900"
                              title="Xác nhận"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                              className="text-red-600 hover:text-red-900"
                              title="Hủy"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy đặt vé nào</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị{' '}
                    <span className="font-medium">{startIndex + 1}</span>
                    {' '}đến{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredBookings.length)}</span>
                    {' '}trong tổng số{' '}
                    <span className="font-medium">{filteredBookings.length}</span>
                    {' '}kết quả
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Trước</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Sau</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => {
            setShowModal(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};

// Booking Details Modal Component
interface BookingDetailsModalProps {
  booking: any;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'paid':
      case 'success':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ xử lý';
      case 'cancelled':
      case 'failed':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      case 'expired':
        return 'Hết hạn';
      default:
        return status || 'Không xác định';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <TicketIcon className="h-6 w-6 mr-2" />
              Chi tiết vé đặt
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Booking Info - Layout giống Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Movie & Showtime Info */}
            <div className="space-y-6">
              {/* Movie Information */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <FilmIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Thông tin phim
                </h3>
                <div className="flex items-center space-x-4">
                  {booking?.movie?.posterUrl && (
                    <img
                      src={booking.movie.posterUrl}
                      alt="Movie Poster"
                      className="w-16 h-20 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {booking?.movie?.title || 'Phim đã đặt'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Mã vé: #{booking.id}
                    </div>
                    {booking?.movie?.genre && (
                      <div className="text-xs text-gray-400">
                        {booking.movie.genre}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Showtime Information */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Suất chiếu
                </h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    {booking?.showtime?.startTime ? 
                      new Date(booking.showtime.startTime).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Ngày chiếu'
                    }
                  </div>
                  <div className="font-medium text-gray-900">
                    {booking?.showtime?.startTime ? 
                      new Date(booking.showtime.startTime).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '--:--'
                    } - {booking?.showtime?.endTime ? 
                      new Date(booking.showtime.endTime).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '--:--'
                    }
                  </div>
                  {booking?.movie?.duration && (
                    <div className="text-xs text-gray-500">
                      Thời lượng: {booking.movie.duration} phút
                    </div>
                  )}
                </div>
              </div>

              {/* Cinema Information */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Rạp chiếu
                </h3>
                <div className="space-y-2">
                  <div className="font-medium text-gray-900">
                    {booking?.showtime?.room?.cinema?.name || 'Rạp chiếu phim'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {booking?.showtime?.room?.cinema?.address || 'Địa chỉ rạp chiếu'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Phòng: {booking?.showtime?.room?.name || 'Phòng chiếu'}
                  </div>
                  {booking?.showtime?.room?.cinema?.phone && (
                    <div className="text-xs text-gray-500">
                      Hotline: {booking.showtime.room.cinema.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Seats Information */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <TicketIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Ghế đã đặt ({(booking?.order?.tickets?.length || 0)})
                </h3>
                {booking?.order?.tickets && booking.order.tickets.length > 0 ? (
                  <div className="space-y-2">
                    {booking.order.tickets.map((ticket: any) => {
                      return (
                        <div 
                          key={ticket.id} 
                          className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 bg-blue-50 px-2 py-1 rounded">
                              {ticket.seat.seatNumber}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({ticket.seat.seatType === 'VIP' ? 'VIP' : 
                                ticket.seat.seatType === 'COUPLE' ? 'Ghế đôi' : 'Ghế thường'})
                            </span>
                            {ticket.status === 'PAID' && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Đã thanh toán
                              </span>
                            )}
                          </div>
                          <div className="font-medium text-gray-900">
                            {ticket.price.toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="pt-2 mt-2 border-t">
                      <div className="flex justify-between items-center font-medium">
                        <span>Tổng cộng:</span>
                        <span className="text-lg text-blue-600">
                          {booking.order.tickets.reduce((sum: number, ticket: any) => {
                            return sum + ticket.price;
                          }, 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <TicketIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-medium">Không tìm thấy thông tin ghế chi tiết</p>
                    <p className="text-sm mt-1">
                      Booking #{booking.id} - Tổng: {booking.totalPrice?.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - QR Code & Customer Info */}
            <div className="space-y-6">
              {/* QR Code */}
              {booking?.order?.tickets?.[0]?.qrCodeUrl && (
                <div className="border rounded-lg p-4 text-center">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center justify-center">
                    <QrCodeIcon className="h-5 w-5 mr-2 text-gray-600" />
                    Mã QR vé
                  </h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <img
                      src={booking.order.tickets[0].qrCodeUrl}
                      alt="QR Code"
                      className="mx-auto mb-2"
                      style={{ width: '150px', height: '150px' }}
                    />
                    <p className="text-xs text-gray-600">
                      Xuất trình mã QR này tại rạp
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Mã vé: {booking.order.tickets[0].token}
                    </p>
                  </div>
                </div>
              )}

              {/* Customer Information */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Thông tin khách hàng
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Họ tên</div>
                    <div className="font-medium text-gray-900">
                      {booking.customerName}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium text-gray-900 break-words">
                      {booking.customerEmail}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Số điện thoại</div>
                    <div className="font-medium text-gray-900">
                      {(booking as any).customerPhone || booking.order?.customerPhone || 'Chưa cập nhật'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Địa chỉ</div>
                    <div className="font-medium text-gray-900">
                      {(booking as any).customerAddress || booking.order?.customerAddress || 'Chưa cập nhật'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Trạng thái</div>
                    <div className="font-medium">
                      <span className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(booking.status || booking.order?.status || (booking as any).paymentStatus)}`}>
                        {getStatusText(booking.status || booking.order?.status || (booking as any).paymentStatus)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Lưu ý quan trọng</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Có mặt trước giờ chiếu 15 phút</li>
                  <li>• Mang theo mã QR và giấy tờ tùy thân</li>
                  <li>• Không được đổi/trả vé sau thanh toán</li>
                  <li>• Kiểm tra kỹ thông tin trước khi vào rạp</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;
