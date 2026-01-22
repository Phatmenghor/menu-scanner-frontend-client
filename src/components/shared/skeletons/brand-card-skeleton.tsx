import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const BrandCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border">
      <div className="relative w-full" style={{ aspectRatio: "16/10" }}>
        {/* Background with shimmer */}
        <div className="absolute inset-0 bg-muted/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>

        {/* Logo container skeleton */}
        <div className="absolute inset-0 p-4 sm:p-6 flex items-center justify-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-muted/50 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Info section at bottom */}
        <div className="absolute inset-x-0 bottom-0 bg-muted/50 p-3 sm:p-4 space-y-1.5">
          <div className="h-4 w-3/4 mx-auto bg-muted/50 rounded animate-pulse" />
          <div className="h-3 w-1/2 mx-auto bg-muted/50 rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );
};

interface BrandGridSkeletonProps {
  count?: number;
  className?: string;
}

export const BrandGridSkeleton = ({
  count = 12,
  className,
}: BrandGridSkeletonProps) => {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <BrandCardSkeleton key={index} />
      ))}
    </div>
  );
};
