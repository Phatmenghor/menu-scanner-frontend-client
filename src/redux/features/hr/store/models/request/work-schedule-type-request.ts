import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface CreateWorkScheduleRequest {
  enumName: string;
  description: string;
}

export interface UpdateWorkScheduleRequest {
  enumName: string;
  description: string;
}

export interface AllWorkScheduleRequest extends BaseGetAllRequest {
  businessId?: string;
}

export interface UpdateWorkScheduleParams {
  id: string;
  param: UpdateWorkScheduleRequest;
}
