"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import Loading from "@/components/shared/common/loading";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreateProductRequest,
  UpdateProductRequest,
} from "../store/models/request/product-request";
import {
  createProductSchema,
  updateProductSchema,
  ProductFormData,
} from "../store/models/schema/product.schema";
import {
  fetchProductByIdService,
  createProductService,
  updateProductService,
} from "../store/thunks/product-thunks";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import { clearError, clearSelectedProduct } from "../store/slice/product-slice";
import {
  selectError,
  selectOperations,
  selectSelectedProduct,
  selectIsFetchingDetail,
} from "../store/selectors/product-selector";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { ModalMode } from "@/constants/status/status";
import {
  PRODUCT_STATUS_OPTIONS,
  PROMOTION_TYPE_OPTIONS,
} from "@/constants/status/create-update-status";

type Props = {
  mode: ModalMode;
  productId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function ProductModal({
  isOpen,
  onClose,
  productId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const productData = useAppSelector(selectSelectedProduct);
  const { isCreating, isUpdating } = operations;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(
      isCreate ? createProductSchema : updateProductSchema
    ) as any,
    defaultValues: {
      id: "",
      name: "",
      description: "",
      categoryId: "",
      brandId: "",
      price: 0,
      mainImageUrl: "",
      promotionType: "",
      promotionValue: 0,
      promotionFromDate: "",
      promotionToDate: "",
      images: [],
      sizes: [],
      status: "ACTIVE",
    },
    mode: "onChange",
  });

  // Field arrays for images and sizes
  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: "images",
  });

  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control,
    name: "sizes",
  });

  const productName = watch("name");
  const mainImageUrl = watch("mainImageUrl");

  // Fetch product data for edit mode
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(fetchProductByIdService(productId));

        if (fetchProductByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          reset({
            id: data.id,
            name: data.name || "",
            description: data.description || "",
            categoryId: data.categoryId || "",
            brandId: data.brandId || "",
            price: data.price || 0,
            mainImageUrl: data.mainImageUrl || "",
            promotionType: data.promotionType || "",
            promotionValue: data.promotionValue || 0,
            promotionFromDate: data.promotionFromDate || "",
            promotionToDate: data.promotionToDate || "",
            images: data.images || [],
            sizes: data.sizes || [],
            status: data.status || "ACTIVE",
          });
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductData();
  }, [productId, isOpen, isCreate, reset, dispatch]);

  // Reset form for create mode
  useEffect(() => {
    if (isOpen && isCreate) {
      reset({
        name: "",
        description: "",
        categoryId: "",
        brandId: "",
        price: 0,
        mainImageUrl: "",
        promotionType: "",
        promotionValue: 0,
        promotionFromDate: "",
        promotionToDate: "",
        images: [],
        sizes: [],
        status: "ACTIVE",
      });
    }
  }, [isOpen, isCreate, reset]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isCreate) {
        const payload: CreateProductRequest = {
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          brandId: data.brandId || undefined,
          price: data.price,
          mainImageUrl: data.mainImageUrl,
          promotionType: data.promotionType || undefined,
          promotionValue: data.promotionValue || undefined,
          promotionFromDate: data.promotionFromDate || undefined,
          promotionToDate: data.promotionToDate || undefined,
          images: data.images || [],
          sizes: data.sizes || [],
          status: data.status,
        };

        const result = await dispatch(createProductService(payload)).unwrap();
        showToast.success(`Product "${result.name}" created successfully`);
        handleClose();
      } else {
        const payload: UpdateProductRequest = {
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          brandId: data.brandId || undefined,
          price: data.price,
          mainImageUrl: data.mainImageUrl,
          promotionType: data.promotionType || undefined,
          promotionValue: data.promotionValue || undefined,
          promotionFromDate: data.promotionFromDate || undefined,
          promotionToDate: data.promotionToDate || undefined,
          images: data.images || [],
          sizes: data.sizes || [],
          status: data.status,
        };

        const result = await dispatch(
          updateProductService({ productId: data.id!, productData: payload })
        ).unwrap();
        showToast.success(`Product "${result.name}" updated successfully`);
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error || `Failed to ${isCreate ? "create" : "update"} product`
      );
    }
  };

  const handleClose = () => {
    reset();
    dispatch(clearError());
    dispatch(clearSelectedProduct());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] max-w-6xl max-h-[90vh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Product" : "Edit Product"}
          description={
            isCreate
              ? "Fill out the form to create a new product"
              : "Update product information below"
          }
          avatarName={productName}
          avatarImageUrl={mainImageUrl}
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

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    control={control}
                    name="name"
                    label="Product Name"
                    placeholder="Enter product name"
                    required
                    disabled={isSubmitting}
                    error={errors.name}
                  />

                  <SelectField
                    control={control}
                    name="categoryId"
                    label="Category"
                    placeholder="Select category"
                    options={[]} // You need to provide category options
                    required
                    disabled={isSubmitting}
                    error={errors.categoryId}
                  />

                  <SelectField
                    control={control}
                    name="brandId"
                    label="Brand"
                    placeholder="Select brand (optional)"
                    options={[]} // You need to provide brand options
                    disabled={isSubmitting}
                    error={errors.brandId}
                  />

                  <TextField
                    control={control}
                    name="price"
                    label="Price"
                    type="number"
                    placeholder="Enter price"
                    required
                    disabled={isSubmitting}
                    error={errors.price}
                  />

                  <SelectField
                    control={control}
                    name="status"
                    label="Status"
                    placeholder="Select status"
                    options={PRODUCT_STATUS_OPTIONS}
                    required
                    disabled={isSubmitting}
                    error={errors.status}
                  />

                  <TextField
                    control={control}
                    name="mainImageUrl"
                    label="Main Image URL"
                    placeholder="Enter main image URL"
                    required
                    disabled={isSubmitting}
                    error={errors.mainImageUrl}
                  />

                  <div className="col-span-2">
                    <TextareaField
                      control={control}
                      name="description"
                      label="Description"
                      placeholder="Enter product description"
                      rows={4}
                      required
                      disabled={isSubmitting}
                      error={errors.description}
                    />
                  </div>
                </div>
              </div>

              {/* Promotion Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Promotion (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    control={control}
                    name="promotionType"
                    label="Promotion Type"
                    placeholder="Select promotion type"
                    options={PROMOTION_TYPE_OPTIONS}
                    disabled={isSubmitting}
                    error={errors.promotionType}
                  />

                  <TextField
                    control={control}
                    name="promotionValue"
                    label="Promotion Value"
                    type="number"
                    placeholder="Enter promotion value"
                    disabled={isSubmitting}
                    error={errors.promotionValue}
                  />

                  <TextField
                    control={control}
                    name="promotionFromDate"
                    label="Promotion From Date"
                    type="datetime-local"
                    placeholder="Select start date"
                    disabled={isSubmitting}
                    error={errors.promotionFromDate}
                  />

                  <TextField
                    control={control}
                    name="promotionToDate"
                    label="Promotion To Date"
                    type="datetime-local"
                    placeholder="Select end date"
                    disabled={isSubmitting}
                    error={errors.promotionToDate}
                  />
                </div>
              </div>

              {/* Product Images */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Product Images</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendImage({ imageUrl: "" })}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                </div>

                {imageFields.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      No images added yet. Click "Add Image" to add product
                      images.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {imageFields.map((field, index) => (
                      <Card key={field.id}>
                        <CardContent className="pt-6">
                          <div className="flex gap-4 items-start">
                            <div className="flex-1">
                              <TextField
                                control={control}
                                name={`images.${index}.imageUrl`}
                                label={`Image ${index + 1} URL`}
                                placeholder="Enter image URL"
                                disabled={isSubmitting}
                                error={errors.images?.[index]?.imageUrl as any}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeImage(index)}
                              disabled={isSubmitting}
                              className="mt-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Sizes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Product Sizes</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendSize({
                        name: "",
                        price: 0,
                        promotionType: "",
                        promotionValue: 0,
                        promotionFromDate: "",
                        promotionToDate: "",
                      })
                    }
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Size
                  </Button>
                </div>

                {sizeFields.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      No sizes added yet. Click "Add Size" to add product sizes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sizeFields.map((field, index) => (
                      <Card key={field.id}>
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Size {index + 1}
                            </CardTitle>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeSize(index)}
                              disabled={isSubmitting}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <TextField
                              control={control}
                              name={`sizes.${index}.name`}
                              label="Size Name"
                              placeholder="e.g., Small, Medium, Large"
                              disabled={isSubmitting}
                              error={errors.sizes?.[index]?.name as any}
                            />

                            <TextField
                              control={control}
                              name={`sizes.${index}.price`}
                              label="Price"
                              type="number"
                              placeholder="Enter price"
                              disabled={isSubmitting}
                              error={errors.sizes?.[index]?.price as any}
                            />

                            <SelectField
                              control={control}
                              name={`sizes.${index}.promotionType`}
                              label="Promotion Type"
                              placeholder="Select promotion type"
                              options={PROMOTION_TYPE_OPTIONS}
                              disabled={isSubmitting}
                              error={
                                errors.sizes?.[index]?.promotionType as any
                              }
                            />

                            <TextField
                              control={control}
                              name={`sizes.${index}.promotionValue`}
                              label="Promotion Value"
                              type="number"
                              placeholder="Enter promotion value"
                              disabled={isSubmitting}
                              error={
                                errors.sizes?.[index]?.promotionValue as any
                              }
                            />

                            <TextField
                              control={control}
                              name={`sizes.${index}.promotionFromDate`}
                              label="Promotion From"
                              type="datetime-local"
                              disabled={isSubmitting}
                              error={
                                errors.sizes?.[index]?.promotionFromDate as any
                              }
                            />

                            <TextField
                              control={control}
                              name={`sizes.${index}.promotionToDate`}
                              label="Promotion To"
                              type="datetime-local"
                              disabled={isSubmitting}
                              error={
                                errors.sizes?.[index]?.promotionToDate as any
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage="Creating product..."
              updateMessage="Updating product..."
            >
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Product"
                updateText="Update Product"
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
