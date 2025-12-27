import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const BrandCardSkeleton = () => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6 flex flex-col items-center justify-center">
        <Skeleton className="w-32 h-32 rounded-full mb-4" />
        <Skeleton className="h-5 w-24" />
      </CardContent>
    </Card>
  );
};

interface BrandGridSkeletonProps {
  count?: number;
}

export const BrandGridSkeleton = ({ count = 6 }: BrandGridSkeletonProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <BrandCardSkeleton key={index} />
      ))}
    </div>
  );
};
