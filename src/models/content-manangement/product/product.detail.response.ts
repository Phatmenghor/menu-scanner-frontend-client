export interface ProductDetailModel {
  id: string;
  name: string;
  description: string;
  status: string;
  price: number;
  promotionType: string;
  promotionValue: number;
  promotionFromDate: string;
  promotionToDate: string;
  displayOriginPrice: number;
  displayPromotionType: string;
  displayPromotionValue: number;
  displayPromotionFromDate: string;
  displayPromotionToDate: string;
  displayPrice: number;
  hasPromotion: boolean;
  hasSizes: boolean;
  viewCount: number;
  favoriteCount: number;
  isFavorited: boolean;
  createdAt: string;
  businessId: string;
  businessName: string;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  images: Image[];
  sizes: Size[];
}

export interface Image {
  id: string;
  imageUrl: string;
  imageType: string;
}

export interface Size {
  id: string;
  name: string;
  price: number;
  finalPrice: number;
  hasPromotion: boolean;
  promotionType: string;
  promotionValue: number;
  promotionFromDate: string;
  promotionToDate: string;
}
