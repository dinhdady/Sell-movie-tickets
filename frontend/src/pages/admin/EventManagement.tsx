import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CurrencyDollarIcon,
  GiftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { eventAPI } from '../../services/eventApi';
import type { Event } from '../../types/event';

const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'HOLIDAY' as 'HOLIDAY' | 'SEASONAL' | 'SPECIAL' | 'PROMOTION' | 'NEW_YEAR' | 'VALENTINE' | 'WOMEN_DAY' | 'CHILDREN_DAY' | 'INDEPENDENCE_DAY' | 'CHRISTMAS',
    discountPercentage: 0,
    minimumOrderAmount: 0,
    maximumDiscountAmount: 0,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getAll();
      setEvents(response.object || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await eventAPI.update(editingEvent.id, formData);
      } else {
        await eventAPI.create(formData);
      }
      setShowModal(false);
      setEditingEvent(null);
      resetForm();
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || '',
      type: event.type,
      discountPercentage: event.discountPercentage,
      minimumOrderAmount: event.minimumOrderAmount || 0,
      maximumDiscountAmount: event.maximumDiscountAmount || 0,
      startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      try {
        await eventAPI.delete(id);
        loadEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'HOLIDAY',
      discountPercentage: 0,
      minimumOrderAmount: 0,
      maximumDiscountAmount: 0,
      startDate: '',
      endDate: ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircleIcon className="w-3 h-3 mr-1" />Hoạt động</span>;
      case 'INACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><XCircleIcon className="w-3 h-3 mr-1" />Không hoạt động</span>;
      case 'EXPIRED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><ClockIcon className="w-3 h-3 mr-1" />Hết hạn</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatValue = (event: Event) => {
    return `${event.discountPercentage}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Sự kiện</h1>
          <p className="text-gray-600">Tạo và quản lý các sự kiện giảm giá</p>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Tạo Sự kiện
        </button>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sự kiện</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trị</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã sử dụng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <GiftIcon className="w-4 h-4 text-green-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{event.name}</div>
                      {event.description && (
                        <div className="text-sm text-gray-500">{event.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.type === 'HOLIDAY' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {event.type === 'HOLIDAY' ? 'Ngày lễ' : 'Khuyến mãi'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-gray-900">{formatValue(event)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    Không giới hạn
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <div>
                      <div>Từ: {event.startDate ? new Date(event.startDate).toLocaleDateString('vi-VN') : 'N/A'}</div>
                      <div>Đến: {event.endDate ? new Date(event.endDate).toLocaleDateString('vi-VN') : 'N/A'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(event.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingEvent ? 'Chỉnh sửa Sự kiện' : 'Tạo Sự kiện mới'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên sự kiện</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại sự kiện</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'HOLIDAY' | 'SEASONAL' | 'SPECIAL' | 'PROMOTION' | 'NEW_YEAR' | 'VALENTINE' | 'WOMEN_DAY' | 'CHILDREN_DAY' | 'INDEPENDENCE_DAY' | 'CHRISTMAS'})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="HOLIDAY">Ngày lễ</option>
                    <option value="SEASONAL">Theo mùa</option>
                    <option value="SPECIAL">Đặc biệt</option>
                    <option value="PROMOTION">Khuyến mãi</option>
                    <option value="NEW_YEAR">Tết Nguyên Đán</option>
                    <option value="VALENTINE">Valentine</option>
                    <option value="WOMEN_DAY">Ngày Quốc tế Phụ nữ</option>
                    <option value="CHILDREN_DAY">Ngày Quốc tế Thiếu nhi</option>
                    <option value="INDEPENDENCE_DAY">Ngày Quốc khánh</option>
                    <option value="CHRISTMAS">Giáng sinh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phần trăm giảm giá (%)</label>
                  <input
                    type="number"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({...formData, discountPercentage: parseFloat(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Đơn hàng tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => setFormData({...formData, minimumOrderAmount: parseFloat(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Giảm giá tối đa (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.maximumDiscountAmount}
                    onChange={(e) => setFormData({...formData, maximumDiscountAmount: parseFloat(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    min="0"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {editingEvent ? 'Cập nhật' : 'Tạo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;
