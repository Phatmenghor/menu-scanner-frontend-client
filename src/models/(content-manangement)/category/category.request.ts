export interface AllCategoryRequest {
  search?: string;
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  businessId?: string;
  status?: string;
}

export interface CategoryRequest {
  name?: string;
  imageUrl?: string;
  status?: string;
}
