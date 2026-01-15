import React, { useEffect, useMemo, useState } from 'react';
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
  XMarkIcon as CloseIcon,
} from '@heroicons/react/24/outline';
import { bookingAPI, type ApiBooking } from '../../services/api';

type BookingWithExtras = ApiBooking & {
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  totalPrice?: number;
  paymentStatus?: string;
  createdAt?: string;

  movie?: {
    title?: string;
    posterUrl?: string;
    genre?: string;
    duration?: number;
    rating?: number;
  };

  showtime?: {
    startTime?: string;
    endTime?: string;
    room?: {
      name?: string;
      capacity?: number;
      cinema?: {
        name?: string;
        address?: string;
        phone?: string;
        email?: string;
      };
    };
  };

  order?: {
    totalPrice?: number;
    status?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    tickets?: Array<{
      id: number;
      token: string;
      price: number;
      status: string;
      qrCodeUrl?: string;
      createdAt?: string;
      isUsed?: boolean;
      seat?: {
        seatNumber?: string;
        seatType?: string;
      };
    }>;
  };

  tickets?: Array<{
    id: number;
    token?: string;
    price?: number;
    status?: string;
    qrCodeUrl?: string;
    createdAt?: string;
    isUsed?: boolean;
    seat?: {
      seatNumber?: string;
      seatType?: string;
      row?: string;
      number?: number;
      type?: string;
    };
  }>;

  seat?: {
    seatNumber: string;
    seatType: string;
    rowNumber: string;
    columnNumber: number;
  };
};

const normalizeStatus = (s?: string) => (s || '').trim().toLowerCase();

