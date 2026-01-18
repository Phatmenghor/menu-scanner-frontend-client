/**
 * =============================================================================
 * CRUD MODAL TEMPLATE - COPY THIS FILE FOR NEW ADMIN PAGES
 * =============================================================================
 *
 * This template provides a complete pattern for creating admin CRUD modals
 * with dynamic width and flexible layouts.
 *
 * USAGE:
 * 1. Copy this file to your feature components folder
 * 2. Rename it (e.g., your-feature-modal.tsx)
 * 3. Replace all "ENTITY" placeholders with your entity name
 * 4. Update the form fields in the FormGrid sections
 * 5. Update the schema and Redux imports
 *
 * MODAL SIZES:
 * - "md": 2-3 simple fields
 * - "lg": Good for 2-column forms (recommended for most)
 * - "2xl": Complex multi-section forms
 * - "3xl": Forms with image galleries
 *
 * =============================================================================
 */

"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DynamicModal, ModalSizePresets } from "@/components/shared/modal/dynamic-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { FormGrid, FormSection, FormRow } from "@/components/shared/form-field/form-grid";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import Loading from "@/components/shared/common/loading";
import { ModalMode, Status } from "@/constants/status/status";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { uploadImage, isBase64Image } from "@/utils/common/upload-image";
import { showToast } from "@/components/shared/common/show-toast";

// TODO: Replace with your schema imports
// import { CreateEntitySchema, createEntitySchema, updateEntitySchema } from "../store/models/schema/entity-schema";

// TODO: Replace with your Redux imports
// import { createEntity, fetchEntityById, updateEntity } from "../store/thunks/entity-thunks";
// import { clearError, clearSelectedEntity } from "../store/slice/entity-slice";
// import { selectError, selectIsFetchingDetail, selectOperations } from "../store/selectors/entity-selector";

// TODO: Replace with your status options
// import { ENTITY_STATUS_OPTIONS } from "@/constants/status/create-update-status";

interface EntityModalProps {
  mode: ModalMode;
  entityId?: string;
  onClose: () => void;
  isOpen: boolean;
}

/**
 * ENTITY Modal - Create/Edit
 *
 * CONFIGURATION:
 * - Modal Size: "lg" (good for 2-column layout)
 * - Layout: 2-column grid for most fields
 * - Form validation: Zod schema with react-hook-form
 */
