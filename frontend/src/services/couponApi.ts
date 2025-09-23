import axios from 'axios';
import type { Coupon } from '../types/coupon';

const API_BASE_URL = 'http://localhost:8080/api';

export const couponAPI = {
  // Lấy tất cả coupon
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/coupon`);
    return response.data;
  },

  // Lấy coupon theo ID
  getById: async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/coupon/${id}`);
    return response.data;
  },

  // Lấy coupon theo code
  getByCode: async (code: string) => {
    const response = await axios.get(`${API_BASE_URL}/coupon/code/${code}`);
    return response.data;
  },

  // Lấy coupon đang hoạt động
  getActive: async () => {
    const response = await axios.get(`${API_BASE_URL}/coupon/active`);
    return response.data;
  },

  // Lấy coupon có thể áp dụng
  getApplicable: async (orderAmount: number) => {
    const response = await axios.get(`${API_BASE_URL}/coupon/applicable?orderAmount=${orderAmount}`);
    return response.data;
  },

  // Validate coupon
  validate: async (couponCode: string, orderAmount: number, userId: number) => {
    const response = await axios.post(`${API_BASE_URL}/coupon/validate`, {
      couponCode,
      orderAmount,
      userId
    });
    return response.data;
  },

  // Tạo coupon mới (Admin only)
  create: async (coupon: Partial<Coupon>) => {
    const response = await axios.post(`${API_BASE_URL}/coupon`, coupon);
    return response.data;
  },

  // Cập nhật coupon (Admin only)
  update: async (id: number, coupon: Partial<Coupon>) => {
    const response = await axios.put(`${API_BASE_URL}/coupon/${id}`, coupon);
    return response.data;
  },

  // Xóa coupon (Admin only)
  delete: async (id: number) => {
    const response = await axios.delete(`${API_BASE_URL}/coupon/${id}`);
    return response.data;
  },

  // Lấy thống kê coupon (Admin only)
  getStats: async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/coupon/${id}/stats`);
    return response.data;
  },

  // Lấy coupon sắp hết hạn (Admin only)
  getExpiringSoon: async () => {
    const response = await axios.get(`${API_BASE_URL}/coupon/expiring-soon`);
    return response.data;
  },

  // Lấy coupon đã hết hạn (Admin only)
  getExpired: async () => {
    const response = await axios.get(`${API_BASE_URL}/coupon/expired`);
    return response.data;
  },

  // Tìm kiếm coupon
  search: async (keyword: string) => {
    const response = await axios.get(`${API_BASE_URL}/coupon/search?keyword=${keyword}`);
    return response.data;
  }
};
