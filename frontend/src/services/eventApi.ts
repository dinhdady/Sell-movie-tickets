import axios from 'axios';
import type { Event } from '../types/event';

const API_BASE_URL = 'http://localhost:8080/api';

export const eventAPI = {
  // Lấy tất cả event
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/event`);
    return response.data;
  },

  // Lấy event theo ID
  getById: async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/event/${id}`);
    return response.data;
  },

  // Lấy event đang hoạt động
  getActive: async () => {
    const response = await axios.get(`${API_BASE_URL}/event/active`);
    return response.data;
  },

  // Lấy event hiện tại (đang diễn ra)
  getCurrent: async () => {
    const response = await axios.get(`${API_BASE_URL}/event/current`);
    return response.data;
  },

  // Lấy event có thể áp dụng
  getApplicable: async (orderAmount: number) => {
    const response = await axios.get(`${API_BASE_URL}/event/applicable?orderAmount=${orderAmount}`);
    return response.data;
  },

  // Lấy event theo type
  getByType: async (type: string) => {
    const response = await axios.get(`${API_BASE_URL}/event/type/${type}`);
    return response.data;
  },

  // Validate event
  validate: async (eventId: number, orderAmount: number, userId: number) => {
    const response = await axios.post(`${API_BASE_URL}/event/validate`, {
      eventId,
      orderAmount,
      userId
    });
    return response.data;
  },

  // Tạo event mới (Admin only)
  create: async (event: Partial<Event>) => {
    const response = await axios.post(`${API_BASE_URL}/event`, event);
    return response.data;
  },

  // Cập nhật event (Admin only)
  update: async (id: number, event: Partial<Event>) => {
    const response = await axios.put(`${API_BASE_URL}/event/${id}`, event);
    return response.data;
  },

  // Xóa event (Admin only)
  delete: async (id: number) => {
    const response = await axios.delete(`${API_BASE_URL}/event/${id}`);
    return response.data;
  },

  // Lấy thống kê event (Admin only)
  getStats: async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/event/${id}/stats`);
    return response.data;
  },

  // Lấy event sắp bắt đầu (Admin only)
  getUpcoming: async () => {
    const response = await axios.get(`${API_BASE_URL}/event/upcoming`);
    return response.data;
  },

  // Lấy event sắp kết thúc (Admin only)
  getEndingSoon: async () => {
    const response = await axios.get(`${API_BASE_URL}/event/ending-soon`);
    return response.data;
  },

  // Lấy event đã hết hạn (Admin only)
  getExpired: async () => {
    const response = await axios.get(`${API_BASE_URL}/event/expired`);
    return response.data;
  },

  // Tìm kiếm event
  search: async (keyword: string) => {
    const response = await axios.get(`${API_BASE_URL}/event/search?keyword=${keyword}`);
    return response.data;
  },

  // Cập nhật status của event (Admin only)
  updateStatuses: async () => {
    const response = await axios.post(`${API_BASE_URL}/event/update-statuses`);
    return response.data;
  }
};
