/**
 * REFACTORED Brand Modal - Example using new Dynamic Modal System
 *
 * This demonstrates the new pattern with:
 * - DynamicModal for flexible sizing (lg = good for 2-column)
 * - FormGrid with 2-column layout
 * - FormSection for organizing fields
 * - Same functionality as before, cleaner code
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
import { BANNER_STATUS_CREATE_UPDATE } from "@/constants/status/create-update-status";
import {
  CreateBrandData,
  createBrandSchema,
  updateBrandSchema,
} from "../store/models/schema/brand-schema";
import {
  createBrandService,
  fetchBrandByIdService,
  updateBrandService,
} from "../store/thunks/brand-thunks";
import { clearError, clearSelectedBrand } from "../store/slice/brand-slice";
import {
  selectError,
  selectIsFetchingDetail,
  selectOperations,
} from "../store/selectors/brand-selector";

type Props = {
  mode: ModalMode;
  brandId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function BrandModalRefactored({ isOpen, onClose, brandId, mode }: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const dispatch = useAppDispatch();
  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating } = operations;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<CreateBrandData>({
    resolver: zodResolver(isCreate ? createBrandSchema : updateBrandSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      description: "",
      status: Status.ACTIVE,
    },
    mode: "onChange",
  });

  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        imageUrl: "",
        description: "",
        status: Status.ACTIVE,
      });
    }
  }, [isOpen, brandId, reset]);

  useEffect(() => {
    const fetchBrandData = async () => {
      if (!brandId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(fetchBrandByIdService(brandId));

        if (fetchBrandByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          reset({
            name: data?.name || "",
            imageUrl: data?.imageUrl || "",
            description: data?.description || "",
            status: data?.status || "",
          });
        }
      } catch (error) {
        console.error("Error fetching brand data:", error);
      }
    };

    fetchBrandData();
  }, [brandId, isOpen, isCreate, reset, dispatch]);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: CreateBrandData) => {
    try {
      let finalImageUrl = data.imageUrl;

      if (finalImageUrl && isBase64Image(finalImageUrl)) {
        setIsUploadingImage(true);
        try {
          finalImageUrl = await uploadImage(finalImageUrl);
        } catch (uploadError) {
          console.error("Error uploading brand image:", uploadError);
          showToast.error("Failed to upload brand image. Please try again.");
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const payload: CreateBrandData = {
        name: data?.name || "",
        imageUrl: finalImageUrl,
        description: data.description || "",
        status: data.status,
      };

      if (isCreate) {
        await dispatch(createBrandService(payload)).unwrap();
        showToast.success("Brand created successfully");
        handleClose();
      } else {
        await dispatch(
          updateBrandService({ brandId: brandId!, brandData: payload })
        ).unwrap();
        showToast.success("Brand updated successfully");
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error?.message || `Failed to ${isCreate ? "create" : "update"} brand`
      );
    }
  };

  const handleClose = () => {
    reset();
    setIsUploadingImage(false);
    dispatch(clearError());
    dispatch(clearSelectedBrand());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;
  const isProcessing = isSubmitting || isUploadingImage;

  return (
    <DynamicModal
      isOpen={isOpen}
      onClose={handleClose}
      size={ModalSizePresets.standardForm} // "lg" - Perfect for 2-column layout
    >
      <FormHeader
        title={isCreate ? "Create New Brand" : "Edit Brand"}
        description={
          isCreate
            ? "Upload a logo and configure brand settings"
            : "Update brand information below"
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
              {/* Image Upload Section */}
              <FormSection>
                <ClickableImageUpload
                  label="Brand Logo"
                  value={imageUrl}
                  onChange={(base64) => setValue("imageUrl", base64)}
                  aspectRatio="square"
                  height="h-40"
                  maxSize={5}
                  required
                  error={errors.imageUrl}
                  placeholder="Click to upload brand logo"
                  helperText="PNG with transparent background recommended"
                />
              </FormSection>

              {/* Brand Details - 2 Column Layout */}
              <FormSection
                title="Brand Details"
                description="Basic brand information"
                divider
              >
                <FormGrid columns={2} gap="md">
                  <TextField
                    control={control}
                    name="name"
                    label="Brand Name"
                    placeholder="Enter brand name"
                    disabled={isProcessing}
                    error={errors.name}
                  />

                  <SelectField
                    control={control}
                    name="status"
                    label="Status"
                    placeholder="Select status"
                    options={BANNER_STATUS_CREATE_UPDATE}
                    required
                    disabled={isProcessing}
                    error={errors.status}
                  />

                  {/* Description spans full width using FormRow */}
                  <FormRow>
                    <TextareaField
                      control={control}
                      name="description"
                      label="Description"
                      placeholder="Enter brand description (optional)"
                      rows={4}
                      disabled={isProcessing}
                      error={errors.description}
                    />
                  </FormRow>
                </FormGrid>
              </FormSection>
            </div>
          </FormBody>

          <FormFooter
            isSubmitting={isProcessing}
            isDirty={isDirty}
            isCreate={isCreate}
            createMessage={isUploadingImage ? "Uploading brand..." : "Creating brand..."}
            updateMessage={isUploadingImage ? "Uploading brand..." : "Updating brand..."}
          >
            <CancelButton onClick={handleClose} disabled={isProcessing} />
            <SubmitButton
              isSubmitting={isProcessing}
              isDirty={isDirty}
              isCreate={isCreate}
              createText="Create Brand"
              updateText="Update Brand"
              submittingCreateText={isUploadingImage ? "Uploading..." : "Creating..."}
              submittingUpdateText={isUploadingImage ? "Uploading..." : "Updating..."}
            />
          </FormFooter>
        </form>
      )}
    </DynamicModal>
  );
}
