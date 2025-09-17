import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  TicketIcon, 
  CalendarIcon,
  BuildingOfficeIcon,
  UserIcon,
  CreditCardIcon,
  QrCodeIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import QRCode from 'qrcode';
import LoadingSpinner from '../components/LoadingSpinner';
import { paymentAPI, bookingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface VNPayResponse {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

interface Ticket {
  id: number;
  orderId: number;
  seatId: number;
  price: number;
  token: string;
  status: string; // PAID, PENDING, etc.
  seat?: {
    seatNumber: string;
    rowNumber: string;
    columnNumber: number;
    roomId: number;
    seatType: 'REGULAR' | 'VIP' | 'COUPLE';
    price: number;
  };
  showtime?: {
    startTime: string;
    endTime: string;
    movie?: {
      title: string;
      posterUrl?: string;
    };
    room?: {
      name: string;
      cinema?: {
        name: string;
        address: string;
      };
    };
  };
}

interface BookingDetails {
  id: number;
  movie: {
    title: string;
    posterUrl?: string;
  };
  showtime: {
    startTime: string;
    endTime: string;
    room: {
      name: string;
      cinema: {
        name: string;
        address: string;
      };
    };
  };
  order: {
    tickets: Array<Ticket>;
    status: string; // PAID, PENDING, etc.
  };
  customerName: string;
  customerEmail: string;
  totalPrice: number;
}

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<VNPayResponse | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [status, setStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Kiểm tra xem có tham số URL không
        if (!searchParams || searchParams.size === 0) {
          console.log('No search parameters found in URL, checking for booking from Profile');
          
          // Kiểm tra xem có booking từ Profile không
          const selectedBooking = localStorage.getItem('selectedBooking');
          if (selectedBooking) {
            console.log('Found booking from Profile:', selectedBooking);
            try {
              const booking = JSON.parse(selectedBooking);
              
              // Kiểm tra authentication trước khi gọi API
              if (!user) {
                console.error('User not authenticated');
                setErrorMessage('Bạn cần đăng nhập để xem thông tin vé. Vui lòng đăng nhập và thử lại.');
                setStatus('failed');
                setLoading(false);
                return;
              }

              // Gọi API để lấy thông tin chi tiết booking với ghế
              try {
                const bookingDetailsResponse = await bookingAPI.getById(booking.id);
                console.log('Booking details from API:', bookingDetailsResponse);
                
                // Xử lý response 302 (redirect)
                let bookingData;
                if (bookingDetailsResponse.state === '302') {
                  console.log('Received 302 redirect, using object data:', bookingDetailsResponse.object);
                  bookingData = bookingDetailsResponse.object;
                } else {
                  bookingData = bookingDetailsResponse.object;
                }
                
                // Tạo booking details từ dữ liệu thực tế
                const realBookingDetails: BookingDetails = {
                  id: bookingData.id,
                  movie: {
                    title: (bookingData as any).showtime?.movie?.title || 'Phim đã đặt',
                    posterUrl: (bookingData as any).showtime?.movie?.posterUrl
                  },
                  showtime: {
                    startTime: (bookingData as any).showtime?.startTime || new Date().toISOString(),
                    endTime: (bookingData as any).showtime?.endTime || new Date().toISOString(),
                    room: {
                      name: (bookingData as any).showtime?.room?.name || 'Phòng chiếu',
                      cinema: {
                        name: (bookingData as any).showtime?.room?.cinema?.name || 'Rạp chiếu phim',
                        address: (bookingData as any).showtime?.room?.cinema?.address || 'Địa chỉ rạp chiếu'
                      }
                    }
                  },
                  order: {
                    tickets: (bookingData as any).tickets?.map((ticket: any, index: number) => {
                      // Tạo seatNumber từ rowNumber và columnNumber nếu không có sẵn
                      const rowNumber = ticket.seat?.rowNumber || 'A';
                      const columnNumber = ticket.seat?.columnNumber || index + 1;
                      const seatNumber = ticket.seat?.seatNumber || `${rowNumber}${columnNumber}`;
                      
                      return {
                        id: ticket.id || index + 1,
                        orderId: ticket.orderId || bookingData.id,
                        seatId: ticket.seatId || index + 1,
                        seat: ticket.seat ? {
                          seatNumber: seatNumber,
                          rowNumber: rowNumber,
                          columnNumber: columnNumber,
                          roomId: ticket.seat.roomId || 1,
                          seatType: ticket.seat.seatType || 'REGULAR',
                          price: ticket.seat.price || ticket.price || 80000
                        } : {
                          seatNumber: seatNumber,
                          rowNumber: rowNumber,
                          columnNumber: columnNumber,
                          roomId: 1,
                          seatType: 'REGULAR' as const,
                          price: ticket.price || 80000
                        },
                        price: ticket.price || 80000,
                        token: ticket.token || `token_${ticket.id || index + 1}`,
                        status: ticket.status || 'PAID'
                      };
                    }) || [],
                    status: bookingData.status || 'PAID'
                  },
                  customerName: bookingData.customerName || booking.customerName,
                  customerEmail: bookingData.customerEmail || booking.customerEmail,
                  totalPrice: bookingData.totalPrice || booking.totalPrice
                };
                
                setBookingDetails(realBookingDetails);
              } catch (apiError) {
                console.error('API call failed:', apiError);
                
                // Nếu API thất bại, hiển thị thông báo lỗi thay vì mock data
                setErrorMessage('Không thể lấy thông tin chi tiết vé từ server. Vui lòng kiểm tra kết nối mạng và thử lại.');
                setStatus('failed');
                setLoading(false);
                return;
              }
              
              setStatus('success');
              
              // Tạo QR code từ dữ liệu thực tế
              if (bookingDetails && bookingDetails.order.tickets && bookingDetails.order.tickets.length > 0) {
                const firstTicket = bookingDetails.order.tickets[0];
                const qrData = firstTicket.token ? `TICKET_${firstTicket.token}` : `BOOKING_${booking.id}`;
                const qrCodeDataUrl = await QRCode.toDataURL(qrData);
                setQrCodeUrl(qrCodeDataUrl);
              } else {
                // Fallback nếu không có ticket
                const qrData = `BOOKING_${booking.id}`;
                const qrCodeDataUrl = await QRCode.toDataURL(qrData);
                setQrCodeUrl(qrCodeDataUrl);
              }
              
              // Xóa dữ liệu từ localStorage
              localStorage.removeItem('selectedBooking');
              localStorage.removeItem('lastTxnRef');
              setLoading(false);
              return;
            } catch (error) {
              console.error('Error processing booking from Profile:', error);
              setErrorMessage('Không thể xử lý thông tin vé từ Profile');
              setStatus('failed');
              setLoading(false);
              return;
            }
          }
          
          setErrorMessage('Không tìm thấy thông tin thanh toán. Vui lòng truy cập từ trang đặt vé.');
          setStatus('failed');
          setLoading(false);
          return;
        }

        console.log('Search params:', Object.fromEntries(searchParams.entries()));

        // Lấy txnRef từ URL trước tiên
        const txnRef = searchParams.get('vnp_TxnRef');

        // Nếu không có txnRef trong URL, thử lấy từ localStorage
        if (!txnRef) {
          console.log('No txnRef in URL, trying to get from localStorage');
          const storedTxnRef = localStorage.getItem('lastTxnRef');

          if (storedTxnRef) {
            console.log('Found txnRef in localStorage:', storedTxnRef);

            try {
              // Lấy thông tin đặt vé từ backend bằng txnRef đã lưu
              const response = await paymentAPI.getBookingByTxnRef(storedTxnRef);
              console.log('Payment API response:', response);

              if (response.state === 'SUCCESS') {
                setBookingDetails(response.object);
                setStatus('success');

                // Generate QR code with first ticket token if available
                if (response.object.order?.tickets && response.object.order.tickets.length > 0) {
                  const firstTicket = response.object.order.tickets[0];
                  console.log('Ticket data:', firstTicket);
                  // Đảm bảo ticket có token
                  if (firstTicket.token) {
                    const qrData = `TICKET_${firstTicket.token}`;
                    console.log('Generating QR code with data:', qrData);
                    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
                    setQrCodeUrl(qrCodeDataUrl);
                  } else {
                    console.error('Ticket token is missing');
                  }
                }

                // Xóa txnRef từ localStorage sau khi đã sử dụng
                localStorage.removeItem('lastTxnRef');
                setLoading(false);
                return;
              } else {
                console.error('Payment API failed:', response.message);
                setErrorMessage('Không thể lấy thông tin thanh toán: ' + (response.message || 'Lỗi không xác định'));
                setStatus('failed');
                setLoading(false);
                return;
              }
            } catch (error) {
              console.error('Error fetching booking details from localStorage txnRef:', error);
              setErrorMessage('Lỗi khi lấy thông tin thanh toán. Vui lòng thử lại.');
              setStatus('failed');
              setLoading(false);
              return;
            }
          } else {
            console.log('No stored txnRef found in localStorage');
            setErrorMessage('Không tìm thấy thông tin thanh toán. Vui lòng truy cập từ trang đặt vé.');
            setStatus('failed');
            setLoading(false);
            return;
          }
        }

        // Extract VNPay parameters from URL
        const vnpayResponse: VNPayResponse = {
          vnp_Amount: searchParams.get('vnp_Amount') || '',
          vnp_BankCode: searchParams.get('vnp_BankCode') || '',
          vnp_BankTranNo: searchParams.get('vnp_BankTranNo') || '',
          vnp_CardType: searchParams.get('vnp_CardType') || '',
          vnp_OrderInfo: searchParams.get('vnp_OrderInfo') || '',
          vnp_PayDate: searchParams.get('vnp_PayDate') || '',
          vnp_ResponseCode: searchParams.get('vnp_ResponseCode') || '',
          vnp_TmnCode: searchParams.get('vnp_TmnCode') || '',
          vnp_TransactionNo: searchParams.get('vnp_TransactionNo') || '',
          vnp_TransactionStatus: searchParams.get('vnp_TransactionStatus') || '',
          vnp_TxnRef: txnRef || '',
          vnp_SecureHash: searchParams.get('vnp_SecureHash') || '',
        };

        console.log('VNPay response:', vnpayResponse);
        setPaymentData(vnpayResponse);

        // Kiểm tra xem có mã giao dịch không
        if (!vnpayResponse.vnp_TxnRef) {
          console.error('No transaction reference found in URL or localStorage');
          setErrorMessage('Không tìm thấy mã giao dịch');
          setStatus('failed');
          setLoading(false);
          return;
        }

        // Determine payment status
        const paymentStatus = vnpayResponse.vnp_ResponseCode === '00' && vnpayResponse.vnp_TransactionStatus === '00'
          ? 'success'
          : 'failed';
        setStatus(paymentStatus);

        // If payment successful, confirm payment and fetch booking details
        if (paymentStatus === 'success' && vnpayResponse.vnp_TxnRef) {
          try {
            // First confirm the payment and generate tickets
            console.log('Confirming payment for txnRef:', vnpayResponse.vnp_TxnRef);
            const confirmResponse = await paymentAPI.confirmPayment(vnpayResponse.vnp_TxnRef);
            console.log('Confirm payment response:', confirmResponse);

            if (confirmResponse.state === 'SUCCESS') {
              // Then fetch the updated booking details with tickets
              console.log('Fetching booking details for txnRef:', vnpayResponse.vnp_TxnRef);
              const response = await paymentAPI.getBookingByTxnRef(vnpayResponse.vnp_TxnRef);
              console.log('Booking details response:', response);

              if (response.state === 'SUCCESS') {
                setBookingDetails(response.object);

                // Generate QR code with first ticket token if available
                if (response.object.order?.tickets && response.object.order.tickets.length > 0) {
                  const firstTicket = response.object.order.tickets[0];
                  console.log('Ticket data:', firstTicket);

                  // Đảm bảo ticket có token
                  if (firstTicket.token) {
                    const qrData = `TICKET_${firstTicket.token}`;
                    console.log('Generating QR code with data:', qrData);
                    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
                    setQrCodeUrl(qrCodeDataUrl);

                    // Lấy thông tin phim từ ticket nếu không có trong bookingDetails
                    if (!response.object.movie && firstTicket.showtime?.movie) {
                      response.object.movie = firstTicket.showtime.movie;
                      console.log('Updated movie info from ticket:', response.object.movie);
                    }

                    // Kiểm tra trạng thái vé
                    console.log('Ticket status:', firstTicket.status);
                    if (firstTicket.status === 'PAID') {
                      console.log('Ticket is paid');
                    }
                  } else {
                    console.error('Ticket token is missing');
                  }
                }
              } else {
                console.error('Failed to get booking details:', response.message);
                setErrorMessage('Không thể lấy thông tin đặt vé: ' + (response.message || 'Không xác định'));
              }
            } else {
              console.error('Failed to confirm payment:', confirmResponse.message);
              setErrorMessage('Không thể xác nhận thanh toán: ' + confirmResponse.message);
            }
          } catch (error) {
            console.error('Error confirming payment or fetching booking details:', error);
            setErrorMessage('Lỗi khi xác nhận thanh toán hoặc lấy thông tin đặt vé');
          }
        } else if (paymentStatus === 'failed') {
          setErrorMessage('Thanh toán không thành công. Mã lỗi: ' + vnpayResponse.vnp_ResponseCode);
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        setErrorMessage('Lỗi xử lý thanh toán');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  // Format amount from VNPay (cents to VND)
  const formatAmount = (amount: string) => {
    const amountInVND = parseInt(amount) / 100;
    return amountInVND.toLocaleString('vi-VN');
  };

  // Format date from VNPay format (YYYYMMDDHHmmss)
  const formatDate = (dateString: string) => {
    if (!dateString || dateString.length !== 14) return dateString;

    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(8, 10);
    const minute = dateString.substring(10, 12);
    const second = dateString.substring(12, 14);

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  // Get status icon and styling
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />;
      case 'failed':
        return <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />;
      default:
        return <ClockIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />;
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'success':
        return {
          title: 'Thanh toán thành công!',
          message: 'Vé của bạn đã được đặt thành công. Vui lòng kiểm tra email để nhận thông tin chi tiết.',
          color: 'text-green-600'
        };
      case 'failed':
        return {
          title: 'Thanh toán thất bại',
          message: 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.',
          color: 'text-red-600'
        };
      default:
        return {
          title: 'Đang xử lý thanh toán',
          message: 'Vui lòng đợi trong giây lát...',
          color: 'text-yellow-600'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Status Icon */}
          <div className="text-center mb-6">
            {getStatusIcon()}
          </div>

          {/* Status Message */}
          <div className="text-center mb-8">
            <h1 className={`text-2xl font-bold mb-2 ${statusInfo.color}`}>
              {statusInfo.title}
            </h1>
            <p className="text-gray-600">
              {errorMessage || statusInfo.message}
            </p>
          </div>

          {/* Booking Details */}
          {bookingDetails && status === 'success' && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <TicketIcon className="h-6 w-6 mr-2 text-gray-600" />
                Thông tin vé đã đặt
              </h2>

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
                      {(bookingDetails?.movie?.posterUrl || bookingDetails?.order?.tickets?.[0]?.showtime?.movie?.posterUrl) && (
                        <img
                          src={bookingDetails?.movie?.posterUrl || bookingDetails?.order?.tickets?.[0]?.showtime?.movie?.posterUrl}
                          alt="Movie Poster"
                          className="w-16 h-20 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {bookingDetails?.movie?.title || bookingDetails?.order?.tickets?.[0]?.showtime?.movie?.title || 'Phim đã đặt'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Mã vé: #{bookingDetails.id}
                        </div>
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
                        {bookingDetails?.showtime?.startTime ? 
                          new Date(bookingDetails.showtime.startTime).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Ngày chiếu'
                        }
                      </div>
                      <div className="font-medium text-gray-900">
                        {bookingDetails?.showtime?.startTime ? 
                          new Date(bookingDetails.showtime.startTime).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '--:--'
                        } - {bookingDetails?.showtime?.endTime ? 
                          new Date(bookingDetails.showtime.endTime).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '--:--'
                        }
                      </div>
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
                        {bookingDetails?.showtime?.room?.cinema?.name || 
                         bookingDetails?.order?.tickets?.[0]?.showtime?.room?.cinema?.name || 
                         'Rạp chiếu phim'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {bookingDetails?.showtime?.room?.cinema?.address || 
                         bookingDetails?.order?.tickets?.[0]?.showtime?.room?.cinema?.address || 
                         'Địa chỉ rạp chiếu'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Phòng: {bookingDetails?.showtime?.room?.name || 
                               bookingDetails?.order?.tickets?.[0]?.showtime?.room?.name || 
                               'Phòng chiếu'}
                      </div>
                    </div>
                  </div>

                  {/* Seats Information */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <TicketIcon className="h-5 w-5 mr-2 text-gray-600" />
                      Ghế đã đặt ({bookingDetails?.order?.tickets?.length || 0})
                    </h3>
                    {bookingDetails?.order?.tickets && bookingDetails.order.tickets.length > 0 ? (
                      <div className="space-y-2">
                        {bookingDetails.order.tickets.map((ticket, index) => (
                          <div 
                            key={ticket?.id ?? ticket?.token ?? index} 
                            className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {ticket?.seat?.seatNumber || `A${index + 1}`}
                              </span>
                              {ticket?.seat?.seatType && (
                                <span className="text-sm text-gray-500">
                                  ({ticket.seat.seatType === 'VIP' ? 'VIP' : 
                                    ticket.seat.seatType === 'COUPLE' ? 'Ghế đôi' : 'Ghế thường'})
                                </span>
                              )}
                              {ticket.status === 'PAID' && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Đã thanh toán
                                </span>
                              )}
                            </div>
                            <div className="font-medium text-gray-900">
                              {ticket.price?.toLocaleString('vi-VN') || '0'}đ
                            </div>
                          </div>
                        ))}
                        
                        <div className="pt-2 mt-2 border-t">
                          <div className="flex justify-between items-center font-medium">
                            <span>Tổng cộng:</span>
                            <span className="text-lg">
                              {bookingDetails.totalPrice?.toLocaleString('vi-VN') || '0'}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        <p>Chưa có thông tin ghế chi tiết</p>
                        <p className="text-sm mt-1">Vui lòng liên hệ hỗ trợ để được hỗ trợ</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - QR Code & Customer Info */}
                <div className="space-y-6">
                  {/* QR Code */}
                  {qrCodeUrl && (
                    <div className="border rounded-lg p-4 text-center">
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center justify-center">
                        <QrCodeIcon className="h-5 w-5 mr-2 text-gray-600" />
                        Mã QR vé
                      </h3>
                      <div className="bg-gray-50 p-4 rounded">
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          className="mx-auto mb-2"
                          style={{ width: '150px', height: '150px' }}
                        />
                        <p className="text-xs text-gray-600">
                          Xuất trình mã QR này tại rạp
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
                          {bookingDetails.customerName}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium text-gray-900 break-words">
                          {bookingDetails.customerEmail}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Trạng thái</div>
                        <div className="font-medium">
                          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            Đặt vé thành công
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
            </div>
          )}

          {/* Payment Details */}
          {paymentData && (
            <div className="bg-white border rounded-lg p-4 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2 text-gray-600" />
                Chi tiết thanh toán
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Mã giao dịch</div>
                  <div className="font-medium text-gray-900">{paymentData.vnp_TxnRef}</div>
                </div>

                <div>
                  <div className="text-gray-500">Số tiền</div>
                  <div className="font-medium text-gray-900">
                    {formatAmount(paymentData.vnp_Amount)}đ
                  </div>
                </div>

                <div>
                  <div className="text-gray-500">Ngân hàng</div>
                  <div className="font-medium text-gray-900">{paymentData.vnp_BankCode}</div>
                </div>

                <div>
                  <div className="text-gray-500">Loại thẻ</div>
                  <div className="font-medium text-gray-900">{paymentData.vnp_CardType}</div>
                </div>

                <div>
                  <div className="text-gray-500">Mã giao dịch ngân hàng</div>
                  <div className="font-medium text-gray-900">{paymentData.vnp_BankTranNo}</div>
                </div>

                <div>
                  <div className="text-gray-500">Thời gian</div>
                  <div className="font-medium text-gray-900">
                    {formatDate(paymentData.vnp_PayDate)}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="text-gray-500">Thông tin đơn hàng</div>
                  <div className="font-medium text-gray-900">
                    {decodeURIComponent(paymentData.vnp_OrderInfo)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {status === 'success' ? (
              <>
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xem vé của tôi
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Về trang chủ
                </button>
              </>
            ) : status === 'failed' ? (
              <>
                <button
                  onClick={() => navigate('/booking')}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Thử lại
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Về trang chủ
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Về trang chủ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
