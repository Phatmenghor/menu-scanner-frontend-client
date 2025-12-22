import { BasePagination } from "@/utils/common/pagination";
import { DistrictResponseModel } from "./district-response";

export interface AllCommuneResponseModel extends BasePagination {
  content: CommuneResponseModel[];
}

export interface CommuneResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  communeCode: string;
  communeEn: string;
  communeKh: string;
  districtCode: string;
  district: DistrictResponseModel;
}
