import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, bookingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  CalendarIcon,
  TicketIcon,
  CreditCardIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  QrCodeIcon,
  BuildingOfficeIcon,
  FilmIcon,
  XMarkIcon as CloseIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Booking {
  id: number;
  userId?: string;
  showtimeId?: number;
  totalPrice: number;
  totalAmount?: number;
  status: string;
  bookingStatus?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  createdAt?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  movie?: {
    title: string;
    posterUrl?: string;
    description?: string;
    duration?: number;
    releaseDate?: string;
    genre?: string;
    director?: string;
    cast?: string;
    rating?: number;
    language?: string;
    filmRating?: string;
    price?: number;
  };
  showtime?: {
    id?: number;
    startTime: string;
    endTime: string;
    room: {
      name: string;
      capacity?: number;
      cinema: {
        id?: number;
        name: string;
        address: string;
        phone?: string;
        cinemaType?: string;
      };
    };
    movie?: {
      title: string;
      posterUrl?: string;
    };
  };
  order?: {
    tickets: Array<{
      id: number;
      orderId: number;
      seatId: number;
      price: number;
      token: string;
      status: string;
      qrCodeUrl?: string;
      seat: {
        seatNumber: string;
        rowNumber: string;
        columnNumber: number;
        roomId: number;
        seatType: 'REGULAR' | 'VIP' | 'COUPLE';
        price: number;
      };
    }>;
    status: string;
    customerPhone?: string;
    customerAddress?: string;
  };
  tickets?: Array<{
    id: number;
    seat: {
      row: string;
      number: number;
      type: string;
    };
    price: number;
    status: string;
    qrCodeUrl?: string;
  }>;
}


