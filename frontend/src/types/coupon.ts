export interface Coupon {
  id: number;
  code: string;
  name: string;
  description: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount: number;
  totalQuantity: number;
  usedQuantity: number;
  remainingQuantity: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'EXHAUSTED';
  isActive: boolean;
  bannerUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidation {
  valid: boolean;
  message: string;
  discountAmount?: number;
  finalAmount?: number;
  coupon?: Coupon;
}

export interface CouponUsage {
  id: number;
  couponId: number;
  userId: number;
  bookingId: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  usedAt: string;
  notes?: string;
}
