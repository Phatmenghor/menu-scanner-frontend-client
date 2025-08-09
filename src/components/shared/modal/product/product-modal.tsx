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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  X,
  ImageIcon,
  Loader2,
  Package,
  Star,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  RotateCcw,
  Settings,
  Percent,
  Calendar,
  Info,
  DollarSign,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ModalMode } from "@/constants/app-resource/status/status";
import { ComboboxSelectCategory } from "../../combo-box/combobox-category";
import { CategoryModel } from "@/models/(content-manangement)/category/category.response";
import { BrandModel } from "@/models/(content-manangement)/brand/brand.response";
import { ComboboxSelectBrand } from "../../combo-box/combobox-brand";
import { uploadImageService } from "@/services/dashboard/image/image.service";
import { UploadImageRequest } from "@/models/image/image.request";
import { AppToast } from "@/components/app/components/app-toast";
import { PriceInput } from "../../common/price-input";
import { getCategoryByIdService } from "@/services/dashboard/content-management/category/category.service";
import { getBrandByIdService } from "@/services/dashboard/content-management/brand/brand.service";

// Types
type ImageType = "MAIN" | "GALLERY";
type ImageData = {
  imageUrl: string;
  imageType: ImageType;
};

type ProductFormData = {
  id?: string;
  name: string;
  categoryId: string;
  images: ImageData[];
  description?: string;
  brandId?: string;
  price?: number;
  promotionType?: string;
  promotionValue?: number;
  promotionFromDate?: string;
  promotionToDate?: string;
  sizes?: SizeData[];
  status?: string;
};

type SizeData = {
  name: string;
  price: number;
  promotionType?: string;
  promotionValue?: number;
  promotionFromDate?: string;
  promotionToDate?: string;
};

type Props = {
  mode: ModalMode;
  data: ProductFormData | null;
  onClose: () => void;
  isOpen: boolean;
  isSubmitting?: boolean;
  onSave: (data: ProductFormData) => void;
};

