"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  X,
  ImageIcon,
  Loader2,
  Package,
  Star,
  ImageIcon as ImageLucide,
  AlertCircle,
  CheckCircle,
  Percent,
  Calendar,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  productFormData,
  ProductFormSchema,
} from "@/models/(content-manangement)/product/product.schema";
import { ModalMode } from "@/constants/app-resource/status/status";
import { ComboboxSelectCategory } from "../../combo-box/combobox-category";
import { CategoryModel } from "@/models/(content-manangement)/category/category.response";
import { BrandModel } from "@/models/(content-manangement)/brand/brand.response";
import { ComboboxSelectBrand } from "../../combo-box/combobox-brand";
import { uploadImageService } from "@/services/dashboard/image/image.service";
import { UploadImageRequest } from "@/models/image/image.request";
import { AppToast } from "@/components/app/components/app-toast";
import { PriceInput } from "../../common/price-input";
import { size } from "zod";
import { getCategoryByIdService } from "@/services/dashboard/content-management/category/category.service";
import { getBrandByIdService } from "@/services/dashboard/content-management/brand/brand.service";

// Types
type ImageType = "MAIN" | "GALLERY";
type ImageData = {
  imageUrl: string;
  imageType: ImageType;
};

type Props = {
  mode: ModalMode;
  data: productFormData | null;
  onClose: () => void;
  isOpen: boolean;
  isSubmitting?: boolean;
  onSave: (data: productFormData) => void;
};

