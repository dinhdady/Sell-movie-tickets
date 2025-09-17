import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ClockIcon, TicketIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';
import QRCode from 'qrcode';
import LoadingSpinner from '../components/LoadingSpinner';
import { paymentAPI } from '../services/api';

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
  seat: {
    seatNumber: string;
    seatType: string;
  };
  price: number;
  token: string;
  status: string; // PAID, PENDING, etc.
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
          console.error('No search parameters found in URL');
          setErrorMessage('Không tìm thấy thông tin thanh toán trong URL');
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
              console.log('hello:', response);

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
              }
            } catch (error) {
              console.error('Error fetching booking details from localStorage txnRef:', error);
            }
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
      <div className="max-w-4xl mx-auto px-4">
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
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TicketIcon className="h-6 w-6 mr-2" />
                Thông tin vé đã đặt
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Movie & Showtime Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Thông tin phim</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="font-semibold text-lg">{bookingDetails?.movie?.title || (bookingDetails?.order?.tickets && bookingDetails?.order?.tickets[0]?.showtime?.movie?.title) || 'Đang tải thông tin phim...'}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-1" />
                      Suất chiếu
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="font-medium">
                        {bookingDetails?.showtime?.startTime ? new Date(bookingDetails.showtime.startTime).toLocaleDateString('vi-VN') : 'Đang tải...'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {bookingDetails?.showtime?.startTime ? new Date(bookingDetails.showtime.startTime).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Đang tải...'} - {bookingDetails?.showtime?.endTime ? new Date(bookingDetails.showtime.endTime).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Đang tải...'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                      <MapPinIcon className="h-5 w-5 mr-1" />
                      Rạp & Phòng chiếu
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="font-medium">{bookingDetails?.showtime?.room?.cinema?.name || (bookingDetails?.order?.tickets && bookingDetails?.order?.tickets[0]?.showtime?.room?.cinema?.name) || 'Đang tải thông tin rạp...'}</div>
                      <div className="text-sm text-gray-600">{bookingDetails?.showtime?.room?.cinema?.address || (bookingDetails?.order?.tickets && bookingDetails?.order?.tickets[0]?.showtime?.room?.cinema?.address) || 'Đang tải địa chỉ...'}</div>
                      <div className="text-sm font-medium mt-1">Phòng: {bookingDetails?.showtime?.room?.name || (bookingDetails?.order?.tickets && bookingDetails?.order?.tickets[0]?.showtime?.room?.name) || 'Đang tải...'}</div>
                    </div>
                  </div>
                </div>

                {/* Tickets & QR Code */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Ghế đã đặt</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                    {bookingDetails?.order?.tickets?.map((ticket) => (
                      <div key={ticket?.id ?? ticket?.token ?? Math.random()} className="flex justify-between items-center">
                        <span className="font-medium">
                          Ghế {ticket?.seat?.seatNumber} ({ticket?.seat?.seatType})
                          {ticket.status === 'PAID' && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Đã thanh toán</span>}
                        </span>
                        <span className="text-green-600 font-medium">
                          {ticket.price.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    ))}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Tổng cộng:</span>
                            <span className="text-green-600">
                              {bookingDetails.totalPrice ? bookingDetails.totalPrice.toLocaleString('vi-VN') : '0'}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  {qrCodeUrl && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Mã QR vé</h3>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          className="mx-auto mb-2"
                          style={{ width: '150px', height: '150px' }}
                        />
                        <p className="text-xs text-gray-600">
                          Vui lòng xuất trình mã QR này tại rạp
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Thông tin khách hàng</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm">
                        <div><strong>Tên:</strong> {bookingDetails.customerName}</div>
                        <div><strong>Email:</strong> {bookingDetails.customerEmail}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          {paymentData && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Chi tiết thanh toán
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Mã giao dịch:</span>
                  <div className="font-medium">{paymentData.vnp_TxnRef}</div>
                </div>

                <div>
                  <span className="text-gray-600">Số tiền:</span>
                  <div className="font-medium text-green-600">
                    {formatAmount(paymentData.vnp_Amount)}đ
                  </div>
                </div>

                <div>
                  <span className="text-gray-600">Ngân hàng:</span>
                  <div className="font-medium">{paymentData.vnp_BankCode}</div>
                </div>

                <div>
                  <span className="text-gray-600">Loại thẻ:</span>
                  <div className="font-medium">{paymentData.vnp_CardType}</div>
                </div>

                <div>
                  <span className="text-gray-600">Mã giao dịch ngân hàng:</span>
                  <div className="font-medium">{paymentData.vnp_BankTranNo}</div>
                </div>

                <div>
                  <span className="text-gray-600">Thời gian:</span>
                  <div className="font-medium">
                    {formatDate(paymentData.vnp_PayDate)}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <span className="text-gray-600">Thông tin đơn hàng:</span>
                  <div className="font-medium">
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