export default function EntityModal({
  isOpen,
  onClose,
  entityId,
  mode,
}: EntityModalProps) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const dispatch = useAppDispatch();

  // TODO: Replace with your selectors
  // const operations = useAppSelector(selectOperations);
  // const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  // const reduxError = useAppSelector(selectError);
  // const { isCreating, isUpdating } = operations;

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    // TODO: Replace with your schema
    // resolver: zodResolver(isCreate ? createEntitySchema : updateEntitySchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      description: "",
      status: Status.ACTIVE,
    },
    mode: "onChange",
  });

  const imageUrl = watch("imageUrl");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        imageUrl: "",
        description: "",
        status: Status.ACTIVE,
      });
    }
  }, [isOpen, reset]);

  // Fetch data for edit mode
  useEffect(() => {
    const fetchData = async () => {
      if (!entityId || !isOpen || isCreate) return;

      try {
        // TODO: Replace with your fetch thunk
        // const resultAction = await dispatch(fetchEntityById(entityId));
        // if (fetchEntityById.fulfilled.match(resultAction)) {
        //   const data = resultAction.payload;
        //   reset({
        //     name: data?.name || "",
        //     imageUrl: data?.imageUrl || "",
        //     description: data?.description || "",
        //     status: data?.status || Status.ACTIVE,
        //   });
        // }
      } catch (error) {
        console.error("Error fetching entity:", error);
      }
    };

    fetchData();
  }, [entityId, isOpen, isCreate, reset, dispatch]);

  // Clear errors on mount
  useEffect(() => {
    if (isOpen) {
      // TODO: dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: any) => {
    try {
      let finalImageUrl = data.imageUrl;

      // Upload image if base64
      if (finalImageUrl && isBase64Image(finalImageUrl)) {
        setIsUploadingImage(true);
        try {
          finalImageUrl = await uploadImage(finalImageUrl);
        } catch (error) {
          showToast.error("Failed to upload image");
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const payload = {
        name: data.name,
        imageUrl: finalImageUrl,
        description: data.description,
        status: data.status,
      };

      if (isCreate) {
        // TODO: await dispatch(createEntity(payload)).unwrap();
        showToast.success("Entity created successfully");
      } else {
        // TODO: await dispatch(updateEntity({ id: entityId!, data: payload })).unwrap();
        showToast.success("Entity updated successfully");
      }

      handleClose();
    } catch (error: any) {
      showToast.error(error?.message || "Operation failed");
    }
  };

  const handleClose = () => {
    reset();
    setIsUploadingImage(false);
    // TODO: dispatch(clearError());
    // TODO: dispatch(clearSelectedEntity());
    onClose();
  };

  // TODO: Replace with your loading states
  const isSubmitting = false; // isCreate ? isCreating : isUpdating;
  const isProcessing = isSubmitting || isUploadingImage;
  const isFetchingDetail = false;
  const reduxError = null;

  return (
    <DynamicModal
      isOpen={isOpen}
      onClose={handleClose}
      size={ModalSizePresets.standardForm} // "lg" - good for 2-column
    >
      <FormHeader
        title={isCreate ? "Create New Entity" : "Edit Entity"}
        description={
          isCreate
            ? "Fill in the details to create a new entity"
            : "Update entity information below"
        }
        isCreate={isCreate}
      />

      {!isCreate && (isFetchingDetail || !imageUrl) ? (
        <div className="p-6 flex items-center justify-center min-h-[400px] flex-1">
          <Loading />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <FormBody>
            {/* Redux Error Display */}
            {reduxError && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg mb-4">
                <p className="text-sm text-destructive font-medium">
                  {reduxError}
                </p>
              </div>
            )}

            <div className="space-y-6">
              {/*
                SECTION 1: Image Upload (Optional)
                Remove this if your entity doesn't need images
              */}
              <FormSection>
                <ClickableImageUpload
                  label="Entity Image"
                  value={imageUrl}
                  onChange={(base64) => setValue("imageUrl", base64)}
                  aspectRatio="square"
                  height="h-40"
                  maxSize={5}
                  error={errors.imageUrl}
                  placeholder="Click to upload image"
                />
              </FormSection>

              {/*
                SECTION 2: Basic Information (2-Column)
                This is the main pattern - 2 columns for most fields
              */}
              <FormSection
                title="Basic Information"
                description="Primary entity details"
                divider
              >
                <FormGrid columns={2} gap="md">
                  <TextField
                    control={control}
                    name="name"
                    label="Entity Name"
                    placeholder="Enter name"
                    disabled={isProcessing}
                    error={errors.name}
                  />

                  <SelectField
                    control={control}
                    name="status"
                    label="Status"
                    placeholder="Select status"
                    options={[
                      { value: Status.ACTIVE, label: "Active" },
                      { value: Status.INACTIVE, label: "Inactive" },
                    ]}
                    required
                    disabled={isProcessing}
                    error={errors.status}
                  />

                  {/*
                    FormRow: For fields that need full width
                    Use this for TextArea or long fields
                  */}
                  <FormRow>
                    <TextareaField
                      control={control}
                      name="description"
                      label="Description"
                      placeholder="Enter description (optional)"
                      rows={4}
                      disabled={isProcessing}
                      error={errors.description}
                    />
                  </FormRow>
                </FormGrid>
              </FormSection>

              {/*
                SECTION 3: Additional Fields (Optional)
                Add more sections as needed
              */}
              {/* <FormSection
                title="Additional Settings"
                description="Optional configuration"
                divider
              >
                <FormGrid columns={2}>
                  <TextField
                    control={control}
                    name="field1"
                    label="Field 1"
                    placeholder="Enter value"
                  />
                  <TextField
                    control={control}
                    name="field2"
                    label="Field 2"
                    placeholder="Enter value"
                  />
                </FormGrid>
              </FormSection> */}
            </div>
          </FormBody>

          <FormFooter
            isSubmitting={isProcessing}
            isDirty={isDirty}
            isCreate={isCreate}
            createMessage={isUploadingImage ? "Uploading..." : "Creating..."}
            updateMessage={isUploadingImage ? "Uploading..." : "Updating..."}
          >
            <CancelButton onClick={handleClose} disabled={isProcessing} />
            <SubmitButton
              isSubmitting={isProcessing}
              isDirty={isDirty}
              isCreate={isCreate}
              createText="Create Entity"
              updateText="Update Entity"
              submittingCreateText={isUploadingImage ? "Uploading..." : "Creating..."}
              submittingUpdateText={isUploadingImage ? "Uploading..." : "Updating..."}
            />
          </FormFooter>
        </form>
      )}
    </DynamicModal>
  );
}
