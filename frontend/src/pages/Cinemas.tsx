import React, { useState, useEffect } from 'react';
import { cinemaAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  MapPinIcon, 
  PhoneIcon,
  BuildingOfficeIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface Cinema {
  id: number;
  name: string;
  address: string;
  phone: string;
  cinemaType: 'STANDARD' | 'PREMIUM' | 'IMAX' | '4DX';
}

const Cinemas: React.FC = () => {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('ALL');

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(true);
        const response = await cinemaAPI.getAll();
        setCinemas(response.object as any || []);
      } catch (err) {
        setError('Không thể tải danh sách rạp chiếu');
        console.error('Error fetching cinemas:', err);
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
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Xem Lịch Chiếu
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
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
    </div>
  );
};

export default Cinemas;
