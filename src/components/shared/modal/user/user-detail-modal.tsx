"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Plus,
  Trash2,
  Upload,
  Save,
  Eye,
  Heart,
  Package,
  DollarSign,
  ImageIcon,
  Ruler,
  BarChart3,
  Calendar,
  User,
  Building2,
  Tag,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ProductModel,
  Size,
  Image as ProductImage,
} from "@/models/content-manangement/product/product.response";
import { BusinessModel } from "@/models/business-group/business/business.response";
import { CategoryModel } from "@/models/content-manangement/category/category.response";
import { BrandModel } from "@/models/content-manangement/brand/brand.response";

interface AdminProductModalProps {
  product: ProductModel | null;
  open: boolean;
  onClose: () => void;
  onSave: (product: ProductModel) => void;
  onDelete?: (productId: string) => void;
  businesses: BusinessModel[];
  categories: CategoryModel[];
  brands: BrandModel[];
}

export default function AdminProductModal({
  product,
  open,
  onClose,
  onSave,
  onDelete,
  businesses = [],
  categories = [],
  brands = [],
}: AdminProductModalProps) {
  const [formData, setFormData] = useState<ProductModel | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    } else {
      // Create new product template
      setFormData({
        id: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "admin",
        updatedBy: "admin",
        businessId: "",
        businessName: "",
        categoryId: "",
        categoryName: "",
        brandId: "",
        brandName: "",
        name: "",
        description: "",
        status: "draft",
        price: 0,
        promotionType: "",
        promotionValue: 0,
        promotionFromDate: "",
        promotionToDate: "",
        images: [],
        mainImageUrl: "",
        sizes: [],
        displayPrice: 0,
        hasPromotionActive: false,
        hasSizes: false,
        publicUrl: "",
        favoriteCount: 0,
        viewCount: 0,
        isFavorited: false,
      });
    }
  }, [product]);

  if (!open || !formData) return null;

  const handleInputChange = (field: keyof ProductModel, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleBusinessChange = (businessId: string) => {
    const business = businesses.find((b) => b.id === businessId);
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            businessId,
            businessName: business?.name || "",
          }
        : null
    );
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            categoryId,
            categoryName: category?.name || "",
          }
        : null
    );
  };

  const handleBrandChange = (brandId: string) => {
    const brand = brands.find((b) => b.id === brandId);
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            brandId,
            brandName: brand?.name || "",
          }
        : null
    );
  };

  const addSize = () => {
    const newSize: Size = {
      id: `size_${Date.now()}`,
      name: "",
      price: 0,
      promotionType: "",
      promotionValue: 0,
      promotionFromDate: "",
      promotionToDate: "",
      finalPrice: 0,
      isPromotionActive: false,
    };
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            sizes: [...prev.sizes, newSize],
            hasSizes: true,
          }
        : null
    );
  };

  const removeSize = (sizeId: string) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            sizes: prev.sizes.filter((s) => s.id !== sizeId),
            hasSizes: prev.sizes.length > 1,
          }
        : null
    );
  };

  const updateSize = (sizeId: string, field: keyof Size, value: any) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            sizes: prev.sizes.map((size) =>
              size.id === sizeId
                ? {
                    ...size,
                    [field]: value,
                    finalPrice:
                      field === "price" ||
                      field === "promotionValue" ||
                      field === "promotionType"
                        ? calculateFinalPrice(
                            field === "price" ? value : size.price,
                            field === "promotionType"
                              ? value
                              : size.promotionType,
                            field === "promotionValue"
                              ? value
                              : size.promotionValue
                          )
                        : size.finalPrice,
                  }
                : size
            ),
          }
        : null
    );
  };

  const addImage = () => {
    const newImage: ProductImage = {
      id: `img_${Date.now()}`,
      imageUrl: "",
      imageType: formData.images.length === 0 ? "main" : "gallery",
    };
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            images: [...prev.images, newImage],
          }
        : null
    );
  };

  const removeImage = (imageId: string) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            images: prev.images.filter((img) => img.id !== imageId),
          }
        : null
    );
  };

  const updateImage = (
    imageId: string,
    field: keyof ProductImage,
    value: string
  ) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            images: prev.images.map((img) =>
              img.id === imageId ? { ...img, [field]: value } : img
            ),
          }
        : null
    );
  };

  const calculateFinalPrice = (
    price: number,
    promotionType: string,
    promotionValue: number
  ) => {
    if (!promotionType || promotionValue === 0) return price;

    if (promotionType === "percentage") {
      return price - (price * promotionValue) / 100;
    } else if (promotionType === "fixed") {
      return Math.max(0, price - promotionValue);
    }
    return price;
  };

  const handleSave = () => {
    if (formData) {
      const updatedProduct = {
        ...formData,
        updatedAt: new Date().toISOString(),
        displayPrice: formData.hasSizes
          ? Math.min(...formData.sizes.map((s) => s.finalPrice))
          : calculateFinalPrice(
              formData.price,
              formData.promotionType,
              formData.promotionValue
            ),
        hasPromotionActive: formData.hasSizes
          ? formData.sizes.some((s) => s.isPromotionActive)
          : formData.promotionType !== "" && formData.promotionValue > 0,
        mainImageUrl:
          formData.images.find((img) => img.imageType === "main")?.imageUrl ||
          formData.images[0]?.imageUrl ||
          "",
      };
      onSave(updatedProduct);
    }
  };

  const handleDelete = () => {
    if (formData?.id && onDelete) {
      onDelete(formData.id);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        };
      case "draft":
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };
      case "inactive":
        return {
          color: "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-500",
        };
      default:
        return {
          color: "bg-gray-50 text-gray-700 border-gray-200",
          dot: "bg-gray-500",
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusConfig = getStatusConfig(formData.status);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col border">
          {/* Enhanced Header */}
          <div className="relative bg-gradient-to-r from-slate-50 to-slate-100 border-b p-6 flex-shrink-0 rounded-t-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    {formData.images.length > 0 &&
                    formData.images[0].imageUrl ? (
                      <Image
                        src={formData.images[0].imageUrl || "/placeholder.svg"}
                        alt={formData.name}
                        width={80}
                        height={80}
                        className="rounded-xl object-cover"
                      />
                    ) : (
                      <Package className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white ${statusConfig.dot}`}
                  />
                </div>
                <div className="flex-1 pt-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {formData.name || "New Product"}
                  </h2>
                  <p className="text-base text-gray-600 mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {formData.businessName || "No business selected"}
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`${statusConfig.color} font-medium px-3 py-1`}
                    >
                      <span>{formData.status}</span>
                    </Badge>
                    {formData.hasPromotionActive && (
                      <Badge className="bg-red-50 text-red-700 border-red-200 font-medium px-3 py-1">
                        On Sale
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-10 w-10 rounded-full hover:bg-white/80"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger
                    value="basic"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="pricing"
                    className="flex items-center gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    Pricing
                  </TabsTrigger>
                  <TabsTrigger
                    value="images"
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Images
                  </TabsTrigger>
                  <TabsTrigger
                    value="sizes"
                    className="flex items-center gap-2"
                  >
                    <Ruler className="h-4 w-4" />
                    Sizes
                  </TabsTrigger>
                  <TabsTrigger
                    value="stats"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Stats
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter product name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          handleInputChange("status", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="business">Business *</Label>
                      <Select
                        value={formData.businessId}
                        onValueChange={handleBusinessChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business" />
                        </SelectTrigger>
                        <SelectContent>
                          {businesses.map((business) => (
                            <SelectItem key={business.id} value={business.id}>
                              {business.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand *</Label>
                      <Select
                        value={formData.brandId}
                        onValueChange={handleBrandChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Enter product description"
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Base Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Base Price ($)</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) =>
                              handleInputChange(
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Display Price</Label>
                          <Input
                            value={`$${formData.displayPrice.toFixed(2)}`}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <Label className="text-base font-medium">
                          Promotion Settings
                        </Label>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="promotionType">
                              Promotion Type
                            </Label>
                            <Select
                              value={formData.promotionType}
                              onValueChange={(value) =>
                                handleInputChange("promotionType", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="No promotion" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No promotion</SelectItem>
                                <SelectItem value="percentage">
                                  Percentage
                                </SelectItem>
                                <SelectItem value="fixed">
                                  Fixed Amount
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="promotionValue">
                              Promotion Value{" "}
                              {formData.promotionType === "percentage"
                                ? "(%)"
                                : "($)"}
                            </Label>
                            <Input
                              id="promotionValue"
                              type="number"
                              step="0.01"
                              value={formData.promotionValue}
                              onChange={(e) =>
                                handleInputChange(
                                  "promotionValue",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              disabled={!formData.promotionType}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Calculated Final Price</Label>
                            <Input
                              value={`$${calculateFinalPrice(
                                formData.price,
                                formData.promotionType,
                                formData.promotionValue
                              ).toFixed(2)}`}
                              disabled
                              className="bg-muted"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="promotionFromDate">
                              Promotion Start Date
                            </Label>
                            <Input
                              id="promotionFromDate"
                              type="datetime-local"
                              value={
                                formData.promotionFromDate
                                  ? new Date(formData.promotionFromDate)
                                      .toISOString()
                                      .slice(0, 16)
                                  : ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "promotionFromDate",
                                  e.target.value
                                    ? new Date(e.target.value).toISOString()
                                    : ""
                                )
                              }
                              disabled={!formData.promotionType}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="promotionToDate">
                              Promotion End Date
                            </Label>
                            <Input
                              id="promotionToDate"
                              type="datetime-local"
                              value={
                                formData.promotionToDate
                                  ? new Date(formData.promotionToDate)
                                      .toISOString()
                                      .slice(0, 16)
                                  : ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "promotionToDate",
                                  e.target.value
                                    ? new Date(e.target.value).toISOString()
                                    : ""
                                )
                              }
                              disabled={!formData.promotionType}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="images" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-medium">
                      Product Images
                    </Label>
                    <Button onClick={addImage} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {formData.images.map((image, index) => (
                      <Card key={image.id}>
                        <CardContent className="p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <Badge
                              variant={
                                image.imageType === "main"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {image.imageType}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImage(image.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
                            {image.imageUrl ? (
                              <Image
                                src={image.imageUrl || "/placeholder.svg"}
                                alt={`Product image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Image URL</Label>
                            <Input
                              value={image.imageUrl}
                              onChange={(e) =>
                                updateImage(
                                  image.id,
                                  "imageUrl",
                                  e.target.value
                                )
                              }
                              placeholder="Enter image URL"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Image Type</Label>
                            <Select
                              value={image.imageType}
                              onValueChange={(value) =>
                                updateImage(image.id, "imageType", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="main">Main</SelectItem>
                                <SelectItem value="gallery">Gallery</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {formData.images.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No images added yet. Click "Add Image" to get started.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="sizes" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        Size Variants
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.hasSizes}
                          onCheckedChange={(checked) =>
                            handleInputChange("hasSizes", checked)
                          }
                        />
                        <Label>Enable size variants</Label>
                      </div>
                    </div>
                    {formData.hasSizes && (
                      <Button onClick={addSize} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Size
                      </Button>
                    )}
                  </div>

                  {formData.hasSizes && (
                    <div className="space-y-4">
                      {formData.sizes.map((size) => (
                        <Card key={size.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <Label className="text-base font-medium">
                                Size Configuration
                              </Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSize(size.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                              <div className="space-y-2">
                                <Label>Size Name</Label>
                                <Input
                                  value={size.name}
                                  onChange={(e) =>
                                    updateSize(size.id, "name", e.target.value)
                                  }
                                  placeholder="e.g., Small, Medium"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Price ($)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={size.price}
                                  onChange={(e) =>
                                    updateSize(
                                      size.id,
                                      "price",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Promotion Type</Label>
                                <Select
                                  value={size.promotionType}
                                  onValueChange={(value) =>
                                    updateSize(size.id, "promotionType", value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="No promotion" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">
                                      No promotion
                                    </SelectItem>
                                    <SelectItem value="percentage">
                                      Percentage
                                    </SelectItem>
                                    <SelectItem value="fixed">
                                      Fixed Amount
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Promotion Value</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={size.promotionValue}
                                  onChange={(e) =>
                                    updateSize(
                                      size.id,
                                      "promotionValue",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  disabled={!size.promotionType}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4">
                              <div className="space-y-2">
                                <Label>Promotion Start</Label>
                                <Input
                                  type="datetime-local"
                                  value={
                                    size.promotionFromDate
                                      ? new Date(size.promotionFromDate)
                                          .toISOString()
                                          .slice(0, 16)
                                      : ""
                                  }
                                  onChange={(e) =>
                                    updateSize(
                                      size.id,
                                      "promotionFromDate",
                                      e.target.value
                                        ? new Date(e.target.value).toISOString()
                                        : ""
                                    )
                                  }
                                  disabled={!size.promotionType}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Promotion End</Label>
                                <Input
                                  type="datetime-local"
                                  value={
                                    size.promotionToDate
                                      ? new Date(size.promotionToDate)
                                          .toISOString()
                                          .slice(0, 16)
                                      : ""
                                  }
                                  onChange={(e) =>
                                    updateSize(
                                      size.id,
                                      "promotionToDate",
                                      e.target.value
                                        ? new Date(e.target.value).toISOString()
                                        : ""
                                    )
                                  }
                                  disabled={!size.promotionType}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Final Price</Label>
                                <Input
                                  value={`$${size.finalPrice.toFixed(2)}`}
                                  disabled
                                  className="bg-muted"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {formData.sizes.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No sizes configured yet. Click "Add Size" to get
                          started.
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="stats" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          View Statistics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>View Count</Label>
                          <Input
                            type="number"
                            value={formData.viewCount}
                            onChange={(e) =>
                              handleInputChange(
                                "viewCount",
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Public URL</Label>
                          <Input
                            value={formData.publicUrl}
                            onChange={(e) =>
                              handleInputChange("publicUrl", e.target.value)
                            }
                            placeholder="https://example.com/product/..."
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5" />
                          Favorite Statistics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Favorite Count</Label>
                          <Input
                            type="number"
                            value={formData.favoriteCount}
                            onChange={(e) =>
                              handleInputChange(
                                "favoriteCount",
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.isFavorited}
                            onCheckedChange={(checked) =>
                              handleInputChange("isFavorited", checked)
                            }
                          />
                          <Label>Currently Favorited</Label>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Created At</Label>
                          <Input
                            value={formatDate(formData.createdAt)}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Updated At</Label>
                          <Input
                            value={formatDate(formData.updatedAt)}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Created By</Label>
                          <Input
                            value={formData.createdBy}
                            onChange={(e) =>
                              handleInputChange("createdBy", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Updated By</Label>
                          <Input
                            value={formData.updatedBy}
                            onChange={(e) =>
                              handleInputChange("updatedBy", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center flex-shrink-0 rounded-b-xl">
            <div>
              {product && onDelete && (
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Product
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {product ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
