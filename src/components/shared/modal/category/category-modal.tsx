import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
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
import { Upload, X, ImageIcon, Link, Eye, Loader2, Tag } from "lucide-react";
import {
  ModalMode,
  STATUS_USER_OPTIONS,
} from "@/constants/app-resource/status/status";
import {
  CategoryFormData,
  CategoryFormSchema,
} from "@/models/content-manangement/category/category.schema";
import { uploadImageService } from "@/services/dashboard/image/image.service";
import { UploadImageRequest } from "@/models/image/image.request";

type Props = {
  mode: ModalMode;
  data: CategoryFormData | null;
  onClose: () => void;
  isOpen: boolean;
  isSubmitting?: boolean;
  onSave: (data: CategoryFormData) => void;
};

// Utility functions
const getActiveStatusValue = () => {
  const activeStatus = STATUS_USER_OPTIONS.find(
    (status) =>
      status.label.toLowerCase() === "active" ||
      status.value.toLowerCase() === "active"
  );
  return activeStatus?.value || STATUS_USER_OPTIONS[0]?.value || "";
};

function CategoryModal({
  isOpen,
  onClose,
  data,
  mode,
  onSave,
  isSubmitting = false,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const activeStatusValue = getActiveStatusValue();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      status: activeStatusValue,
    },
  });

  const watchedImageUrl = watch("imageUrl");
  const watchedName = watch("name");
  const watchedStatus = watch("status");

  // Get full image URL
  const getImageSource = (imageUrl: string) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http") || imageUrl.startsWith("data:")) {
      return imageUrl;
    }
    return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "") + imageUrl;
  };

  // Reset form when modal opens or data changes
  useEffect(() => {
    if (isOpen) {
      const initialData = {
        name: data?.name ?? "",
        imageUrl: data?.imageUrl ?? "",
        status: data?.status ?? activeStatusValue,
      };

      reset(initialData);
      setSelectedFile(null);
      setUploadError("");

      // Set preview URL based on existing data
      if (data?.imageUrl) {
        setPreviewUrl(getImageSource(data.imageUrl));
      } else {
        setPreviewUrl("");
      }
    }
  }, [data, reset, isOpen, activeStatusValue]);

  // Update preview when imageUrl changes (for manual URL input)
  useEffect(() => {
    if (watchedImageUrl && !selectedFile && !isUploading) {
      setPreviewUrl(getImageSource(watchedImageUrl));
    }
  }, [watchedImageUrl, selectedFile, isUploading]);

  // Validate file type and size
  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/svg+xml",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return "Please select a valid image file (JPG, PNG, SVG, WebP)";
    }

    if (file.size > maxSize) {
      return "Image size must be less than 5MB";
    }

    return null;
  };

  // Handle file upload
  const handleFileChange = async (file: File) => {
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      // Create preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          const base64Data = base64String.split(",")[1];

          const payload: UploadImageRequest = {
            base64: base64Data,
            type: file.type,
          };

          const response = await uploadImageService(payload);

          if (response?.imageUrl) {
            // Clean up object URL
            URL.revokeObjectURL(objectUrl);

            // Update form with the uploaded image URL
            setValue(
              "imageUrl",
              process.env.NEXT_PUBLIC_API_BASE_URL + response.imageUrl,
              {
                shouldValidate: true,
                shouldDirty: true,
              }
            );

            // Update preview with the actual uploaded image
            setPreviewUrl(
              getImageSource(
                process.env.NEXT_PUBLIC_API_BASE_URL + response.imageUrl
              )
            );

            console.log("Image uploaded successfully:", response.imageUrl);
          } else {
            throw new Error("No image URL returned from upload service");
          }
        } catch (uploadError) {
          console.error("Upload failed:", uploadError);
          setUploadError("Failed to upload image. Please try again.");
          // Clean up object URL on error
          URL.revokeObjectURL(objectUrl);
          setPreviewUrl("");
          setValue("imageUrl", "");
        }
      };

      reader.onerror = () => {
        console.error("File reading failed");
        setUploadError("Failed to read the selected file.");
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl("");
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File processing failed:", error);
      setUploadError("Failed to process the selected file.");
      setPreviewUrl("");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (file) {
      setSelectedFile(file);
      handleFileChange(file);
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

  // Clear image
  const clearImage = () => {
    // Clean up object URL if it exists
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setUploadError("");
    setValue("imageUrl", "", { shouldValidate: true, shouldDirty: true });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Form submission handler
  const onSubmit = (formData: CategoryFormData) => {
    console.log(isCreate ? "New category: " : "Update category: ", formData);
    onSave({
      id: data?.id,
      ...formData,
    });
  };

  const handleClose = () => {
    // Clean up object URLs when closing
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    onClose();
  };

  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {isCreate ? "Create Category" : "Edit Category"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Create a new category with image and settings."
              : "Update category information and settings."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          {/* Category Name Field */}
          <div className="space-y-1">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  type="text"
                  placeholder="Enter category name"
                  disabled={isSubmitting || isUploading}
                  className={errors.name ? "border-red-500" : ""}
                />
              )}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Category Image Upload Section */}
          <div className="space-y-2">
            <Label>Category Image</Label>

            {/* Upload Error Display */}
            {uploadError && (
              <div className="p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                {uploadError}
              </div>
            )}

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
                      Uploading image...
                    </p>
                  </div>
                </div>
              )}

              {previewUrl ? (
                <div className="relative">
                  <div className="flex justify-center">
                    <img
                      src={previewUrl}
                      alt="Category image preview"
                      className="max-w-full h-32 object-contain rounded-lg bg-white p-2 border"
                      onError={() => {
                        console.error("Image failed to load:", previewUrl);
                        setPreviewUrl("");
                        setUploadError("Failed to load image preview");
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={clearImage}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
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
                      Choose Image
                    </Button>
                    <p className="mt-2 text-sm text-gray-500">
                      or drag and drop an image here
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    PNG, JPG, SVG, WebP up to 5MB
                  </p>
                </div>
              )}

              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isSubmitting || isUploading}
              />
            </div>
          </div>

          {/* Image URL Field (Alternative to file upload) */}
          <div className="space-y-1">
            <Label htmlFor="imageUrl" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Image URL (Alternative)
            </Label>
            <Controller
              control={control}
              name="imageUrl"
              render={({ field }) => (
                <Input
                  {...field}
                  id="imageUrl"
                  type="text"
                  placeholder="https://example.com/category-image.png"
                  disabled={isSubmitting || isUploading}
                  className={errors.imageUrl ? "border-red-500" : ""}
                />
              )}
            />
            {errors.imageUrl && (
              <p className="text-sm text-destructive">
                {errors.imageUrl.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              You can either upload a file above or provide an image URL here
            </p>
          </div>

          {/* Status Field */}
          {!isCreate && (
            <div className="space-y-1">
              <Label htmlFor="status-select">
                Status <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting || isUploading}
                  >
                    <SelectTrigger
                      id="status-select"
                      className={`bg-white dark:bg-inherit ${
                        errors.status ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_USER_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>
          )}

          {/* Preview Section */}
          {previewUrl && (
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Label>
              <div className="p-4 border rounded-lg bg-gray-50">
                <p className="text-sm text-muted-foreground mb-3">
                  Category Preview:
                </p>
                <div className="flex items-center gap-3 p-3 bg-white rounded border">
                  <img
                    src={previewUrl}
                    alt="Category preview"
                    className="w-12 h-12 object-contain rounded border"
                    onError={() =>
                      console.error("Preview image failed to load")
                    }
                  />
                  <div>
                    <h4 className="font-medium">
                      {watchedName || "Category Name"}
                    </h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {watchedStatus || "Status"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting || isUploading
                ? "Processing..."
                : isCreate
                ? "Create Category"
                : "Update Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryModal;
