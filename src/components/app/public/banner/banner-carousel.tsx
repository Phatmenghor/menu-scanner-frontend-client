import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { BannerModel } from "@/models/content-manangement/banner/banner.response";

interface BannerCarouselProps {
  banners: BannerModel[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  height?: string;
  onBannerClick?: (banner: BannerModel) => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  height = "h-[300px] md:h-[450px] lg:h-[550px]",
  onBannerClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Filter only active banners
  const activeBanners = banners.filter((banner) => banner.status === "ACTIVE");

  const goToNext = useCallback(() => {
    if (activeBanners.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === activeBanners.length - 1 ? 0 : prevIndex + 1
    );
    setImageLoaded(false);
  }, [activeBanners.length]);

  const goToPrevious = () => {
    if (activeBanners.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? activeBanners.length - 1 : prevIndex - 1
    );
    setImageLoaded(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setImageLoaded(false);
  };

  const handleBannerClick = () => {
    const currentBanner = activeBanners[currentIndex];
    if (currentBanner && onBannerClick) {
      onBannerClick(currentBanner);
    } else if (currentBanner?.linkUrl) {
      // Fallback: open link directly
      window.open(currentBanner.linkUrl, "_blank");
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || activeBanners.length <= 1) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPlaying, goToNext, autoPlayInterval, activeBanners.length]);

  // Reset to first slide when banners change
  useEffect(() => {
    setCurrentIndex(0);
    setImageLoaded(false);
  }, [banners]);

  if (activeBanners.length === 0) {
    return (
      <div
        className={`relative w-full ${height} rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 flex items-center justify-center`}
      >
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">No Banners Available</h2>
          <p className="text-lg opacity-80">
            Check back soon for exciting updates!
          </p>
        </div>
      </div>
    );
  }

  const currentBanner = activeBanners[currentIndex];

  return (
    <div
      className={`relative w-full ${height} rounded-2xl overflow-hidden group`}
    >
      {/* Banner Image */}
      <div
        className="w-full h-full cursor-pointer relative overflow-hidden"
        onClick={handleBannerClick}
      >
        {currentBanner?.imageUrl ? (
          <>
            <img
              src={
                process.env.NEXT_PUBLIC_API_BASE_URL + currentBanner.imageUrl
              }
              alt={`Banner ${currentIndex + 1}`}
              className={`w-full h-full object-cover transition-all duration-700 ${
                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                console.error(
                  "Failed to load banner image:",
                  currentBanner.imageUrl
                );
                e.currentTarget.style.display = "none";
              }}
            />

            {/* Gradient overlay for better readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20"></div>

            {/* Fallback gradient if image fails */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 -z-10"></div>
          </>
        ) : (
          /* Fallback design */
          <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 flex items-center justify-center">
            <div className="text-white text-center">
              <h2 className="text-3xl font-bold mb-2">
                {currentBanner.businessName}
              </h2>
              <p className="text-xl opacity-90">Banner {currentIndex + 1}</p>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {!imageLoaded && currentBanner?.imageUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      {showControls && activeBanners.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="Previous banner"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="Next banner"
          >
            <ChevronRight size={24} />
          </button>

          {/* Play/Pause Button */}
          {autoPlay && (
            <button
              onClick={togglePlayPause}
              className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
          )}
        </>
      )}

      {/* Indicators */}
      {showIndicators && activeBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Business Name Badge */}
      {currentBanner?.businessName && (
        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentBanner.businessName}
        </div>
      )}

      {/* Banner Counter */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
          {currentIndex + 1} / {activeBanners.length}
        </div>
      )}
    </div>
  );
};
