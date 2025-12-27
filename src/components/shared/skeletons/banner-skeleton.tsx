import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const BannerSkeleton = () => {
  return (
    <div className="w-full mb-8">
      <Skeleton className="w-full h-[400px] md:h-[500px] rounded-xl" />
    </div>
  );
};
