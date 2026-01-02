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
import { cn } from "@/lib/utils";

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
  const [current, setCurrent] = React.useState(0);
  const [carouselApi, setCarouselApi] = React.useState<any>();
  const [loadedImages, setLoadedImages] = React.useState<Set<number>>(
    new Set()
  );
  const [isHovered, setIsHovered] = React.useState(false);

  // Custom auto-scroll implementation
  React.useEffect(() => {
    if (!carouselApi || banners.length <= 1 || isHovered) return;

    const intervalId = setInterval(() => {
      carouselApi.scrollNext();
    }, 1000); // 4 seconds delay

    return () => clearInterval(intervalId);
  }, [carouselApi, banners.length, isHovered]);

  React.useEffect(() => {
    if (!carouselApi) return;

    setCurrent(carouselApi.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

  if (loading) {
    return (
      <div className="w-full mb-8">
        <Skeleton className="w-full h-[200px] sm:h-[280px] md:h-[320px] lg:h-[360px] rounded-2xl" />
      </div>
    );
  }

  if (error || !banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-8">
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Carousel
          setApi={setCarouselApi}
          className="w-full"
          opts={{
            loop: true,
            align: "start",
          }}
        >
          <CarouselContent>
            {banners.map((banner, index) => (
              <CarouselItem key={banner.id + "-" + index}>
                <div className="relative w-full h-[200px] sm:h-[280px] md:h-[320px] lg:h-[360px] rounded-2xl overflow-hidden group">
                  {!loadedImages.has(index) && (
                    <div className="absolute inset-0 bg-muted animate-pulse" />
                  )}

                  <Image
                    src={
                      banner.imageUrl ||
                      `https://picsum.photos/1200/400?random=${index}`
                    }
                    alt={banner.businessName || "Banner"}
                    fill
                    className={cn(
                      "object-cover transition-all duration-500 group-hover:scale-105",
                      loadedImages.has(index) ? "opacity-100" : "opacity-0"
                    )}
                    onLoad={() => handleImageLoad(index)}
                    priority={index === 0}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="absolute inset-0 flex items-end pb-12">
                    <div className="p-4 sm:p-6 md:p-8 w-full">
                      <div className="max-w-2xl">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                          {banner.businessName}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {banner.linkUrl && (
                    <a
                      href={banner.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 z-10"
                    >
                      <span className="sr-only">
                        View {banner.businessName}
                      </span>
                    </a>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {banners.length > 1 && (
            <>
              <CarouselPrevious className="left-2 sm:left-4 bg-white/90 hover:bg-white border-none shadow-lg" />
              <CarouselNext className="right-2 sm:right-4 bg-white/90 hover:bg-white border-none shadow-lg" />
            </>
          )}
        </Carousel>

        {banners.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2 pointer-events-none">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  carouselApi?.scrollTo(idx);
                }}
                className={cn(
                  "h-2 rounded-full transition-all duration-300 pointer-events-auto",
                  current === idx
                    ? "w-8 bg-primary"
                    : "w-2 bg-white/50 hover:bg-white/80"
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
