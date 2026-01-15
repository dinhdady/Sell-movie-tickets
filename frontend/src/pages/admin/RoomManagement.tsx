import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CogIcon } from '@heroicons/react/24/outline';
import { roomAPI, cinemaAPI, seatAPI } from '../../services/api';
interface Cinema {
  id: number;
  name: string;
  address: string;
  phone: string;
  cinemaType: string;
}
interface Room {
  id: number;
  name: string;
  capacity: number;
  cinemaId: number;
  cinema?: Cinema;
  createdAt: string;
}
interface RoomModalProps {
  room: Room | null;
  cinemas: Cinema[];
  onClose: () => void;
  onSave: (room: Partial<Room>) => void;
}
const RoomModal: React.FC<RoomModalProps> = ({ room, cinemas, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Room>>({
    name: '',
    capacity: 80,
    cinemaId: 0
  });
  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        capacity: room.capacity,
        cinemaId: room.cinemaId
      });
    } else {
      setFormData({
        name: '',
        capacity: 80,
        cinemaId: cinemas.length > 0 ? cinemas[0].id : 0
      });
    }
  }, [room, cinemas]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {room ? 'Chỉnh sửa phòng chiếu' : 'Thêm phòng chiếu mới'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên phòng</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tên phòng chiếu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rạp chiếu</label>
              <select
                required
                value={formData.cinemaId}
                onChange={(e) => setFormData({...formData, cinemaId: parseInt(e.target.value)})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Chọn rạp chiếu</option>
                {cinemas.map((cinema) => (
                  <option key={cinema.id} value={cinema.id}>
                    {cinema.name} - {cinema.address}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sức chứa dự kiến</label>
              <input
                type="number"
                min="1"
                max="500"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Số ghế dự kiến (sẽ được cập nhật tự động khi tạo ghế)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Ghế sẽ được tạo tự động theo pattern A1, A2, B1, B2... (8 hàng x 10 ghế = 80 ghế)
              </p>
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
                {room ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCinema, setSelectedCinema] = useState<number>(0);
  useEffect(() => {
    fetchRooms();
    fetchCinemas();
  }, []);
  const fetchRooms = async () => {
    try {
      const response = await roomAPI.getAll();
      if (response.state === 'SUCCESS') {
        setRooms(response.object as Room[]);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const fetchCinemas = async () => {
    try {
      const response = await cinemaAPI.getAll();
      if (response.state === 'SUCCESS') {
        setCinemas(response.object as Cinema[]);
      }
    } catch (error) {
    }
  };
  const handleCreateRoom = async (roomData: Partial<Room>) => {
    try {
      const response = await roomAPI.create(roomData as any);
      if (response.state === '201' || response.state === 'SUCCESS') {
        fetchRooms();
        setShowModal(false);
        alert(response.message || 'Tạo phòng chiếu thành công!');
      } else {
        alert(response.message || 'Lỗi khi tạo phòng chiếu');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo phòng chiếu');
    }
  };
  const handleUpdateRoom = async (roomData: Partial<Room>) => {
    if (!selectedRoom) return;
    try {
      const response = await roomAPI.update(selectedRoom.id, roomData as any);
      if (response.state === '200' || response.state === 'SUCCESS') {
        fetchRooms();
        setShowModal(false);
        setSelectedRoom(null);
        alert('Cập nhật phòng chiếu thành công!');
      } else {
        alert('Lỗi khi cập nhật phòng chiếu: ' + response.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật phòng chiếu');
    }
  };
  const handleDeleteRoom = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng chiếu này? Tất cả ghế trong phòng cũng sẽ bị xóa.')) return;
    try {
      await roomAPI.delete(id);
      fetchRooms();
      alert('Xóa phòng chiếu thành công!');
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa phòng chiếu');
    }
  };
  const handleRegenerateSeats = async (roomId: number) => {
    if (!confirm('Bạn có chắc chắn muốn tạo lại ghế cho phòng này? Tất cả ghế cũ sẽ bị xóa.')) return;
    try {
      const response = await seatAPI.generateDefault(roomId);
      if (response.state === '200') {
        fetchRooms();
        alert(response.message || 'Tạo lại ghế thành công!');
      } else {
        alert(response.message || 'Lỗi khi tạo lại ghế');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo lại ghế');
    }
  };
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCinema = selectedCinema === 0 || room.cinemaId === selectedCinema;
    return matchesSearch && matchesCinema;
  });
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
            Quản lý phòng chiếu
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý các phòng chiếu và ghế trong hệ thống
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => {
              setSelectedRoom(null);
              setShowModal(true);
            }}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Thêm phòng chiếu
          </button>
        </div>
      </div>
      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Tìm kiếm phòng chiếu
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="search"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Nhập tên phòng..."
              />
            </div>
          </div>
          <div>
            <label htmlFor="cinema" className="block text-sm font-medium text-gray-700">
              Lọc theo rạp chiếu
            </label>
            <div className="mt-1">
              <select
                id="cinema"
                value={selectedCinema}
                onChange={(e) => setSelectedCinema(parseInt(e.target.value))}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value={0}>Tất cả rạp chiếu</option>
                {cinemas.map((cinema) => (
                  <option key={cinema.id} value={cinema.id}>
                    {cinema.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Rooms Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên phòng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rạp chiếu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sức chứa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{room.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(() => {
                          if (!room.cinemaId) {
                            return 'N/A';
                          }
                          const cinema = cinemas.find(c => c.id === room.cinemaId);
                          return cinema?.name || 'N/A';
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{room.capacity} ghế</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {room.createdAt ? new Date(room.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleRegenerateSeats(room.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Tạo lại ghế"
                        >
                          <CogIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
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
        <RoomModal
          room={selectedRoom}
          cinemas={cinemas}
          onClose={() => {
            setShowModal(false);
            setSelectedRoom(null);
          }}
          onSave={selectedRoom ? handleUpdateRoom : handleCreateRoom}
        />
      )}
    </div>
  );
};
export default RoomManagement;
