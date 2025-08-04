export interface BusinessSettingModel {
  businessId: string;
  name: string;
  imageUrl: string;
  description: string;
  phone: string;
  address: string;
  businessType: string;
  facebookUrl: string;
  instagramUrl: string;
  telegramUrl: string;
  usdToKhrRate: number;
  taxRate: number;
  hasActiveSubscription: boolean;
  currentPlan: string;
  daysRemaining: number;
  subscriptionEndDate: string;
  currency: string;
  timezone: string;
  updatedAt: string;
}
