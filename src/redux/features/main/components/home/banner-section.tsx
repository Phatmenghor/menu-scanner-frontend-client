import React from "react";
import { useAppSelector } from "@/redux/store";
import { BannerSkeleton } from "@/components/shared/skeletons/banner-skeleton";

interface BannerSectionProps {
  loading: boolean;
  error: string | null;
}

export const BannerSection = ({ loading, error }: BannerSectionProps) => {
  const banners = useAppSelector(selectBanner);
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  if (loading) {
    return <BannerSkeleton />;
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
                <img
                  src={banner.imageUrl || banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-8 text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">
                      {banner.title}
                    </h2>
                    {banner.description && (
                      <p className="text-lg text-white/90">
                        {banner.description}
                      </p>
                    )}
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
