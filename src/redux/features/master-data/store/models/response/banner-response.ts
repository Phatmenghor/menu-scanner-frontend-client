import { BasePagination } from "@/utils/common/pagination";
import { DistrictResponseModel } from "./district-response";

export interface AllBannerResponseModel extends BasePagination {
  content: BannerResponseModel[];
}

export interface BannerResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  businessId: string;
  businessName: string;
  imageUrl: string;
  linkUrl: string;
  status: string;
}
