import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { movieAPI, roomAPI, seatAPI, cinemaAPI, showtimeAPI } from '../services/api';
import { couponAPI } from '../services/couponApi';
import { eventAPI } from '../services/eventApi';
import type { Movie, Showtime, Cinema, Room } from '../types/movie';
import type { Seat } from '../types/booking';
import type { Coupon } from '../types/coupon';
import type { Event } from '../types/event';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ClockIcon, 
  MapPinIcon,
  BuildingOfficeIcon,
  FilmIcon,
  TagIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
const Booking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  // Get showtime from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedShowtimeId = urlParams.get('showtime');
  const [movie, setMovie] = useState<Movie | null>(null);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  
  // Event states
  const [activeEvents, setActiveEvents] = useState<Event[]>([]);
  const [appliedEvent, setAppliedEvent] = useState<Event | null>(null);
  const [eventDiscountAmount, setEventDiscountAmount] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Fetch movie details
        const movieResponse = await movieAPI.getById(parseInt(id));
        if (movieResponse.state === 'SUCCESS' && movieResponse.object) {
          setMovie(movieResponse.object);
        } else if (movieResponse.state === '200' && movieResponse.object) {
          setMovie(movieResponse.object);
        } else {
          throw new Error('Failed to load movie details');
        }
        // Fetch cinemas from API
        try {
          const cinemasResponse = await cinemaAPI.getAll();
          if (cinemasResponse.state === 'SUCCESS' && cinemasResponse.object) {
            setCinemas(cinemasResponse.object as any);
          } else if (cinemasResponse.state === '200' && cinemasResponse.object) {
            setCinemas(cinemasResponse.object as any);
          } else {
            throw new Error('Failed to load cinemas');
          }
        } catch {
          throw new Error('Failed to load cinemas');
        }
        
        // Fetch active events
        try {
          const eventsResponse = await eventAPI.getCurrent();
          if (eventsResponse.state === 'SUCCESS' && eventsResponse.object) {
            setActiveEvents(eventsResponse.object as any);
          } else if (eventsResponse.state === '200' && eventsResponse.object) {
            setActiveEvents(eventsResponse.object as any);
          }
        } catch (error) {
          console.warn('Failed to load events:', error);
          setActiveEvents([]);
        }
        // Auto-select cinema and showtime if preselected
        if (preselectedShowtimeId && cinemas.length > 0) {
          const cinema = cinemas[0]; // Auto-select first cinema
          setSelectedCinema(cinema);
          // Fetch rooms from database for selected cinema
          try {
            const roomsResponse = await roomAPI.getByCinema(cinema.id);
            if (roomsResponse.state === 'SUCCESS' && roomsResponse.object) {
              setRooms(roomsResponse.object as any);
              // Auto-select room 1 (phòng 1)
              const room1 = roomsResponse.object.find(room => room.id === 1) || roomsResponse.object[0];
              setSelectedRoom(room1 as any);
              // Fetch showtimes for the movie from API
              const showtimesResponse = await showtimeAPI.getByMovieId(parseInt(id!));
              if ((showtimesResponse.state === 'SUCCESS' || showtimesResponse.state === '200') && showtimesResponse.object) {
                // Filter showtimes to only show those with endTime > now
                const now = new Date();
                const availableShowtimes = showtimesResponse.object.filter(showtime => {
                  const endTime = new Date(showtime.endTime);
                  return endTime > now;
                });
                
                setShowtimes(availableShowtimes);
                console.log(`Filtered ${availableShowtimes.length} available showtimes out of ${showtimesResponse.object.length} total`);
                
                // Auto-select the preselected showtime ONLY if it exists in the filtered response
                const selectedShowtime = availableShowtimes.find(st => st.id === parseInt(preselectedShowtimeId));
                if (selectedShowtime) {
                  console.log('✅ Found preselected showtime from API:', selectedShowtime);
                  setSelectedShowtime(selectedShowtime);
                  // Fetch seats from database for room 1
                  await loadSeatsFromDatabase(room1.id, selectedShowtime.id);
                } else {
                  console.log('❌ Preselected showtime ID', preselectedShowtimeId, 'not found in available showtimes');
                  console.log('Available showtime IDs:', availableShowtimes.map(st => st.id));
                  setError(`Suất chiếu ID ${preselectedShowtimeId} đã kết thúc hoặc không còn tồn tại. Vui lòng chọn suất chiếu khác từ danh sách bên dưới.`);
                }
              }
            }
          } catch {
            throw new Error('Failed to load rooms and showtimes');
          }
        }
      } catch {
        setError('Không thể tải thông tin đặt vé. Vui lòng kiểm tra kết nối mạng và thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, preselectedShowtimeId]);
  // Auto refresh seat data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedShowtime && selectedRoom) {
        refreshSeatData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Also refresh when window gains focus
    const handleFocus = () => {
      if (selectedShowtime && selectedRoom) {
        refreshSeatData();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [selectedShowtime, selectedRoom]);
  const handleCinemaSelect = async (cinema: Cinema) => {
    setSelectedCinema(cinema);
    setSelectedRoom(null);
    setSelectedShowtime(null);
    setSeats([]);
    setSelectedSeats([]);
    // Fetch rooms for selected cinema from API
    try {
      const roomsResponse = await roomAPI.getByCinema(cinema.id);
      if (roomsResponse.state === 'SUCCESS' && roomsResponse.object) {
        setRooms(roomsResponse.object as any);
      } else {
        setError('Không thể tải danh sách phòng chiếu');
      }
    } catch {
      setError('Lỗi khi tải danh sách phòng chiếu');
    }
  };
  const handleRoomSelect = async (room: Room) => {
    setSelectedRoom(room);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setSeats([]);
    // Fetch showtimes for the movie and room from API
    try {
      const showtimesResponse = await showtimeAPI.getByMovieAndRoom(parseInt(id!), room.id);
      if ((showtimesResponse.state === 'SUCCESS' || showtimesResponse.state === '200') && showtimesResponse.object) {
        // Filter showtimes to only show those with endTime > now
        const now = new Date();
        const availableShowtimes = showtimesResponse.object.filter(showtime => {
          const endTime = new Date(showtime.endTime);
          return endTime > now;
        });
        
        setShowtimes(availableShowtimes);
        console.log(`Filtered ${availableShowtimes.length} available showtimes for room ${room.id} out of ${showtimesResponse.object.length} total`);
        
        if (availableShowtimes.length === 0) {
          setError('Không có suất chiếu nào còn khả dụng cho phòng này');
        }
      } else {
        setError('Không thể tải danh sách suất chiếu');
      }
    } catch {
      setError('Lỗi khi tải danh sách suất chiếu');
    }
  };
  const handleShowtimeSelect = async (showtime: Showtime) => {
    // Validate that the showtime hasn't ended
    const now = new Date();
    const endTime = new Date(showtime.endTime);
    
    if (endTime <= now) {
      setError('Suất chiếu này đã kết thúc. Vui lòng chọn suất chiếu khác.');
      return;
    }
    
    setSelectedShowtime(showtime);
    setSelectedSeats([]);
    // Load seats for the selected showtime and room
    if (showtime.roomId) {
      await loadSeatsFromDatabase(showtime.roomId, showtime.id);
    } else if (showtime.room?.id) {
      await loadSeatsFromDatabase(showtime.room.id, showtime.id);
    } else {
      setError('Không thể tải thông tin ghế');
    }
  };
  const loadSeatsFromDatabase = async (roomId: number, showtimeId: number) => {
    try {
      // Fetch seat availability for the specific showtime and room
      const seatsResponse = await seatAPI.getSeatAvailability(showtimeId, roomId);
      if ((seatsResponse.state === 'SUCCESS' || seatsResponse.state === '200') && seatsResponse.object) {
        // Ensure seats have proper status for display
        const seatsWithStatus = seatsResponse.object.map(seat => ({
          ...seat,
          status: seat.status || 'AVAILABLE' as const,
          // Ensure seatNumber is properly formatted
          seatNumber: seat.seatNumber || `${seat.rowNumber}${seat.columnNumber}`
        }));
        setSeats(seatsWithStatus as any);
      } else {
        // Fallback: fetch all seats for the room and mark as available
        const roomSeatsResponse = await seatAPI.getByRoom(roomId);
        if ((roomSeatsResponse.state === 'SUCCESS' || roomSeatsResponse.state === '200') && roomSeatsResponse.object) {
          const seatsWithStatus = roomSeatsResponse.object.map((seat: any) => ({
            ...seat,
            status: seat.status || 'AVAILABLE' as const,
            // Ensure seatNumber is properly formatted
            seatNumber: seat.seatNumber || `${seat.rowNumber}${seat.columnNumber}`
          }));
          setSeats(seatsWithStatus as any);
        } else {
          throw new Error('Failed to load seats');
        }
      }
    } catch {
      throw new Error('Failed to load seats');
    }
  };
  const handleSeatSelect = (seat: Seat) => {
    // Don't allow selection of booked, reserved, or maintenance seats
    if (seat.status === 'BOOKED' || seat.status === 'RESERVED' || seat.status === 'MAINTENANCE') return;
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };
  const getSeatColor = (seat: Seat) => {
    // Check if seat is selected
    if (selectedSeats.some(s => s.id === seat.id)) {
      return 'bg-blue-500 text-white border-2 border-blue-600';
    }
    // Check seat status first
    switch (seat.status) {
      case 'BOOKED':
        return 'bg-red-600 text-white cursor-not-allowed opacity-80 border-2 border-red-700';
      case 'RESERVED':
        return 'bg-orange-500 text-white cursor-not-allowed opacity-80 border-2 border-orange-600';
      case 'MAINTENANCE':
        return 'bg-gray-500 text-white cursor-not-allowed opacity-60 border-2 border-gray-600';
      case 'AVAILABLE':
      default:
        // Color by seat type for available seats
        switch (seat.seatType) {
          case 'VIP':
            return 'bg-yellow-400 hover:bg-yellow-500 text-gray-800 cursor-pointer border border-yellow-500';
          case 'COUPLE':
            return 'bg-purple-400 hover:bg-purple-500 text-white cursor-pointer border border-purple-500';
          case 'REGULAR':
          default:
            return 'bg-green-400 hover:bg-green-500 text-white cursor-pointer border border-green-500';
        }
    }
  };
  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => {
      // Use seat price from database, fallback to seat type pricing
      const seatPrice = seat.price || getSeatTypePrice(seat.seatType);
      return total + seatPrice;
    }, 0);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    const totalAmount = calculateTotal();
    if (totalAmount < appliedCoupon.minimumOrderAmount) return 0;
    
    let discount = 0;
    if (appliedCoupon.type === 'PERCENTAGE') {
      discount = totalAmount * (appliedCoupon.discountValue / 100);
    } else if (appliedCoupon.type === 'FIXED_AMOUNT') {
      discount = appliedCoupon.discountValue;
    }
    
    // Apply maximum discount limit
    if (appliedCoupon.maximumDiscountAmount && discount > appliedCoupon.maximumDiscountAmount) {
      discount = appliedCoupon.maximumDiscountAmount;
    }
    
    return discount;
  };


  const calculateFinalTotal = () => {
    const couponDiscount = calculateDiscount();
    return calculateTotal() - couponDiscount - eventDiscountAmount;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã coupon');
      return;
    }

    if (!user) {
      setCouponError('Vui lòng đăng nhập để sử dụng coupon');
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError('');
      
      const totalAmount = calculateTotal();
      const validation = await couponAPI.validate(couponCode, totalAmount, parseInt(user.id));
      
      if (validation.object?.valid) {
        setAppliedCoupon(validation.object.coupon);
        setCouponError('');
      } else {
        setCouponError(validation.object?.message || 'Coupon không hợp lệ');
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError('Không thể validate coupon. Vui lòng thử lại.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Calculate event discount when selectedSeats or activeEvents change
  useEffect(() => {
    if (selectedSeats.length > 0 && activeEvents.length > 0) {
      const totalAmount = selectedSeats.reduce((total, seat) => {
        // Use seat price from database, fallback to seat type pricing
        const seatPrice = seat.price || (() => {
          const basePrice = movie?.price || 80000;
          switch (seat.seatType) {
            case 'VIP':
              return basePrice * 1.5;
            case 'COUPLE':
              return basePrice * 2;
            case 'REGULAR':
            default:
              return basePrice;
          }
        })();
        return total + seatPrice;
      }, 0);
      
      let bestDiscount = 0;
      let bestEvent = null;
      
      for (const event of activeEvents) {
        if (totalAmount >= event.minimumOrderAmount) {
          let discount = totalAmount * (event.discountPercentage / 100);
          
          // Apply maximum discount limit
          if (event.maximumDiscountAmount && discount > event.maximumDiscountAmount) {
            discount = event.maximumDiscountAmount;
          }
          
          if (discount > bestDiscount) {
            bestDiscount = discount;
            bestEvent = event;
          }
        }
      }
      
      // Update applied event
      if (bestEvent && bestDiscount > 0) {
        setAppliedEvent(bestEvent);
        setEventDiscountAmount(bestDiscount);
      } else {
        setAppliedEvent(null);
        setEventDiscountAmount(0);
      }
    } else {
      setAppliedEvent(null);
      setEventDiscountAmount(0);
    }
  }, [selectedSeats, activeEvents, movie?.price]);
  const getSeatTypePrice = (seatType: string) => {
    const basePrice = movie?.price || 80000;
    switch (seatType) {
      case 'VIP':
        return basePrice * 1.5;
      case 'COUPLE':
        return basePrice * 2;
      case 'REGULAR':
      default:
        return basePrice;
    }
  };
  const handleBooking = async () => {
    if (!selectedShowtime || selectedSeats.length === 0) {
      setError('Vui lòng chọn suất chiếu và ghế');
      return;
    }
    if (!user) {
      setError('Vui lòng đăng nhập để đặt vé');
      return;
    }
    
    // Validate that the showtime hasn't ended
    const now = new Date();
    const endTime = new Date(selectedShowtime.endTime);
    
    if (endTime <= now) {
      setError('Suất chiếu này đã kết thúc. Vui lòng chọn suất chiếu khác.');
      return;
    }
    // Validate selected seats have proper data
    const validatedSeats = selectedSeats.map(seat => ({
      ...seat,
      // Ensure seat has all required properties
      id: seat.id,
      seatNumber: seat.seatNumber,
      rowNumber: seat.rowNumber,
      columnNumber: seat.columnNumber,
      seatType: seat.seatType,
      price: seat.price || getSeatTypePrice(seat.seatType),
      status: seat.status || 'AVAILABLE'
    }));
    // Always navigate to booking form for payment
    navigate('/booking-form', {
      state: {
        movie,
        showtime: selectedShowtime,
        selectedSeats: validatedSeats,
        totalPrice: calculateTotal(),
        appliedCoupon: appliedCoupon,
        discountAmount: calculateDiscount(),
        appliedEvent: appliedEvent,
        eventDiscountAmount: eventDiscountAmount,
        finalTotal: calculateFinalTotal()
      }
    });
  };
  // Function to refresh seat data
  const refreshSeatData = async () => {
    if (selectedShowtime && selectedRoom) {
      try {
        await loadSeatsFromDatabase(selectedRoom.id, selectedShowtime.id);
      } catch {
        // Ignore refresh errors
      }
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
          <button
            onClick={() => navigate('/movies')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Quay lại danh sách phim
          </button>
        </div>
      </div>
    );
  }
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Movie Info */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center space-x-6">
              {movie.posterUrl && (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-24 h-32 object-cover rounded-lg"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {movie.title}
                </h1>
                <p className="text-gray-600 mb-4">{movie.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                  </span>
                  <span className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {movie.genre}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cinema, Room, and Showtime Selection */}
            <div className="lg:col-span-2">
              {/* Cinema Selection */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <BuildingOfficeIcon className="h-6 w-6 mr-2" />
                  Chọn rạp chiếu
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cinemas.map((cinema) => (
                    <button
                      key={cinema.id}
                      onClick={() => handleCinemaSelect(cinema)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        selectedCinema?.id === cinema.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{cinema.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{cinema.address}</div>
                      <div className="text-xs text-gray-500 mt-1">{cinema.phone}</div>
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-2 inline-block">
                        {cinema.cinemaType}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Room Selection */}
              {selectedCinema && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FilmIcon className="h-6 w-6 mr-2" />
                    Chọn phòng chiếu
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {rooms.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => handleRoomSelect(room)}
                        className={`p-4 border rounded-lg text-center transition-colors ${
                          selectedRoom?.id === room.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">{room.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{room.capacity} ghế</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Showtime Selection */}
              {selectedRoom && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Chọn suất chiếu
                    </h2>
                    <div className="text-sm text-gray-500">
                      Chỉ hiển thị suất chiếu còn khả dụng
                    </div>
                  </div>
                {showtimes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {showtimes.map((showtime) => {
                      const now = new Date();
                      const endTime = new Date(showtime.endTime);
                      const isEnded = endTime <= now;
                      
                      return (
                        <button
                          key={showtime.id}
                          onClick={() => handleShowtimeSelect(showtime)}
                          disabled={isEnded}
                          className={`p-4 border rounded-lg text-left transition-colors ${
                            isEnded
                              ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                              : selectedShowtime?.id === showtime.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {new Date(showtime.startTime).toLocaleDateString('vi-VN')}
                              </div>
                              <div className="text-sm text-gray-600">
                                {new Date(showtime.startTime).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })} - {new Date(showtime.endTime).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              {isEnded && (
                                <div className="text-xs text-red-600 font-medium mt-1">
                                  Đã kết thúc
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                {showtime.room?.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {showtime.room?.capacity} ghế
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">
                      Không có suất chiếu nào còn khả dụng
                    </p>
                    <p className="text-sm text-gray-400">
                      Tất cả suất chiếu đã kết thúc hoặc chưa có lịch chiếu
                    </p>
                  </div>
                )}
                </div>
              )}
              {/* Seat Selection */}
              {selectedShowtime && (
                <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Chọn ghế
                    </h2>
                    <button
                      onClick={refreshSeatData}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Làm mới
                    </button>
                  </div>
                  {/* Seat Legend */}
                  <div className="flex items-center space-x-6 mb-6 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-400 rounded mr-2"></div>
                      <span>Ghế thường</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
                      <span>Ghế VIP</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-pink-400 rounded mr-2"></div>
                      <span>Ghế đôi</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-600 rounded mr-2 border border-red-700"></div>
                      <span>Đã đặt</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                      <span>Đang chọn</span>
                    </div>
                  </div>
                  {/* Screen */}
                  <div className="mb-8">
                    <div className="bg-gray-800 text-white text-center py-2 rounded-lg mb-4">
                      MÀN HÌNH
                    </div>
                  </div>
                  {/* Seat Map */}
                  <div className="space-y-2">
                    {seats.length > 0 ? (
                      <div className="max-w-4xl mx-auto">
                        {/* Seat Legend */}
                        <div className="flex justify-center gap-6 mb-6 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span>Có thể chọn</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded"></div>
                            <span>Đã chọn</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-600 rounded border border-red-700"></div>
                            <span>Đã đặt</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                            <span>VIP</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-purple-500 rounded"></div>
                            <span>Couple</span>
                          </div>
                        </div>
                        {/* Group seats by row */}
                        {Array.from(new Set(seats.map(seat => seat.rowNumber))).sort().map(row => (
                          <div key={row} className="flex items-center justify-center mb-2">
                            <div className="w-8 text-center font-medium text-gray-600 mr-4">
                              {row}
                            </div>
                            <div className="flex gap-1">
                              {seats
                                .filter(seat => seat.rowNumber === row)
                                .sort((a, b) => a.columnNumber - b.columnNumber)
                                .map((seat) => (
                                  <button
                                    key={seat.id}
                                    onClick={() => handleSeatSelect(seat)}
                                    disabled={seat.status === 'OCCUPIED' || seat.status === 'BOOKED'}
                                    className={`w-10 h-10 rounded text-xs font-medium transition-colors ${getSeatColor(seat)} flex items-center justify-center hover:scale-105`}
                                    title={`Ghế ${seat.seatNumber} - ${seat.seatType} - ${seat.price?.toLocaleString('vi-VN') || 'N/A'}đ - ID: ${seat.id}`}
                                  >
                                    {seat.columnNumber}
                                  </button>
                                ))}
                            </div>
                          </div>
                        ))}
                        {/* Display total seats info */}
                        <div className="text-center mt-4 text-sm text-gray-600">
                          Tổng số ghế: {seats.length} | 
                          Ghế trống: {seats.filter(s => s.status === 'AVAILABLE').length} | 
                          Ghế đã đặt: {seats.filter(s => s.status === 'BOOKED' || s.status === 'OCCUPIED').length}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-500">
                          <p>Không thể tải thông tin ghế</p>
                          <p className="text-sm mt-2">Vui lòng thử lại sau</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Tóm tắt đặt vé
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Phim</div>
                    <div className="font-medium">{movie.title}</div>
                  </div>
                  {selectedShowtime && (
                    <div>
                      <div className="text-sm text-gray-600">Suất chiếu</div>
                      <div className="font-medium">
                        {new Date(selectedShowtime.startTime).toLocaleString('vi-VN')}
                      </div>
                      <div className="text-xs text-gray-500">
                        Kết thúc: {new Date(selectedShowtime.endTime).toLocaleString('vi-VN')}
                      </div>
                      {(() => {
                        const now = new Date();
                        const endTime = new Date(selectedShowtime.endTime);
                        const isEnded = endTime <= now;
                        return isEnded ? (
                          <div className="text-xs text-red-600 font-medium mt-1">
                            ⚠️ Suất chiếu đã kết thúc
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-600">Ghế đã chọn ({selectedSeats.length})</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedSeats.length > 0 ? (
                        selectedSeats.map((seat) => (
                          <div key={seat.id} className="flex justify-between text-sm py-1">
                            <span className="flex items-center gap-2">
                              <span className="font-medium">{seat.seatNumber}</span>
                              <span className="text-xs text-gray-500">
                                ({seat.seatType === 'VIP' ? 'VIP' : 
                                  seat.seatType === 'COUPLE' ? 'Ghế đôi' : 'Ghế thường'})
                              </span>
                            </span>
                            <span className="font-medium">
                              {(seat.price || getSeatTypePrice(seat.seatType)).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 italic">Chưa chọn ghế nào</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Coupon Section */}
                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600 mb-3">Mã giảm giá</div>
                    
                    {!appliedCoupon ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Nhập mã coupon"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={couponLoading || !couponCode.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {couponLoading ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <TagIcon className="w-4 h-4" />
                            )}
                            Áp dụng
                          </button>
                        </div>
                        {couponError && (
                          <div className="text-red-500 text-xs flex items-center gap-1">
                            <XMarkIcon className="w-3 h-3" />
                            {couponError}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckIcon className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              {appliedCoupon.code} - {appliedCoupon.name}
                            </span>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          {appliedCoupon.type === 'PERCENTAGE' 
                            ? `Giảm ${appliedCoupon.discountValue}%`
                            : `Giảm ${appliedCoupon.discountValue.toLocaleString('vi-VN')}đ`
                          }
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Tạm tính</span>
                      <span>{calculateTotal().toLocaleString('vi-VN')}đ</span>
                    </div>
                    {appliedCoupon && calculateDiscount() > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span className="flex items-center gap-1">
                          <TagIcon className="w-4 h-4" />
                          Giảm giá Coupon ({appliedCoupon.code})
                        </span>
                        <span>-{calculateDiscount().toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}
                    {appliedEvent && eventDiscountAmount > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span className="flex items-center gap-1">
                          <FilmIcon className="w-4 h-4" />
                          Giảm giá Sự kiện ({appliedEvent.name})
                        </span>
                        <span>-{eventDiscountAmount.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Tổng cộng</span>
                      <span>{calculateFinalTotal().toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                  <button
                    onClick={handleBooking}
                    disabled={!selectedShowtime || selectedSeats.length === 0 || (selectedShowtime && new Date(selectedShowtime.endTime) <= new Date())}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {selectedShowtime && new Date(selectedShowtime.endTime) <= new Date() 
                      ? 'Suất chiếu đã kết thúc' 
                      : 'Xác nhận và thanh toán'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};
export default Booking;
