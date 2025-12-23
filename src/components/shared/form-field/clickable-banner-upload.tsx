"use client";

import React, { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldError } from "react-hook-form";

interface ClickableBannerUploadProps {
  label: string;
  value?: string;
  onChange: (base64: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: FieldError;
  maxSize?: number;
}

export function ClickableBannerUpload({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  maxSize = 10,
}: ClickableBannerUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      onChange(base64);
    } catch (error) {
      console.error("Error reading image:", error);
      alert("Failed to read image. Please try again.");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="space-y-3">
        {/* Banner Display/Upload Area */}
        <div
          onClick={handleClick}
          className={cn(
            "relative h-48 w-full rounded-lg overflow-hidden border-2 transition-all",
            value
              ? "border-border hover:border-primary/50"
              : "border-dashed border-border hover:border-primary",
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:shadow-md",
            error && "border-red-500"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />

          {value ? (
            <>
              {/* Banner Image */}
              <img
                src={value}
                alt="Banner preview"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2 text-white">
                  <Upload className="h-8 w-8" />
                  <p className="text-sm font-medium">Click to change image</p>
                </div>
              </div>

              {/* Remove button */}
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-3 right-3 z-10 opacity-0 hover:opacity-100 transition-opacity"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </>
          ) : (
            <>
              {/* Empty state - Click to upload */}
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-muted/30">
                <div className="p-4 bg-muted rounded-full">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-medium text-foreground">
                    Click to upload banner image
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF up to {maxSize}MB
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Helper text */}
        {value && !disabled && (
          <p className="text-xs text-muted-foreground text-center">
            Click on the image to change it
          </p>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
