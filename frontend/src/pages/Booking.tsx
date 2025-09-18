import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { movieAPI, roomAPI, seatAPI, cinemaAPI, showtimeAPI } from '../services/api';
import type { Movie, Showtime, Cinema, Room } from '../types/movie';
import type { Seat } from '../types/booking';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ClockIcon, 
  MapPinIcon,
  BuildingOfficeIcon,
  FilmIcon
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
            setCinemas(cinemasResponse.object);
          } else if (cinemasResponse.state === '200' && cinemasResponse.object) {
            setCinemas(cinemasResponse.object);
          } else {
            throw new Error('Failed to load cinemas');
          }
        } catch (error) {
          console.error('Error fetching cinemas:', error);
          throw new Error('Failed to load cinemas');
        }
        
        // Auto-select cinema and showtime if preselected
        if (preselectedShowtimeId && cinemas.length > 0) {
          const cinema = cinemas[0]; // Auto-select first cinema
          setSelectedCinema(cinema);
          
          // Fetch rooms from database for selected cinema
          try {
            const roomsResponse = await roomAPI.getByCinema(cinema.id);
            if (roomsResponse.state === 'SUCCESS' && roomsResponse.object) {
              setRooms(roomsResponse.object);
              // Auto-select room 1 (phòng 1)
              const room1 = roomsResponse.object.find(room => room.id === 1) || roomsResponse.object[0];
              setSelectedRoom(room1);
              
              // Fetch showtimes for the movie from API
              const showtimesResponse = await showtimeAPI.getByMovieId(parseInt(id!));
              if (showtimesResponse.state === 'SUCCESS' && showtimesResponse.object) {
                setShowtimes(showtimesResponse.object);
                // Auto-select the preselected showtime
                const selectedShowtime = showtimesResponse.object.find(st => st.id === parseInt(preselectedShowtimeId));
                if (selectedShowtime) {
                  setSelectedShowtime(selectedShowtime);
                  
                  // Fetch seats from database for room 1
                  await loadSeatsFromDatabase(room1.id, selectedShowtime.id);
                }
              }
            }
          } catch (error) {
            console.error('Error fetching rooms/showtimes:', error);
            throw new Error('Failed to load rooms and showtimes');
          }
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải thông tin đặt vé. Vui lòng kiểm tra kết nối mạng và thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, preselectedShowtimeId]);

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
        setRooms(roomsResponse.object);
      } else {
        setError('Không thể tải danh sách phòng chiếu');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Lỗi khi tải danh sách phòng chiếu');
    }
  };

  const handleRoomSelect = async (room: Room) => {
    setSelectedRoom(room);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setSeats([]);
    
    // Fetch showtimes for the movie from API
    try {
      console.log('Fetching showtimes for movieId:', id, 'roomId:', room.id);
      const showtimesResponse = await showtimeAPI.getByMovieId(parseInt(id!));
      console.log('Showtimes response:', showtimesResponse);
      
      if (showtimesResponse.state === 'SUCCESS' && showtimesResponse.object) {
        console.log('All showtimes:', showtimesResponse.object);
        // Filter showtimes for the selected room
        const roomShowtimes = showtimesResponse.object.filter(st => {
          console.log('Checking showtime:', st, 'roomId:', st.room?.id, 'expected:', room.id);
          return st.room?.id === room.id;
        });
        console.log('Filtered showtimes for room:', roomShowtimes);
        setShowtimes(roomShowtimes);
      } else {
        console.error('Failed to fetch showtimes:', showtimesResponse);
        setError('Không thể tải danh sách suất chiếu');
      }
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      setError('Lỗi khi tải danh sách suất chiếu');
    }
  };

  const handleShowtimeSelect = async (showtime: Showtime) => {
    console.log('Selected showtime:', showtime);
    setSelectedShowtime(showtime);
    setSelectedSeats([]);
    
    // Load seats for the selected showtime and room
    if (showtime.roomId) {
      console.log('Loading seats for showtime roomId:', showtime.roomId);
      await loadSeatsFromDatabase(showtime.roomId, showtime.id);
    } else if (showtime.room?.id) {
      console.log('Loading seats for showtime.room.id:', showtime.room.id);
      await loadSeatsFromDatabase(showtime.room.id, showtime.id);
    } else {
      console.log('No roomId found in showtime');
      setError('Không thể tải thông tin ghế');
    }
  };

  const loadSeatsFromDatabase = async (roomId: number, showtimeId: number) => {
    try {
      console.log('Loading seats for roomId:', roomId, 'showtimeId:', showtimeId);
      
      // Fetch seat availability for the specific showtime and room
      const seatsResponse = await seatAPI.getSeatAvailability(showtimeId, roomId);
      console.log('Seat availability response:', seatsResponse);
      
      if (seatsResponse.state === 'SUCCESS' && seatsResponse.object) {
        console.log('Loaded seats from database:', seatsResponse.object);
        // Ensure seats have proper status for display
        const seatsWithStatus = seatsResponse.object.map(seat => ({
          ...seat,
          status: seat.status || 'AVAILABLE' as const,
          // Ensure seatNumber is properly formatted
          seatNumber: seat.seatNumber || `${seat.rowNumber}${seat.columnNumber}`
        }));
        setSeats(seatsWithStatus);
      } else {
        console.log('Seat availability failed, trying fallback...');
        // Fallback: fetch all seats for the room and mark as available
        const roomSeatsResponse = await seatAPI.getByRoomId(roomId);
        console.log('Room seats response:', roomSeatsResponse);
        
        if (roomSeatsResponse.state === 'SUCCESS' && roomSeatsResponse.object) {
          console.log('Loaded room seats from database:', roomSeatsResponse.object);
          const seatsWithStatus = roomSeatsResponse.object.map(seat => ({
            ...seat,
            status: seat.status || 'AVAILABLE' as const,
            // Ensure seatNumber is properly formatted
            seatNumber: seat.seatNumber || `${seat.rowNumber}${seat.columnNumber}`
          }));
          setSeats(seatsWithStatus);
        } else {
          console.log('Both seat APIs failed');
          throw new Error('Failed to load seats');
        }
      }
    } catch (error) {
      console.error('Error loading seats from database:', error);
      throw new Error('Failed to load seats');
    }
  };


  const handleSeatSelect = (seat: Seat) => {
    if (seat.status === 'OCCUPIED' || seat.status === 'BOOKED') return;
    
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
    
    // Check if seat is booked or occupied - these should be red and not clickable
    if (seat.status === 'BOOKED' || seat.status === 'OCCUPIED') {
      return 'bg-red-500 text-white cursor-not-allowed opacity-60';
    }
    
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
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => {
      // Use seat price from database, fallback to seat type pricing
      const seatPrice = seat.price || getSeatTypePrice(seat.seatType);
      return total + seatPrice;
    }, 0);
  };

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

    console.log('Booking data being passed:', {
      movie,
      showtime: selectedShowtime,
      selectedSeats: validatedSeats,
      totalPrice: calculateTotal()
    });

    // Always navigate to booking form for payment
    navigate('/booking-form', {
      state: {
        movie,
        showtime: selectedShowtime,
        selectedSeats: validatedSeats,
        totalPrice: calculateTotal()
      }
    });
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
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Chọn suất chiếu
                  </h2>
                
                {showtimes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {showtimes.map((showtime) => (
                      <button
                        key={showtime.id}
                        onClick={() => handleShowtimeSelect(showtime)}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          selectedShowtime?.id === showtime.id
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
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có suất chiếu nào cho phim này
                  </p>
                )}
                </div>
              )}


              {/* Seat Selection */}
              {selectedShowtime && (
                <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Chọn ghế
                  </h2>
                  
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
                      <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
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
                            <div className="w-4 h-4 bg-red-500 rounded"></div>
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
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng</span>
                      <span>{calculateTotal().toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleBooking}
                    disabled={!selectedShowtime || selectedSeats.length === 0}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Xác nhận và thanh toán
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
