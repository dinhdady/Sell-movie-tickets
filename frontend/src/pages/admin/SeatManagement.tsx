import React, { useState, useEffect } from 'react';
import { CogIcon, TrashIcon } from '@heroicons/react/24/outline';
import { roomAPI, cinemaAPI, seatAPI } from '../../services/api';
interface Cinema {
  id: number;
  name: string;
  address: string;
}
interface Room {
  id: number;
  name: string;
  capacity: number;
  cinemaId: number;
  cinema?: Cinema;
}
interface Seat {
  id: number;
  seatNumber: string;
  rowNumber: string;
  columnNumber: number;
  seatType: 'REGULAR' | 'VIP' | 'COUPLE';
  roomId: number;
  price?: number;
  status?: 'AVAILABLE' | 'BOOKED' | 'RESERVED' | 'MAINTENANCE' | 'SELECTED' | 'OCCUPIED';
}
interface SeatConfigModalProps {
  room: Room | null;
  onClose: () => void;
  onGenerate: (config: any) => void;
}
const SeatConfigModal: React.FC<SeatConfigModalProps> = ({ room, onClose, onGenerate }) => {
  const [config, setConfig] = useState({
    rows: 8,
    seatsPerRow: 10,
    seatType: 'REGULAR',
    vipRows: 0,
    coupleSeats: 0
  });
  const [mode, setMode] = useState<'default' | 'custom'>('default');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ ...config, mode });
  };
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Cấu hình ghế cho phòng: {room?.name}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chế độ tạo ghế</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mode"
                    value="default"
                    checked={mode === 'default'}
                    onChange={(e) => setMode(e.target.value as 'default' | 'custom')}
                    className="mr-2"
                  />
                  <span className="text-sm">Mặc định (8 hàng x 10 ghế = 80 ghế)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mode"
                    value="custom"
                    checked={mode === 'custom'}
                    onChange={(e) => setMode(e.target.value as 'default' | 'custom')}
                    className="mr-2"
                  />
                  <span className="text-sm">Tùy chỉnh</span>
                </label>
              </div>
            </div>
            {mode === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số hàng ghế</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={config.rows}
                    onChange={(e) => setConfig({...config, rows: parseInt(e.target.value)})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số ghế mỗi hàng</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={config.seatsPerRow}
                    onChange={(e) => setConfig({...config, seatsPerRow: parseInt(e.target.value)})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại ghế mặc định</label>
                  <select
                    value={config.seatType}
                    onChange={(e) => setConfig({...config, seatType: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="REGULAR">Ghế thường</option>
                    <option value="VIP">Ghế VIP</option>
                    <option value="COUPLE">Ghế đôi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số hàng VIP (từ đầu)</label>
                  <input
                    type="number"
                    min="0"
                    max={config.rows}
                    value={config.vipRows}
                    onChange={(e) => setConfig({...config, vipRows: parseInt(e.target.value)})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số hàng ghế đôi (từ cuối)</label>
                  <input
                    type="number"
                    min="0"
                    max={config.rows}
                    value={config.coupleSeats}
                    onChange={(e) => setConfig({...config, coupleSeats: parseInt(e.target.value)})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Pattern ghế:</strong> A1, A2, A3... B1, B2, B3... C1, C2, C3...
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Tổng ghế:</strong> {mode === 'default' ? '80' : config.rows * config.seatsPerRow} ghế
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
                Tạo ghế
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
const SeatManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState<number>(0);
  const [seatInfo, setSeatInfo] = useState<any>(null);
  useEffect(() => {
    fetchRooms();
    fetchCinemas();
  }, []);
  useEffect(() => {
    if (selectedRoom) {
      fetchSeats(selectedRoom.id);
      fetchSeatInfo(selectedRoom.id);
    }
  }, [selectedRoom]);
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
  const fetchSeats = async (roomId: number) => {
    try {
      const response = await seatAPI.getByRoom(roomId);
      if (response.state === '200' || response.state === 'SUCCESS') {
        setSeats(response.object);
      }
    } catch (error) {
    }
  };
  const fetchSeatInfo = async (roomId: number) => {
    try {
      const response = await seatAPI.getRoomInfo(roomId);
      if (response.state === '200' || response.state === 'SUCCESS') {
        setSeatInfo(response.object);
      }
    } catch (error) {
    }
  };
  const handleGenerateSeats = async (config: any) => {
    if (!selectedRoom) return;
    try {
      let response;
      if (config.mode === 'default') {
        response = await seatAPI.generateDefault(selectedRoom.id);
      } else {
        response = await seatAPI.generateCustom(selectedRoom.id, config);
      }
      if (response.state === '200' || response.state === 'SUCCESS') {
        fetchSeats(selectedRoom.id);
        fetchSeatInfo(selectedRoom.id);
        fetchRooms(); // Cập nhật capacity
        setShowConfigModal(false);
        alert(response.message || 'Tạo ghế thành công!');
      } else {
        alert(response.message || 'Lỗi khi tạo ghế');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo ghế');
    }
  };
  const handleDeleteSeats = async (roomId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tất cả ghế của phòng này?')) return;
    try {
      const response = await seatAPI.deleteByRoom(roomId);
      if (response.state === '200' || response.state === 'SUCCESS') {
        fetchSeats(roomId);
        fetchSeatInfo(roomId);
        fetchRooms(); // Cập nhật capacity
        alert('Xóa ghế thành công!');
      } else {
        alert('Lỗi khi xóa ghế: ' + response.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa ghế');
    }
  };
  const filteredRooms = rooms.filter(room => 
    selectedCinema === 0 || room.cinemaId === selectedCinema
  );
  const renderSeatGrid = () => {
    if (!seats.length) return null;
    // Nhóm ghế theo hàng
    const seatsByRow = seats.reduce((acc, seat) => {
      if (!acc[seat.rowNumber]) {
        acc[seat.rowNumber] = [];
      }
      acc[seat.rowNumber].push(seat);
      return acc;
    }, {} as Record<string, Seat[]>);
    // Sắp xếp các hàng
    const sortedRows = Object.keys(seatsByRow).sort();
    return (
      <div className="space-y-2">
        {sortedRows.map(rowNumber => (
          <div key={rowNumber} className="flex items-center space-x-1">
            <div className="w-8 text-sm font-medium text-gray-600">{rowNumber}</div>
            <div className="flex space-x-1">
              {seatsByRow[rowNumber]
                .sort((a, b) => a.columnNumber - b.columnNumber)
                .map(seat => (
                <div
                  key={seat.id}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-medium rounded border ${
                    seat.seatType === 'VIP' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                    seat.seatType === 'COUPLE' ? 'bg-pink-100 border-pink-300 text-pink-800' :
                    'bg-gray-100 border-gray-300 text-gray-800'
                  }`}
                  title={`${seat.seatNumber} - ${seat.seatType}`}
                >
                  {seat.columnNumber}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };
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
            Quản lý ghế
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Cấu hình và quản lý ghế cho các phòng chiếu
          </p>
        </div>
      </div>
      {/* Room Selection */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cinema" className="block text-sm font-medium text-gray-700">
              Chọn rạp chiếu
            </label>
            <select
              id="cinema"
              value={selectedCinema}
              onChange={(e) => setSelectedCinema(parseInt(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>Tất cả rạp chiếu</option>
              {cinemas.map((cinema) => (
                <option key={cinema.id} value={cinema.id}>
                  {cinema.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="room" className="block text-sm font-medium text-gray-700">
              Chọn phòng chiếu
            </label>
            <select
              id="room"
              value={selectedRoom?.id || ''}
              onChange={(e) => {
                const roomId = parseInt(e.target.value);
                const room = rooms.find(r => r.id === roomId);
                setSelectedRoom(room || null);
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn phòng chiếu</option>
              {filteredRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} - {cinemas.find(c => c.id === room.cinemaId)?.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {selectedRoom && (
        <>
          {/* Room Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Phòng: {selectedRoom.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Rạp: {cinemas.find(c => c.id === selectedRoom.cinemaId)?.name}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <CogIcon className="h-4 w-4 mr-1" />
                  Cấu hình ghế
                </button>
                {seats.length > 0 && (
                  <button
                    onClick={() => handleDeleteSeats(selectedRoom.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Xóa ghế
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* Seat Info */}
          {seatInfo && (
            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Thông tin ghế</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{seatInfo.totalSeats}</div>
                  <div className="text-sm text-gray-500">Tổng ghế</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{seatInfo.rows}</div>
                  <div className="text-sm text-gray-500">Số hàng</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{seatInfo.seatsPerRow}</div>
                  <div className="text-sm text-gray-500">Ghế/hàng</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Object.keys(seatInfo.seatTypes).length}
                  </div>
                  <div className="text-sm text-gray-500">Loại ghế</div>
                </div>
              </div>
              {Object.keys(seatInfo.seatTypes).length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Phân bố loại ghế:</h5>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(seatInfo.seatTypes).map(([type, count]) => (
                      <span key={type} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {type}: {String(count)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Seat Grid */}
          {seats.length > 0 ? (
            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Sơ đồ ghế</h4>
              <div className="overflow-x-auto">
                {renderSeatGrid()}
              </div>
              <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                  Ghế thường
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
                  Ghế VIP
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-pink-100 border border-pink-300 rounded mr-2"></div>
                  Ghế đôi
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <div className="text-gray-500">
                <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có ghế</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Nhấn "Cấu hình ghế" để tạo ghế cho phòng này.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowConfigModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <CogIcon className="h-4 w-4 mr-2" />
                    Cấu hình ghế
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* Config Modal */}
      {showConfigModal && (
        <SeatConfigModal
          room={selectedRoom}
          onClose={() => setShowConfigModal(false)}
          onGenerate={handleGenerateSeats}
        />
      )}
    </div>
  );
};
export default SeatManagement;
