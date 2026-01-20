"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Loading from "@/components/shared/common/loading";
import { TextField } from "@/components/shared/form-field/text-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { ModalMode } from "@/constants/status/status";
import { AppDefault } from "@/constants/app-resource/default/default";
import { selectUser } from "@/redux/features/auth/store/selectors/auth-selectors";
import {
  selectError,
  selectIsFetchingDetail,
  selectOperations,
} from "../store/selectors/work-schedule-selectors";
import {
  createWorkScheduleSchema,
  updateWorkScheduleSchema,
  WorkScheduleTypeFormData,
} from "../store/models/schema/work-schedule.schema";
import {
  createWorkScheduleService,
  fetchWorkScheduleByIdService,
  updateWorkScheduleService,
} from "../store/thunks/work-schedule-thunks";
import {
  clearError,
  clearSelectedWorkSchedule,
} from "../store/slice/work-schedule-slice";
import {
  CreateWorkScheduleRequest,
  UpdateWorkScheduleRequest,
} from "../store/models/request/work-schedule-request";
import { MultiSelectDaysField } from "@/components/shared/form-field/multi-select-days-field";
import { TimePickerField } from "@/components/shared/form-field/time-picker-field";
import { ComboboxSelectUser } from "@/components/shared/combobox/combobox_select_user";
import { ComboboxSelectScheduleType } from "@/components/shared/combobox/combobox_select_schedule_type";
import { UserResponseModel } from "@/redux/features/auth/store/models/response/users-response";

