"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Heart,
  Share2,
  ShoppingCart,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getPublicProductByIdService } from "@/services/public/product/product.service";
import { Button } from "@/components/ui/button";
import Loading from "@/components/shared/common/loading";
import {
  ProductDetailModel,
  Size,
} from "@/models/content-manangement/product/product.detail.response";

const ProductDetailPage: React.FC = () => {
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<ProductDetailModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        const productData = await getPublicProductByIdService(productId);
        setProduct(productData);
        setIsFavorited(productData.isFavorited);

        // Set default size if available
        if (productData.hasSizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleImageNavigation = (direction: "prev" | "next") => {
    if (!product?.images) return;

    setCurrentImageIndex((prev) => {
      if (direction === "prev") {
        return prev === 0 ? product.images.length - 1 : prev - 1;
      } else {
        return prev === product.images.length - 1 ? 0 : prev + 1;
      }
    });
  };

  const getCurrentPrice = () => {
    if (selectedSize) {
      return selectedSize.finalPrice;
    }
    return product?.displayPrice || 0;
  };

  const handleAddToCart = () => {
    // Implement add to cart logic
    console.log("Adding to cart:", {
      productId: product?.id,
      size: selectedSize,
      quantity,
    });
  };

  const handleBuyNow = () => {
    // Implement buy now logic
    console.log("Buy now:", {
      productId: product?.id,
      size: selectedSize,
      quantity,
    });
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // Implement favorite toggle API call
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600">
            {error || "The requested product could not be found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse">
            {/* Image Thumbnails */}
            <div className="hidden mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
              <div className="grid grid-cols-4 gap-6">
                {product.images.map((image, index) => (
                  <Button
                    key={image.id}
                    className={`relative h-24 bg-white rounded-md flex items-center justify-center text-sm font-medium uppercase text-gray-900 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4 ${
                      index === currentImageIndex ? "ring-2" : ""
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <span className="sr-only">Image {index + 1}</span>
                    <span className="absolute inset-0 rounded-md overflow-hidden">
                      <Image
                        src={image?.imageUrl}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-cover object-center"
                      />
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Main Image */}
            <div className="w-full aspect-square relative bg-white rounded-lg overflow-hidden">
              {product.images.length > 0 && (
                <>
                  <Image
                    src={product.images[currentImageIndex]?.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover object-center"
                    priority
                  />

                  {/* Navigation arrows */}
                  {product.images.length > 1 && (
                    <>
                      <Button
                        onClick={() => handleImageNavigation("prev")}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        onClick={() => handleImageNavigation("next")}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 uppercase">
                {product.name}
              </h1>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={toggleFavorite}
                  className={`p-2 rounded-full transition-colors hover:bg-slate-200 ${
                    isFavorited
                      ? "bg-pink-100 text-primary hover:bg-primary-500"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Heart
                    className={`h-6 w-6 ${isFavorited ? "fill-current" : ""}`}
                  />
                </Button>
                <Button className="p-2 bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
                  <Share2 className="h-6 w-6" />
                </Button>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-sm text-gray-500">By {product.businessName}</p>
              <p className="text-sm text-gray-500 mt-1">
                {product.categoryName}
              </p>
            </div>

            {/* Price */}
            <div className="mt-6">
              <div className="flex items-center space-x-4">
                <p className="text-3xl font-bold text-pink-600">
                  ${getCurrentPrice().toFixed(2)}
                </p>
                {product.hasPromotion && (
                  <p className="text-lg text-gray-500 line-through">
                    ${(selectedSize?.price || product.price).toFixed(2)}
                  </p>
                )}
              </div>
              {product.hasPromotion && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {product.promotionType === "PERCENTAGE"
                      ? `${product.promotionValue}% OFF`
                      : `$${product.promotionValue} OFF`}
                  </span>
                </div>
              )}
            </div>

            {/* Size Selection */}
            {product.hasSizes && product.sizes.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Choose Size:{" "}
                  <span className="font-bold">{selectedSize?.name}</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.sizes.map((size) => (
                    <Button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`relative p-4 border rounded-lg text-left transition-all ${
                        selectedSize?.id === size.id
                          ? "border-pink-500 bg-pink- text-primary hover:bg-gray-600 ring-2 ring-pink-500"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {size.name}
                        </span>
                        {selectedSize?.id === size.id && (
                          <div className="h-2 w-2 bg-pink-500 rounded-full text-white"></div>
                        )}
                      </div>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="text-sm font-bold">
                          ${size.finalPrice.toFixed(2)}
                        </span>
                        {size.hasPromotion && (
                          <span className="text-xs text-gray-500 line-through">
                            ${size.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 rounded-full bg-primary-100 hover:bg-gray-200 text-primary transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 text-lg font-semibold min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 rounded-full bg-primary-100 hover:bg-primary-200 text-primary transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-4">
              <Button
                onClick={handleBuyNow}
                className="w-full bg-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-pink-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Buy Now</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleAddToCart}
                className="w-full border-2 border-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-pink-50 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </Button>
            </div>

            {/* Product Stats */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {product.favoriteCount}
                  </div>
                  <div className="text-gray-500">Favorites</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {product.viewCount}
                  </div>
                  <div className="text-gray-500">Views</div>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Description
                </h3>
                <div className="prose prose-sm text-gray-600">
                  <p>{product.description}</p>
                </div>
              </div>
            )}

            {/* Product Details */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Product Details
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Brand</dt>
                  <dd className="text-sm text-gray-900">{product.brandName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Category
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {product.categoryName}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900 capitalize">
                    {product.status.toLowerCase()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Store</dt>
                  <dd className="text-sm text-gray-900">
                    {product.businessName}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Similar Items Section Placeholder */}
        <div className="mt-16 pt-16 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            SIMILAR ITEMS YOU MIGHT LIKE
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder for similar items - you can implement this with a separate API call */}
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm p-4">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