const Profile: React.FC = () => {
  const { user: authUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Load user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        console.log('🎯 [Profile] Loading user profile...');
        
        const profileResponse = await userAPI.getProfile();
        console.log('🎯 [Profile] Profile loaded:', profileResponse.object?.email);
        setUserProfile(profileResponse.object);
        setEditedProfile(profileResponse.object);
      } catch (err) {
        setError('Không thể tải thông tin người dùng');
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchUserProfile();
    }
  }, [authUser]);

  // Load bookings separately - this will run after profile is loaded
  useEffect(() => {
    const loadBookings = async () => {
      if (!authUser?.email) {
        console.log('🎯 [Profile] No auth user email, skipping bookings load');
        return;
      }

      try {
        console.log('🎯 [Profile] Loading bookings for:', authUser.email);
        setBookingsLoading(true);
        
        // Primary: Use tickets-with-tokens API to get real ticket data
        try {
          console.log('🎯 [Profile] Trying tickets-with-tokens API...');
          const ticketsResponse = await bookingAPI.testTicketsWithTokens();
          console.log('🎯 [Profile] Tickets with tokens API response:', ticketsResponse);
          
          if (Array.isArray(ticketsResponse) && ticketsResponse.length > 0) {
            // Filter tickets by user email and convert to booking format
            const userTickets = ticketsResponse.filter(ticket => 
              ticket.order?.customerEmail === authUser.email
            );
            
            if (userTickets.length > 0) {
              const userBookings = userTickets.map((ticket: any) => ({
                id: ticket.id,
                customerName: ticket.order?.customerEmail?.split('@')[0] || 'Customer',
                customerEmail: ticket.order?.customerEmail || authUser.email,
                totalPrice: ticket.order?.totalPrice || ticket.price,
                paymentStatus: ticket.status,
                status: ticket.status,
                createdAt: ticket.createdAt,
                movie: {
                  title: 'Movie Title', // Will be filled from ticket data
                  posterUrl: ''
                },
                showtime: {
                  startTime: '00:00',
                  endTime: '00:00',
                  room: {
                    name: 'Room',
                    cinema: {
                      name: 'Cinema',
                      address: 'Address'
                    }
                  }
                },
                // Include real ticket data with token
                order: {
                  id: ticket.order?.id || ticket.id,
                  status: ticket.status,
                  totalPrice: ticket.order?.totalPrice || ticket.price,
                  customerEmail: ticket.order?.customerEmail || authUser.email,
                  customerName: ticket.order?.customerEmail?.split('@')[0] || 'Customer',
                  customerPhone: 'Chưa cập nhật',
                  customerAddress: 'Chưa cập nhật',
                  tickets: [{
                    id: ticket.id,
                    token: ticket.token,
                    price: ticket.price,
                    status: ticket.status,
                    qrCodeUrl: ticket.qrCodeUrl,
                    seat: ticket.seat
                  }]
                },
                tickets: [{
                  id: ticket.id,
                  token: ticket.token,
                  price: ticket.price,
                  status: ticket.status,
                  qrCodeUrl: ticket.qrCodeUrl,
                  seat: ticket.seat
                }]
              }))
              .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
              
              console.log('🎯 [Profile] Found user tickets with real tokens:', userBookings.length);
              console.log('🎯 [Profile] Sample ticket with token:', userBookings[0]);
              console.log('🎯 [Profile] Token from ticket:', userBookings[0]?.tickets?.[0]?.token);
              setBookings(userBookings);
              return;
            }
          }
        } catch (ticketsError) {
          console.log('🎯 [Profile] Tickets with tokens API failed, trying fallback APIs:', ticketsError);
        }
        
        // Secondary: Try test tickets API
        try {
          console.log('🎯 [Profile] Trying test tickets API...');
          const testTicketsResponse = await bookingAPI.testAdminTickets();
          console.log('🎯 [Profile] Test tickets response:', testTicketsResponse);
          
          if (Array.isArray(testTicketsResponse) && testTicketsResponse.length > 0) {
            const userBookings = testTicketsResponse
              .filter(ticket => ticket.customerEmail === authUser.email)
              .map(ticket => ({
                id: ticket.id,
                customerName: ticket.customerName || 'Customer',
                customerEmail: ticket.customerEmail,
                totalPrice: ticket.totalPrice || ticket.price,
                paymentStatus: ticket.status,
                status: ticket.status,
                createdAt: ticket.createdAt,
                movie: {
                  title: ticket.movieTitle || 'Unknown Movie',
                  posterUrl: ticket.moviePosterUrl
                },
                showtime: {
                  startTime: ticket.startTime,
                  endTime: ticket.endTime,
                  room: {
                    name: ticket.roomName || 'Room',
                    cinema: {
                      name: ticket.cinemaName || 'Cinema',
                      address: ticket.cinemaAddress || 'Address'
                    }
                  }
                },
                // Include token data if available
                order: {
                  id: ticket.id,
                  status: ticket.status,
                  totalPrice: ticket.totalPrice || ticket.price,
                  customerEmail: ticket.customerEmail,
                  customerName: ticket.customerName || 'Customer',
                  customerPhone: 'Chưa cập nhật',
                  customerAddress: 'Chưa cập nhật',
                  tickets: [{
                    id: ticket.id,
                    token: ticket.token || `TKT${ticket.id}`,
                    price: ticket.price,
                    status: ticket.status,
                    qrCodeUrl: ticket.qrCodeUrl,
                    seat: ticket.seat
                  }]
                },
                tickets: [{
                  id: ticket.id,
                  token: ticket.token || `TKT${ticket.id}`,
                  price: ticket.price,
                  status: ticket.status,
                  qrCodeUrl: ticket.qrCodeUrl,
                  seat: ticket.seat
                }]
              }))
              .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            
            console.log('🎯 [Profile] Found bookings from test tickets:', userBookings.length);
            setBookings(userBookings);
            return;
          }
        } catch (testTicketsError) {
          console.log('🎯 [Profile] Test tickets API failed, trying test bookings API:', testTicketsError);
        }
        
        // Tertiary: Fallback to test bookings API
        const testResponse = await bookingAPI.testAdminBookings();
        console.log('🎯 [Profile] Test bookings API response:', testResponse);
        
        if (Array.isArray(testResponse) && testResponse.length > 0) {
          const userBookings = testResponse
            .filter(booking => booking.customerEmail === authUser.email)
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          
          console.log('🎯 [Profile] Found bookings for user:', userBookings.length);
          console.log('🎯 [Profile] Bookings data:', userBookings);
            setBookings(userBookings);
          } else {
          console.log('🎯 [Profile] No bookings found');
            setBookings([]);
          }
        } catch (err) {
        console.error('🎯 [Profile] Error loading bookings:', err);
          setBookings([]);
      } finally {
        setBookingsLoading(false);
      }
    };

    // Add a small delay to ensure profile is loaded first
    const timer = setTimeout(() => {
      loadBookings();
    }, 100);

    return () => clearTimeout(timer);
  }, [authUser?.email]);

  // Force load bookings on component mount
  useEffect(() => {
    const forceLoadBookings = async () => {
      console.log('🎯 [Profile] Force loading bookings on mount...');
      
      try {
        // Try tickets API first
        try {
          const tokensResponse = await bookingAPI.testTicketsWithTokens();
          console.log('🎯 [Profile] Force load - tokens API response:', tokensResponse);
          
          if (Array.isArray(tokensResponse) && tokensResponse.length > 0) {
            if (authUser?.email) {
              const userBookings = tokensResponse
                .filter(ticket => ticket.order?.customerEmail === authUser.email)
                .map(ticket => ({
                  id: ticket.order?.id || ticket.id,
                  customerName: ticket.order?.customerEmail?.split('@')[0] || 'Customer',
                  customerEmail: ticket.order?.customerEmail || authUser.email,
                  totalPrice: ticket.order?.totalPrice || ticket.price,
                  paymentStatus: ticket.order?.status || ticket.status,
                  status: ticket.order?.status || ticket.status,
                  createdAt: ticket.createdAt,
                  movie: {
                    title: ticket.movieTitle || 'Unknown Movie',
                    posterUrl: ticket.moviePosterUrl
                  },
                  showtime: {
                    startTime: ticket.startTime,
                    endTime: ticket.endTime,
                    room: {
                      name: ticket.roomName || 'Room',
                      cinema: {
                        name: ticket.cinemaName || 'Cinema',
                        address: ticket.cinemaAddress || 'Address'
                      }
                    }
                  },
                  order: {
                    id: ticket.order?.id || ticket.id,
                    status: ticket.order?.status || ticket.status,
                    totalPrice: ticket.order?.totalPrice || ticket.price,
                    customerEmail: ticket.order?.customerEmail || authUser.email,
                    customerName: ticket.order?.customerEmail?.split('@')[0] || 'Customer',
                    customerPhone: 'Chưa cập nhật',
                    customerAddress: 'Chưa cập nhật',
                    tickets: [{
                      id: ticket.id,
                      token: ticket.token,
                      price: ticket.price,
                      status: ticket.status,
                      qrCodeUrl: ticket.qrCodeUrl,
                      seat: ticket.seat
                    }]
                  },
                  tickets: [{
                    id: ticket.id,
                    token: ticket.token,
                    price: ticket.price,
                    status: ticket.status,
                    qrCodeUrl: ticket.qrCodeUrl,
                    seat: ticket.seat
                  }]
                }))
                .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
              console.log('🎯 [Profile] Force load - filtered bookings:', userBookings.length);
              setBookings(userBookings);
            } else {
              console.log('🎯 [Profile] Force load - no auth user, skipping');
            }
            return;
          }
        } catch (tokenError) {
          console.log('🎯 [Profile] Force load - tokens API failed:', tokenError);
        }
        
        // Fallback to test bookings API
        const testResponse = await bookingAPI.testAdminBookings();
        console.log('🎯 [Profile] Force load - test API response:', testResponse);
        
        if (Array.isArray(testResponse) && testResponse.length > 0) {
          if (authUser?.email) {
            const userBookings = testResponse
              .filter(booking => booking.customerEmail === authUser.email)
              .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            console.log('🎯 [Profile] Force load - filtered bookings:', userBookings.length);
            setBookings(userBookings);
          } else {
            console.log('🎯 [Profile] Force load - showing all bookings:', testResponse.length);
            setBookings(testResponse);
          }
        } else {
          console.log('🎯 [Profile] Force load - no bookings found');
          setBookings([]);
        }
      } catch (err) {
        console.error('🎯 [Profile] Force load error:', err);
        setBookings([]);
      }
    };

    // Run after a short delay to ensure everything is loaded
    const timer = setTimeout(forceLoadBookings, 500);
    return () => clearTimeout(timer);
  }, []); // Empty dependency array - runs only on mount

  // Auto-refresh when page becomes visible (e.g., returning from payment)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && authUser) {
        // Refresh bookings when page becomes visible
        const refreshBookings = async () => {
          try {
            setBookingsLoading(true);
            console.log('🎯 [Profile] Visibility change - refreshing bookings...');
            
            // Sử dụng cùng strategy như handleRefreshBookings
            if (authUser?.email) {
              try {
                const testResponse = await bookingAPI.testAdminBookings();
                if (Array.isArray(testResponse) && testResponse.length > 0) {
                  const userBookings = testResponse
                    .filter(booking => booking.customerEmail === authUser.email)
                    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
              setBookings(userBookings);
                  return;
                }
              } catch (testError) {
                console.log('🎯 [Profile] Test API failed on visibility change:', testError);
              }
              
              // Fallback to tickets API
              if (authUser?.id) {
                try {
                  const ticketsResponse = await bookingAPI.getMyTickets(authUser.id);
                  if (Array.isArray(ticketsResponse) && ticketsResponse.length > 0) {
                    const sortedBookings = ticketsResponse
                      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                    setBookings(sortedBookings);
                    return;
                  }
                } catch (ticketsError) {
                  console.log('🎯 [Profile] Tickets API failed on visibility change:', ticketsError);
                }
              }
            }
          } catch (err) {
            console.log('Error refreshing bookings on visibility change:', err);
          } finally {
            setBookingsLoading(false);
          }
        };
        refreshBookings();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [authUser]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setEditedProfile(userProfile || {});
    }
  };

  const handleSave = async () => {
    if (!editedProfile) return;
    
    try {
      setSaveLoading(true);
      // Cast role to proper type
      const updateData = {
        ...editedProfile,
        role: editedProfile.role as 'USER' | 'ADMIN'
      };
      const response = await userAPI.updateProfile(authUser!.id, updateData);
      setUserProfile(response.object);
      updateUser(response.object);
      setEditMode(false);
      setError(null);
    } catch (err) {
      setError('Không thể cập nhật thông tin');
      console.error('Error updating profile:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (booking: any) => {
    const status = booking.paymentStatus || booking.status;
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
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (booking: any) => {
    // Ưu tiên paymentStatus, sau đó là status
    const status = booking.paymentStatus || booking.status;
    console.log('🎯 [Profile] Booking status mapping:', {
      id: booking.id,
      paymentStatus: booking.paymentStatus,
      status: booking.status,
      finalStatus: status
    });
    
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
      case 'processing':
        return 'Đang xử lý';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return status || 'Chờ thanh toán';
    }
  };

  const handleRefreshBookings = async () => {
    try {
      setBookingsLoading(true);
      console.log('🎯 [Profile] Refreshing bookings for user:', authUser?.email);
      
      // Primary: Sử dụng tickets-with-tokens API để lấy ticket data thực
      try {
        console.log('🎯 [Profile] Trying tickets-with-tokens API...');
        const ticketsResponse = await bookingAPI.testTicketsWithTokens();
        console.log('🎯 [Profile] Tickets with tokens API response:', ticketsResponse);
        
        if (Array.isArray(ticketsResponse) && ticketsResponse.length > 0) {
          // Filter tickets by user email
          const userTickets = ticketsResponse.filter(ticket => 
            ticket.order?.customerEmail === authUser?.email
          );
          
          if (userTickets.length > 0) {
            const userBookings = userTickets.map((ticket: any) => ({
                id: ticket.id,
                customerName: ticket.order?.customerEmail?.split('@')[0] || 'Customer',
                customerEmail: ticket.order?.customerEmail || authUser?.email,
                totalPrice: ticket.order?.totalPrice || ticket.price,
                paymentStatus: ticket.status,
                status: ticket.status,
                createdAt: ticket.createdAt,
                movie: {
                  title: 'Movie Title',
                  posterUrl: ''
                },
                showtime: {
                  startTime: '00:00',
                  endTime: '00:00',
                  room: {
                    name: 'Room',
                    cinema: {
                      name: 'Cinema',
                      address: 'Address'
                    }
                  }
                },
                // Include real ticket data with token
                order: {
                  id: ticket.order?.id || ticket.id,
                  status: ticket.status,
                  totalPrice: ticket.order?.totalPrice || ticket.price,
                  customerEmail: ticket.order?.customerEmail || authUser?.email,
                  customerName: ticket.order?.customerEmail?.split('@')[0] || 'Customer',
                  customerPhone: 'Chưa cập nhật',
                  customerAddress: 'Chưa cập nhật',
                  tickets: [{
                    id: ticket.id,
                    token: ticket.token,
                    price: ticket.price,
                    status: ticket.status,
                    qrCodeUrl: ticket.qrCodeUrl,
                    seat: ticket.seat
                  }]
                },
                tickets: [{
                  id: ticket.id,
                  token: ticket.token,
                  price: ticket.price,
                  status: ticket.status,
                  qrCodeUrl: ticket.qrCodeUrl,
                  seat: ticket.seat
                }]
              }))
              .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            
            console.log('🎯 [Profile] Found user tickets with real tokens:', userBookings.length);
            console.log('🎯 [Profile] Sample ticket with token:', userBookings[0]);
            setBookings(userBookings);
            return;
          }
        }
      } catch (ticketsError) {
        console.log('🎯 [Profile] Tickets with tokens API failed, trying fallback APIs:', ticketsError);
      }
        
      // Secondary: Fallback to test API
      try {
        console.log('🎯 [Profile] Trying test API for email:', authUser?.email);
        const testResponse = await bookingAPI.testAdminBookings();
        console.log('🎯 [Profile] Test API response:', testResponse);
        
        if (Array.isArray(testResponse) && testResponse.length > 0) {
          const userBookings = testResponse.filter(booking => 
              booking.customerEmail === authUser?.email
          );
          const sortedBookings = userBookings
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          console.log('🎯 [Profile] Filtered user bookings:', sortedBookings);
          setBookings(sortedBookings);
          return;
        }
      } catch (testError) {
        console.log('🎯 [Profile] Test API failed:', testError);
      }
      
      // Secondary: Fallback to tickets API (requires auth)
      if (authUser?.id) {
        try {
          console.log('🎯 [Profile] Fallback - trying tickets API for user ID:', authUser.id);
          const ticketsResponse = await bookingAPI.getMyTickets(authUser.id);
          console.log('🎯 [Profile] User tickets response:', ticketsResponse);
          
          if (Array.isArray(ticketsResponse) && ticketsResponse.length > 0) {
            const sortedBookings = ticketsResponse
              .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            console.log('🎯 [Profile] Sorted user tickets:', sortedBookings);
            setBookings(sortedBookings);
            return;
          }
        } catch (ticketsError) {
          console.log('🎯 [Profile] Tickets API failed:', ticketsError);
        }
      }
      
      // Tertiary: Fallback to user bookings API (requires auth)
      if (authUser?.id) {
        try {
          console.log('🎯 [Profile] Fallback - trying user bookings API for user ID:', authUser.id);
        const bookingsResponse = await bookingAPI.getUserBookings(authUser.id);
        console.log('🎯 [Profile] User bookings response:', bookingsResponse);
        
        if (Array.isArray(bookingsResponse) && bookingsResponse.length > 0) {
          const sortedBookings = bookingsResponse
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          console.log('🎯 [Profile] Sorted user bookings:', sortedBookings);
          setBookings(sortedBookings);
            return;
          }
        } catch (bookingsError) {
          console.log('🎯 [Profile] User bookings API failed:', bookingsError);
        }
      }
      
      // Final fallback: Try all bookings and filter
      try {
        console.log('🎯 [Profile] Final fallback - trying all bookings API...');
        const allBookingsResponse = await bookingAPI.getAll();
        console.log('🎯 [Profile] All bookings response:', allBookingsResponse);
        
        if (Array.isArray(allBookingsResponse) && allBookingsResponse.length > 0) {
          const userBookings = allBookingsResponse.filter(booking => 
            booking.customerEmail === authUser?.email
          );
          const sortedBookings = userBookings
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          console.log('🎯 [Profile] Filtered from all bookings:', sortedBookings);
          setBookings(sortedBookings);
          return;
        }
      } catch (allBookingsError) {
        console.log('🎯 [Profile] All bookings API failed:', allBookingsError);
      }
      
      // No data found
      console.log('🎯 [Profile] No bookings found from any API');
      setBookings([]);
      
    } catch (err) {
      console.error('❌ [Profile] Error refreshing bookings:', err);
      setError('Không thể tải lại danh sách vé');
    } finally {
      setBookingsLoading(false);
    }
  };

  // Function to generate QR code data - only token from database
  const generateQRCodeData = (booking: Booking, token?: string) => {
    // Use real token from database if available, otherwise use booking ID as fallback
    const bookingToken = token || `TKT${booking.id}`;
    
    // QR code chỉ chứa token đơn giản
    return bookingToken;
  };

  // Function to create QR code URL
  const createQRCodeUrl = (data: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
  };

  const handleViewBookingDetail = async (booking: Booking) => {
    try {
      console.log('🎯 [Profile] Fetching booking detail for ID:', booking.id);
      
      // Try to get detailed booking information using new API endpoint
      try {
      const response = await bookingAPI.getDetailsById(booking.id);
      console.log('🎯 [Profile] Booking detail response:', response);
      
      if (response.state === 'SUCCESS' && response.object) {
        console.log('✅ [Profile] Using detailed booking data from getDetailsById');
          
          // Check if we need to enhance QR code data
          const enhancedObject = { ...response.object };
          if (enhancedObject.order?.tickets && enhancedObject.order.tickets.length > 0) {
            enhancedObject.order.tickets = enhancedObject.order.tickets.map((ticket: any) => {
              if (!ticket.qrCodeUrl && ticket.token) {
                // Generate QR code with real token
                const qrData = generateQRCodeData({...enhancedObject, status: enhancedObject.status || 'UNKNOWN'}, ticket.token);
                ticket.qrCodeUrl = createQRCodeUrl(qrData);
              }
              return ticket;
            });
          }
          
          setSelectedBooking(enhancedObject);
        setShowBookingDetail(true);
          return;
        }
      } catch (detailError) {
        console.log('🎯 [Profile] Detailed API failed:', detailError);
      }
      
      // Fallback: Enhance basic booking data with real token from API
      console.log('⚠️ [Profile] Using enhanced basic booking info');
      
      // Try to get real token from tickets API
      let realToken = null;
      try {
        console.log('🎯 [Profile] Fetching real tokens from API...');
        const tokensResponse = await bookingAPI.testTicketsWithTokens();
        console.log('🎯 [Profile] Tokens response:', tokensResponse);
        
        if (tokensResponse && Array.isArray(tokensResponse) && tokensResponse.length > 0) {
          // Find token for this booking
          const matchingTicket = tokensResponse.find(ticket => 
            ticket.order?.customerEmail === booking.customerEmail || 
            ticket.order?.id === booking.id
          );
          if (matchingTicket && matchingTicket.token) {
            realToken = matchingTicket.token;
            console.log('✅ [Profile] Found real token:', realToken);
          }
        }
      } catch (tokenError) {
        console.log('🎯 [Profile] Could not fetch real tokens:', tokenError);
      }
      
      // Generate QR code with real token (similar to PaymentCallback)
      let qrCodeUrl = '';
      if (realToken) {
        // Use real token like PaymentCallback
        const qrData = `TICKET_${realToken}`;
        qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
        console.log('✅ [Profile] Generated QR with real token:', qrCodeUrl);
      } else {
        // Fallback to booking ID
        const qrData = `BOOKING_${booking.id}`;
        qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
        console.log('⚠️ [Profile] Generated QR with booking ID:', qrCodeUrl);
      }
      
      // Set QR code URL for display
      setQrCodeUrl(qrCodeUrl);
      
      const enhancedBooking = {
        ...booking,
        // Add mock order data if missing
        order: booking.order || {
          id: booking.id,
          status: booking.paymentStatus || booking.status || 'PAID',
          totalPrice: booking.totalPrice,
          customerEmail: booking.customerEmail,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone || 'Chưa cập nhật',
          customerAddress: booking.customerAddress || 'Chưa cập nhật',
          tickets: booking.tickets || []
        },
        // Add ticket data with real token if available
        tickets: booking.tickets || [
          {
            id: booking.id * 1000 + 1,
            orderId: booking.id,
            seatId: 1,
            price: booking.totalPrice || 0,
            token: realToken || `TKT${booking.id}`,
            status: booking.paymentStatus || booking.status || 'PAID',
            qrCodeUrl: qrCodeUrl,
            seat: {
              seatNumber: 'A1',
              rowNumber: 'A',
              columnNumber: 1,
              roomId: 1,
              seatType: 'REGULAR',
              price: booking.totalPrice || 0
            }
          }
        ]
      };
      
      console.log('🎯 [Profile] Enhanced booking data:', enhancedBooking);
      setSelectedBooking(enhancedBooking);
      setShowBookingDetail(true);
      
    } catch (error) {
      console.error('❌ [Profile] Error fetching booking detail:', error);
      // Final fallback with basic data
      setSelectedBooking(booking);
      setShowBookingDetail(true);
    }
  };

  const handleCloseBookingDetail = () => {
    setShowBookingDetail(false);
    setSelectedBooking(null);
  };

  const handleViewMore = () => {
    setShowAllBookings(!showAllBookings);
  };


  if (loading) return <LoadingSpinner />;

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Không thể tải thông tin người dùng</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Profile Information */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Thông tin tài khoản</h2>
            <button
              onClick={editMode ? handleSave : handleEditToggle}
              disabled={saveLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                editMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {saveLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : editMode ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <PencilIcon className="h-4 w-4" />
              )}
              <span>{editMode ? 'Lưu' : 'Chỉnh sửa'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="h-4 w-4 mr-2" />
                Họ và tên
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editedProfile.fullName || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, fullName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg">{userProfile.fullName}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="h-4 w-4 mr-2" />
                Tên đăng nhập
              </label>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-600">{userProfile.username}</p>
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Email
              </label>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-600">{userProfile.email}</p>
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Số điện thoại
              </label>
              {editMode ? (
                <input
                  type="tel"
                  value={editedProfile.phone || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập số điện thoại"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg">{userProfile.phone || 'Chưa cập nhật'}</p>
              )}
            </div>

            {/* Join Date */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Ngày tham gia
              </label>
              <p className="p-3 bg-gray-50 rounded-lg">{formatDate(userProfile.createdAt)}</p>
            </div>

            {/* Role */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Loại tài khoản
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  userProfile.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {userProfile.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                </span>
              </div>
            </div>
          </div>

          {editMode && (
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleEditToggle}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Hủy</span>
              </button>
            </div>
          )}
            </div>

            {/* User Stats Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Thống kê tài khoản
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {bookings.length}
                  </div>
                  <div className="text-sm text-gray-600">Vé đã đặt</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {bookings.filter(b => b.status?.toLowerCase() === 'paid').length}
                  </div>
                  <div className="text-sm text-gray-600">Đã thanh toán</div>
                </div>
              </div>
            </div>

            {/* Security Settings Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Bảo mật tài khoản
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Mật khẩu</p>
                    <p className="text-sm text-gray-600">Cập nhật lần cuối: 30 ngày trước</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Đổi mật khẩu
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Xác thực hai bước</p>
                    <p className="text-sm text-gray-600">Bảo vệ tài khoản tốt hơn</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Kích hoạt
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Thông báo email</p>
                    <p className="text-sm text-gray-600">Nhận thông báo về đơn hàng</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking History */}
          <div className="space-y-6">
            {/* Booking History */}
            <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <TicketIcon className="h-5 w-5 mr-2" />
              Lịch sử đặt vé
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {bookings.length} vé đã đặt
              </span>
              <button
                onClick={handleRefreshBookings}
                disabled={bookingsLoading}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                {bookingsLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Đang tải...</span>
                  </>
                ) : (
                  <span>Làm mới</span>
                )}
              </button>
              <button
                onClick={() => {
                  console.log('🎯 [Profile] Manual test button clicked');
                  console.log('🎯 [Profile] Current bookings state:', bookings);
                  console.log('🎯 [Profile] Auth user:', authUser);
                  handleRefreshBookings();
                }}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Test Load
              </button>
            </div>
          </div>

          {(() => { console.log('🎯 [Profile] Rendering bookings section, bookings.length:', bookings.length); return null; })()}
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {(showAllBookings ? bookings : bookings.slice(0, 5)).map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="font-medium text-gray-900">
                          Mã đặt vé: #{booking.id}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking)}`}>
                          {getStatusText(booking)}
                        </span>
                      </div>
                      
                      {/* Movie and Showtime Info */}
                      {booking.showtime && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {booking.showtime?.movie?.title || 'Phim đã đặt'}
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">
                            Rạp: {booking.showtime.room.cinema.name} - Phòng {booking.showtime.room.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Thời gian: {new Date(booking.showtime.startTime).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      )}
                      
                      {/* Tickets Info */}
                      {booking.tickets && booking.tickets.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Ghế đã chọn:</p>
                          <div className="flex flex-wrap gap-2">
                            {booking.tickets.map((ticket: any, index: number) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {ticket.seat.row}{ticket.seat.number} ({ticket.seat.type})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <p>Ngày đặt: {booking.createdAt ? formatDate(booking.createdAt) : 'N/A'}</p>
                          <p>Khách hàng: {booking.customerName}</p>
                        </div>
                        
                        {/* View Detail Button */}
                        <button
                          onClick={() => handleViewBookingDetail(booking)}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>Xem chi tiết</span>
                        </button>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-blue-600 mb-2">
                        {booking.totalPrice?.toLocaleString('vi-VN')}đ
                      </p>
                      {booking.tickets && (
                        <p className="text-sm text-gray-500">
                          {booking.tickets.length} vé
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {bookings.length > 5 && (
                <div className="text-center pt-4">
                  <button 
                    onClick={handleViewMore}
                    className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    {showAllBookings ? 'Thu gọn' : `Xem thêm ${bookings.length - 5} vé`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <TicketIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có vé nào được đặt
              </h3>
              <p className="text-gray-600 mb-4">
                Bạn chưa đặt vé nào. Hãy khám phá các bộ phim đang chiếu và đặt vé ngay!
              </p>
              <button 
                onClick={() => navigate('/movies')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Xem phim đang chiếu
              </button>
            </div>
          )}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Hành động nhanh
              </h2>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/movies')}
                  className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <TicketIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="font-medium">Đặt vé mới</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
                
                <button 
                  onClick={() => navigate('/cinemas')}
                  className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="font-medium">Xem rạp chiếu</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
                
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <CreditCardIcon className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="font-medium">Làm mới trang</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {showBookingDetail && selectedBooking && (
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
                  onClick={handleCloseBookingDetail}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <CloseIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Booking Info - Layout giống PaymentCallback */}
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
                      {selectedBooking?.movie?.posterUrl && (
                        <img
                          src={selectedBooking.movie.posterUrl}
                          alt="Movie Poster"
                          className="w-16 h-20 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {selectedBooking?.movie?.title || 'Phim đã đặt'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Mã vé: #{selectedBooking.id}
                        </div>
                        {selectedBooking?.movie?.genre && (
                          <div className="text-xs text-gray-400">
                            {selectedBooking.movie.genre}
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
                        {selectedBooking?.showtime?.startTime ? 
                          new Date(selectedBooking.showtime.startTime).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Ngày chiếu'
                        }
                      </div>
                      <div className="font-medium text-gray-900">
                        {selectedBooking?.showtime?.startTime ? 
                          new Date(selectedBooking.showtime.startTime).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '--:--'
                        } - {selectedBooking?.showtime?.endTime ? 
                          new Date(selectedBooking.showtime.endTime).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '--:--'
                        }
                      </div>
                      {selectedBooking?.movie?.duration && (
                        <div className="text-xs text-gray-500">
                          Thời lượng: {selectedBooking.movie.duration} phút
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
                        {selectedBooking?.showtime?.room?.cinema?.name || 'Rạp chiếu phim'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedBooking?.showtime?.room?.cinema?.address || 'Địa chỉ rạp chiếu'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Phòng: {selectedBooking?.showtime?.room?.name || 'Phòng chiếu'}
                      </div>
                      {selectedBooking?.showtime?.room?.cinema?.phone && (
                        <div className="text-xs text-gray-500">
                          Hotline: {selectedBooking.showtime.room.cinema.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ticket Information */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <TicketIcon className="h-5 w-5 mr-2 text-gray-600" />
                      Thông tin vé đã đặt ({(selectedBooking?.order?.tickets?.length || selectedBooking?.tickets?.length || 0)})
                    </h3>
                    {(selectedBooking?.order?.tickets && selectedBooking.order.tickets.length > 0) || 
                     (selectedBooking?.tickets && selectedBooking.tickets.length > 0) ? (
                      <div className="space-y-2">
                        {(selectedBooking.order?.tickets || selectedBooking.tickets || []).map((ticket: any) => {
                          const getStatusColor = (status: string) => {
                            switch (status?.toLowerCase()) {
                              case 'paid':
                                return 'bg-green-100 text-green-800';
                              case 'pending':
                                return 'bg-yellow-100 text-yellow-800';
                              case 'used':
                                return 'bg-blue-100 text-blue-800';
                              default:
                                return 'bg-gray-100 text-gray-800';
                            }
                          };

                          const getStatusText = (status: string) => {
                            switch (status?.toLowerCase()) {
                              case 'paid':
                                return 'Đã thanh toán';
                              case 'pending':
                                return 'Chờ thanh toán';
                              case 'used':
                                return 'Đã sử dụng';
                              default:
                                return 'Không xác định';
                            }
                          };

                          return (
                            <div 
                              key={ticket.id} 
                              className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0 bg-gray-50 rounded-lg p-3 mb-2"
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="font-bold text-gray-900 bg-blue-100 px-3 py-1 rounded-lg text-lg">
                                    {ticket.seat?.seatNumber || 'N/A'}
                                </span>
                                  <span className="text-sm text-gray-600 font-medium">
                                    {ticket.seat?.seatType === 'VIP' ? 'VIP' : 
                                     ticket.seat?.seatType === 'COUPLE' ? 'Ghế đôi' : 
                                     ticket.seat?.seatType === 'REGULAR' ? 'Ghế thường' : 'Ghế'}
                                </span>
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(ticket.status)}`}>
                                    {getStatusText(ticket.status)}
                                  </span>
                              </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                  <div>
                                    <span className="font-medium">Token:</span>
                                    <div className="font-mono text-xs bg-white p-1 rounded border mt-1 break-all">
                                      {ticket.token || 'N/A'}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Giá vé:</span>
                                    <div className="font-bold text-green-600">
                                      {ticket.price ? ticket.price.toLocaleString('vi-VN') + 'đ' : 'N/A'}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Trạng thái sử dụng:</span>
                                    <div className={ticket.isUsed ? 'text-red-600' : 'text-green-600'}>
                                      {ticket.isUsed ? 'Đã sử dụng' : 'Chưa sử dụng'}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Ngày tạo:</span>
                                    <div>
                                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        <div className="pt-2 mt-2 border-t">
                          <div className="flex justify-between items-center font-medium">
                            <span>Tổng cộng:</span>
                            <span className="text-lg text-blue-600">
                              {(selectedBooking.order?.tickets || selectedBooking.tickets || []).reduce((sum: number, ticket: any) => {
                                return sum + (ticket.price || 0);
                              }, 0).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>
                        
                        {/* Thông tin vé theo TicketStatus */}
                        <div className="pt-2 mt-2 border-t bg-blue-50 p-3 rounded">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <TicketIcon className="h-4 w-4 mr-1" />
                            Trạng thái vé theo TicketStatus
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                            <div className="bg-white p-2 rounded border">
                              <div className="font-medium text-gray-700">PENDING</div>
                              <div className="text-yellow-600">Chờ thanh toán</div>
                            </div>
                            <div className="bg-white p-2 rounded border">
                              <div className="font-medium text-gray-700">PAID</div>
                              <div className="text-green-600">Đã thanh toán</div>
                            </div>
                            <div className="bg-white p-2 rounded border">
                              <div className="font-medium text-gray-700">USED</div>
                              <div className="text-blue-600">Đã sử dụng</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Thông tin thêm về booking */}
                        <div className="pt-2 mt-2 border-t bg-gray-50 p-3 rounded">
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Mã booking:</span>
                              <span className="font-medium">#{selectedBooking.id}</span>
                            </div>
                            {selectedBooking.totalPrice && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tổng thanh toán:</span>
                                <span className="font-medium">{selectedBooking.totalPrice.toLocaleString('vi-VN')}đ</span>
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
                          Booking #{selectedBooking.id} - Tổng: {selectedBooking.totalPrice?.toLocaleString('vi-VN')}đ
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
                  {/* QR Code - Similar to PaymentCallback */}
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
                          {selectedBooking.customerName}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium text-gray-900 break-words">
                          {selectedBooking.customerEmail}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Số điện thoại</div>
                        <div className="font-medium text-gray-900">
                          {(selectedBooking as any).customerPhone || selectedBooking.order?.customerPhone || 'Chưa cập nhật'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Địa chỉ</div>
                        <div className="font-medium text-gray-900">
                          {(selectedBooking as any).customerAddress || selectedBooking.order?.customerAddress || 'Chưa cập nhật'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Trạng thái</div>
                        <div className="font-medium">
                          <span className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(selectedBooking)}`}>
                            {getStatusText(selectedBooking)}
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
                  onClick={handleCloseBookingDetail}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
