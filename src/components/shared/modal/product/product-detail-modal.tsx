"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  X,
  Eye,
  Heart,
  Package,
  DollarSign,
  ImageIcon,
  Ruler,
  BarChart3,
  Calendar,
  Building2,
  Tag,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Share,
  Copy,
  ExternalLink,
  Star,
  TrendingUp,
  Users,
  Percent,
  Zap,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ProductDetailModel } from "@/models/content-manangement/product/product.detail.response";
import { getProductByIdService } from "@/services/dashboard/content-management/product/product.service";

interface ProductDetailModalProps {
  productId: string | null;
  open: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({
  productId,
  open,
  onClose,
}: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const [product, setProduct] = useState<ProductDetailModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!productId) return;

    try {
      setIsLoading(true);
      const productData: ProductDetailModel = await getProductByIdService(
        productId
      );
      if (productData) {
        setProduct(productData);
      }
    } catch (err) {
      console.error(
        err instanceof Error ? err.message : "Failed to load product"
      );
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle className="h-3.5 w-3.5" />,
          dot: "bg-emerald-500",
        };
      case "draft":
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          dot: "bg-amber-500",
        };
      case "inactive":
        return {
          color: "bg-red-50 text-red-700 border-red-200",
          icon: <XCircle className="h-3.5 w-3.5" />,
          dot: "bg-red-500",
        };
      case "out_of_stock":
        return {
          color: "bg-orange-50 text-orange-700 border-orange-200",
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          dot: "bg-orange-500",
        };
      default:
        return {
          color: "bg-gray-50 text-gray-700 border-gray-200",
          icon: <XCircle className="h-3.5 w-3.5" />,
          dot: "bg-gray-500",
        };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getPromotionText = (type: string, value: number) => {
    if (type === "PERCENTAGE") {
      return `${value}% OFF`;
    } else if (type === "FIXED_AMOUNT") {
      return `$${value} OFF`;
    }
    return "SALE";
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(message);
    });
  };

  const shareProduct = () => {
    navigator.share({
      title: product?.name,
      text: `Check out this product: ${product?.name}`,
    });
  };

  const InfoItem = ({
    icon,
    label,
    value,
    className = "",
    action,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | React.ReactNode;
    className?: string;
    action?: React.ReactNode;
  }) => (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="flex-shrink-0 mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
          {label}
        </p>
        <div className="text-sm font-medium text-foreground flex items-center justify-between">
          {value || (
            <span className="text-muted-foreground italic">Not provided</span>
          )}
          {action}
        </div>
      </div>
    </div>
  );

  const StatCard = ({
    icon,
    label,
    value,
    trend,
    trendValue,
    color = "blue",
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <div className={`text-${color}-600`}>{icon}</div>
          </div>
          {trend && (
            <div
              className={`flex items-center text-xs ${
                trend === "up"
                  ? "text-green-600"
                  : trend === "down"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {trendValue}
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );

  const statusConfig = getStatusConfig(product?.status ?? "");
  const allImages = product?.images || [];
  const currentImage = allImages[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length
    );
  };

  const getFullImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("/")) {
      return `${process.env.NEXT_PUBLIC_API_BASE_URL}${imageUrl}`;
    }
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/${imageUrl}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] p-0 flex flex-col">
        {/* Enhanced Header with Action Buttons */}
        <div className="relative bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b p-6 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              {/* Product Image Carousel */}
              <div className="relative">
                <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  {allImages.length > 0 && currentImage ? (
                    <>
                      <Image
                        src={getFullImageUrl(currentImage.imageUrl)}
                        alt={product?.name || ""}
                        width={96}
                        height={96}
                        className="rounded-xl object-cover w-full h-full"
                        onLoadStart={() => setImageLoading(true)}
                        onLoad={() => setImageLoading(false)}
                      />
                      {imageLoading && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />
                      )}
                    </>
                  ) : (
                    <Package className="h-12 w-12 text-white" />
                  )}
                </div>

                {/* Image Navigation */}
                {allImages.length > 1 && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-white rounded-full shadow-lg px-2 py-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevImage}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <span className="text-xs font-medium px-1">
                      {currentImageIndex + 1}/{allImages.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextImage}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white ${statusConfig.dot}`}
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 pt-1">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {product?.name}
                  </h2>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareProduct}
                      className="flex items-center gap-1"
                    >
                      <Share className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>

                <p className="text-base text-gray-600 mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {product?.businessName}
                </p>

                <div className="flex items-center gap-3 mb-3">
                  <Badge
                    className={`${statusConfig.color} font-medium px-3 py-1`}
                  >
                    {statusConfig.icon}
                    <span className="ml-1.5">{product?.status}</span>
                  </Badge>
                  {product?.hasPromotion && (
                    <Badge className="bg-red-50 text-red-700 border-red-200 font-medium px-3 py-1 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {getPromotionText(
                        product.promotionType,
                        product.promotionValue
                      )}
                    </Badge>
                  )}
                  {product?.categoryName && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Tag className="h-3 w-3" />
                      {product.categoryName}
                    </Badge>
                  )}
                  {product?.brandName && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Building2 className="h-3 w-3" />
                      {product.brandName}
                    </Badge>
                  )}
                </div>

                {/* Price Display */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-green-600">
                      {formatPrice(product?.price ?? 0)}
                    </span>
                    {product?.hasPromotion &&
                      product.price !== product.displayPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          {formatPrice(product?.price)}
                        </span>
                      )}
                  </div>
                  {product?.hasSizes && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Ruler className="h-3 w-3" />
                      {product?.sizes?.length} sizes available
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                  icon={<Eye className="h-5 w-5" />}
                  label="Views"
                  value={product?.viewCount.toLocaleString() || ""}
                  color="blue"
                />
                <StatCard
                  icon={<Heart className="h-5 w-5" />}
                  label="Favorites"
                  value={product?.favoriteCount.toLocaleString() || ""}
                  color="pink"
                />
                <StatCard
                  icon={<Package className="h-5 w-5" />}
                  label="Images"
                  value={product?.images?.length || 0}
                  color="purple"
                />
                <StatCard
                  icon={<Ruler className="h-5 w-5" />}
                  label="Size Options"
                  value={product?.sizes?.length || (product?.hasSizes ? 0 : 1)}
                  color="green"
                />
              </div>

              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger
                    value="overview"
                    className="flex items-center gap-2"
                  >
                    <Info className="h-4 w-4" />
                    Overview
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
                    Gallery
                  </TabsTrigger>
                  <TabsTrigger
                    value="sizes"
                    className="flex items-center gap-2"
                  >
                    <Ruler className="h-4 w-4" />
                    Sizes
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Product Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Product Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <InfoItem
                          icon={<Building2 className="h-4 w-4" />}
                          label="Business"
                          value={product?.businessName}
                        />
                        <InfoItem
                          icon={<Tag className="h-4 w-4" />}
                          label="Category"
                          value={product?.categoryName}
                        />
                        <InfoItem
                          icon={<Building2 className="h-4 w-4" />}
                          label="Brand"
                          value={product?.brandName || "No brand"}
                        />
                        <InfoItem
                          icon={<Package className="h-4 w-4" />}
                          label="Product Type"
                          value={
                            product?.hasSizes
                              ? "Variable Product"
                              : "Simple Product"
                          }
                        />
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-purple-600" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() =>
                            copyToClipboard(
                              product?.name || "",
                              "Product name copied!"
                            )
                          }
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Product Name
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={shareProduct}
                        >
                          <Share className="h-4 w-4 mr-2" />
                          Share Product
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
                        {product?.description ? (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {product?.description}
                          </p>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <div className="text-center">
                              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm italic">
                                No description available
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pricing Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center p-6 bg-green-50 rounded-lg">
                          <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                          <p className="text-sm text-green-600 font-medium mb-1">
                            Current Price
                          </p>
                          <p className="text-3xl font-bold text-green-700">
                            {formatPrice(product?.displayPrice || 0)}
                          </p>
                        </div>
                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                          <Package className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                          <p className="text-sm text-gray-600 font-medium mb-1">
                            Base Price
                          </p>
                          <p className="text-3xl font-bold text-gray-700">
                            {formatPrice(product?.price || 0)}
                          </p>
                        </div>
                      </div>

                      {product?.hasPromotion && (
                        <>
                          <Separator />
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Percent className="h-5 w-5 text-red-600" />
                              <h4 className="text-base font-medium">
                                Active Promotion
                              </h4>
                              <Badge className="bg-red-100 text-red-700">
                                {getPromotionText(
                                  product.promotionType,
                                  product.promotionValue
                                )}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <InfoItem
                                icon={<Tag className="h-4 w-4" />}
                                label="Promotion Type"
                                value={
                                  product.promotionType === "PERCENTAGE"
                                    ? "Percentage Discount"
                                    : "Fixed Amount Discount"
                                }
                              />
                              <InfoItem
                                icon={<Percent className="h-4 w-4" />}
                                label="Discount Value"
                                value={
                                  product.promotionType === "PERCENTAGE"
                                    ? `${product.promotionValue}%`
                                    : formatPrice(product.promotionValue)
                                }
                              />
                              <InfoItem
                                icon={<DollarSign className="h-4 w-4" />}
                                label="You Save"
                                value={formatPrice(
                                  product.price - product.displayPrice
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <InfoItem
                                icon={<Calendar className="h-4 w-4" />}
                                label="Promotion Start"
                                value={formatDate(product.promotionFromDate)}
                              />
                              <InfoItem
                                icon={<Calendar className="h-4 w-4" />}
                                label="Promotion End"
                                value={formatDate(product.promotionToDate)}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="images" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Product Gallery ({product?.images?.length || 0} images)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {product?.images && product?.images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {product?.images.map((image, index) => (
                            <div key={image.id} className="space-y-2">
                              <div className="aspect-square relative bg-muted rounded-lg overflow-hidden group cursor-pointer">
                                <Image
                                  src={getFullImageUrl(image.imageUrl)}
                                  alt={`Product image ${index + 1}`}
                                  fill
                                  className="object-cover transition-transform group-hover:scale-105"
                                  onClick={() => setCurrentImageIndex(index)}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                              <div className="flex justify-center">
                                <Badge
                                  variant={
                                    image.imageType === "MAIN"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={
                                    image.imageType === "MAIN"
                                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                      : ""
                                  }
                                >
                                  {image.imageType === "MAIN" && (
                                    <Star className="h-3 w-3 mr-1" />
                                  )}
                                  {image.imageType}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">
                            No images available
                          </p>
                          <p className="text-sm">
                            This product doesn't have any images yet.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sizes" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Ruler className="h-5 w-5" />
                        Size Variants
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {product?.hasSizes &&
                      product.sizes &&
                      product.sizes.length > 0 ? (
                        <div className="space-y-4">
                          {product.sizes.map((size) => (
                            <Card
                              key={size.id}
                              className="border-l-4 border-l-blue-500"
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h4 className="text-lg font-semibold">
                                      {size.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-2xl font-bold text-green-600">
                                        {formatPrice(size.finalPrice)}
                                      </span>
                                      {size.hasPromotion &&
                                        size.price !== size.finalPrice && (
                                          <span className="text-sm text-gray-500 line-through">
                                            {formatPrice(size.price)}
                                          </span>
                                        )}
                                    </div>
                                  </div>
                                  {size.hasPromotion && (
                                    <Badge className="bg-red-50 text-red-700 border-red-200">
                                      <Zap className="h-3 w-3 mr-1" />
                                      {getPromotionText(
                                        size.promotionType,
                                        size.promotionValue
                                      )}
                                    </Badge>
                                  )}
                                </div>

                                {size.hasPromotion && (
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-red-50 rounded-lg">
                                    <InfoItem
                                      icon={<Tag className="h-4 w-4" />}
                                      label="Promotion Type"
                                      value={
                                        size.promotionType === "PERCENTAGE"
                                          ? "Percentage"
                                          : "Fixed Amount"
                                      }
                                    />
                                    <InfoItem
                                      icon={<Percent className="h-4 w-4" />}
                                      label="Discount"
                                      value={
                                        size.promotionType === "PERCENTAGE"
                                          ? `${size.promotionValue}%`
                                          : formatPrice(size.promotionValue)
                                      }
                                    />
                                    <InfoItem
                                      icon={<Calendar className="h-4 w-4" />}
                                      label="Start Date"
                                      value={formatDate(size.promotionFromDate)}
                                    />
                                    <InfoItem
                                      icon={<Calendar className="h-4 w-4" />}
                                      label="End Date"
                                      value={formatDate(size.promotionToDate)}
                                    />
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Ruler className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">
                            No size variants
                          </p>
                          <p className="text-sm">
                            This is a simple product with a single price.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Engagement Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Engagement Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Eye className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">Total Views</span>
                          </div>
                          <span className="text-xl font-bold text-blue-700">
                            {product?.viewCount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Heart className="h-5 w-5 text-pink-600" />
                            <span className="font-medium">Favorites</span>
                          </div>
                          <span className="text-xl font-bold text-pink-700">
                            {product?.favoriteCount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <span className="font-medium">Engagement Rate</span>
                          </div>
                          <span className="text-xl font-bold text-green-700">
                            {product && product?.viewCount > 0
                              ? (
                                  (product.favoriteCount / product.viewCount) *
                                  100
                                ).toFixed(1)
                              : "0.0"}
                            %
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Product Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Product Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <InfoItem
                          icon={statusConfig.icon}
                          label="Current Status"
                          value={
                            <Badge className={statusConfig.color}>
                              {product?.status.replace("_", " ")}
                            </Badge>
                          }
                        />
                        <InfoItem
                          icon={<Heart className="h-4 w-4" />}
                          label="User Favorited"
                          value={
                            <Badge
                              variant={
                                product?.isFavorited ? "default" : "secondary"
                              }
                            >
                              {product?.isFavorited ? "Yes" : "No"}
                            </Badge>
                          }
                        />
                        <InfoItem
                          icon={<Zap className="h-4 w-4" />}
                          label="Has Active Promotion"
                          value={
                            <Badge
                              variant={
                                product?.hasPromotion ? "default" : "secondary"
                              }
                            >
                              {product?.hasPromotion ? "Yes" : "No"}
                            </Badge>
                          }
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* System Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        System Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem
                          icon={<Calendar className="h-4 w-4" />}
                          label="Created Date"
                          value={formatDate(product?.createdAt || "")}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div className="flex gap-2">
            <Button variant="outline" onClick={shareProduct}>
              <Share className="h-4 w-4 mr-2" />
              Share Product
            </Button>
            <Button variant="outline" onClick={onClose} className="px-6">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
