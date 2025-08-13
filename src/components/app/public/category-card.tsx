import React from "react";
import { Package, ChevronRight } from "lucide-react";
import { CategoryModel } from "@/models/content-manangement/category/category.response";

interface CategoryCardProps {
  category: CategoryModel;
  onCategoryClick?: (categoryId: string) => void;
  showProductCount?: boolean;
  size?: "small" | "medium" | "large";
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onCategoryClick,
  showProductCount = true,
  size = "medium",
}) => {
  const handleCardClick = () => {
    if (onCategoryClick) {
      onCategoryClick(category.id);
    }
  };

  const isInactive = category.status !== "ACTIVE";

  // Size configurations
  const sizeClasses = {
    small: {
      container: "h-32",
      text: "text-sm",
      subtext: "text-xs",
      padding: "p-3",
    },
    medium: {
      container: "h-40",
      text: "text-base",
      subtext: "text-sm",
      padding: "p-4",
    },
    large: {
      container: "h-48",
      text: "text-lg",
      subtext: "text-base",
      padding: "p-5",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl cursor-pointer 
        transition-all duration-300 hover:scale-105 hover:shadow-lg
        ${currentSize.container} ${isInactive ? "opacity-60" : ""}
      `}
      onClick={handleCardClick}
    >
      {/* Background Image or Gradient */}
      {category.imageUrl ? (
        <>
          <img
            src={process.env.NEXT_PUBLIC_API_BASE_URL + category.imageUrl}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
        </>
      ) : (
        /* Fallback gradient background */
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400"></div>
      )}

      {/* Status Badge */}
      {isInactive && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            INACTIVE
          </span>
        </div>
      )}

      {/* Content */}
      <div
        className={`relative z-10 h-full flex flex-col justify-between ${currentSize.padding}`}
      >
        {/* Business Badge */}
        <div className="flex justify-start">
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            {category.businessName}
          </span>
        </div>

        {/* Category Info */}
        <div className="text-white">
          <h3 className={`font-bold mb-1 ${currentSize.text}`}>
            {category.name}
          </h3>

          {showProductCount && (
            <div
              className={`flex items-center gap-1 ${currentSize.subtext} opacity-90`}
            >
              <Package size={14} />
              <span>
                {category.totalProducts}{" "}
                {category.totalProducts === 1 ? "Product" : "Products"}
              </span>
            </div>
          )}
        </div>

        {/* Arrow Icon */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ChevronRight size={20} className="text-white" />
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
    </div>
  );
};
