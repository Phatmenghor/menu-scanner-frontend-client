export interface AllBannerRequest {
  search?: string;
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  businessId?: string;
  status?: string;
}

export interface UploadBannerRequest {
  imageUrl?: string;
  linkUrl?: string;
  status?: string;
}
