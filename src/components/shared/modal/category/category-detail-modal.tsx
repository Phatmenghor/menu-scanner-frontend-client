import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tag, ImageIcon, Edit, Trash2 } from "lucide-react";
import { z } from "zod";
import { CategoryModel } from "@/models/content-manangement/category/category.response";
import { CategoryFormData } from "@/models/content-manangement/category/category.schema";
import { DeleteConfirmationDialog } from "../../dialog/dialog-delete";

type Props = {
  data: CategoryFormData | null;
  onClose: () => void;
  isOpen: boolean;
  onEdit?: (data: CategoryFormData) => void;
  onDelete?: (data: CategoryFormData) => void;
  showActions?: boolean;
};

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "inactive":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "draft":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Get full image URL
const getImageSource = (imageUrl: string) => {
  if (!imageUrl) return "";
  return imageUrl.startsWith("http")
    ? imageUrl
    : (process.env.NEXT_PUBLIC_API_BASE_URL ?? "") + imageUrl;
};

function CategoryDetailModal({
  isOpen,
  onClose,
  data,
  onEdit,
  onDelete,
  showActions = true,
}: Props) {
  if (!data) return null;

  const handleEdit = () => {
    onEdit?.(data);
  };

  const handleDelete = () => {
    onDelete?.(data);
  };

  const imageSource = data.imageUrl ? getImageSource(data.imageUrl) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Category Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this category.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Category Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {imageSource ? (
                <div className="relative">
                  <img
                    src={imageSource || "/placeholder.svg"}
                    alt={`${data.name} category`}
                    className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {data.name}
                </h2>
                <Badge
                  variant="outline"
                  className={`mt-2 ${getStatusColor(
                    data.status || "inactive"
                  )}`}
                >
                  {data.status
                    ? data.status.charAt(0).toUpperCase() + data.status.slice(1)
                    : "No status"}
                </Badge>
              </div>
            </div>

            {showActions && (
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Category Information */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Category Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Category Name
                  </label>
                  <p className="text-gray-900 font-medium">
                    {data.name || "No name provided"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={getStatusColor(data.status || "inactive")}
                    >
                      {data.status
                        ? data.status.charAt(0).toUpperCase() +
                          data.status.slice(1)
                        : "No status"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Section */}
          {imageSource && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Category Image
                </h3>
                <div className="flex justify-center">
                  <div className="relative max-w-md">
                    <img
                      src={imageSource || "/placeholder.svg"}
                      alt={`${data.name} category`}
                      className="w-full h-auto max-h-64 object-contain rounded-lg border shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Category Preview Card */}
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-sm text-muted-foreground mb-3">
                How this category appears in listings:
              </p>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border shadow-sm">
                {imageSource ? (
                  <img
                    src={imageSource || "/placeholder.svg"}
                    alt={`${data.name || "Category"} preview`}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Tag className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {data.name || "Unnamed Category"}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusColor(
                        data.status || "inactive"
                      )}`}
                    >
                      {data.status
                        ? data.status.charAt(0).toUpperCase() +
                          data.status.slice(1)
                        : "No status"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryDetailModal;
