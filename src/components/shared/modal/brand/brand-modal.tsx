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
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  X,
  Image as ImageIcon,
  Link,
  Eye,
  Loader2,
  Building2,
  FileText,
} from "lucide-react";
import {
  ModalMode,
  STATUS_USER_OPTIONS,
} from "@/constants/app-resource/status/status";
import { BrandRequest } from "@/models/content-manangement/brand/brand.request";
import {
  BrandFormData,
  BrandSchema,
} from "@/models/content-manangement/brand/brand.schema";
import { uploadImageService } from "@/services/dashboard/image/image.service";
import { UploadImageRequest } from "@/models/image/image.request";

type Props = {
  mode: ModalMode;
  data: BrandFormData | null;
  onClose: () => void;
  isOpen: boolean;
  isSubmitting?: boolean;
  onSave: (data: BrandRequest) => void;
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

function BrandModal({
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

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(BrandSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      description: "",
      status: activeStatusValue,
    },
  });

  const watchedImageUrl = watch("imageUrl");

  // Reset form when modal opens or data changes
  useEffect(() => {
    if (isOpen) {
      reset({
        name: data?.name ?? "",
        imageUrl: data?.imageUrl ?? "",
        description: data?.description ?? "",
        status: data?.status ?? activeStatusValue,
      });
      setSelectedFile(null);
      setPreviewUrl(data?.imageUrl ? getImageSource(data.imageUrl) : "");
    }
  }, [data, reset, isOpen, activeStatusValue]);

  // Update preview when imageUrl changes
  useEffect(() => {
    if (watchedImageUrl && !selectedFile) {
      setPreviewUrl(getImageSource(watchedImageUrl));
    }
  }, [watchedImageUrl, selectedFile]);

  // Get full image URL
  const getImageSource = (imageUrl: string) => {
    if (!imageUrl) return "";
    return imageUrl.startsWith("http")
      ? imageUrl
      : (process.env.NEXT_PUBLIC_API_BASE_URL ?? "") + imageUrl;
  };

  // Handle file upload with actual API service
  const handleFileUpload = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          const base64Data = base64String.split(",")[1];

          const payload: UploadImageRequest = {
            base64: base64Data,
            type: file.type,
          };

          console.log("Uploading image with payload:", {
            type: file.type,
            size: file.size,
          });

          const response = await uploadImageService(payload);
          console.log("Upload response:", response);

          if (response?.imageUrl) {
            setValue("imageUrl", response.imageUrl, {
              shouldValidate: true,
            });
            setPreviewUrl(getImageSource(response.imageUrl));
            console.log("Image uploaded successfully:", response.imageUrl);
            console.log(
              "Preview URL set to:",
              getImageSource(response.imageUrl)
            );
          } else {
            console.error("No imageUrl in response:", response);
          }
        } catch (error) {
          console.error("Failed to upload image", error);
          // You might want to show a toast notification here
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        console.error("Failed to read file");
        setIsUploading(false);
      };

      console.log("Starting to read file:", file.name, file.type, file.size);
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to process file", error);
      setIsUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      handleFileUpload(file);
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
    setSelectedFile(null);
    setPreviewUrl("");
    setValue("imageUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Form submission handler
  const onSubmit = (formData: BrandFormData) => {
    console.log(isCreate ? "New brand: " : "Update brand: ", formData);
    onSave({
      id: data?.id,
      ...formData,
    });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isCreate ? "Create Brand" : "Edit Brand"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Create a new brand with logo and description."
              : "Update brand information and settings."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          {/* Brand Name Field */}
          <div className="space-y-1">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Brand Name <span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  type="text"
                  placeholder="Enter brand name"
                  disabled={isSubmitting || isUploading}
                  className={errors.name ? "border-red-500" : ""}
                />
              )}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Brand Logo Upload Section */}
          <div className="space-y-2">
            <Label>Brand Logo</Label>

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
                      Uploading logo...
                    </p>
                  </div>
                </div>
              )}

              {previewUrl ? (
                <div className="relative">
                  <div className="flex justify-center">
                    <img
                      src={previewUrl}
                      alt="Brand logo preview"
                      className="max-w-full h-32 object-contain rounded-lg bg-white p-2 border"
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
                      Choose Logo
                    </Button>
                    <p className="mt-2 text-sm text-gray-500">
                      or drag and drop a logo here
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    PNG, JPG, SVG up to 5MB (square format recommended)
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
              Logo URL (Alternative)
            </Label>
            <Controller
              control={control}
              name="imageUrl"
              render={({ field }) => (
                <Input
                  {...field}
                  id="imageUrl"
                  type="text"
                  placeholder="https://example.com/brand-logo.png"
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
              You can either upload a file above or provide a logo URL here
            </p>
          </div>

          {/* Description Field */}
          <div className="space-y-1">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </Label>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="description"
                  placeholder="Enter brand description (optional)"
                  disabled={isSubmitting || isUploading}
                  className={`min-h-[80px] resize-none ${
                    errors.description ? "border-red-500" : ""
                  }`}
                  maxLength={500}
                />
              )}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Brief description about the brand (max 500 characters)
            </p>
          </div>

          {/* Status Field */}
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

          {/* Preview Section */}
          {previewUrl && (
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Label>
              <div className="p-4 border rounded-lg bg-gray-50">
                <p className="text-sm text-muted-foreground mb-3">
                  Brand Preview:
                </p>
                <div className="flex items-center gap-3 p-3 bg-white rounded border">
                  <img
                    src={previewUrl}
                    alt="Brand logo preview"
                    className="w-12 h-12 object-contain rounded"
                  />
                  <div>
                    <h4 className="font-medium">
                      {watch("name") || "Brand Name"}
                    </h4>
                    {watch("description") && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {watch("description")}
                      </p>
                    )}
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
                ? "Create Brand"
                : "Update Brand"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BrandModal;
