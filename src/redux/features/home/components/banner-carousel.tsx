"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock banner data - replace with actual data from your API
const banners = [
  {
    id: "1",
    imageUrl: "https://placehold.co/1920x600/4472C4/white?text=Banner+1",
    title: "Summer Sale",
    subtitle: "Up to 50% off on selected items",
    link: "/promotions/summer-sale",
  },
  {
    id: "2",
    imageUrl: "https://placehold.co/1920x600/E91E63/white?text=Banner+2",
    title: "New Arrivals",
    subtitle: "Check out our latest collection",
    link: "/new-arrivals",
  },
  {
    id: "3",
    imageUrl: "https://placehold.co/1920x600/4CAF50/white?text=Banner+3",
    title: "Free Shipping",
    subtitle: "On orders over $50",
    link: "/products",
  },
  {
    id: "4",
    imageUrl: "https://placehold.co/1920x600/FF9800/white?text=Banner+4",
    title: "Best Sellers",
    subtitle: "Shop our most popular products",
    link: "/best-sellers",
  },
];

export function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-scroll functionality
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(nextSlide, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <section className="relative w-full bg-muted/30">
      <div className="container mx-auto px-0">
        {/* Reduced height to 50% of original */}
        <div className="relative h-[225px] md:h-[250px] lg:h-[300px] overflow-hidden rounded-none md:rounded-lg">
          {/* Slides */}
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={cn(
                "absolute inset-0 transition-all duration-700 ease-in-out",
                index === currentIndex
                  ? "opacity-100 translate-x-0"
                  : index < currentIndex
                  ? "opacity-0 -translate-x-full"
                  : "opacity-0 translate-x-full"
              )}
            >
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                className="object-cover"
                priority={index === 0}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4 md:px-8">
                  <div className="max-w-2xl space-y-2">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white animate-fade-in">
                      {banner.title}
                    </h2>
                    <p className="text-sm md:text-base text-white/90 animate-fade-in-delay">
                      {banner.subtitle}
                    </p>
                    <Button
                      size="sm"
                      className="mt-2 animate-fade-in-delay-2"
                      onClick={() => (window.location.href = banner.link)}
                    >
                      Shop Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <div className="absolute inset-0 flex items-center justify-between p-2 md:p-4">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white border-none shadow-lg"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white border-none shadow-lg"
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
