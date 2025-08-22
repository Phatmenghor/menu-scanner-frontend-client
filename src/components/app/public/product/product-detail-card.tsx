import React, { useState } from "react";
import { Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductModel } from "@/models/content-manangement/product/product.response";
import { ProductDetailModel } from "@/models/content-manangement/product/product.detail.response";

interface ProductCardProps {
  product: ProductDetailModel;
  showBestSeller?: boolean;
  onWishlistToggle?: (productId: string, isFavorited: boolean) => void;
  onProductClick?: (productId: string) => void;
  viewMode?: "grid" | "list"; // Add this new prop
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showBestSeller = false,
  onWishlistToggle,
  onProductClick,
  viewMode = "grid", // Default to grid view
}) => {
  const [isWishlisted, setIsWishlisted] = useState(product.isFavorited);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavoriteState = !isWishlisted;
    setIsWishlisted(newFavoriteState);
    if (onWishlistToggle) {
      onWishlistToggle(product.id, newFavoriteState);
    }
  };

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product.id);
    }
  };

  const isOutOfStock = product.status === "OUT_OF_STOCK";
  const hasDiscount =
    product.hasPromotion && product.displayPrice < product.price;

  // List view layout
  if (viewMode === "list") {
    return (
      <div
        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.02] relative group flex"
        onClick={handleCardClick}
      >
        {/* Badges for list view */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {showBestSeller && (
            <span className="bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded">
              BEST SELLER
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              OUT OF STOCK
            </span>
          )}
          {hasDiscount && (
            <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
              SALE
            </span>
          )}
        </div>

        {/* Product Image - Smaller for list view */}
        <div className="w-48 h-48 bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 relative overflow-hidden flex-shrink-0">
          {product.images ? (
            <img
              src={product.images[0].imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-lg font-semibold text-center p-4">
              {product.name}
            </div>
          )}

          {/* Overlay effect on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"></div>
        </div>

        {/* Product Info - Expanded for list view */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-gray-800 font-semibold text-lg mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {product.brandName} • {product.categoryName}
                </p>
              </div>

              {/* Wishlist Button */}
              <Button
                onClick={handleWishlistClick}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isWishlisted
                    ? "bg-pink-600 text-white"
                    : "bg-pink-600 text-white hover:bg-pink-700"
                }`}
                disabled={isOutOfStock}
              >
                <Heart
                  size={16}
                  fill={isWishlisted ? "currentColor" : "none"}
                />
              </Button>
            </div>

            {/* Price Display */}
            <div className="flex items-center gap-3 mb-4">
              <p className="text-pink-600 font-bold text-xl">
                ${product.displayPrice.toFixed(2)}
              </p>
              {hasDiscount && (
                <p className="text-gray-400 line-through text-lg">
                  ${product.price.toFixed(2)}
                </p>
              )}
            </div>

            {/* Description or additional info for list view */}
            {product.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                {product.description}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Heart size={14} />
              {product.favoriteCount} favorites
            </div>
            <div className="flex items-center gap-1">
              <Eye size={14} />
              {product.viewCount} views
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original grid view layout (unchanged)
  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105 relative group"
      onClick={handleCardClick}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {showBestSeller && (
          <span className="bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded">
            BEST SELLER
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            OUT OF STOCK
          </span>
        )}
        {hasDiscount && (
          <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
            SALE
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="aspect-square bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 relative overflow-hidden">
        {product.images ? (
          <img
            src={product.images[0].imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-lg font-semibold text-center p-4">
            {product.name}
          </div>
        )}

        {/* Stats overlay */}
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Heart size={12} />
            {product.favoriteCount}
          </div>
          <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Eye size={12} />
            {product.viewCount}
          </div>
        </div>

        {/* Overlay effect on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"></div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <h3 className="text-gray-800 font-semibold text-sm mb-1 line-clamp-2">
              {product.name}
            </h3>

            {/* Price Display */}
            <div className="flex items-center gap-2">
              <p className="text-pink-600 font-bold text-lg">
                ${product.displayPrice.toFixed(2)}
              </p>
              {hasDiscount && (
                <p className="text-gray-400 line-through text-sm">
                  ${product.price.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Wishlist Button */}
          <Button
            onClick={handleWishlistClick}
            className={`p-2 rounded-full transition-all duration-200 ${
              isWishlisted
                ? "bg-pink-600 text-white"
                : "bg-pink-600 text-white hover:bg-pink-700"
            }`}
            disabled={isOutOfStock}
          >
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
          </Button>
        </div>
      </div>
    </div>
  );
};
