import { BannerCarousel } from "@/redux/features/home/components/banner-carousel";
import { BrandSection } from "@/redux/features/home/components/brand-section";
import { ProductSection } from "@/redux/features/home/components/product-section";
import { PromotionSection } from "@/redux/features/home/components/promotion-section";

export default function HomePage() {
  return (
    <>
      {/* Banner Carousel */}
      <BannerCarousel />

      {/* Promotion Section - Top 10 products with promotions */}
      <PromotionSection />

      {/* All Products Section */}
      <ProductSection />

      {/* Brand Section */}
      <BrandSection />
    </>
  );
}
