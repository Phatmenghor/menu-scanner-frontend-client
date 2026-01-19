import {
  AllWorkScheduleResponseModel,
  WorkScheduleResponseModel,
} from "../response/work-schedule-type-response";

export interface WorkScheduleFilters {
  search: string;
  pageNo: number;
}

export interface OperationStates {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface WorkScheduleManagementState {
  data: AllWorkScheduleResponseModel | null;
  selectedWorkSchedule: WorkScheduleResponseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: WorkScheduleFilters;
  operations: OperationStates;
}
