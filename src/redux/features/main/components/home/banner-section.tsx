"use client";

import React from "react";
import Image from "next/image";
import { BannerResponseModel } from "@/redux/features/master-data/store/models/response/banner-response";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface BannerSectionProps {
  banners: BannerResponseModel[];
  loading: boolean;
  error: string | null;
}

export const BannerSection = ({
  banners,
  loading,
  error,
}: BannerSectionProps) => {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  if (loading) {
    return (
      <div className="w-full mb-8">
        <Skeleton className="w-full h-[400px] md:h-[500px] rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mb-8 p-8 bg-destructive/10 rounded-xl text-center">
        <p className="text-destructive">Failed to load banners</p>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-8">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden">
                <Image
                  src={banner.imageUrl || "https://picsum.photos/1200/500"}
                  alt={banner.businessName || "Banner"}
                  fill
                  className="object-cover"
                  priority
                />
                {banner.linkUrl && (
                  <a
                    href={banner.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0"
                  >
                    <span className="sr-only">View banner link</span>
                  </a>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-8 text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">
                      {banner.businessName}
                    </h2>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {banners.length > 1 && (
          <>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </>
        )}
      </Carousel>
    </div>
  );
};