// Enhanced Image Management Hook
const useEnhancedImageManagement = (
  control: any,
  setValue: any,
  watch: any
) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadImageType, setUploadImageType] = useState<ImageType>("MAIN");

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
    update: updateImage,
  } = useFieldArray({
    control,
    name: "images",
  });

  const watchedImages: ImageData[] = watch("images") || [];

  const getImageCounts = () => ({
    main: watchedImages.filter((img: ImageData) => img.imageType === "MAIN")
      .length,
    gallery: watchedImages.filter(
      (img: ImageData) => img.imageType === "GALLERY"
    ).length,
    total: watchedImages.length,
  });

  const hasMainImage = () => getImageCounts().main > 0;

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

    if (file.size > 10 * 1024 * 1024) {
      AppToast({
        type: "error",
        message: "File size must be less than 10MB.",
        duration: 3000,
        position: "top-right",
      });
      return;
    }

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
            const mainImageIndex = watchedImages.findIndex(
              (img) => img.imageType === "MAIN"
            );
            if (mainImageIndex !== -1) {
              updateImage(mainImageIndex, {
                imageUrl: response.imageUrl,
                imageType: "MAIN",
              });
            }
          } else {
            appendImage({
              imageUrl: response.imageUrl,
              imageType: imageType,
            });
          }

          AppToast({
            type: "success",
            message: `${imageType} image uploaded successfully`,
            duration: 2000,
            position: "top-right",
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to upload image", error);
      AppToast({
        type: "error",
        message: "Failed to upload image. Please try again.",
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const toggleImageType = (index: number) => {
    const currentImage = watchedImages[index];
    if (currentImage.imageType === "MAIN") {
      updateImage(index, {
        ...currentImage,
        imageType: "GALLERY",
      });
    } else {
      if (hasMainImage()) {
        const confirmReplace = window.confirm(
          "You already have a main image. Do you want to make this image the new main image?"
        );
        if (!confirmReplace) return;
        const mainImageIndex = watchedImages.findIndex(
          (img) => img.imageType === "MAIN"
        );
        if (mainImageIndex !== -1) {
          updateImage(mainImageIndex, {
            ...watchedImages[mainImageIndex],
            imageType: "GALLERY",
          });
        }
      }
      updateImage(index, {
        ...currentImage,
        imageType: "MAIN",
      });
    }
  };

  const clearAllImages = () => {
    setValue("images", []);
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
    clearAllImages,
  };
};

// Enhanced Size Management Hook
const useEnhancedSizeManagement = (control: any, setValue: any, watch: any) => {
  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control,
    name: "sizes",
  });

  const watchedSizes = watch("sizes") || [];

  const addSize = () => {
    appendSize({
      name: "",
      price: 0,
      promotionType: "",
      promotionValue: 0,
      promotionFromDate: "",
      promotionToDate: "",
    });
  };

  const clearAllSizes = () => {
    setValue("sizes", []);
  };

  const hasSizes = () => watchedSizes.length > 0;

  return {
    sizeFields,
    watchedSizes,
    addSize,
    removeSize,
    clearAllSizes,
    hasSizes,
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
  const [selectedBrand, setSelectedBrand] = useState<BrandModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      categoryId: "",
      images: [],
      description: "",
      brandId: "",
      price: 0,
      promotionType: "",
      promotionValue: 0,
      promotionFromDate: "",
      promotionToDate: "",
      sizes: [],
      status: "ACTIVE",
    },
  });

  // Enhanced Hooks
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
    clearAllImages,
  } = useEnhancedImageManagement(control, setValue, watch);

  const {
    sizeFields,
    watchedSizes,
    addSize,
    removeSize,
    clearAllSizes,
    hasSizes,
  } = useEnhancedSizeManagement(control, setValue, watch);

  // Watch form values
  const promotionType = watch("promotionType");
  const productHasSizes = hasSizes();

  // Form Initialization
  const initializeForm = useCallback(() => {
    if (data) {
      const formData: ProductFormData = {
        id: data.id,
        name: data.name || "",
        categoryId: data.categoryId || "",
        images: data.images || [],
        description: data.description || "",
        brandId: data.brandId || "",
        price: data.price || 0,
        promotionType: data.promotionType || "",
        promotionValue: data.promotionValue || 0,
        promotionFromDate: data.promotionFromDate || "",
        promotionToDate: data.promotionToDate || "",
        sizes: data.sizes || [],
        status: data.status || "ACTIVE",
      };

      reset(formData);
    } else {
      reset({
        name: "",
        categoryId: "",
        images: [],
        description: "",
        brandId: "",
        price: 0,
        promotionType: "",
        promotionValue: 0,
        promotionFromDate: "",
        promotionToDate: "",
        sizes: [],
        status: "ACTIVE",
      });
    }
  }, [data, reset]);

  // Fetch category and brand details
  const fetchCategoryDetail = useCallback(async () => {
    if (!data?.categoryId) return;
    setIsLoading(true);
    try {
      const response = await getCategoryByIdService(data.categoryId);
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
      const response = await getBrandByIdService(data.brandId);
      setSelectedBrand(response);
    } catch (error: any) {
      console.log("Failed to fetch brands: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [data?.brandId]);

  // Effects
  useEffect(() => {
    if (isOpen) {
      initializeForm();
      if (data) {
        fetchCategoryDetail();
        fetchBrandDetail();
      }
      setActiveTab("basic");
    } else {
      setSelectedCategory(null);
      setSelectedBrand(null);
    }
  }, [isOpen, data, initializeForm, fetchCategoryDetail, fetchBrandDetail]);

  // Event Handlers
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file, uploadImageType);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const onCategoryChange = useCallback(
    (cate: CategoryModel) => {
      setSelectedCategory(cate);
      setValue("categoryId", cate.id);
    },
    [setValue]
  );

  const onBrandChange = useCallback(
    (brand: BrandModel) => {
      setSelectedBrand(brand);
      setValue("brandId", brand.id);
    },
    [setValue]
  );

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

  // Simple Form Validation
  const validateForm = (formData: ProductFormData) => {
    const counts = getImageCounts();
    const errors: string[] = [];

    if (!formData.name?.trim()) {
      errors.push("Product name is required");
    }

    if (!formData.categoryId) {
      errors.push("Category is required");
    }

    // Images are not required but if added, validate main image
    if (counts.total > 0 && counts.main > 1) {
      errors.push("Only one main image is allowed");
    }

    // Pricing validation based on whether product has sizes
    if (productHasSizes) {
      // Has sizes - validate sizes, ignore simple product price
      if (formData.sizes && formData.sizes.length > 0) {
        formData.sizes.forEach((size, index) => {
          if (!size.name?.trim()) {
            errors.push(`Size ${index + 1} name is required`);
          }
          if (!size.price || size.price <= 0) {
            errors.push(`Size ${index + 1} price is required`);
          }
        });
      } else {
        errors.push("At least one size is required when sizes are configured");
      }
    } else {
      // No sizes - validate simple product price
      if (!formData.price || formData.price <= 0) {
        errors.push("Price is required for products without size variations");
      }
    }

    // Promotion validation for simple product (only when no sizes)
    if (
      !productHasSizes &&
      formData.promotionType &&
      formData.promotionType !== ""
    ) {
      const promotionValue = formData.promotionValue ?? 0;
      if (promotionValue <= 0) {
        errors.push("Promotion value is required when promotion type is set");
      }
      if (formData.promotionType === "PERCENTAGE" && promotionValue > 100) {
        errors.push("Percentage discount cannot exceed 100%");
      }
    }

    return errors;
  };

  // Form Submission
  const onSubmit = (formData: ProductFormData) => {
    const validationErrors = validateForm(formData);

    if (validationErrors.length > 0) {
      AppToast({
        type: "error",
        message: validationErrors[0],
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    // Prepare payload based on whether product has sizes
    const basePayload: Partial<ProductFormData> = {
      ...formData,
      id: data?.id,
      name: formData.name.trim(),
      description: formData.description?.trim(),
      categoryId: formData.categoryId.trim(),
      brandId: formData.brandId?.trim(),
    };

    if (productHasSizes) {
      // Has sizes - use sizes for pricing, clear simple product pricing
      basePayload.sizes = formData.sizes || [];
      basePayload.price = 0; // Clear simple product price
      delete basePayload.promotionType;
      delete basePayload.promotionValue;
      delete basePayload.promotionFromDate;
      delete basePayload.promotionToDate;
    } else {
      // No sizes - use simple product pricing, clear sizes
      basePayload.sizes = []; // Clear sizes
      basePayload.price = formData.price;

      // Handle simple product promotion
      if (
        formData.promotionType &&
        formData.promotionType !== "" &&
        formData.promotionType !== "NONE"
      ) {
        basePayload.promotionType = formData.promotionType;
        basePayload.promotionValue = formData.promotionValue ?? 0;
        basePayload.promotionFromDate = formData.promotionFromDate;
        basePayload.promotionToDate = formData.promotionToDate;
      } else {
        delete basePayload.promotionType;
        delete basePayload.promotionValue;
        delete basePayload.promotionFromDate;
        delete basePayload.promotionToDate;
      }
    }

    console.log("Payload for API:", basePayload);
    onSave(basePayload as ProductFormData);
  };

  // Reset Functions
  const resetFormCompletely = () => {
    reset();
    setSelectedCategory(null);
    setSelectedBrand(null);
  };

  const clearSimpleProductPromotion = () => {
    setValue("promotionType", "");
    setValue("promotionValue", 0);
    setValue("promotionFromDate", "");
    setValue("promotionToDate", "");
  };

  const counts = getImageCounts();
  const getFullImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("/")) {
      return `${process.env.NEXT_PUBLIC_API_BASE_URL}${imageUrl}`;
    }
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/${imageUrl}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-6xl max-h-[95vh] overflow-y-auto">
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

        <div className="space-y-6 pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Basic Info & Pricing
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Images ({counts.total})
              </TabsTrigger>
              <TabsTrigger value="sizes" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Size Variations ({watchedSizes.length})
              </TabsTrigger>
            </TabsList>

            {/* Basic Information & Pricing Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Product Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Product Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                            />
                          )}
                        />
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
                      </div>

                      {/* Brand */}
                      <div className="space-y-1">
                        <Label htmlFor="brandId">Brand</Label>
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
                      </div>

                      {/* Status */}
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
                                <SelectItem value="INACTIVE">
                                  Inactive
                                </SelectItem>
                                <SelectItem value="OUT_OF_STOCK">
                                  Out of Stock
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
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
                  </CardContent>
                </Card>

                {/* Pricing & Promotion (Only for Simple Products) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Product Pricing
                      {productHasSizes && (
                        <Badge variant="secondary" className="ml-2">
                          Managed by Size Variations
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {productHasSizes ? (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          This product has size variations. Pricing is managed
                          in the "Size Variations" tab. The base price here will
                          be ignored.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        {/* Base Price */}
                        <div className="space-y-2">
                          <Label htmlFor="price">
                            Base Price ($){" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Controller
                            control={control}
                            name="price"
                            render={({ field }) => (
                              <PriceInput
                                value={field.value || 0}
                                onChange={field.onChange}
                                placeholder="Enter price"
                                currency="$"
                                min={0}
                                disabled={isSubmitting || isUploading}
                              />
                            )}
                          />
                        </div>

                        {/* Promotion Section */}
                        <div className="space-y-4 p-4 border rounded-lg bg-orange-50">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium flex items-center gap-2">
                              <Percent className="h-4 w-4" />
                              Promotion (Optional)
                            </h4>
                            {promotionType && promotionType !== "" && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearSimpleProductPromotion}
                                disabled={isSubmitting || isUploading}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Clear
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Promotion Type</Label>
                              <Controller
                                control={control}
                                name="promotionType"
                                render={({ field }) => (
                                  <Select
                                    value={field.value || "NONE"}
                                    onValueChange={(value) =>
                                      field.onChange(
                                        value === "NONE" ? "" : value
                                      )
                                    }
                                    disabled={isSubmitting || isUploading}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select promotion type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="NONE">
                                        No Promotion
                                      </SelectItem>
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
                            </div>

                            {promotionType &&
                              promotionType !== "" &&
                              promotionType !== "NONE" && (
                                <>
                                  <div className="space-y-2">
                                    <Label>
                                      Discount Value
                                      {promotionType === "PERCENTAGE" && " (%)"}
                                      {promotionType === "FIXED_AMOUNT" &&
                                        " ($)"}
                                    </Label>
                                    <Controller
                                      control={control}
                                      name="promotionValue"
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          type="number"
                                          step={
                                            promotionType === "PERCENTAGE"
                                              ? "1"
                                              : "0.01"
                                          }
                                          min="0"
                                          max={
                                            promotionType === "PERCENTAGE"
                                              ? "100"
                                              : undefined
                                          }
                                          placeholder={
                                            promotionType === "PERCENTAGE"
                                              ? "0-100"
                                              : "0.00"
                                          }
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          disabled={isSubmitting || isUploading}
                                        />
                                      )}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Controller
                                      control={control}
                                      name="promotionFromDate"
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          type="datetime-local"
                                          disabled={isSubmitting || isUploading}
                                        />
                                      )}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Controller
                                      control={control}
                                      name="promotionToDate"
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          type="datetime-local"
                                          disabled={isSubmitting || isUploading}
                                        />
                                      )}
                                    />
                                  </div>
                                </>
                              )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Product Images (Optional)
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Star className="h-3 w-3 text-yellow-500" />
                        Main: {counts.main}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <ImageIcon className="h-3 w-3" />
                        Gallery: {counts.gallery}
                      </Badge>
                      <Badge variant="secondary">Total: {counts.total}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image Type Selector - Default to MAIN */}
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium">Upload as:</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant={
                          uploadImageType === "MAIN" ? "default" : "outline"
                        }
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
                        <ImageIcon className="h-3 w-3" />
                        Gallery
                      </Button>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearAllImages}
                        disabled={
                          isSubmitting || isUploading || counts.total === 0
                        }
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Clear All
                      </Button>
                    </div>
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
                            Main Image
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {imageFields.map((image, index) => {
                              const watchedImage = watchedImages[index];
                              if (watchedImage?.imageType !== "MAIN")
                                return null;
                              return (
                                <div key={image.id} className="relative group">
                                  <div className="relative">
                                    <img
                                      src={getFullImageUrl(
                                        watchedImage.imageUrl
                                      )}
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
                                      <ImageIcon className="h-3 w-3" />
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
                            <ImageIcon className="h-4 w-4" />
                            Gallery Images ({counts.gallery})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {imageFields.map((image, index) => {
                              const watchedImage = watchedImages[index];
                              if (watchedImage?.imageType !== "GALLERY")
                                return null;
                              return (
                                <div key={image.id} className="relative group">
                                  <div className="relative">
                                    <img
                                      src={getFullImageUrl(
                                        watchedImage.imageUrl
                                      )}
                                      alt={`Gallery image ${index + 1}`}
                                      className="w-full h-24 object-cover rounded-lg border"
                                    />
                                    <div className="absolute top-1 left-1">
                                      <Badge className="bg-gray-600 text-white text-xs px-1 rounded flex items-center gap-1">
                                        <ImageIcon className="h-2 w-2" />
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

                  {/* Info Message */}
                  {counts.total === 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Images are optional. You can add product images to make
                        your product more appealing to customers.
                      </AlertDescription>
                    </Alert>
                  )}

                  {counts.main > 1 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You can only have one main image.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Size Variations Tab */}
            <TabsContent value="sizes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Size Variations
                    </span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSize}
                        disabled={isSubmitting || isUploading}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Size
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearAllSizes}
                        disabled={
                          isSubmitting ||
                          isUploading ||
                          watchedSizes.length === 0
                        }
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Clear All
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!productHasSizes ? (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        No size variations configured. If you add sizes, the
                        basic product price will be ignored and pricing will be
                        managed per size. Each size can have its own price and
                        promotions.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Size variations are configured. Product pricing is now
                        managed per size. The basic product price in "Basic
                        Info" is ignored.
                      </AlertDescription>
                    </Alert>
                  )}

                  {sizeFields.map((size, index) => (
                    <Card
                      key={size.id}
                      className="border-l-4 border-l-blue-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-medium">Size {index + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSize(index)}
                            className="text-red-500 hover:text-red-700"
                            disabled={isSubmitting || isUploading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label>Size Name *</Label>
                            <Controller
                              control={control}
                              name={`sizes.${index}.name`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="e.g., Small, Medium, Large"
                                  disabled={isSubmitting || isUploading}
                                />
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Price ($) *</Label>
                            <Controller
                              control={control}
                              name={`sizes.${index}.price`}
                              render={({ field }) => (
                                <PriceInput
                                  value={field.value || 0}
                                  onChange={field.onChange}
                                  placeholder="Price"
                                  currency="$"
                                  min={0}
                                  disabled={isSubmitting || isUploading}
                                />
                              )}
                            />
                          </div>
                        </div>

                        {/* Inline Promotion for Each Size */}
                        <div className="p-3 bg-orange-50 rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <h6 className="font-medium flex items-center gap-2">
                              <Percent className="h-4 w-4" />
                              Size Promotion (Optional)
                            </h6>
                            {watch(`sizes.${index}.promotionType`) &&
                              watch(`sizes.${index}.promotionType`) !== "" && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setValue(
                                      `sizes.${index}.promotionType`,
                                      ""
                                    );
                                    setValue(
                                      `sizes.${index}.promotionValue`,
                                      0
                                    );
                                    setValue(
                                      `sizes.${index}.promotionFromDate`,
                                      ""
                                    );
                                    setValue(
                                      `sizes.${index}.promotionToDate`,
                                      ""
                                    );
                                  }}
                                  disabled={isSubmitting || isUploading}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Clear
                                </Button>
                              )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Promotion Type</Label>
                              <Controller
                                control={control}
                                name={`sizes.${index}.promotionType`}
                                render={({ field }) => (
                                  <Select
                                    value={field.value || "NONE"}
                                    onValueChange={(value) =>
                                      field.onChange(
                                        value === "NONE" ? "" : value
                                      )
                                    }
                                    disabled={isSubmitting || isUploading}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select promotion type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="NONE">
                                        No Promotion
                                      </SelectItem>
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
                            </div>

                            {watch(`sizes.${index}.promotionType`) &&
                              watch(`sizes.${index}.promotionType`) !== "" &&
                              watch(`sizes.${index}.promotionType`) !==
                                "NONE" && (
                                <>
                                  <div className="space-y-2">
                                    <Label>
                                      Discount Value
                                      {watch(`sizes.${index}.promotionType`) ===
                                        "PERCENTAGE" && " (%)"}
                                      {watch(`sizes.${index}.promotionType`) ===
                                        "FIXED_AMOUNT" && " ($)"}
                                    </Label>
                                    <Controller
                                      control={control}
                                      name={`sizes.${index}.promotionValue`}
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          type="number"
                                          step={
                                            watch(
                                              `sizes.${index}.promotionType`
                                            ) === "PERCENTAGE"
                                              ? "1"
                                              : "0.01"
                                          }
                                          min="0"
                                          max={
                                            watch(
                                              `sizes.${index}.promotionType`
                                            ) === "PERCENTAGE"
                                              ? "100"
                                              : undefined
                                          }
                                          placeholder={
                                            watch(
                                              `sizes.${index}.promotionType`
                                            ) === "PERCENTAGE"
                                              ? "0-100"
                                              : "0.00"
                                          }
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          disabled={isSubmitting || isUploading}
                                        />
                                      )}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Controller
                                      control={control}
                                      name={`sizes.${index}.promotionFromDate`}
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          type="datetime-local"
                                          disabled={isSubmitting || isUploading}
                                        />
                                      )}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Controller
                                      control={control}
                                      name={`sizes.${index}.promotionToDate`}
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          type="datetime-local"
                                          disabled={isSubmitting || isUploading}
                                        />
                                      )}
                                    />
                                  </div>
                                </>
                              )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetFormCompletely}
                disabled={isSubmitting || isUploading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || isUploading}
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
