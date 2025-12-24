import { BasePagination } from "@/utils/common/pagination";

export interface AllProductResponseModel extends BasePagination {
  content: ProductDetailResponseModel[];
}

export interface ProductListResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  name: string;
  status: string;
  displayPrice: number;
  displayOriginPrice: number;
  displayPromotionType: string;
  displayPromotionValue: number;
  displayPromotionFromDate: string;
  displayPromotionToDate: string;
  hasSizes: boolean;
  hasActivePromotion: boolean;
  mainImageUrl: string;
  viewCount: number;
  favoriteCount: number;
  isFavorited: boolean;
  businessId: string;
  categoryId: string;
  brandId: string;
}

export interface ProductDetailResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  name: string;
  description: string;
  status: string;
  price: number;
  promotionType: string;
  promotionValue: number;
  promotionFromDate: string;
  promotionToDate: string;
  displayPrice: number;
  displayOriginPrice: number;
  displayPromotionType: string;
  displayPromotionValue: number;
  displayPromotionFromDate: string;
  displayPromotionToDate: string;
  hasSizes: boolean;
  hasPromotion: boolean;
  mainImageUrl: string;
  viewCount: number;
  favoriteCount: number;
  isFavorited: boolean;
  businessId: string;
  businessName: string;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  images: ProductImage[];
  sizes: ProductSize[];
}

interface ProductImage {
  id: string;
  imageUrl: string;
  displayOrder: number;
  createdAt: string;
}

interface ProductSize {
  id: string;
  name: string;
  price: number;
  promotionType: string;
  promotionValue: number;
  promotionFromDate: string;
  promotionToDate: string;
  finalPrice: number;
  hasPromotion: boolean;
  createdAt: string;
}
