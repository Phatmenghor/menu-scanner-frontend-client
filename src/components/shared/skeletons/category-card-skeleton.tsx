import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const CategoryCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 flex flex-col items-center justify-center">
        {/* Icon/Image Skeleton */}
        <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-3" />
        {/* Name Skeleton - 2 lines */}
        <div className="w-full space-y-1 flex flex-col items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        {/* Count Skeleton */}
        <Skeleton className="h-3 w-12 mt-1" />
      </CardContent>
    </Card>
  );
};

interface CategoryGridSkeletonProps {
  count?: number;
}

export const CategoryGridSkeleton = ({
  count = 8,
}: CategoryGridSkeletonProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <CategoryCardSkeleton key={index} />
      ))}
    </div>
  );
};
