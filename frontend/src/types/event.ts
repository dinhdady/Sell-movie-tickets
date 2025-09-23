export interface Event {
  id: number;
  name: string;
  description: string;
  type: 'HOLIDAY' | 'SEASONAL' | 'SPECIAL' | 'PROMOTION' | 'NEW_YEAR' | 'VALENTINE' | 'WOMEN_DAY' | 'CHILDREN_DAY' | 'INDEPENDENCE_DAY' | 'CHRISTMAS';
  discountPercentage: number;
  minimumOrderAmount: number;
  maximumDiscountAmount: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'CANCELLED';
  isActive: boolean;
  bannerUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventValidation {
  valid: boolean;
  message: string;
  discountAmount?: number;
  finalAmount?: number;
  event?: Event;
}

export interface EventUsage {
  id: number;
  eventId: number;
  userId: number;
  bookingId: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  usedAt: string;
  notes?: string;
}
