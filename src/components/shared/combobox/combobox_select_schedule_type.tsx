"use client";

import { BaseCombobox, BaseComboboxProps } from "./base-combobox";
import { useAppDispatch } from "@/redux/store";
import { fetchAllWorkSchedulesTypeService } from "@/redux/features/hr/store/thunks/work-schedule-type-thunks";

interface ScheduleType {
  enumName: string;
  id: string;
}

interface ComboboxSelectScheduleTypeProps
  extends Omit<
    BaseComboboxProps<ScheduleType>,
    "fetchData" | "getDisplayValue" | "getItemId" | "getItemValue" | "value" | "onValueChange"
  > {
  value: string;
  onValueChange: (value: string) => void;
}

export function ComboboxSelectScheduleType({
  value,
  onValueChange,
  ...props
}: ComboboxSelectScheduleTypeProps) {
  const dispatch = useAppDispatch();

  const fetchScheduleTypes = async ({
    search,
    pageNo,
  }: {
    search: string;
    pageNo: number;
  }) => {
    const result = await dispatch(
      fetchAllWorkSchedulesTypeService({ search, pageNo })
    ).unwrap();

    return {
      content: result?.content || [],
      pageNo: result?.pageNo || pageNo,
      last: result?.last || true,
    };
  };

  // Convert string value to ScheduleType object for BaseCombobox
  const scheduleTypeValue: ScheduleType | null = value
    ? { enumName: value, id: value }
    : null;

  // Convert ScheduleType object back to string for parent component
  const handleValueChange = (item: ScheduleType | null) => {
    onValueChange(item?.enumName || "");
  };

  return (
    <BaseCombobox<ScheduleType>
      {...props}
      value={scheduleTypeValue}
      onValueChange={handleValueChange}
      fetchData={fetchScheduleTypes}
      getDisplayValue={(item) => item.enumName}
      getItemId={(item) => item.id}
      getItemValue={(item) => item.enumName}
      placeholder={props.placeholder || "Select schedule type..."}
      searchPlaceholder="Search schedule type..."
      emptyMessage="No schedule type found."
      label={props.label || "Schedule Type"}
      enablePagination={false}
    />
  );
}