// Image Management Hook - FIXED
const useImageManagement = (control: any, setValue: any, watch: any) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadImageType, setUploadImageType] = useState<ImageType>("GALLERY");

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
    update: updateImage,
  } = useFieldArray({
    control,
    name: "images",
  });

  // FIXED: Use watch instead of control._formValues
  const watchedImages: ImageData[] = watch("images") || [];

  // Image type utilities
  const getMainImage = () =>
    watchedImages.find((img: ImageData) => img.imageType === "MAIN");

  const hasMainImage = () => !!getMainImage();

  const getMainImageIndex = () =>
    watchedImages.findIndex((img: ImageData) => img.imageType === "MAIN");

  const getImageCounts = () => ({
    main: watchedImages.filter((img: ImageData) => img.imageType === "MAIN")
      .length,
    gallery: watchedImages.filter(
      (img: ImageData) => img.imageType === "GALLERY"
    ).length,
    total: watchedImages.length,
  });

  const handleFileUpload = async (file: File, imageType: ImageType) => {
    if (!file || !file.type.startsWith("image/")) {
      AppToast({
        type: "error",
        message: "Please select a valid image file.",
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");
      return;
    }

    // Check if trying to upload MAIN image when one already exists
    if (imageType === "MAIN" && hasMainImage()) {
      const confirmReplace = window.confirm(
        "You already have a main image. Do you want to replace it with this new image?"
      );
      if (!confirmReplace) return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(",")[1];

        const payload: UploadImageRequest = {
          base64: base64Data,
          type: file.type,
        };

        const response = await uploadImageService(payload);
        if (response?.imageUrl) {
          if (imageType === "MAIN" && hasMainImage()) {
            // Replace existing main image
            const mainImageIndex = getMainImageIndex();
            if (mainImageIndex !== -1) {
              updateImage(mainImageIndex, {
                imageUrl: response.imageUrl,
                imageType: "MAIN",
              });
            }
          } else {
            // Add new image
            appendImage({
              imageUrl: response.imageUrl,
              imageType: imageType,
            });
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to upload image", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleImageType = (index: number) => {
    const currentImage = watchedImages[index];
    if (currentImage.imageType === "MAIN") {
      // Converting MAIN to GALLERY
      updateImage(index, {
        ...currentImage,
        imageType: "GALLERY",
      });
    } else {
      // Converting GALLERY to MAIN
      if (hasMainImage()) {
        const confirmReplace = window.confirm(
          "You already have a main image. Do you want to make this image the new main image?"
        );
        if (!confirmReplace) return;
        // Convert current MAIN to GALLERY
        const mainImageIndex = getMainImageIndex();
        if (mainImageIndex !== -1) {
          updateImage(mainImageIndex, {
            ...watchedImages[mainImageIndex],
            imageType: "GALLERY",
          });
        }
      }
      // Convert this image to MAIN
      updateImage(index, {
        ...currentImage,
        imageType: "MAIN",
      });
    }
  };

  return {
    imageFields,
    watchedImages,
    isUploading,
    uploadImageType,
    setUploadImageType,
    handleFileUpload,
    removeImage,
    toggleImageType,
    getImageCounts,
    hasMainImage,
  };
};

export function ProductModal({
  isOpen,
  onClose,
  data,
  mode,
  onSave,
  isSubmitting = false,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandModel | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<productFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      images: [],
      description: "",
      brandId: "",
      price: 0,
      promotionType: undefined,
      promotionValue: 0,
      promotionFromDate: "",
      promotionToDate: "",
      sizes: [
        {
          name: "",
          price: 0,
          promotionType: "NONE",
          promotionValue: 0,
          promotionFromDate: "",
          promotionToDate: "",
        },
      ],
      status: "ACTIVE",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sizes",
  });

  watch("categoryId");
  watch("brandId");
  const promotionType = watch("promotionType");
  const watchedSizes = watch("sizes");

  const {
    imageFields,
    watchedImages,
    isUploading,
    uploadImageType,
    setUploadImageType,
    handleFileUpload,
    removeImage,
    toggleImageType,
    getImageCounts,
    hasMainImage,
  } = useImageManagement(control, setValue, watch);

  function normalizePromotionType(value: string | undefined): string {
    return value === undefined || value === null ? "NONE" : value;
  }

  function denormalizePromotionType(value: string): string | undefined {
    return value === "NONE" ? undefined : value;
  }

  const fetchCategoryDetail = useCallback(async () => {
    if (!data?.categoryId) return;
    setIsLoading(true);
    try {
      const response = await getCategoryByIdService(data?.categoryId);
      console.log("Fetched categories:", response);
      setSelectedCategory(response);
    } catch (error: any) {
      console.log("Failed to fetch categories: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [data?.categoryId]);

  const fetchBrandDetail = useCallback(async () => {
    if (!data?.brandId) return;
    setIsLoading(true);
    try {
      const response = await getBrandByIdService(data?.brandId);
      console.log("Fetched brands:", response);
      setSelectedBrand(response);
    } catch (error: any) {
      console.log("Failed to fetch brands: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [data?.brandId]);

  useEffect(() => {
    if (isOpen && data) {
      fetchCategoryDetail();
      fetchBrandDetail();
    }
  }, [isOpen, data?.id]);

  // Reset form when modal opens or data changes - FIXED
  useEffect(() => {
    if (isOpen && data) {
      console.log("=== FORM RESET ===");
      console.log("Raw data:", data);
      const formData = {
        id: data?.id,
        name: data?.name ?? "",
        categoryId: data?.categoryId ?? "",
        images: data?.images ?? [],
        description: data?.description ?? "",
        brandId: data?.brandId ?? "",
        price: data?.price ?? 0,
        promotionType: normalizePromotionType(data?.promotionType),
        promotionValue: data?.promotionValue ?? 0,
        promotionFromDate: data?.promotionFromDate || "",
        promotionToDate: data?.promotionToDate || "",
        sizes:
          data?.sizes && data.sizes.length > 0
            ? data.sizes.map((size) => ({
                ...size,
                promotionType: normalizePromotionType(size?.promotionType),
                promotionFromDate: size.promotionFromDate || "",
                promotionToDate: size.promotionToDate || "",
              }))
            : [
                {
                  name: "",
                  price: 0,
                  promotionType: "NONE",
                  promotionValue: 0,
                  promotionFromDate: "",
                  promotionToDate: "",
                },
              ],
        status: data?.status ?? "ACTIVE",
      };

      reset(formData);
    } else if (isOpen && !data) {
      // Handle create mode - reset to default values
      reset({
        name: "",
        categoryId: "",
        images: [],
        description: "",
        brandId: "",
        price: 0,
        promotionType: "NONE",
        promotionValue: 0,
        promotionFromDate: "",
        promotionToDate: "",
        sizes: [],
        status: "ACTIVE",
      });
    }
  }, [isOpen, data, reset]);

  useEffect(() => {
    if (!isOpen) {
      // Clear selected category and brand when modal closes
      setSelectedCategory(null);
      setSelectedBrand(null);
    }
  }, [isOpen]);

  useEffect(() => {
    console.log("=== FORM DEBUG ===");
    console.log("Form errors:", errors);
    console.log("Form isValid:", isValid);
    console.log("Form isDirty:", isDirty);
    console.log("Form isSubmitting:", isSubmitting);
    console.log("Current form values:", watch());

    // Check specific field errors
    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", JSON.stringify(errors, null, 2));
    }
  }, [errors, isValid, isDirty, isSubmitting, watch]);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file, uploadImageType);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const onCategoryChange = useCallback(
    (cate: CategoryModel) => {
      console.log("Selected category: ", cate);
      setSelectedCategory(cate);
      setValue("categoryId", cate.id);
    },
    [setValue]
  );

  const onBrandChange = useCallback(
    (brand: BrandModel) => {
      console.log("Selected brand: ", brand);
      setSelectedBrand(brand);
      setValue("brandId", brand.id);
    },
    [setValue]
  );

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const onSubmit = (formData: productFormData) => {
    const counts = getImageCounts();
    // Validation
    if (counts.total === 0) {
      AppToast({
        type: "warning",
        message: "Please add at least one product image.",
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    if (counts.main === 0) {
      AppToast({
        type: "warning",
        message:
          "Please set one image as the main image for the product thumbnail.",
        duration: 3000,
        position: "top-right",
      });
      return;
    }
    if (counts.main > 1) {
      AppToast({
        type: "warning",
        message:
          "You can only have one main image. Please fix this before saving.",
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    // FIX: Use denormalizePromotionType to convert "NONE" back to undefined
    const processedFormData = {
      ...formData,
      promotionType: denormalizePromotionType(formData.promotionType || "NONE"),
      sizes: formData.sizes?.map((size) => ({
        ...size,
        promotionType: denormalizePromotionType(size.promotionType || "NONE"),
      })),
    };

    const payload = {
      ...processedFormData,
      id: data?.id,
      name: processedFormData.name.trim(),
      description: processedFormData.description?.trim(),
      categoryId: processedFormData.categoryId.trim(),
      brandId: processedFormData.brandId?.trim(),
      size: processedFormData.sizes,
    };

    console.log("Payload before submit:", payload);

    onSave(payload);
    onClose();
  };

  const counts = getImageCounts();

  const getFullImageUrl = (imageUrl: string) => {
    // Handle different URL formats
    if (imageUrl.startsWith("http")) {
      return imageUrl; // Already full URL
    }
    if (imageUrl.startsWith("/")) {
      return `${process.env.NEXT_PUBLIC_API_BASE_URL}${imageUrl}`;
    }
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/${imageUrl}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isCreate ? "Create Product" : "Edit Product"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Create a new product with images, pricing, and details."
              : "Update product information and settings."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          {/* Basic Product Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Product Name */}
              <div className="space-y-1">
                <Label htmlFor="name">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="name"
                      placeholder="Enter product name"
                      disabled={isSubmitting || isUploading}
                      className={errors.name ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1">
                <Label htmlFor="categoryId">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <ComboboxSelectCategory
                      dataSelect={selectedCategory}
                      onChangeSelected={onCategoryChange}
                    />
                  )}
                />
                {errors.categoryId && (
                  <p className="text-sm text-destructive">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-1">
                <Label htmlFor="price">Base Price</Label>
                <Controller
                  control={control}
                  name="price"
                  render={({ field }) => (
                    <PriceInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Price"
                      currency="$"
                      min={0}
                    />
                  )}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">
                    {errors.price.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Brand */}
              <div className="space-y-1">
                <Label htmlFor="brandId">
                  Brand <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="brandId"
                  render={({ field }) => (
                    <ComboboxSelectBrand
                      dataSelect={selectedBrand}
                      onChangeSelected={onBrandChange}
                    />
                  )}
                />
                {errors.brandId && (
                  <p className="text-sm text-destructive">
                    {errors.brandId.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="description"
                      placeholder="Enter product description"
                      disabled={isSubmitting || isUploading}
                      className="min-h-[100px] resize-none"
                    />
                  )}
                />
              </div>

              {/* Status */}
              {!isCreate && (
                <div className="space-y-1">
                  <Label htmlFor="status">Status</Label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting || isUploading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ADDED: Promotion Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              <Label className="text-lg font-semibold">
                Promotion Settings
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
              {/* Promotion Type */}
              <div className="space-y-1">
                <Label htmlFor="promotionType">Promotion Type</Label>
                <Controller
                  control={control}
                  name="promotionType"
                  render={({ field }) => (
                    <Select
                      value={field.value === "NONE" ? undefined : field.value}
                      onValueChange={(value) =>
                        field.onChange(value || undefined)
                      }
                      disabled={isSubmitting || isUploading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select promotion type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">No Promotion</SelectItem>
                        <SelectItem value="PERCENTAGE">
                          Percentage Discount
                        </SelectItem>
                        <SelectItem value="FIXED_AMOUNT">
                          Fixed Amount Discount
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.promotionType && (
                  <p className="text-sm text-destructive">
                    {errors.promotionType.message}
                  </p>
                )}
              </div>

              {/* Promotion Value */}
              <div className="space-y-1">
                <Label htmlFor="promotionValue">
                  Promotion Value
                  {promotionType === "PERCENTAGE" && " (%)"}
                  {promotionType === "FIXED_AMOUNT" && " ($)"}
                </Label>
                <Controller
                  control={control}
                  name="promotionValue"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="promotionValue"
                      type="number"
                      step={promotionType === "PERCENTAGE" ? "1" : "0.01"}
                      min="0"
                      max={promotionType === "PERCENTAGE" ? "100" : undefined}
                      placeholder={
                        promotionType === "PERCENTAGE"
                          ? "Enter percentage (0-100)"
                          : promotionType === "FIXED_AMOUNT"
                          ? "Enter amount"
                          : "0"
                      }
                      disabled={isSubmitting || isUploading || !promotionType}
                      className={errors.promotionValue ? "border-red-500" : ""}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  )}
                />
                {errors.promotionValue && (
                  <p className="text-sm text-destructive">
                    {errors.promotionValue.message}
                  </p>
                )}
              </div>

              {/* Promotion From Date */}
              <div className="space-y-1">
                <Label
                  htmlFor="promotionFromDate"
                  className="flex items-center gap-1"
                >
                  <Calendar className="h-4 w-4" />
                  Promotion Start Date
                </Label>
                <Controller
                  control={control}
                  name="promotionFromDate"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="promotionFromDate"
                      type="datetime-local"
                      disabled={isSubmitting || isUploading || !promotionType}
                      className={
                        errors.promotionFromDate ? "border-red-500" : ""
                      }
                    />
                  )}
                />
                {errors.promotionFromDate && (
                  <p className="text-sm text-destructive">
                    {errors.promotionFromDate.message}
                  </p>
                )}
              </div>

              {/* Promotion To Date */}
              <div className="space-y-1">
                <Label
                  htmlFor="promotionToDate"
                  className="flex items-center gap-1"
                >
                  <Calendar className="h-4 w-4" />
                  Promotion End Date
                </Label>
                <Controller
                  control={control}
                  name="promotionToDate"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="promotionToDate"
                      type="datetime-local"
                      disabled={isSubmitting || isUploading || !promotionType}
                      className={errors.promotionToDate ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.promotionToDate && (
                  <p className="text-sm text-destructive">
                    {errors.promotionToDate.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Product Images Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Product Images <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  Main: {counts.main}/1
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <ImageLucide className="h-3 w-3" />
                  Gallery: {counts.gallery}
                </Badge>
                <Badge variant="secondary">Total: {counts.total}</Badge>
              </div>
            </div>
            {/* Image Type Selector */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium">Upload as:</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={uploadImageType === "MAIN" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUploadImageType("MAIN")}
                  disabled={isSubmitting || isUploading}
                  className="flex items-center gap-1"
                >
                  <Star className="h-3 w-3" />
                  Main {hasMainImage() ? "(Replace)" : ""}
                </Button>
                <Button
                  type="button"
                  variant={
                    uploadImageType === "GALLERY" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setUploadImageType("GALLERY")}
                  disabled={isSubmitting || isUploading}
                  className="flex items-center gap-1"
                >
                  <ImageLucide className="h-3 w-3" />
                  Gallery
                </Button>
              </div>
              <p className="text-xs text-gray-500 ml-auto">
                {uploadImageType === "MAIN"
                  ? "Main image is used as product thumbnail"
                  : "Gallery images are shown in product details"}
              </p>
            </div>
            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-gray-400"
              } ${isUploading ? "opacity-50" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg z-10">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-gray-600">
                      Uploading {uploadImageType.toLowerCase()} image...
                    </p>
                  </div>
                </div>
              )}
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting || isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Add {uploadImageType} Image
                  </Button>
                  <p className="mt-2 text-sm text-gray-500">
                    or drag and drop images here
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </div>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isSubmitting || isUploading}
              />
            </div>
            {/* Image Preview Grid */}
            {imageFields.length > 0 && (
              <div className="space-y-4">
                {/* Main Images */}
                {watchedImages?.filter(
                  (img: ImageData) => img.imageType === "MAIN"
                ).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Main Image (Thumbnail)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imageFields.map((image, index) => {
                        const watchedImage = watchedImages[index];
                        if (watchedImage?.imageType !== "MAIN") return null;
                        return (
                          <div key={image.id} className="relative group">
                            <div className="relative">
                              <img
                                src={
                                  getFullImageUrl(watchedImage.imageUrl) ||
                                  "/placeholder.svg?height=96&width=96"
                                }
                                alt="Main product image"
                                className="w-full h-24 object-cover rounded-lg border-2 border-yellow-400"
                              />
                              <div className="absolute top-1 left-1">
                                <Badge className="bg-yellow-500 text-white text-xs px-1 rounded flex items-center gap-1">
                                  <Star className="h-2 w-2" />
                                  MAIN
                                </Badge>
                              </div>
                            </div>
                            <div className="absolute top-1 right-1 flex gap-1">
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => toggleImageType(index)}
                                disabled={isUploading}
                                title="Convert to Gallery"
                              >
                                <ImageLucide className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                                disabled={isUploading}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Gallery Images */}
                {watchedImages?.filter(
                  (img: ImageData) => img.imageType === "GALLERY"
                ).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <ImageLucide className="h-4 w-4" />
                      Gallery Images ({counts.gallery})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imageFields.map((image, index) => {
                        const watchedImage = watchedImages[index];
                        if (watchedImage?.imageType !== "GALLERY") return null;
                        return (
                          <div key={image.id} className="relative group">
                            <div className="relative">
                              <img
                                src={
                                  getFullImageUrl(watchedImage.imageUrl) ||
                                  "/placeholder.svg?height=96&width=96"
                                }
                                alt={`Gallery image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <div className="absolute top-1 left-1">
                                <Badge className="bg-gray-600 text-white text-xs px-1 rounded flex items-center gap-1">
                                  <ImageLucide className="h-2 w-2" />
                                  GALLERY
                                </Badge>
                              </div>
                            </div>
                            <div className="absolute top-1 right-1 flex gap-1">
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => toggleImageType(index)}
                                disabled={isUploading}
                                title={
                                  hasMainImage()
                                    ? "Replace Main Image"
                                    : "Set as Main Image"
                                }
                              >
                                <Star className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                                disabled={isUploading}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Validation Messages */}
            {counts.total === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please add at least one product image.
                </AlertDescription>
              </Alert>
            )}
            {counts.total > 0 && counts.main === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please set one image as the main image for the product
                  thumbnail.
                </AlertDescription>
              </Alert>
            )}
            {counts.main > 1 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You can only have one main image. Please fix this before
                  saving.
                </AlertDescription>
              </Alert>
            )}
            {counts.main === 1 && counts.total > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Images configured correctly! You have 1 main image and{" "}
                  {counts.gallery} gallery images.
                </AlertDescription>
              </Alert>
            )}
            {errors.images && (
              <p className="text-sm text-destructive">
                {errors.images.message}
              </p>
            )}

            {fields.map((item, index) => {
              const sizePromotionType = watch(`sizes.${index}.promotionType`);

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-white shadow-sm"
                >
                  {/* 🟦 Size Name */}
                  <Controller
                    control={control}
                    name={`sizes.${index}.name`}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter size (e.g. Medium (24 oz))"
                      />
                    )}
                  />

                  {/* 🟦 Price */}
                  <Controller
                    control={control}
                    name={`sizes.${index}.price`}
                    render={({ field }) => (
                      <PriceInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Price"
                        currency="$"
                        min={0}
                      />
                    )}
                  />

                  {/* 🟦 Promotion Type */}
                  <Controller
                    control={control}
                    name={`sizes.${index}.promotionType`}
                    render={({ field }) => (
                      <Select
                        value={field.value === "NONE" ? undefined : field.value}
                        onValueChange={(value) =>
                          field.onChange(value || undefined)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select promotion type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">No Promotion</SelectItem>
                          <SelectItem value="PERCENTAGE">
                            Percentage Discount
                          </SelectItem>
                          <SelectItem value="FIXED_AMOUNT">
                            Fixed Amount Discount
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {/* 🟦 Promotion Value */}
                  {sizePromotionType !== "NONE" &&
                    sizePromotionType !== undefined && (
                      <Controller
                        control={control}
                        name={`sizes.${index}.promotionValue`}
                        render={({ field }) => (
                          <PriceInput
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Promotion Value"
                            currency={
                              watchedSizes?.[index]?.promotionType ===
                              "PERCENTAGE"
                                ? "%"
                                : "$"
                            }
                            min={0}
                          />
                        )}
                      />
                    )}

                  {/* 🟦 Promotion Dates */}
                  {sizePromotionType !== "NONE" &&
                    sizePromotionType !== undefined && (
                      <>
                        <Controller
                          control={control}
                          name={`sizes.${index}.promotionFromDate`}
                          render={({ field }) => (
                            <Input
                              type="date"
                              {...field}
                              placeholder="From Date"
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name={`sizes.${index}.promotionToDate`}
                          render={({ field }) => (
                            <Input
                              type="date"
                              {...field}
                              placeholder="To Date"
                            />
                          )}
                        />
                      </>
                    )}

                  {/* 🗑 Remove Button (Full Width) */}
                  <div className="col-span-1 md:col-span-2 text-right pt-2">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-sm text-red-500 underline"
                    >
                      Remove Size
                    </button>
                  </div>
                </div>
              );
            })}

            {/* 🔹 Add Size Button */}
            <div>
              <Button
                type="button"
                onClick={() =>
                  append({
                    name: "",
                    price: 0,
                    promotionType: "NONE",
                    promotionValue: 0,
                    promotionFromDate: "",
                    promotionToDate: "",
                  })
                }
                className="text-sm font-sans px-2 py-2 rounded"
              >
                Add Size
              </Button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading || counts.main !== 1}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCreate ? "Creating..." : "Updating..."}
                </>
              ) : (
                <>{isCreate ? "Create Product" : "Update Product"}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
