import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { z } from "zod";
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
  Plus,
  Trash2,
  Star,
  ImageIcon as ImageLucide,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  productFormData,
  ProductFormSchema,
} from "@/models/(content-manangement)/product/product.schema";

// Types
type ImageType = "MAIN" | "GALLERY";

type Props = {
  mode: "CREATE" | "EDIT";
  data: productFormData | null;
  onClose: () => void;
  isOpen: boolean;
  isSubmitting?: boolean;
  onSave: (data: productFormData) => void;
};

// Image Management Hook
const useImageManagement = (control: any, setValue: any) => {
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

  const watchedImages = control._formValues?.images || [];

  // Image type utilities
  const getMainImage = () =>
    watchedImages.find((img: productFormData) => img.imageType === "MAIN");
  const hasMainImage = () => !!getMainImage();
  const getMainImageIndex = () =>
    watchedImages.findIndex((img: productFormData) => img.imageType === "MAIN");
  const getImageCounts = () => ({
    main: watchedImages.filter(
      (img: productFormData) => img.imageType === "MAIN"
    ).length,
    gallery: watchedImages.filter(
      (img: productFormData) => img.imageType === "GALLERY"
    ).length,
    total: watchedImages.length,
  });

  // Mock upload service - replace with your actual service
  const uploadImageService = async (
    file: File
  ): Promise<{ imageUrl: string }> => {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create a mock URL - in real implementation, this would be your uploaded image URL
    const mockUrl = URL.createObjectURL(file);
    return { imageUrl: mockUrl };
  };

  const handleFileUpload = async (file: File, imageType: ImageType) => {
    if (!file || !file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
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
      const response = await uploadImageService(file);

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
  const isCreate = mode === "CREATE";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
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
      sizes: [],
      status: "ACTIVE",
    },
  });

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
  } = useImageManagement(control, setValue);

  // Reset form when modal opens or data changes
  useEffect(() => {
    if (isOpen) {
      reset({
        name: data?.name ?? "",
        categoryId: data?.categoryId ?? "",
        images: data?.images ?? [],
        description: data?.description ?? "",
        brandId: data?.brandId ?? "",
        price: data?.price ?? 0,
        promotionType: data?.promotionType,
        promotionValue: data?.promotionValue ?? 0,
        promotionFromDate: data?.promotionFromDate ?? "",
        promotionToDate: data?.promotionToDate ?? "",
        sizes: data?.sizes ?? [],
        status: data?.status ?? "ACTIVE",
      });
    }
  }, [data, reset, isOpen]);

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

  const onSubmit = (formData: ProductFormData) => {
    const counts = getImageCounts();

    // Validation
    if (counts.total === 0) {
      alert("Please add at least one product image.");
      return;
    }

    if (counts.main === 0) {
      alert(
        "Please set one image as the main image for the product thumbnail."
      );
      return;
    }

    if (counts.main > 1) {
      alert("You can only have one main image. Please fix this before saving.");
      return;
    }

    const payload = {
      ...formData,
      id: data?.id,
      name: formData.name.trim(),
      description: formData.description?.trim(),
      categoryId: formData.categoryId.trim(),
      brandId: formData.brandId?.trim(),
    };

    onSave(payload);
    onClose();
  };

  const counts = getImageCounts();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting || isUploading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="books">Books</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Input
                      {...field}
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      disabled={isSubmitting || isUploading}
                      className={errors.price ? "border-red-500" : ""}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
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
            </div>
          </div>

          {/* Product Images Section */}
          <div className="space-y-4">
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
                  (img: productFormData) => img.imageType === "MAIN"
                ).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Main Image (Thumbnail)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imageFields.map((image, index) => {
                        if (image.imageType !== "MAIN") return null;
                        return (
                          <div key={image.id} className="relative group">
                            <div className="relative">
                              <img
                                src={
                                  image.imageUrl ||
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
                  (img: productFormData) => img.imageType === "GALLERY"
                ).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <ImageLucide className="h-4 w-4" />
                      Gallery Images ({counts.gallery})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imageFields.map((image, index) => {
                        if (image.imageType !== "GALLERY") return null;
                        return (
                          <div key={image.id} className="relative group">
                            <div className="relative">
                              <img
                                src={
                                  image.imageUrl ||
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
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
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
