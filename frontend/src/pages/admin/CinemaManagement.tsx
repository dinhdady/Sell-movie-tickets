import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { cinemaAPI } from '../../services/api';
interface Cinema {
  id: number;
  name: string;
  address: string;
  phone: string;
  cinemaType: string;
  createdAt: string;
  rooms?: Room[];
}
interface Room {
  id: number;
  name: string;
  capacity: number;
  cinemaId: number;
}
interface CinemaModalProps {
  cinema: Cinema | null;
  onClose: () => void;
  onSave: (cinema: Partial<Cinema>) => void;
}
const CinemaModal: React.FC<CinemaModalProps> = ({ cinema, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Cinema>>({
    name: '',
    address: '',
    phone: '',
    cinemaType: 'STANDARD'
  });
  useEffect(() => {
    if (cinema) {
      setFormData({
        name: cinema.name,
        address: cinema.address,
        phone: cinema.phone,
        cinemaType: cinema.cinemaType
      });
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '',
        cinemaType: 'STANDARD'
      });
    }
  }, [cinema]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {cinema ? 'Chỉnh sửa rạp chiếu' : 'Thêm rạp chiếu mới'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên rạp</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tên rạp chiếu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập địa chỉ rạp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Loại rạp</label>
              <select
                value={formData.cinemaType}
                onChange={(e) => setFormData({...formData, cinemaType: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="STANDARD">Rạp thường</option>
                <option value="SPECIAL">Rạp đặc biệt</option>
                <option value="VIP">Rạp VIP</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {cinema ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
const CinemaManagement: React.FC = () => {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    fetchCinemas();
  }, []);
  const fetchCinemas = async () => {
    try {
      const response = await cinemaAPI.getAll();
      if (response.state === 'SUCCESS') {
        setCinemas(response.object as Cinema[]);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const handleCreateCinema = async (cinemaData: Partial<Cinema>) => {
    try {
      const response = await cinemaAPI.create(cinemaData as any);
      if (response.state === 'SUCCESS' || response.state === '201') {
        fetchCinemas();
        setShowModal(false);
        alert('Tạo rạp chiếu thành công!');
      } else {
        alert('Lỗi khi tạo rạp chiếu: ' + response.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo rạp chiếu');
    }
  };
  const handleUpdateCinema = async (cinemaData: Partial<Cinema>) => {
    if (!selectedCinema) return;
    try {
      const response = await cinemaAPI.update(selectedCinema.id, cinemaData as any);
      if (response.state === '201' || response.state === 'SUCCESS') {
        fetchCinemas();
        setShowModal(false);
        setSelectedCinema(null);
        alert('Cập nhật rạp chiếu thành công!');
      } else {
        alert('Lỗi khi cập nhật rạp chiếu: ' + response.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật rạp chiếu');
    }
  };
  const handleDeleteCinema = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa rạp chiếu này?')) return;
    try {
      await cinemaAPI.delete(id);
      fetchCinemas();
      alert('Xóa rạp chiếu thành công!');
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa rạp chiếu');
    }
  };
  const filteredCinemas = cinemas.filter(cinema =>
    cinema.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cinema.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Quản lý rạp chiếu
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin các rạp chiếu trong hệ thống
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => {
              setSelectedCinema(null);
              setShowModal(true);
            }}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Thêm rạp chiếu
          </button>
        </div>
      </div>
      {/* Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="max-w-md">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Tìm kiếm rạp chiếu
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="search"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Nhập tên rạp hoặc địa chỉ..."
            />
          </div>
        </div>
      </div>
      {/* Cinemas Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên rạp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Địa chỉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số điện thoại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại rạp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số phòng
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCinemas.map((cinema) => (
                  <tr key={cinema.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cinema.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cinema.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cinema.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {cinema.cinemaType === 'STANDARD' ? 'Thường' : 
                         cinema.cinemaType === 'SPECIAL' ? 'Đặc biệt' : 'VIP'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cinema.rooms?.length || 0} phòng
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCinema(cinema);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCinema(cinema.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <CinemaModal
          cinema={selectedCinema}
          onClose={() => {
            setShowModal(false);
            setSelectedCinema(null);
          }}
          onSave={selectedCinema ? handleUpdateCinema : handleCreateCinema}
        />
      )}
    </div>
  );
};
export default CinemaManagement;
