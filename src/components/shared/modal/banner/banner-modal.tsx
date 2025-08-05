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
import {
  Upload,
  X,
  Image as ImageIcon,
  Link,
  Eye,
  Loader2,
} from "lucide-react";
import {
  ModalMode,
  Status,
  STATUS_USER_OPTIONS,
} from "@/constants/app-resource/status/status";
import {
  UploadBannerFormData,
  UploadBannerSchema,
} from "@/models/(content-manangement)/banner/banner.schema";
import { uploadImageService } from "@/services/dashboard/image/image.service";
import { UploadImageRequest } from "@/models/image/image.request";

type Props = {
  mode: ModalMode;
  data: UploadBannerFormData | null;
  onClose: () => void;
  isOpen: boolean;
  isSubmitting?: boolean;
  onSave: (data: UploadBannerFormData) => void;
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

function UploadBannerModal({
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
  } = useForm<UploadBannerFormData>({
    resolver: zodResolver(UploadBannerSchema),
    defaultValues: {
      imageUrl: "",
      linkUrl: "",
      status: activeStatusValue,
    },
  });

  const watchedImageUrl = watch("imageUrl");

  // Reset form when modal opens or data changes
  useEffect(() => {
    if (isOpen) {
      reset({
        id: data?.id ?? "",
        imageUrl: data?.imageUrl ?? "",
        linkUrl: data?.linkUrl ?? "",
        status: data?.status ?? "ACTIVE",
      });
      setSelectedFile(null);
      setPreviewUrl(data?.imageUrl ? getImageSource(data.imageUrl) : "");
    }
  }, [data, reset, isOpen]);

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

  // Handle file upload via API
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

          const response = await uploadImageService(payload);
          if (response?.imageUrl) {
            setValue("imageUrl", response.imageUrl, {
              shouldValidate: true,
            });
            setPreviewUrl(getImageSource(response.imageUrl));
            console.log("Image uploaded successfully:", response.imageUrl);
          }
        } catch (error) {
          console.error("Failed to upload image", error);
          // You might want to show a toast notification here
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to read file", error);
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
  const onSubmit = (formData: UploadBannerFormData) => {
    console.log(isCreate ? "New banner: " : "Update banner: ", formData);
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
          <DialogTitle>
            {isCreate ? "Upload Banner" : "Edit Banner"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Upload a new banner image and configure its settings."
              : "Update banner information and image."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Banner Image</Label>

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
                    <p className="mt-2 text-sm text-gray-600">Uploading...</p>
                  </div>
                </div>
              )}

              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Banner preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
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
                      Choose File
                    </Button>
                    <p className="mt-2 text-sm text-gray-500">
                      or drag and drop an image here
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}

              <input
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
                  placeholder="https://example.com/banner.jpg"
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

          {/* Link URL Field */}
          <div className="space-y-1">
            <Label htmlFor="linkUrl" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Link URL (Optional)
            </Label>
            <Controller
              control={control}
              name="linkUrl"
              render={({ field }) => (
                <Input
                  {...field}
                  id="linkUrl"
                  type="text"
                  placeholder="https://example.com/landing-page"
                  disabled={isSubmitting || isUploading}
                  className={errors.linkUrl ? "border-red-500" : ""}
                />
              )}
            />
            {errors.linkUrl && (
              <p className="text-sm text-destructive">
                {errors.linkUrl.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              URL to navigate when banner is clicked
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
              <div className="p-3 border rounded-lg bg-gray-50">
                <p className="text-sm text-muted-foreground mb-2">
                  Banner Preview:
                </p>
                <img
                  src={previewUrl}
                  alt="Banner preview"
                  className="w-full max-h-32 object-cover rounded border"
                />
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
                ? "Upload Banner"
                : "Update Banner"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UploadBannerModal;
