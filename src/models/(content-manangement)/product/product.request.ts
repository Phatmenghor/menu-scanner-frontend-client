export interface AllProductRequest {
  search?: string;
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  businessId?: string;
  categoryId?: string;
  brandId?: string;
  status?: string;
  hasPromotion?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductFormData {
  name: string; // required
  categoryId: string; // required
  images: Image[]; // required

  description?: string;
  brandId?: string;
  price?: number;

  promotionType?: string;
  promotionValue?: number;
  promotionFromDate?: string;
  promotionToDate?: string;

  sizes?: Size[];
  status?: string;
}

export interface Image {
  imageUrl: string;
  imageType: string;
}

export interface Size {
  name: string;
  price: number;
  promotionType?: string;
  promotionValue?: number;
  promotionFromDate?: string;
  promotionToDate?: string;
}
