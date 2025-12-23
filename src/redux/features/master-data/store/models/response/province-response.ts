import { BasePagination } from "@/utils/common/pagination";

export interface AllProvinceResponseModel extends BasePagination {
  content: ProvinceResponseModel[];
}

export interface ProvinceResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  provinceCode: string;
  provinceEn: string;
  provinceKh: string;
}
