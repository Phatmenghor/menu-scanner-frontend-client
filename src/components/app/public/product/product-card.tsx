import React, { useState } from "react";
import { Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductModel } from "@/models/content-manangement/product/product.response";

interface ProductCardProps {
  product: ProductModel;
  showBestSeller?: boolean;
  onWishlistToggle?: (productId: string, isFavorited: boolean) => void;
  onProductClick?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showBestSeller = false,
  onWishlistToggle,
  onProductClick,
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
    product.hasPromotionActive && product.displayPrice < product.price;

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
        {product.mainImageUrl ? (
          <img
            src={process.env.NEXT_PUBLIC_API_BASE_URL + product.mainImageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
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
            <p className="text-xs text-gray-500 mb-2">
              {product.brandName} • {product.categoryName}
            </p>

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
