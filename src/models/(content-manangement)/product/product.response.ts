export interface AllProduct {
  content: ProductModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ProductModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  businessId: string;
  businessName: string;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  name: string;
  description: string;
  status: string;
  price: number;
  promotionType: string;
  promotionValue: number;
  promotionFromDate: string;
  promotionToDate: string;
  images: Image[];
  mainImageUrl: string;
  sizes: Size[];
  displayPrice: number;
  hasPromotionActive: boolean;
  hasSizes: boolean;
  publicUrl: string;
  favoriteCount: number;
  viewCount: number;
  isFavorited: boolean;
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
  promotionType: string;
  promotionValue: number;
  promotionFromDate: string;
  promotionToDate: string;
  finalPrice: number;
  isPromotionActive: boolean;
}
