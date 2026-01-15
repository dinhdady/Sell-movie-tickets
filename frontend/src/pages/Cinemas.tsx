import React, { useState, useEffect } from 'react';
import { cinemaAPI, showtimeAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  MapPinIcon, 
  PhoneIcon,
  BuildingOfficeIcon,
  StarIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
interface Cinema {
  id: number;
  name: string;
  address: string;
  phone: string;
  cinemaType: 'STANDARD' | 'PREMIUM' | 'IMAX' | '4DX';
}
interface Showtime {
  id: number;
  movieId: number;
  roomId: number;
  startTime: string;
  endTime: string;
  movie?: {
    title: string;
    duration: number;
    genre: string;
  };
  room?: {
    name: string;
    capacity: number;
  };
}
const Cinemas: React.FC = () => {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [showtimesLoading, setShowtimesLoading] = useState(false);
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(true);
        const response = await cinemaAPI.getAll();
        setCinemas(response.object as any || []);
      } catch (err) {
        setError('Không thể tải danh sách rạp chiếu');
      } finally {
        setLoading(false);
      }
    };
    fetchCinemas();
  }, []);
  const getCinemaTypeLabel = (type: string) => {
    switch (type) {
      case 'STANDARD': return 'Rạp Thường';
      case 'PREMIUM': return 'Rạp VIP';
      case 'IMAX': return 'IMAX';
      case '4DX': return '4DX';
      default: return type;
    }
  };
  const getCinemaTypeColor = (type: string) => {
    switch (type) {
      case 'STANDARD': return 'bg-gray-100 text-gray-800';
      case 'PREMIUM': return 'bg-yellow-100 text-yellow-800';
      case 'IMAX': return 'bg-blue-100 text-blue-800';
      case '4DX': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const filteredCinemas = selectedType === 'ALL' 
    ? cinemas 
    : cinemas.filter(cinema => cinema.cinemaType === selectedType);
  const cinemaTypes = ['ALL', 'STANDARD', 'PREMIUM', 'IMAX', '4DX'];
  // Hàm xử lý xem lịch chiếu
  const handleViewSchedule = async (cinema: Cinema) => {
    setSelectedCinema(cinema);
    setShowScheduleModal(true);
    setShowtimesLoading(true);
    try {
      // Gọi API lấy lịch chiếu theo cinema ID
      const response = await showtimeAPI.getByCinemaId(cinema.id);
      setShowtimes(response.object || []);
    } catch (err) {
      setShowtimes([]);
    } finally {
      setShowtimesLoading(false);
    }
  };
  // Hàm xử lý chỉ đường
  const handleGetDirections = (cinema: Cinema) => {
    const address = encodeURIComponent(cinema.address);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(googleMapsUrl, '_blank');
  };
  // Hàm đóng modal
  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setSelectedCinema(null);
    setShowtimes([]);
  };
  // Hàm format thời gian
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };
  // Hàm format ngày
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hệ Thống Rạp Chiếu
          </h1>
          <p className="text-lg text-gray-600">
            Khám phá các rạp chiếu phim hiện đại với công nghệ tiên tiến
          </p>
        </div>
        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          {cinemaTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {type === 'ALL' ? 'Tất cả' : getCinemaTypeLabel(type)}
            </button>
          ))}
        </div>
        {/* Cinemas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCinemas.map((cinema) => (
            <div
              key={cinema.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              {/* Cinema Type Badge */}
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCinemaTypeColor(cinema.cinemaType)}`}>
                  {getCinemaTypeLabel(cinema.cinemaType)}
                </span>
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">4.5</span>
                </div>
              </div>
              {/* Cinema Name */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 text-blue-600 mr-2" />
                {cinema.name}
              </h3>
              {/* Address */}
              <div className="flex items-start mb-3">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 text-sm">{cinema.address}</p>
              </div>
              {/* Phone */}
              <div className="flex items-center mb-4">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                <p className="text-gray-600 text-sm">{cinema.phone}</p>
              </div>
              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleViewSchedule(cinema)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
                >
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Xem Lịch Chiếu
                </button>
                <button 
                  onClick={() => handleGetDirections(cinema)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center"
                >
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  Chỉ Đường
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Empty State */}
        {filteredCinemas.length === 0 && (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Không tìm thấy rạp chiếu
            </h3>
            <p className="text-gray-600">
              {selectedType === 'ALL' 
                ? 'Hiện tại không có rạp chiếu nào trong hệ thống.' 
                : `Không có rạp chiếu loại ${getCinemaTypeLabel(selectedType)}.`
              }
            </p>
          </div>
        )}
        {/* Statistics */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Thống Kê Hệ Thống Rạp
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {cinemas.length}
              </div>
              <div className="text-gray-600">Tổng số rạp</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {cinemas.filter(c => c.cinemaType === 'PREMIUM').length}
              </div>
              <div className="text-gray-600">Rạp VIP</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {cinemas.filter(c => c.cinemaType === 'IMAX' || c.cinemaType === '4DX').length}
              </div>
              <div className="text-gray-600">Rạp đặc biệt</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                24/7
              </div>
              <div className="text-gray-600">Hỗ trợ khách hàng</div>
            </div>
          </div>
        </div>
      </div>
      {/* Schedule Modal */}
      {showScheduleModal && selectedCinema && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <CalendarIcon className="h-6 w-6 mr-2 text-blue-600" />
                  Lịch Chiếu - {selectedCinema.name}
                </h2>
                <p className="text-gray-600 mt-1">{selectedCinema.address}</p>
              </div>
              <button
                onClick={closeScheduleModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {showtimesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : showtimes.length > 0 ? (
                <div className="space-y-6">
                  {/* Group showtimes by date */}
                  {Object.entries(
                    showtimes.reduce((groups: { [key: string]: Showtime[] }, showtime) => {
                      const date = new Date(showtime.startTime).toDateString();
                      if (!groups[date]) {
                        groups[date] = [];
                      }
                      groups[date].push(showtime);
                      return groups;
                    }, {})
                  ).map(([date, dayShowtimes]) => (
                    <div key={date} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                        {formatDate(dayShowtimes[0].startTime)}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dayShowtimes.map((showtime) => (
                          <div
                            key={showtime.id}
                            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{showtime.movie?.title || 'N/A'}</h4>
                              <span className="text-sm text-gray-500">{showtime.movie?.duration || 0} phút</span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
                              </div>
                              <div className="flex items-center">
                                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                                {showtime.room?.name || 'N/A'} ({showtime.room?.capacity || 0} ghế)
                              </div>
                              <div className="text-xs text-gray-500">
                                {showtime.movie?.genre || 'N/A'}
                              </div>
                            </div>
                            <button className="w-full mt-3 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                              Đặt Vé
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Không có lịch chiếu
                  </h3>
                  <p className="text-gray-600">
                    Rạp này hiện tại chưa có lịch chiếu nào.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Cinemas;
