import React from "react";
import { CategoryCard } from "@/components/shared/card/category-card";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import {
  GridWrapper,
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
  <div className="h-[180px] flex flex-col rounded-xl border overflow-hidden bg-muted/30">
    <Skeleton className="h-[120px] w-full" />
    <div className="p-3 flex-1 flex items-center justify-center">
      <Skeleton className="h-4 w-24" />
    </div>
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
        <GridWrapper cols={{ default: 2, sm: 3, md: 4, lg: 4 }} gap={4}>
          {Array.from({ length: limit }).map((_, index) => (
            <CategorySkeleton key={index} />
          ))}
        </GridWrapper>
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
      <GridWrapper cols={{ default: 2, sm: 3, md: 4, lg: 4 }} gap={4}>
        {displayCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </GridWrapper>
    </SectionWrapper>
  );
};
