import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { cookieService } from '../services/cookieService';
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
  qrCodeUrl?: string;
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
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const processedRef = useRef<boolean>(false);
  const emailProcessingRef = useRef<boolean>(false);
  const globalEmailSentRef = useRef<boolean>(false);
  // Function to process payment with txnRef from cookie
  const processPaymentWithTxnRef = useCallback(async (txnRef: string) => {
    try {
      // First confirm the payment and generate tickets
      const confirmResponse = await paymentAPI.confirmPayment(txnRef);
      if (confirmResponse.state === 'SUCCESS') {
        // Then fetch the updated booking details with tickets
        const response = await paymentAPI.getBookingByTxnRef(txnRef);
        if (response.state === 'SUCCESS') {
          setBookingDetails(response.object);
          setStatus('success');
          // Generate QR code and send email
          await generateQRAndSendEmail(response.object);
          // Clear txnRef from cookie
          cookieService.removeTempData('currentTxnRef');
        } else {
          setErrorMessage('Không thể lấy thông tin đặt vé: ' + (response.message || 'Không xác định'));
          setStatus('failed');
        }
      } else {
        setErrorMessage('Không thể xác nhận thanh toán: ' + confirmResponse.message);
        setStatus('failed');
      }
    } catch (error) {
      setErrorMessage('Có lỗi xảy ra khi xử lý thanh toán: ' + (error instanceof Error ? error.message : 'Không xác định'));
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  }, [emailSent]);
  // Function to create HTML email and send to user
  const sendQREmailToUser = useCallback(async (bookingId: number, qrCodeDataUrl: string, currentBookingDetails?: BookingDetails, qrData?: string) => {
    try {
      // Use current booking details or fallback to state
      const details = currentBookingDetails || bookingDetails;
      if (!details) {
        return false;
      }
      // Create HTML email content
      const htmlContent = createEmailHTML(details, qrCodeDataUrl, qrData);
      const subject = `Xác nhận đặt vé - ${details.movie?.title || 'Unknown Movie'}`;
      // Validate required data
      if (!htmlContent || htmlContent.length === 0) {
        return false;
      }
      if (!details.customerEmail || details.customerEmail.trim() === '') {
        return false;
      }
      const response = await paymentAPI.sendBookingEmail(bookingId, htmlContent, subject, details.customerEmail);
      if (response.state === 'SUCCESS') {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }, [bookingDetails]);
  // Helper function to generate QR code and send email
  const generateQRAndSendEmail = useCallback(async (bookingDetails: BookingDetails) => {
    try {
      // Check if email already sent globally to prevent spam
      if (globalEmailSentRef.current) {
        return { qrCodeDataUrl: qrCodeUrl, emailSent: true };
      }
      // Check if already processing to prevent multiple calls
      if (emailProcessingRef.current) {
        return { qrCodeDataUrl: qrCodeUrl, emailSent: true };
      }
      // Check if this specific booking already processed
      const bookingKey = `email_sent_${bookingDetails.id}`;
      if (cookieService.getTempData(bookingKey)) {
        return { qrCodeDataUrl: qrCodeUrl, emailSent: true };
      }
      emailProcessingRef.current = true;
      globalEmailSentRef.current = true;
      // Get QR code URL from backend (already generated)
      let qrCodeDataUrl = null;
      let qrData = `BOOKING_${bookingDetails.id}`; // Default fallback
      if (bookingDetails.order?.tickets && bookingDetails.order.tickets.length > 0) {
        const firstTicket = bookingDetails.order.tickets[0];
        if (firstTicket.qrCodeUrl) {
          qrCodeDataUrl = firstTicket.qrCodeUrl;
        }
        if (firstTicket.token) {
          qrData = `TICKET_${firstTicket.token}`;
        }
      }
      // QR code should always be available from backend
      if (!qrCodeDataUrl) {
        return { qrCodeDataUrl: null, emailSent: false };
      }
      setQrCodeUrl(qrCodeDataUrl);
      // Send email with QR code
      const emailSentResult = await sendQREmailToUser(bookingDetails.id, qrCodeDataUrl, bookingDetails, qrData);
      if (emailSentResult) {
        setEmailSent(true); // Mark email as sent
        // Mark this specific booking as email sent
        cookieService.setTempData(`email_sent_${bookingDetails.id}`, 'true');
      }
      return { qrCodeDataUrl, emailSent: emailSentResult };
    } catch (error) {
      return { qrCodeDataUrl: null, emailSent: false };
    } finally {
      emailProcessingRef.current = false;
    }
  }, [emailSent, qrCodeUrl, sendQREmailToUser]);
  // Function to create HTML email content
  const createEmailHTML = (booking: BookingDetails, qrCodeDataUrl: string, qrData?: string): string => {
    // Validate required data
    if (!booking) {
      return '';
    }
    if (!booking.movie) {
      return '';
    }
    if (!booking.showtime) {
      return '';
    }
    if (!booking.order || !booking.order.tickets) {
      return '';
    }
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác nhận đặt vé</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.4; color: #333; max-width: 500px; margin: 0 auto; padding: 15px; background-color: #f8fafc; }
        .container { background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1f2937, #374151); color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; }
        .header h1 { margin: 0; font-size: 18px; }
        .qr-section { text-align: center; margin: 20px 0; padding: 15px; background-color: #f1f5f9; border-radius: 6px; border: 1px dashed #cbd5e1; }
        .qr-section h3 { margin: 0 0 10px 0; font-size: 16px; color: #374151; }
        .qr-section img { width: 120px; height: 120px; border: 1px solid #d1d5db; border-radius: 6px; margin-bottom: 8px; }
        .qr-section p { margin: 5px 0; font-size: 12px; color: #6b7280; }
        .booking-info { background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #10b981; }
        .booking-info p { margin: 8px 0; font-size: 14px; }
        .footer { text-align: center; color: #6b7280; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 11px; }
        .highlight { color: #1f2937; font-weight: bold; }
        .notice { background-color: #fef3c7; padding: 12px; border-radius: 4px; margin: 15px 0; }
        .notice h4 { color: #92400e; margin: 0 0 8px 0; font-size: 14px; }
        .notice ul { color: #78350f; margin: 0; padding-left: 15px; font-size: 12px; }
        .notice li { margin: 4px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 Xác nhận đặt vé thành công!</h1>
        </div>
        <p>Xin chào <span class="highlight">${booking.customerName || 'Khách hàng'}</span>,</p>
        <p>Cảm ơn bạn đã đặt vé tại rạp chiếu phim của chúng tôi! Vé của bạn đã được xác nhận thành công.</p>
        <div class="booking-info">
            <p><strong>🎭 Phim:</strong> ${booking.movie?.title || 'N/A'}</p>
            <p><strong>🏢 Rạp:</strong> ${booking.showtime?.room?.cinema?.name || 'N/A'}</p>
            <p><strong>🚪 Phòng:</strong> ${booking.showtime?.room?.name || 'N/A'}</p>
            <p><strong>📅 Ngày & Giờ:</strong> ${booking.showtime?.startTime ? new Date(booking.showtime.startTime).toLocaleString('vi-VN') : 'N/A'}</p>
            <p><strong>💰 Tổng tiền:</strong> ${booking.totalPrice ? booking.totalPrice.toLocaleString('vi-VN') : '0'} VNĐ</p>
            <p><strong>🪑 Ghế:</strong> ${booking.order?.tickets ? booking.order.tickets.map(t => t.seat?.seatNumber || 'N/A').join(', ') : 'N/A'}</p>
        </div>
        <div class="qr-section">
            <div style="text-align: center; margin: 20px 0;">
                <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block; border: 2px solid #333;">
                    <img src="${qrCodeDataUrl}" alt="QR Code vé" style="width: 120px; height: 120px; display: block; margin: 0 auto; max-width: 100%; height: auto;" />
                </div>
                <p style="margin-top: 15px; font-size: 14px; color: #333; font-weight: bold;">
                    Mã QR Vé của bạn
                </p>
                <p style="margin-top: 10px; font-size: 12px; color: #666;">
                    Nếu QR code không hiển thị, vui lòng sử dụng mã vé bên dưới
                </p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 15px; font-family: 'Courier New', monospace; font-size: 13px; word-break: break-all; border: 1px solid #dee2e6;">
                    <strong style="color: #495057;">Mã vé:</strong> <span style="color: #dc3545; font-weight: bold;">${qrData || 'N/A'}</span>
                </div>
            </div>
            <p><strong>Xuất trình mã QR này tại quầy vé để nhận vé</strong></p>
        </div>
        <div class="notice">
            <h4>📱 Lưu ý quan trọng</h4>
            <ul>
                <li>Có mặt trước giờ chiếu <strong>15 phút</strong></li>
                <li>Xuất trình mã QR tại quầy vé</li>
                <li>Mang theo giấy tờ tùy thân</li>
                <li>Liên hệ hotline nếu cần hỗ trợ: <strong>1900-xxxx</strong></li>
            </ul>
        </div>
        <div class="footer">
            <p>Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi!</p>
            <p><strong>🎭 Cinema Team</strong></p>
            <p>Email này được gửi tự động, vui lòng không phản hồi trực tiếp.</p>
        </div>
    </div>
</body>
</html>
    `;
  };
  useEffect(() => {
    const processPayment = async () => {
      try {
        // Check if already processed to prevent infinite loop
        if (processedRef.current) {
          return;
        }
        // Reset processed flag if we have new URL parameters
        if (searchParams && searchParams.size > 0) {
          processedRef.current = false;
        }
        // Kiểm tra xem có tham số URL từ VNPay callback không
        if (searchParams && searchParams.size > 0) {
          const status = searchParams.get('status');
          const txnRef = searchParams.get('txnRef');
          const message = searchParams.get('message');
          if (status === 'success' && txnRef) {
            await processPaymentWithTxnRef(txnRef);
            return;
          } else if (status === 'failed') {
            setErrorMessage(message || 'Thanh toán thất bại');
            setStatus('failed');
            setLoading(false);
            return;
          } else {
          }
        } else {
        }
        // Kiểm tra xem có tham số URL không
        if (!searchParams || searchParams.size === 0) {
          // Kiểm tra xem có txnRef từ payment không
          const currentTxnRef = cookieService.getTempData('currentTxnRef');
          if (currentTxnRef) {
            // Process payment with txnRef from cookie
            await processPaymentWithTxnRef(currentTxnRef);
            return;
          }
          // Kiểm tra xem có pending booking không (fallback khi VNPay lỗi)
          const pendingBooking = cookieService.getTempData('pendingBooking');
          if (pendingBooking) {
            try {
              const bookingData = JSON.parse(pendingBooking);
              // Simulate successful payment for testing
              setStatus('success');
              setBookingDetails({
                id: bookingData.bookingId,
                movie: bookingData.movie,
                showtime: bookingData.showtime,
                totalPrice: bookingData.totalPrice,
                customerName: user?.fullName || 'Test User',
                customerEmail: user?.email || 'test@example.com',
                order: {
                  status: 'PAID',
                  tickets: bookingData.selectedSeats.map((seat: any, index: number) => ({
                    id: index + 1,
                    orderId: bookingData.bookingId,
                    seatId: seat.id,
                    seat: {
                      seatNumber: seat.seatNumber,
                      rowNumber: seat.rowNumber,
                      columnNumber: seat.columnNumber,
                      roomId: 1,
                      seatType: seat.seatType,
                      price: seat.price
                    },
                    price: seat.price,
                    token: `token_${index + 1}`,
                    status: 'PAID'
                  }))
                }
              });
              // Clear pending booking
              cookieService.removeTempData('pendingBooking');
              cookieService.removeTempData('currentTxnRef');
              // Generate QR code and send email
              await generateQRAndSendEmail({
                id: bookingData.bookingId,
                movie: bookingData.movie,
                showtime: bookingData.showtime,
                totalPrice: bookingData.totalPrice,
                customerName: user?.fullName || 'Test User',
                customerEmail: user?.email || 'test@example.com',
                order: {
                  status: 'PAID',
                  tickets: bookingData.selectedSeats.map((seat: any, index: number) => ({
                    id: index + 1,
                    orderId: bookingData.bookingId,
                    seatId: seat.id,
                    seat: {
                      seatNumber: seat.seatNumber,
                      rowNumber: seat.rowNumber,
                      columnNumber: seat.columnNumber,
                      roomId: 1,
                      seatType: seat.seatType,
                      price: seat.price
                    },
                    price: seat.price,
                    token: `token_${index + 1}`,
                    status: 'PAID'
                  }))
                }
              });
              setLoading(false);
              return;
            } catch (error) {
              setErrorMessage('Có lỗi xảy ra khi xử lý đặt vé. Vui lòng thử lại.');
              setStatus('failed');
              setLoading(false);
              return;
            }
          }
          // Kiểm tra xem có booking từ Profile không
          const selectedBooking = cookieService.getTempData('selectedBooking');
          if (selectedBooking) {
            try {
              const booking = JSON.parse(selectedBooking);
              // Kiểm tra authentication trước khi gọi API
              if (!user) {
                setErrorMessage('Bạn cần đăng nhập để xem thông tin vé. Vui lòng đăng nhập và thử lại.');
                setStatus('failed');
                setLoading(false);
                return;
              }
              // Gọi API để lấy thông tin chi tiết booking với ghế
              try {
                const bookingDetailsResponse = await bookingAPI.getById(booking.id);
                // Xử lý response với các state khác nhau
                let bookingData;
                if (bookingDetailsResponse.state === 'SUCCESS' || bookingDetailsResponse.state === '200' || bookingDetailsResponse.state === '302') {
                  bookingData = bookingDetailsResponse.object;
                } else {
                  throw new Error(`API returned state: ${bookingDetailsResponse.state}`);
                }
                // Cố gắng lấy thông tin vé với nhiều cách khác nhau
                let tickets = [];
                const anyBookingData = bookingData as any; // Cast to any to access dynamic properties
                // Cách 1: Từ bookingData.tickets trực tiếp
                if (anyBookingData.tickets && Array.isArray(anyBookingData.tickets)) {
                  tickets = anyBookingData.tickets;
                }
                // Cách 2: Từ bookingData.order.tickets
                else if (anyBookingData.order?.tickets && Array.isArray(anyBookingData.order.tickets)) {
                  tickets = anyBookingData.order.tickets;
                }
                // Cách 3: Từ bookingData.bookingTickets (có thể có tên khác)
                else if (anyBookingData.bookingTickets && Array.isArray(anyBookingData.bookingTickets)) {
                  tickets = anyBookingData.bookingTickets;
                }
                // Tạo booking details từ dữ liệu thực tế
                const anyBooking = booking as any; // Cast booking to any for accessing extended properties
                const realBookingDetails: BookingDetails = {
                  id: bookingData.id || booking.id,
                  movie: {
                    title: anyBookingData.movie?.title || 
                           anyBookingData.showtime?.movie?.title || 
                           (tickets[0] as any)?.showtime?.movie?.title || 
                           anyBooking.movie?.title || 
                           'Phim đã đặt',
                    posterUrl: anyBookingData.movie?.posterUrl || 
                              anyBookingData.showtime?.movie?.posterUrl || 
                              (tickets[0] as any)?.showtime?.movie?.posterUrl ||
                              anyBooking.movie?.posterUrl
                  },
                  showtime: {
                    startTime: anyBookingData.showtime?.startTime || 
                              (tickets[0] as any)?.showtime?.startTime || 
                              anyBooking.showtime?.startTime || 
                              new Date().toISOString(),
                    endTime: anyBookingData.showtime?.endTime || 
                            (tickets[0] as any)?.showtime?.endTime || 
                            anyBooking.showtime?.endTime || 
                            new Date().toISOString(),
                    room: {
                      name: anyBookingData.showtime?.room?.name || 
                           (tickets[0] as any)?.showtime?.room?.name || 
                           anyBooking.showtime?.room?.name || 
                           'Phòng chiếu',
                      cinema: {
                        name: anyBookingData.showtime?.room?.cinema?.name || 
                             (tickets[0] as any)?.showtime?.room?.cinema?.name || 
                             anyBooking.showtime?.room?.cinema?.name || 
                             'Rạp chiếu phim',
                        address: anyBookingData.showtime?.room?.cinema?.address || 
                                (tickets[0] as any)?.showtime?.room?.cinema?.address || 
                                anyBooking.showtime?.room?.cinema?.address || 
                                'Địa chỉ rạp chiếu'
                      }
                    }
                  },
                  order: {
                    tickets: tickets.length > 0 ? tickets.map((ticket: unknown, index: number) => {
                      // Lấy thông tin ghế từ các nguồn khác nhau
                      const ticketData = ticket as Record<string, unknown>;
                      const seatInfo = ticketData.seat || ticketData.bookingSeat || ticketData;
                      // Tạo seatNumber từ rowNumber và columnNumber
                      const seatData = seatInfo as Record<string, unknown>;
                      const rowNumber = seatData.rowNumber || seatData.row || String.fromCharCode(65 + index); // A, B, C...
                      const columnNumber = seatData.columnNumber || seatData.column || (index + 1);
                      const seatNumber = seatData.seatNumber || `${rowNumber}${columnNumber}`;
                      return {
                        id: ticketData.id || ticketData.ticketId || index + 1,
                        orderId: ticketData.orderId || ticketData.bookingId || bookingData.id,
                        seatId: ticketData.seatId || seatData.id || index + 1,
                        seat: {
                          seatNumber: seatNumber,
                          rowNumber: rowNumber,
                          columnNumber: columnNumber,
                          roomId: seatData.roomId || 1,
                          seatType: (seatData.seatType || 'REGULAR') as 'REGULAR' | 'VIP' | 'COUPLE',
                          price: seatData.price || ticketData.price || 80000
                        },
                        price: ticketData.price || seatData.price || 80000,
                        token: ticketData.token || `token_${ticketData.id || index + 1}`,
                        status: ticketData.status || 'PAID'
                      };
                    }) : [
                      // Fallback nếu không có thông tin vé chi tiết
                      {
                        id: 1,
                        orderId: bookingData.id,
                        seatId: 1,
                        seat: {
                          seatNumber: 'A1',
                          rowNumber: 'A',
                          columnNumber: 1,
                          roomId: 1,
                          seatType: 'REGULAR' as const,
                          price: bookingData.totalPrice || booking.totalPrice || 80000
                        },
                        price: bookingData.totalPrice || booking.totalPrice || 80000,
                        token: `token_${bookingData.id}`,
                        status: 'PAID'
                      }
                    ],
                    status: bookingData.paymentStatus || bookingData.status || 'PAID'
                  },
                  customerName: bookingData.customerName || booking.customerName,
                  customerEmail: bookingData.customerEmail || booking.customerEmail,
                  totalPrice: bookingData.totalPrice || booking.totalPrice
                };
                setBookingDetails(realBookingDetails);
                setStatus('success');
                // Tạo QR code và gửi email
                await generateQRAndSendEmail(realBookingDetails);
              } catch (apiError) {
                // Nếu API thất bại, hiển thị thông báo lỗi thay vì mock data
                setErrorMessage('Không thể lấy thông tin chi tiết vé từ server. Vui lòng kiểm tra kết nối mạng và thử lại.');
                setStatus('failed');
                setLoading(false);
                return;
              }
              // Xóa dữ liệu từ cookie
              cookieService.removeTempData('selectedBooking');
              cookieService.removeTempData('lastTxnRef');
              setLoading(false);
              return;
            } catch (error) {
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
        // Lấy txnRef từ URL trước tiên
        const txnRef = searchParams.get('vnp_TxnRef');
        // Nếu không có txnRef trong URL, thử lấy từ cookie
        if (!txnRef) {
          const storedTxnRef = cookieService.getTempData('lastTxnRef');
          if (storedTxnRef) {
            try {
              // Lấy thông tin đặt vé từ backend bằng txnRef đã lưu
              const response = await paymentAPI.getBookingByTxnRef(storedTxnRef);
              if (response.state === 'SUCCESS') {
                setBookingDetails(response.object);
                setStatus('success');
                // Generate QR code and send email
                await generateQRAndSendEmail(response.object);
                // Xóa txnRef từ cookie sau khi đã sử dụng
                cookieService.removeTempData('lastTxnRef');
                setLoading(false);
                return;
              } else {
                setErrorMessage('Không thể lấy thông tin thanh toán: ' + (response.message || 'Lỗi không xác định'));
                setStatus('failed');
                setLoading(false);
                return;
              }
            } catch (error) {
              setErrorMessage('Lỗi khi lấy thông tin thanh toán. Vui lòng thử lại.');
              setStatus('failed');
              setLoading(false);
              return;
            }
          } else {
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
        setPaymentData(vnpayResponse);
        // Kiểm tra xem có mã giao dịch không
        if (!vnpayResponse.vnp_TxnRef) {
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
            const confirmResponse = await paymentAPI.confirmPayment(vnpayResponse.vnp_TxnRef);
            if (confirmResponse.state === 'SUCCESS') {
              // Then fetch the updated booking details with tickets
              const response = await paymentAPI.getBookingByTxnRef(vnpayResponse.vnp_TxnRef);
              if (response.state === 'SUCCESS') {
                setBookingDetails(response.object);
                // Generate QR code and send email
                await generateQRAndSendEmail(response.object);
                // Log ticket status if available
                if (response.object.order?.tickets && response.object.order.tickets.length > 0) {
                  const firstTicket = response.object.order.tickets[0];
                  // Lấy thông tin phim từ ticket nếu không có trong bookingDetails
                  if (!response.object.movie && firstTicket.showtime?.movie) {
                    response.object.movie = firstTicket.showtime.movie;
                  }
                  // Kiểm tra trạng thái vé
                  if (firstTicket.status === 'PAID') {
                  }
                }
              } else {
                setErrorMessage('Không thể lấy thông tin đặt vé: ' + (response.message || 'Không xác định'));
              }
            } else {
              setErrorMessage('Không thể xác nhận thanh toán: ' + confirmResponse.message);
            }
          } catch (error) {
            setErrorMessage('Lỗi khi xác nhận thanh toán hoặc lấy thông tin đặt vé');
          }
        } else if (paymentStatus === 'failed') {
          setErrorMessage('Thanh toán không thành công. Mã lỗi: ' + vnpayResponse.vnp_ResponseCode);
        }
      } catch (error) {
        setErrorMessage('Lỗi xử lý thanh toán');
      } finally {
        setLoading(false);
        processedRef.current = true; // Mark as processed
      }
    };
    processPayment();
  }, [searchParams, user]);
  // Reset states when component unmounts
  useEffect(() => {
    return () => {
      setEmailSent(false);
      processedRef.current = false;
      emailProcessingRef.current = false;
      globalEmailSentRef.current = false;
    };
  }, []);
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
            {/* Special message for VNPay errors */}
            {status === 'failed' && !errorMessage && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Có thể VNPay sandbox đang gặp sự cố. 
                  Bạn có thể thử lại thanh toán hoặc liên hệ hỗ trợ.
                </p>
              </div>
            )}
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
                        {bookingDetails.order.tickets.map((ticket, index) => {
                          // Đảm bảo có thông tin ghế để hiển thị
                          const seatNumber = ticket?.seat?.seatNumber || `Ghế ${index + 1}`;
                          const seatType = ticket?.seat?.seatType || 'REGULAR';
                          const seatPrice = ticket?.seat?.price || ticket?.price || 80000;
                          return (
                            <div 
                              key={ticket?.id ?? ticket?.token ?? index} 
                              className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 bg-blue-50 px-2 py-1 rounded">
                                  {seatNumber}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({seatType === 'VIP' ? 'VIP' : 
                                    seatType === 'COUPLE' ? 'Ghế đôi' : 'Ghế thường'})
                                </span>
                                {ticket.status === 'PAID' && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Đã thanh toán
                                  </span>
                                )}
                              </div>
                              <div className="font-medium text-gray-900">
                                {seatPrice.toLocaleString('vi-VN')}đ
                              </div>
                            </div>
                          );
                        })}
                        <div className="pt-2 mt-2 border-t">
                          <div className="flex justify-between items-center font-medium">
                            <span>Tổng cộng:</span>
                            <span className="text-lg text-blue-600">
                              {bookingDetails.order.tickets.reduce((sum, ticket) => {
                                const seatPrice = ticket?.seat?.price || ticket?.price || 80000;
                                return sum + seatPrice;
                              }, 0).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>
                        {/* Thông tin thêm về booking */}
                        <div className="pt-2 mt-2 border-t bg-gray-50 p-3 rounded">
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Mã booking:</span>
                              <span className="font-medium">#{bookingDetails.id}</span>
                            </div>
                            {bookingDetails.totalPrice && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tổng thanh toán:</span>
                                <span className="font-medium">{bookingDetails.totalPrice.toLocaleString('vi-VN')}đ</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        <TicketIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="font-medium">Không tìm thấy thông tin ghế chi tiết</p>
                        <p className="text-sm mt-1">
                          Booking #{bookingDetails.id} - Tổng: {bookingDetails.totalPrice?.toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-xs mt-1 text-gray-400">
                          Vui lòng liên hệ hỗ trợ nếu cần thông tin chi tiết
                        </p>
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
                  onClick={() => {
                    // Clear pending booking and try again
                    cookieService.removeTempData('pendingBooking');
                    cookieService.removeTempData('currentTxnRef');
                    navigate('/booking');
                  }}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Thử lại thanh toán
                </button>
                <button
                  onClick={() => {
                    // Clear all data and go home
                    cookieService.removeTempData('pendingBooking');
                    cookieService.removeTempData('currentTxnRef');
                    navigate('/');
                  }}
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
