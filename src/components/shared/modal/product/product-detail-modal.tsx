"use client";

import React from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ProductModel } from "@/models/(content-manangement)/product/product.response";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProductDetailModalProps {
  product: ProductModel | null;
  open: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({
  product,
  open,
  onClose,
}: ProductDetailModalProps) {
  if (!open || !product) return null;

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
    if (type === "percentage") {
      return `${value}% OFF`;
    } else if (type === "fixed") {
      return `$${value} OFF`;
    }
    return "SALE";
  };

  const InfoItem = ({
    icon,
    label,
    value,
    className = "",
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | React.ReactNode;
    className?: string;
  }) => (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="flex-shrink-0 mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
          {label}
        </p>
        <div className="text-sm font-medium text-foreground">
          {value || (
            <span className="text-muted-foreground italic">Not provided</span>
          )}
        </div>
      </div>
    </div>
  );

  const statusConfig = getStatusConfig(product.status);

  return (
    <Dialog open={open} onOpenChange={onClose} aria-hidden="true">
      <DialogContent className="max-w-4xl">
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col border">
            {/* Enhanced Header */}
            <div className="relative bg-gradient-to-r from-slate-50 to-slate-100 border-b p-6 flex-shrink-0 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      {product.mainImageUrl ? (
                        <Image
                          src={
                            process.env.NEXT_PUBLIC_API_BASE_URL +
                              product.mainImageUrl || "/placeholder.svg"
                          }
                          alt={product.name}
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
                      {product.name}
                    </h2>
                    <p className="text-base text-gray-600 mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {product.businessName}
                    </p>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`${statusConfig.color} font-medium px-3 py-1`}
                      >
                        {statusConfig.icon}
                        <span className="ml-1.5">{product.status}</span>
                      </Badge>
                      {product.hasPromotionActive && (
                        <Badge className="bg-red-50 text-red-700 border-red-200 font-medium px-3 py-1">
                          {getPromotionText(
                            product.promotionType,
                            product.promotionValue
                          )}
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
                <Tabs defaultValue="basic">
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
                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <InfoItem
                            icon={<Building2 className="h-4 w-4" />}
                            label="Category"
                            value={product.categoryName}
                          />
                        </CardContent>
                      </Card>
                      <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                          <InfoItem
                            icon={<Tag className="h-4 w-4" />}
                            label="Brand"
                            value={product.brandName}
                          />
                        </CardContent>
                      </Card>
                    </div>

                    {/* Description */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Description
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
                          {product.description ? (
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                              {product.description}
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
                          <InfoItem
                            icon={<DollarSign className="h-4 w-4" />}
                            label="Base Price"
                            value={formatPrice(product.price)}
                          />
                          <InfoItem
                            icon={<DollarSign className="h-4 w-4" />}
                            label="Display Price"
                            value={formatPrice(product.displayPrice)}
                          />
                        </div>

                        {product.promotionType && (
                          <>
                            <Separator />
                            <div className="space-y-4">
                              <h4 className="text-base font-medium">
                                Promotion Details
                              </h4>
                              <div className="grid grid-cols-3 gap-4">
                                <InfoItem
                                  icon={<Tag className="h-4 w-4" />}
                                  label="Promotion Type"
                                  value={
                                    product.promotionType === "percentage"
                                      ? "Percentage"
                                      : "Fixed Amount"
                                  }
                                />
                                <InfoItem
                                  icon={<DollarSign className="h-4 w-4" />}
                                  label="Promotion Value"
                                  value={
                                    product.promotionType === "percentage"
                                      ? `${product.promotionValue}%`
                                      : formatPrice(product.promotionValue)
                                  }
                                />
                                <InfoItem
                                  icon={<DollarSign className="h-4 w-4" />}
                                  label="Savings"
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
                          Product Images ({product.images.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {product.images.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {product?.images?.map((image, index) => (
                              <div key={image.id} className="space-y-2">
                                <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
                                  <Image
                                    src={
                                      process.env.NEXT_PUBLIC_API_BASE_URL +
                                        image.imageUrl || "/placeholder.svg"
                                    }
                                    alt={`Product image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex justify-center">
                                  <Badge
                                    variant={
                                      image.imageType === "main"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {image.imageType}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No images available</p>
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
                        {product.hasSizes && product.sizes.length > 0 ? (
                          <div className="space-y-4">
                            {product.sizes.map((size) => (
                              <Card
                                key={size.id}
                                className="border-l-4 border-l-blue-500"
                              >
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-base font-medium">
                                      {size.name}
                                    </h4>
                                    {size.isPromotionActive && (
                                      <Badge className="bg-red-50 text-red-700 border-red-200">
                                        On Sale
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <InfoItem
                                      icon={<DollarSign className="h-4 w-4" />}
                                      label="Original Price"
                                      value={formatPrice(size.price)}
                                    />
                                    <InfoItem
                                      icon={<DollarSign className="h-4 w-4" />}
                                      label="Final Price"
                                      value={formatPrice(size.finalPrice)}
                                    />
                                    {size.promotionType && (
                                      <>
                                        <InfoItem
                                          icon={<Tag className="h-4 w-4" />}
                                          label="Promotion"
                                          value={
                                            size.promotionType === "percentage"
                                              ? `${size.promotionValue}% OFF`
                                              : `$${size.promotionValue} OFF`
                                          }
                                        />
                                        <InfoItem
                                          icon={
                                            <DollarSign className="h-4 w-4" />
                                          }
                                          label="Savings"
                                          value={formatPrice(
                                            size.price - size.finalPrice
                                          )}
                                        />
                                      </>
                                    )}
                                  </div>
                                  {size.promotionType && (
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                      <InfoItem
                                        icon={<Calendar className="h-4 w-4" />}
                                        label="Promotion Start"
                                        value={formatDate(
                                          size.promotionFromDate
                                        )}
                                      />
                                      <InfoItem
                                        icon={<Calendar className="h-4 w-4" />}
                                        label="Promotion End"
                                        value={formatDate(size.promotionToDate)}
                                      />
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Ruler className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No size variants configured</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="stats" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            View Statistics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <InfoItem
                            icon={<Eye className="h-4 w-4" />}
                            label="Total Views"
                            value={product.viewCount.toLocaleString()}
                          />
                          <InfoItem
                            icon={<Tag className="h-4 w-4" />}
                            label="Public URL"
                            value={
                              product.publicUrl ? (
                                <a
                                  href={product.publicUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View Product
                                </a>
                              ) : (
                                "Not set"
                              )
                            }
                          />
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
                          <InfoItem
                            icon={<Heart className="h-4 w-4" />}
                            label="Total Favorites"
                            value={product.favoriteCount.toLocaleString()}
                          />
                          <InfoItem
                            icon={<Heart className="h-4 w-4" />}
                            label="Currently Favorited"
                            value={
                              <Badge
                                variant={
                                  product.isFavorited ? "default" : "secondary"
                                }
                              >
                                {product.isFavorited ? "Yes" : "No"}
                              </Badge>
                            }
                          />
                        </CardContent>
                      </Card>
                    </div>

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
                            label="Created"
                            value={
                              <div>
                                <div>{formatDate(product.createdAt)}</div>
                                {product.createdBy && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    by {product.createdBy}
                                  </div>
                                )}
                              </div>
                            }
                          />
                          <InfoItem
                            icon={<Calendar className="h-4 w-4" />}
                            label="Last Updated"
                            value={
                              <div>
                                <div>{formatDate(product.updatedAt)}</div>
                                {product.updatedBy && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    by {product.updatedBy}
                                  </div>
                                )}
                              </div>
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t bg-gray-50 px-6 py-4 flex justify-end items-center flex-shrink-0 rounded-b-xl">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 bg-transparent"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
