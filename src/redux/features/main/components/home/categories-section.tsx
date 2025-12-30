import React from "react";
import { CategoryCard } from "@/components/shared/card/category-card";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import {
  SectionHeader,
  SectionWrapper,
} from "@/components/shared/common/section-header";

interface CategoriesSectionProps {
  categories: CategoriesResponseModel[];
  loading: boolean;
  error: string | null;
  limit?: number;
  title?: string;
}

const CategorySkeleton = () => (
  <div className="h-[140px] flex flex-col rounded-xl border overflow-hidden bg-muted/30">
    <Skeleton className="h-full w-full" />
  </div>
);

export const CategoriesSection = ({
  categories,
  loading,
  error,
  limit = 8,
  title = "Shop by Category",
}: CategoriesSectionProps) => {
  const displayCategories = categories?.slice(0, limit) || [];

  if (loading) {
    return (
      <SectionWrapper>
        <SectionHeader title={title} subtitle="Browse products by category" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
          {Array.from({ length: limit }).map((_, index) => (
            <CategorySkeleton key={index} />
          ))}
        </div>
      </SectionWrapper>
    );
  }

  if (error || !displayCategories || displayCategories.length === 0) {
    return null;
  }

  return (
    <SectionWrapper>
      <SectionHeader
        title={title}
        subtitle="Browse products by category"
        viewAllLink={categories.length > limit ? "/categories" : undefined}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
        {displayCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </SectionWrapper>
  );
};