const getBadgeColor = (statusRaw?: string) => {
  const status = normalizeStatus(statusRaw);
  switch (status) {
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'paid':
    case 'success':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'expired':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getBadgeText = (statusRaw?: string) => {
  const status = normalizeStatus(statusRaw);
  switch (status) {
    case 'confirmed':
      return 'Đã xác nhận';
    case 'paid':
    case 'success':
      return 'Đã thanh toán';
    case 'pending':
      return 'Chờ xử lý';
    case 'processing':
      return 'Đang xử lý';
    case 'cancelled':
    case 'failed':
      return 'Đã hủy';
    case 'completed':
      return 'Hoàn thành';
    case 'expired':
      return 'Hết hạn';
    default:
      return statusRaw || 'Không xác định';
  }
};

const formatDateTime = (iso?: string) => {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('vi-VN');
};

const formatDateOnly = (iso?: string) => {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('vi-VN');
};

const getTotalPrice = (b: BookingWithExtras) =>
  (b.totalPrice ?? b.order?.totalPrice ?? 0) || 0;

const pickStatus = (b: BookingWithExtras) => b.paymentStatus || (b as any).status || b.order?.status || 'UNKNOWN';

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<BookingWithExtras[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'>('ALL');

  const [selectedBooking, setSelectedBooking] = useState<BookingWithExtras | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Primary: TicketController getAllTickets endpoint (no-auth)
      try {
        const ticketsResponse = await bookingAPI.getAllTicketsNoAuth();
        if (ticketsResponse && Array.isArray(ticketsResponse) && ticketsResponse.length > 0) {
          setBookings(ticketsResponse as BookingWithExtras[]);
          return;
        }
      } catch {}

      // Secondary: Admin bookings (auth)
      try {
        const adminResponse = await bookingAPI.getAdminBookings();
        if (adminResponse && Array.isArray(adminResponse) && adminResponse.length > 0) {
          setBookings(adminResponse as BookingWithExtras[]);
          return;
        }
      } catch {}

      // Tertiary: BookingController
      try {
        const mainResponse = await bookingAPI.getAll();
        if (mainResponse && Array.isArray(mainResponse) && mainResponse.length > 0) {
          setBookings(mainResponse as BookingWithExtras[]);
          return;
        }
      } catch {}

      // Fallback: Test tickets
      try {
        const testTicketsResponse = await bookingAPI.testTickets();
        if (testTicketsResponse && Array.isArray(testTicketsResponse) && testTicketsResponse.length > 0) {
          setBookings(testTicketsResponse as BookingWithExtras[]);
          return;
        }
      } catch {}

      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (booking: BookingWithExtras) => {
    try {
      const response = await bookingAPI.getTicketDetailsById(booking.id);
      if (response) {
        setSelectedBooking(response as BookingWithExtras);
      } else {
        setSelectedBooking(booking);
      }
    } catch {
      setSelectedBooking(booking);
    } finally {
      setShowModal(true);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await bookingAPI.update(id, { paymentStatus: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, paymentStatus: newStatus } : b))
      );
    } catch {
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const filteredBookings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return bookings
      .filter((b) => {
        const name = (b.customerName || '').toLowerCase();
        const email = ((b as any).customerEmail || b.order?.customerEmail || '').toLowerCase();
        const movieTitle = (b.movie?.title || '').toLowerCase();

        const matchesSearch = !term || name.includes(term) || email.includes(term) || movieTitle.includes(term);

        const raw = pickStatus(b);
        const normalized = (raw || '').toString().toUpperCase();
        const matchesStatus =
          filterStatus === 'ALL' ||
          (filterStatus === 'PENDING' && (normalized === 'PENDING' || normalized === 'PROCESSING')) ||
          (filterStatus === 'CONFIRMED' && (normalized === 'CONFIRMED' || normalized === 'PAID' || normalized === 'SUCCESS')) ||
          (filterStatus === 'CANCELLED' && (normalized === 'CANCELLED' || normalized === 'FAILED'));

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [bookings, searchTerm, filterStatus]);

  useEffect(() => setCurrentPage(1), [searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  // Stats
  const totalBookings = bookings.length;
  const confirmedCount = bookings.filter((b) => {
    const s = (pickStatus(b) || '').toString().toUpperCase();
    return s === 'CONFIRMED' || s === 'PAID' || s === 'SUCCESS';
  }).length;

  const pendingCount = bookings.filter((b) => {
    const s = (pickStatus(b) || '').toString().toUpperCase();
    return s === 'PENDING' || s === 'PROCESSING';
  }).length;

  const totalRevenue = bookings
    .filter((b) => {
      const s = (pickStatus(b) || '').toString().toUpperCase();
      return s === 'CONFIRMED' || s === 'PAID' || s === 'SUCCESS';
    })
    .reduce((sum, b) => sum + getTotalPrice(b), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý đặt vé</h1>
              <p className="mt-1 text-sm text-gray-500">
                Quản lý và theo dõi các đơn đặt vé
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchBookings}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Làm mới
              </button>
              <div className="text-sm text-gray-500">
                Tổng: <span className="font-semibold text-gray-900">{filteredBookings.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <StatCard title="Tổng đặt vé" value={totalBookings.toLocaleString()} icon={<ClockIcon className="h-6 w-6 text-white" />} color="bg-blue-500" />
          <StatCard title="Đã xác nhận" value={confirmedCount.toLocaleString()} icon={<CheckIcon className="h-6 w-6 text-white" />} color="bg-green-500" />
          <StatCard title="Chờ xác nhận" value={pendingCount.toLocaleString()} icon={<ClockIcon className="h-6 w-6 text-white" />} color="bg-yellow-500" />
          <StatCard title="Doanh thu" value={`${totalRevenue.toLocaleString()} VNĐ`} icon={<CalendarIcon className="h-6 w-6 text-white" />} color="bg-purple-500" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
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
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
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
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-4 sm:px-6 border-b border-gray-100 flex items-center justify-between">
            <div className="font-semibold text-gray-900">Danh sách đặt vé</div>
            <div className="text-sm text-gray-500">
              Hiển thị <span className="font-medium text-gray-900">{Math.min(endIndex, filteredBookings.length)}</span> /{' '}
              <span className="font-medium text-gray-900">{filteredBookings.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {/* table-fixed + width column => email không kéo giãn */}
            <table className="min-w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[280px]">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[260px]">
                    Phim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[260px]">
                    Rạp & Phòng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[240px]">
                    Ghế & Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]">
                    Ngày đặt
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[110px]">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedBookings.map((b) => {
                  const customerEmail = (b as any).customerEmail || b.order?.customerEmail || 'N/A';
                  const statusRaw = pickStatus(b);

                  const seatText =
                    b.seat?.seatNumber ||
                    b.order?.tickets?.map((t) => t.seat?.seatNumber).filter(Boolean).join(', ') ||
                    'N/A';

                  const seatType =
                    b.seat?.seatType ||
                    b.order?.tickets?.[0]?.seat?.seatType ||
                    'N/A';

                  const token = b.order?.tickets?.[0]?.token;

                  return (
                    <tr key={b.id} className="hover:bg-gray-50">
                      {/* Customer */}
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm font-semibold text-gray-900 truncate" title={b.customerName || ''}>
                          {b.customerName || 'Chưa cập nhật'}
                        </div>

                        {/* Email: ô nhỏ + ... */}
                        <div
                          className="mt-1 inline-block max-w-[220px] truncate rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
                          title={customerEmail}
                        >
                          {customerEmail}
                        </div>
                      </td>

                      {/* Movie */}
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm font-medium text-gray-900 truncate" title={b.movie?.title || ''}>
                          {b.movie?.title || 'Chưa cập nhật'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {b.showtime?.startTime ? formatDateTime(b.showtime.startTime) : 'Chưa cập nhật'}
                        </div>
                      </td>

                      {/* Cinema */}
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm font-medium text-gray-900 truncate" title={b.showtime?.room?.cinema?.name || ''}>
                          {b.showtime?.room?.cinema?.name || 'Chưa cập nhật'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Phòng {b.showtime?.room?.name || 'Chưa cập nhật'}
                        </div>
                      </td>

                      {/* Seat & Token */}
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm text-gray-900">
                          <div className="font-semibold">Ghế: {seatText}</div>
                          <div className="text-xs text-gray-500 mt-1">Loại: {seatType}</div>

                          {token && (
                            <div className="mt-1 text-xs text-blue-600 font-mono truncate" title={token}>
                              Token: {token.substring(0, 10)}...
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 align-top text-sm font-semibold text-gray-900">
                        {getTotalPrice(b).toLocaleString('vi-VN')} VNĐ
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 align-top">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getBadgeColor(statusRaw)}`}>
                          {getBadgeText(statusRaw)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 align-top text-sm text-gray-500">
                        {formatDateOnly(b.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 align-top text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(b)}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 hover:bg-gray-50 text-blue-600"
                            title="Xem chi tiết"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>

                          {((b as any).status || b.paymentStatus) === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(b.id, 'CONFIRMED')}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 hover:bg-green-50 text-green-600"
                                title="Xác nhận"
                              >
                                <CheckIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 hover:bg-red-50 text-red-600"
                                title="Hủy"
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 bg-white">
              <div className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
                <span className="font-medium">{Math.min(endIndex, filteredBookings.length)}</span> trong tổng{' '}
                <span className="font-medium">{filteredBookings.length}</span> kết quả
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>

                <div className="px-3 py-2 text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
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
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({
  title,
  value,
  icon,
  color,
}) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`p-3 rounded-md ${color}`}>{icon}</div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-semibold text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

interface BookingDetailsModalProps {
  booking: BookingWithExtras;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose }) => {
  const statusRaw = pickStatus(booking);

  // gom tickets từ nhiều cấu trúc khác nhau
  const tickets = useMemo(() => {
    if (booking.order?.tickets?.length) return booking.order.tickets;
    if (booking.tickets?.length) return booking.tickets as any;
    if (booking.seat) {
      return [
        {
          id: booking.id,
          seat: booking.seat,
          price: getTotalPrice(booking),
          status: statusRaw,
          token: (booking as any).token || 'N/A',
          createdAt: booking.createdAt,
        },
      ];
    }
    return [];
  }, [booking, statusRaw]);

  const tokenForQR =
    (tickets?.[0] as any)?.token ||
    booking.order?.tickets?.[0]?.token ||
    String(booking.id);

  const qrUrl =
    booking.order?.tickets?.[0]?.qrCodeUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`TICKET_${tokenForQR}`)}`;

  const customerEmail = (booking as any).customerEmail || booking.order?.customerEmail || 'Chưa cập nhật';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <TicketIcon className="h-6 w-6 mr-2" />
              Chi tiết vé đặt
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left */}
            <div className="space-y-6">
              {/* Movie */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <FilmIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Thông tin phim
                </h3>
                <div className="flex items-center gap-4">
                  {booking.movie?.posterUrl && (
                    <img src={booking.movie.posterUrl} alt="Movie Poster" className="w-20 h-28 object-cover rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg text-gray-900 truncate" title={booking.movie?.title || ''}>
                      {booking.movie?.title || 'Phim đã đặt'}
                    </div>
                    <div className="text-sm text-gray-500">Mã vé: #{booking.id}</div>
                    {booking.movie?.genre && <div className="text-sm text-gray-600">Thể loại: {booking.movie.genre}</div>}
                    {booking.movie?.duration && <div className="text-sm text-gray-600">Thời lượng: {booking.movie.duration} phút</div>}
                  </div>
                </div>
              </div>

              {/* Showtime */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Suất chiếu
                </h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    {booking.showtime?.startTime ? new Date(booking.showtime.startTime).toLocaleDateString('vi-VN', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    }) : 'Ngày chiếu'}
                  </div>
                  <div className="font-medium text-gray-900">
                    {booking.showtime?.startTime ? new Date(booking.showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    {' - '}
                    {booking.showtime?.endTime ? new Date(booking.showtime.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </div>
                </div>
              </div>

              {/* Cinema */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Rạp chiếu
                </h3>
                <div className="space-y-2">
                  <div className="font-bold text-lg text-gray-900">
                    {booking.showtime?.room?.cinema?.name || 'Rạp chiếu phim'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {booking.showtime?.room?.cinema?.address || 'Địa chỉ rạp chiếu'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Phòng: {booking.showtime?.room?.name || 'Phòng chiếu'}
                  </div>
                </div>
              </div>

              {/* Tickets */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <TicketIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Thông tin vé đã đặt ({tickets.length})
                </h3>

                {tickets.length > 0 ? (
                  <div className="space-y-2">
                    {tickets.map((t: any) => (
                      <div key={t.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-gray-900 bg-blue-100 px-3 py-1 rounded-lg text-lg">
                            {t.seat?.seatNumber || 'N/A'}
                          </span>
                          <span className="text-sm text-gray-600 font-medium">
                            {t.seat?.seatType === 'VIP' ? 'VIP' : t.seat?.seatType === 'COUPLE' ? 'Ghế đôi' : 'Ghế thường'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getBadgeColor(t.status)}`}>
                            {getBadgeText(t.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Token:</span>
                            <div className="font-mono text-xs bg-white p-2 rounded border mt-1 break-all">
                              {t.token || 'N/A'}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Giá vé:</span>
                            <span className="font-bold text-green-600">
                              {(t.price || 0).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Ngày tạo:</span>
                            <span>{t.createdAt ? formatDateOnly(t.createdAt) : formatDateOnly(booking.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 mt-2 border-t">
                      <div className="flex justify-between items-center font-medium">
                        <span>Tổng cộng:</span>
                        <span className="text-lg text-blue-600">
                          {tickets.reduce((sum: number, t: any) => sum + (t.price || 0), 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <TicketIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-medium">Không tìm thấy thông tin vé chi tiết</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right */}
            <div className="space-y-6">
              {/* QR */}
              <div className="border rounded-lg p-6 text-center">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center justify-center">
                  <QrCodeIcon className="h-6 w-6 mr-2 text-gray-600" />
                  Mã QR vé
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <img
                    src={qrUrl}
                    alt="QR Code"
                    className="mx-auto mb-4"
                    style={{ width: '200px', height: '200px' }}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Xuất trình mã QR này tại rạp để vào xem phim
                  </p>
                </div>
              </div>

              {/* Customer */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Thông tin khách hàng
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Họ tên</div>
                    <div className="font-bold text-lg text-gray-900 truncate" title={booking.customerName || ''}>
                      {booking.customerName || booking.order?.customerName || 'Chưa cập nhật'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">Email</div>

                    {/* Email: 1 dòng + ... */}
                    <div
                      className="font-medium text-gray-900 max-w-full truncate"
                      title={customerEmail}
                    >
                      {customerEmail}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">Số điện thoại</div>
                    <div className="font-medium text-gray-900">
                      {booking.customerPhone || booking.order?.customerPhone || 'Chưa cập nhật'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">Địa chỉ</div>
                    <div className="font-medium text-gray-900">
                      {booking.customerAddress || booking.order?.customerAddress || 'Chưa cập nhật'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">Mã vé</div>
                    <div className="font-bold text-lg text-blue-600">#{booking.id}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">Trạng thái</div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(statusRaw)}`}>
                      {getBadgeText(statusRaw)}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">Tổng thanh toán</div>
                    <div className="font-bold text-lg text-green-600">
                      {getTotalPrice(booking).toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice */}
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
          <div className="mt-6 flex justify-end">
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
