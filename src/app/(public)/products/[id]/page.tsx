"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  fetchProductByIdService,
  fetchAllProductService,
} from "@/redux/features/business/store/thunks/product-thunks";
import {
  selectSelectedProduct,
  selectIsFetchingDetail,
} from "@/redux/features/business/store/selectors/product-selector";
import { ProductCard } from "@/components/shared/card/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Heart, ShoppingCart, Share2 } from "lucide-react";
import { formatCurrency } from "@/utils/common/currency-format";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const productId = params.id as string;
  const product = useAppSelector(selectSelectedProduct);
  const isLoading = useAppSelector(selectIsFetchingDetail);

  const [similarProducts, setSimilarProducts] = useState<
    ProductDetailResponseModel[]
  >([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductByIdService(productId));
    }
  }, [productId, dispatch]);

  // Set main image
  useEffect(() => {
    if (product?.mainImageUrl) {
      setSelectedImage(product.mainImageUrl);
    }
  }, [product]);

  // Fetch similar products
  useEffect(() => {
    if (product) {
      const loadSimilarProducts = async () => {
        try {
          const response = await dispatch(
            fetchAllProductService({
              pageNo: 1,
              pageSize: 4,
              categoryId: product.categoryId || undefined,
            })
          ).unwrap();

          // Filter out current product
          const similar =
            response.content?.filter((p: any) => p.id !== productId) || [];
          setSimilarProducts(similar.slice(0, 4));
        } catch (error) {
          console.error("Error loading similar products:", error);
        }
      };

      loadSimilarProducts();
    }
  }, [product, productId, dispatch]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const hasDiscount =
    product.hasPromotion && product.displayOriginPrice > product.displayPrice;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.displayOriginPrice - product.displayPrice) /
          product.displayOriginPrice) *
          100
      )
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden border">
              <Image
                src={selectedImage || "https://picsum.photos/800/800"}
                alt={product.name}
                fill
                className="object-cover"
              />
              {hasDiscount && (
                <Badge
                  variant="destructive"
                  className="absolute top-4 right-4 text-lg font-bold px-3 py-1"
                >
                  -{discountPercentage}%
                </Badge>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setSelectedImage(product.mainImageUrl)}
                  className={`relative aspect-square rounded border-2 overflow-hidden ${
                    selectedImage === product.mainImageUrl
                      ? "border-primary"
                      : "border-border"
                  }`}
                >
                  <Image
                    src={product.mainImageUrl}
                    alt="Main"
                    fill
                    className="object-cover"
                  />
                </button>
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className={`relative aspect-square rounded border-2 overflow-hidden ${
                      selectedImage === img.imageUrl
                        ? "border-primary"
                        : "border-border"
                    }`}
                  >
                    <Image
                      src={img.imageUrl}
                      alt={`Image ${img.displayOrder}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {product.brandName && (
                  <Badge variant="outline">{product.brandName}</Badge>
                )}
                <Badge variant="outline">{product.categoryName}</Badge>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(product.displayPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatCurrency(product.displayOriginPrice)}
                  </span>
                )}
              </div>
              {product.status === "OUT_OF_STOCK" && (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
              {product.status === "ACTIVE" && (
                <Badge variant="default" className="bg-green-500">
                  In Stock
                </Badge>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "No description available"}
              </p>
            </div>

            {/* Sizes */}
            {product.hasSizes && product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Available Sizes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.sizes.map((size) => (
                    <div
                      key={size.id}
                      className="border rounded-lg p-3 hover:border-primary transition-colors"
                    >
                      <div className="font-medium">{size.name}</div>
                      <div className="text-primary font-semibold">
                        {formatCurrency(size.finalPrice)}
                      </div>
                      {size.hasPromotion && (
                        <div className="text-xs text-muted-foreground line-through">
                          {formatCurrency(size.price)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-2">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center font-semibold">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                disabled={product.status === "OUT_OF_STOCK"}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.map((similar) => (
                <ProductCard key={similar.id} product={similar} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-24 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square rounded" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
