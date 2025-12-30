import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const BrandCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center">
        {/* Logo Skeleton */}
        <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-2" />
        {/* Name Skeleton */}
        <Skeleton className="h-4 w-16 sm:w-20 mb-1" />
        {/* Count Skeleton */}
        <Skeleton className="h-3 w-8" />
      </CardContent>
    </Card>
  );
};

interface BrandGridSkeletonProps {
  count?: number;
}

export const BrandGridSkeleton = ({ count = 12 }: BrandGridSkeletonProps) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <BrandCardSkeleton key={index} />
      ))}
    </div>
  );
};
