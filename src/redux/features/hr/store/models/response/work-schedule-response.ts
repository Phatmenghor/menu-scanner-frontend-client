import { BasePagination } from "@/utils/common/pagination";

export interface AllWorkScheduleResponseModel extends BasePagination {
  content: WorkScheduleResponseModel[];
}

export interface WorkScheduleResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  userInfo: UserInfo;
  businessId: string;
  name: string;
  scheduleTypeEnumName: any;
  workDays: string[];
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
}

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImageUrl: string;
  fullName: string;
}