type Props = {
  mode: ModalMode;
  workScheduleId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function WorkScheduleModal({
  isOpen,
  onClose,
  workScheduleId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating } = operations;

  const [selectedUser, setSelectedUser] = useState<UserResponseModel | null>(
    null,
  );
  const [selectedScheduleType, setSelectedScheduleType] = useState<string>("");

  // Ref to track if data has been fetched for current workScheduleId
  const fetchedWorkScheduleIdRef = React.useRef<string | null>(null);
  // Ref to track if modal has been initialized
  const isInitializedRef = React.useRef<boolean>(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<WorkScheduleTypeFormData>({
    resolver: zodResolver(
      isCreate ? createWorkScheduleSchema : updateWorkScheduleSchema,
    ) as any,
    defaultValues: {
      id: "",
      userId: currentUser?.userId || "",
      businessId: AppDefault.BUSINESS_ID,
      name: "",
      scheduleTypeEnumName: "",
      workDays: [],
      startTime: "",
      endTime: "",
      breakStartTime: "",
      breakEndTime: "",
    },
    mode: "onChange",
  });

  // Initialize modal when it opens - runs only ONCE per modal session
  useEffect(() => {
    if (!isOpen) {
      // Reset initialization flag when modal closes
      isInitializedRef.current = false;
      return;
    }

    // Prevent re-initialization on subsequent re-renders
    if (isInitializedRef.current) {
      return;
    }

    // Mark as initialized IMMEDIATELY
    isInitializedRef.current = true;

    // Handle EDIT mode
    if (!isCreate && workScheduleId) {
      // Prevent fetching if already fetched for this workScheduleId
      if (fetchedWorkScheduleIdRef.current === workScheduleId) {
        return;
      }

      // Mark as fetched
      fetchedWorkScheduleIdRef.current = workScheduleId;

      const fetchWorkScheduleData = async () => {
        try {
          const resultAction = await dispatch(
            fetchWorkScheduleByIdService(workScheduleId),
          );

          if (fetchWorkScheduleByIdService.fulfilled.match(resultAction)) {
            const data = resultAction.payload;

            if (data.userInfo) {
              setSelectedUser(data.userInfo);
            }

            if (data.scheduleTypeEnumName) {
              setSelectedScheduleType(data.scheduleTypeEnumName);
            }

            reset({
              id: data.id,
              userId: data.userInfo?.id || currentUser?.userId || "",
              businessId: data.businessId || AppDefault.BUSINESS_ID,
              name: data.name || "",
              scheduleTypeEnumName: data.scheduleTypeEnumName || "",
              workDays: data.workDays || [],
              startTime: data.startTime || "",
              endTime: data.endTime || "",
              breakStartTime: data.breakStartTime || "",
              breakEndTime: data.breakEndTime || "",
            });
          }
        } catch (error) {
          console.error("Error fetching work schedule data:", error);
          fetchedWorkScheduleIdRef.current = null;
        }
      };

      fetchWorkScheduleData();
    }

    // Handle CREATE mode
    if (isCreate) {
      setSelectedUser(null);
      setSelectedScheduleType("");
      reset({
        userId: currentUser?.userId || "",
        businessId: AppDefault.BUSINESS_ID,
        name: "",
        scheduleTypeEnumName: "",
        workDays: [],
        startTime: "",
        endTime: "",
        breakStartTime: "",
        breakEndTime: "",
      });
    }

    // Clear errors
    dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onSubmit = async (data: WorkScheduleTypeFormData) => {
    try {
      if (isCreate) {
        const payload: CreateWorkScheduleRequest = {
          userId: data.userId,
          businessId: data.businessId,
          name: data.name,
          scheduleTypeEnumName: data.scheduleTypeEnumName,
          workDays: data.workDays,
          startTime: data.startTime,
          endTime: data.endTime,
          breakStartTime: data.breakStartTime,
          breakEndTime: data.breakEndTime,
        };

        const result = await dispatch(
          createWorkScheduleService(payload),
        ).unwrap();

        showToast.success(
          `Work schedule "${result.name}" created successfully`,
        );
        handleClose();
      } else {
        const payload: UpdateWorkScheduleRequest = {
          name: data.name,
          scheduleTypeEnumName: data.scheduleTypeEnumName,
          workDays: data.workDays,
          startTime: data.startTime,
          endTime: data.endTime,
          breakStartTime: data.breakStartTime,
          breakEndTime: data.breakEndTime,
        };

        const result = await dispatch(
          updateWorkScheduleService({ id: data.id, param: payload }),
        ).unwrap();

        showToast.success(
          `Work schedule "${result.name}" updated successfully`,
        );
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error || `Failed to ${isCreate ? "create" : "update"} work schedule`,
      );
    }
  };

  const handleClose = () => {
    reset();
    setSelectedUser(null);
    setSelectedScheduleType("");
    fetchedWorkScheduleIdRef.current = null;
    isInitializedRef.current = false;
    dispatch(clearError());
    dispatch(clearSelectedWorkSchedule());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Work Schedule" : "Edit Work Schedule"}
          description={
            isCreate
              ? "Fill out the form to create a new work schedule"
              : "Update work schedule information below"
          }
        />

        {!isCreate && isFetchingDetail ? (
          <div className="p-6 flex items-center justify-center min-h-[400px] flex-1">
            <Loading />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <FormBody>
              {reduxError && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-sm text-destructive font-medium">
                    {reduxError}
                  </p>
                </div>
              )}

              {/* User Selection */}
              <ComboboxSelectUser
                dataSelect={selectedUser}
                onChangeSelected={(user) => {
                  setSelectedUser(user);
                  setValue("userId", user?.id || "", { shouldValidate: true });
                }}
                disabled={isSubmitting}
                label="Select User"
                required
                error={errors.userId?.message}
              />

              {/* Schedule Name */}
              <TextField
                control={control}
                name="name"
                label="Schedule Name"
                placeholder="Enter schedule name"
                required
                disabled={isSubmitting}
                error={errors.name}
              />

              {/* Schedule Type */}
              <ComboboxSelectScheduleType
                value={selectedScheduleType}
                onValueChange={(value) => {
                  setSelectedScheduleType(value);
                  setValue("scheduleTypeEnumName", value, {
                    shouldValidate: true,
                  });
                }}
                disabled={isSubmitting}
                label="Schedule Type"
                required
                placeholder="Select schedule type"
                error={errors.scheduleTypeEnumName?.message}
              />

              {/* Work Days */}
              <MultiSelectDaysField
                control={control}
                name="workDays"
                label="Work Days"
                required
                disabled={isSubmitting}
                error={errors.workDays as any}
              />

              {/* Start Time */}
              <TimePickerField
                control={control}
                name="startTime"
                label="Start Time"
                placeholder="Select start time"
                required
                disabled={isSubmitting}
                error={errors.startTime}
              />

              {/* End Time */}
              <TimePickerField
                control={control}
                name="endTime"
                label="End Time"
                placeholder="Select end time"
                required
                disabled={isSubmitting}
                error={errors.endTime}
              />

              {/* Break Start Time */}
              <TimePickerField
                control={control}
                name="breakStartTime"
                label="Break Start Time (Optional)"
                placeholder="Select break start time"
                disabled={isSubmitting}
                error={errors.breakStartTime}
              />

              {/* Break End Time */}
              <TimePickerField
                control={control}
                name="breakEndTime"
                label="Break End Time (Optional)"
                placeholder="Select break end time"
                disabled={isSubmitting}
                error={errors.breakEndTime}
              />
            </FormBody>

            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage="Creating work schedule..."
              updateMessage="Updating work schedule..."
            >
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Work Schedule"
                updateText="Update Work Schedule"
                submittingCreateText="Creating..."
                submittingUpdateText="Updating..."
              />
            </FormFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
