import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllWorkScheduleRequest,
  CreateWorkScheduleRequest,
  UpdateWorkScheduleParams,
} from "../models/request/work-schedule-request";
import { AppDefault } from "@/constants/app-resource/default/default";

export const fetchAllWorkSchedulesService = createApiThunk<
  any,
  AllWorkScheduleRequest
>("work-schedule-type/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/enums/work-schedule-type/all",
    {
      businessId: AppDefault.BUSINESS_ID,
      ...params,
    }
  );
  return response.data.data;
});

export const fetchWorkScheduleByIdService = createApiThunk<any, string>(
  "work-schedule-type/fetchById",
  async (workScheduleId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/enums/work-schedule-type/${workScheduleId}`
    );
    return response.data.data;
  }
);

export const createWorkScheduleService = createApiThunk<
  any,
  CreateWorkScheduleRequest
>("work-schedule-type/create", async (workScheduleData) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/enums/work-schedule-type",
    {
      businessId: AppDefault.BUSINESS_ID,
      ...workScheduleData,
    }
  );
  return response.data.data;
});

export const updateWorkScheduleService = createApiThunk<
  any,
  UpdateWorkScheduleParams
>("work-schedule-type/update", async ({ id, param }) => {
  const response = await axiosClientWithAuth.put(
    `/api/v1/enums/work-schedule-type/${id}`,
    param
  );
  return response.data.data;
});

export const deleteWorkScheduleService = createApiThunk<any, string>(
  "work-schedule-type/delete",
  async (workScheduleId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/enums/work-schedule-type/${workScheduleId}`
    );
    return response.data.data;
  }
);
