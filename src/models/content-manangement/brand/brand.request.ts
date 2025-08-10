export interface AllBrandRequest {
  search?: string;
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  businessId?: string;
  status?: string;
}

export interface BrandRequest {
  name?: string;
  imageUrl?: string;
  description?: string;
  status?: string;
}
