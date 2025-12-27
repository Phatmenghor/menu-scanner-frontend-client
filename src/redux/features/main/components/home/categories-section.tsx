import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/shared/card/category-card";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";

interface CategoriesSectionProps {
  categories: CategoriesResponseModel[];
  loading: boolean;
  error: string | null;
  limit?: number;
  title?: string;
}

const CategorySkeleton = () => (
  <div className="h-[200px] flex flex-col rounded-lg border overflow-hidden">
    <Skeleton className="h-[140px] w-full" />
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
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, index) => (
            <CategorySkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="p-8 bg-destructive/10 rounded-xl text-center">
          <p className="text-destructive">Failed to load categories</p>
        </div>
      </div>
    );
  }

  if (!displayCategories || displayCategories.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {categories.length > limit && (
          <Link href="/categories">
            <Button variant="outline">View All</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {displayCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
};
