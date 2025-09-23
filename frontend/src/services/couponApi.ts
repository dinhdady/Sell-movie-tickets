import api from './api';
import type { Coupon } from '../types/coupon';

export const couponAPI = {
  // Lấy tất cả coupon
  getAll: async () => {
    const response = await api.get('/coupon');
    return response.data;
  },

  // Lấy coupon theo ID
  getById: async (id: number) => {
    const response = await api.get(`/coupon/${id}`);
    return response.data;
  },

  // Lấy coupon theo code
  getByCode: async (code: string) => {
    const response = await api.get(`/coupon/code/${code}`);
    return response.data;
  },

  // Lấy coupon đang hoạt động
  getActive: async () => {
    const response = await api.get('/coupon/active');
    return response.data;
  },

  // Lấy coupon có thể áp dụng
  getApplicable: async (orderAmount: number) => {
    const response = await api.get(`/coupon/applicable?orderAmount=${orderAmount}`);
    return response.data;
  },

  // Validate coupon
  validate: async (couponCode: string, orderAmount: number, userId: number) => {
    const response = await api.post('/coupon/validate', {
      couponCode,
      orderAmount,
      userId
    });
    return response.data;
  },

  // Tạo coupon mới (Admin only)
  create: async (coupon: Partial<Coupon>) => {
    const response = await api.post('/coupon', coupon);
    return response.data;
  },

  // Cập nhật coupon (Admin only)
  update: async (id: number, coupon: Partial<Coupon>) => {
    const response = await api.put(`/coupon/${id}`, coupon);
    return response.data;
  },

  // Xóa coupon (Admin only)
  delete: async (id: number) => {
    const response = await api.delete(`/coupon/${id}`);
    return response.data;
  },

  // Lấy thống kê coupon (Admin only)
  getStats: async (id: number) => {
    const response = await api.get(`/coupon/${id}/stats`);
    return response.data;
  },

  // Lấy coupon sắp hết hạn (Admin only)
  getExpiringSoon: async () => {
    const response = await api.get('/coupon/expiring-soon');
    return response.data;
  },

  // Lấy coupon đã hết hạn (Admin only)
  getExpired: async () => {
    const response = await api.get('/coupon/expired');
    return response.data;
  },

  // Tìm kiếm coupon
  search: async (keyword: string) => {
    const response = await api.get(`/coupon/search?keyword=${keyword}`);
    return response.data;
  }
};
