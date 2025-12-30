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

  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 4000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    })
  );

  React.useEffect(() => {
    if (!carouselApi) return;

    setCurrent(carouselApi.selectedScrollSnap());

    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

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
      <div className="relative">
        <Carousel
          setApi={setCarouselApi}
          plugins={[autoplayPlugin.current]}
          className="w-full"
          opts={{
            loop: true,
            align: "start",
          }}
        >
          <CarouselContent>
            {banners.map((banner, index) => (
              <CarouselItem key={banner.id}>
                <div className="relative w-full h-[200px] sm:h-[280px] md:h-[320px] lg:h-[360px] rounded-2xl overflow-hidden group">
                  {/* Image */}
                  <Image
                    src={
                      banner.imageUrl ||
                      `https://picsum.photos/1200/400?random=${index}`
                    }
                    alt={banner.businessName || "Banner"}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority={index === 0}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 flex items-end">
                    <div className="p-4 sm:p-6 md:p-8 w-full">
                      <div className="max-w-2xl">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                          {banner.businessName}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* Link Overlay */}
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

                  {/* Dots Indicator - Inside Image at Bottom */}
                  {banners.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                      {banners.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.preventDefault();
                            carouselApi?.scrollTo(idx);
                          }}
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
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
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <CarouselPrevious className="left-2 sm:left-4 bg-white/90 hover:bg-white border-none shadow-lg" />
              <CarouselNext className="right-2 sm:right-4 bg-white/90 hover:bg-white border-none shadow-lg" />
            </>
          )}
        </Carousel>
      </div>
    </div>
  );
};
