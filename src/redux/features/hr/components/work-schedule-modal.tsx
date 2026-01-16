"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Loading from "@/components/shared/common/loading";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { getArrayFieldError } from "@/utils/common/get-field-error";
import {
  AccountStatus,
  ModalMode,
  UserGropeType,
} from "@/constants/status/status";
import {
  ACCOUNT_STATUS_CREATE_UPDATE,
  USER_BUSINESS_ROLE_CREATE_UPDATE,
} from "@/constants/status/create-update-status";
import {
  selectError,
  selectIsFetchingDetail,
  selectOperations,
  selectSelectedWorkSchedule,
} from "../store/selectors/work-schedule-selectors";
import {
  createWorkScheduleSchema,
  updateWorkScheduleSchema,
  WorkScheduleFormData,
} from "../store/models/schema/work-schedule.schema";
import { fetchWorkScheduleByIdService } from "../store/thunks/work-schedule-thunks";
import { clearError } from "../store/slice/work-schedule-slice";

type Props = {
  mode: ModalMode;
  workScheduleId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function UserBusinessModal({
  isOpen,
  onClose,
  workScheduleId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const workScheduleData = useAppSelector(selectSelectedWorkSchedule);
  const { isCreating, isUpdating } = operations;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<WorkScheduleFormData>({
    resolver: zodResolver(
      isCreate ? createWorkScheduleSchema : updateWorkScheduleSchema
    ) as any,
    defaultValues: {
      id: "",
      enumName: "",
      description: "",
    },
    mode: "onChange",
  });

  // Fetch user data for edit mode
  useEffect(() => {
    const fetchWorkScheduleData = async () => {
      if (!workScheduleId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(
          fetchWorkScheduleByIdService(workScheduleId)
        );

        if (fetchWorkScheduleByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          reset({
            id: data.id,
            enumName: data.enumName || "",
            description: data.description || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user business data:", error);
      }
    };

    fetchWorkScheduleData();
  }, [workScheduleId, isOpen, isCreate, reset, dispatch]);

  // Reset form for create mode
  useEffect(() => {
    if (isOpen && isCreate) {
      reset({
        enumName: "",
        description: "",
      });
    }
  }, [isOpen, isCreate, reset]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isCreate) {
        const payload: CreateUserRequest = {
          userIdentifier: data.userIdentifier!,
          email: data.email,
          password: data.password!,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          userType: data.userType!,
          accountStatus: data.accountStatus,
          roles: data.roles,
          position: data.position || undefined,
          address: data.address || undefined,
          notes: data.notes || undefined,
        };

        const result = await dispatch(createUserService(payload)).unwrap();
        showToast.success(
          `User business "${
            result.userIdentifier || result.email
          }" created successfully`
        );
        handleClose();
      } else {
        const payload: UpdateUserRequest = {
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          accountStatus: data.accountStatus,
          roles: data.roles,
          position: data.position || undefined,
          address: data.address || undefined,
          notes: data.notes || undefined,
        };

        const result = await dispatch(
          updateUserService({ userId: data.id, userData: payload })
        ).unwrap();
        showToast.success(
          `User business "${
            result.fullName || result.email
          }" updated successfully`
        );
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error || `Failed to ${isCreate ? "create" : "update"} user business`
      );
    }
  };

  const handleClose = () => {
    reset();
    dispatch(clearError());
    dispatch(clearSelectedUser());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New User Business" : "Edit User Business"}
          description={
            isCreate
              ? "Fill out the form to create a new user business account"
              : "Update user business information below"
          }
          avatarName={userIdentifier || email}
          avatarImageUrl={workScheduleData?.profileImageUrl}
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

              {/* Changed: grid-cols-2 (always 2 columns, no responsive) */}
              <div className="grid grid-cols-2 gap-4">
                {isCreate && (
                  <>
                    <TextField
                      control={control}
                      name="userIdentifier"
                      label="User Identifier"
                      placeholder="Enter user identifier"
                      required
                      disabled={isSubmitting}
                      error={errors.userIdentifier}
                    />

                    <TextField
                      control={control}
                      name="email"
                      label="Email"
                      type="email"
                      placeholder="Enter email address"
                      required
                      disabled={isSubmitting}
                      error={errors.email}
                    />
                  </>
                )}

                <TextField
                  control={control}
                  name="firstName"
                  label="First Name"
                  placeholder="Enter first name"
                  required
                  disabled={isSubmitting}
                  error={errors.firstName}
                />

                <TextField
                  control={control}
                  name="lastName"
                  label="Last Name"
                  placeholder="Enter last name"
                  required
                  disabled={isSubmitting}
                  error={errors.lastName}
                />

                <TextField
                  control={control}
                  name="phoneNumber"
                  label="Phone Number"
                  placeholder="Enter phone number"
                  required
                  disabled={isSubmitting}
                  error={errors.phoneNumber}
                />

                <TextField
                  control={control}
                  name="position"
                  label="Position"
                  placeholder="Enter position (optional)"
                  disabled={isSubmitting}
                  error={errors.position}
                />

                {/* Changed: col-span-2 (always full width, no responsive) */}
                <div className="col-span-2">
                  <TextField
                    control={control}
                    name="address"
                    label="Address"
                    placeholder="Enter address (optional)"
                    disabled={isSubmitting}
                    error={errors.address}
                  />
                </div>

                {isCreate && (
                  <PasswordField
                    control={control}
                    name="password"
                    label="Password"
                    placeholder="Enter password"
                    required
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    error={errors.password}
                  />
                )}

                <SelectField
                  control={control}
                  name="roles"
                  label="User Role"
                  placeholder="Select user role"
                  options={USER_BUSINESS_ROLE_CREATE_UPDATE}
                  required
                  disabled={isSubmitting}
                  error={getArrayFieldError(errors.roles)}
                  onValueChange={(value) => {
                    setValue("roles", [value], {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />

                <SelectField
                  control={control}
                  name="accountStatus"
                  label="Account Status"
                  placeholder="Select account status"
                  options={ACCOUNT_STATUS_CREATE_UPDATE}
                  required
                  disabled={isSubmitting}
                  error={errors.accountStatus}
                />
              </div>

              <TextareaField
                control={control}
                name="notes"
                label="Notes"
                placeholder="Enter any additional notes (optional)"
                rows={5}
                disabled={isSubmitting}
                error={errors.notes}
              />
            </FormBody>

            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage="Creating user..."
              updateMessage="Updating user..."
            >
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create User"
                updateText="Update User"
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
