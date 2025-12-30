"use client";

import React, { useEffect, useRef } from "react";

import {
  fetchHomeBanners,
  fetchHomeCategories,
  fetchHomePromotionProducts,
  fetchHomeFeaturedProducts,
  fetchHomeNewArrivals,
  fetchHomeBrands,
} from "@/redux/features/main/store/thunks/home-thunks";

import {
  saveScrollPosition,
  enableScrollRestoration,
  setInitialLoadComplete,
} from "@/redux/features/main/store/slice/home-slice";

import { useHomeState } from "@/redux/features/main/store/state/home-state";

import { BannerSection } from "@/redux/features/main/components/home/banner-section";
import { CategoriesSection } from "@/redux/features/main/components/home/categories-section";
import { PromotionsSection } from "@/redux/features/main/components/home/promotions-section";
import { ProductsSection } from "@/redux/features/main/components/home/products-section";
import { BrandsSection } from "@/redux/features/main/components/home/brand-section";

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    dispatch,
    banners,
    categories,
    promotionProducts,
    featuredProducts,
    newArrivals,
    brands,
    bannersSection,
    categoriesSection,
    promotionProductsSection,
    featuredProductsSection,
    newArrivalsSection,
    brandsSection,
    shouldRestoreScroll,
    scrollPosition,
  } = useHomeState();

  // ========== LOAD DATA ==========
  useEffect(() => {
    const loadData = async () => {
      const promises = [];

      // ✅ Fire all requests immediately
      if (!bannersSection.loaded) {
        promises.push(dispatch(fetchHomeBanners()));
      }

      if (!categoriesSection.loaded) {
        promises.push(dispatch(fetchHomeCategories()));
      }

      if (!promotionProductsSection.loaded) {
        promises.push(dispatch(fetchHomePromotionProducts()));
      }

      if (!featuredProductsSection.loaded) {
        promises.push(dispatch(fetchHomeFeaturedProducts()));
      }

      if (!newArrivalsSection.loaded) {
        promises.push(dispatch(fetchHomeNewArrivals()));
      }

      if (!brandsSection.loaded) {
        promises.push(dispatch(fetchHomeBrands()));
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises);
        dispatch(setInitialLoadComplete());
      }
    };

    loadData();
  }, [
    dispatch,
    bannersSection.loaded,
    categoriesSection.loaded,
    promotionProductsSection.loaded,
    featuredProductsSection.loaded,
    newArrivalsSection.loaded,
    brandsSection.loaded,
  ]);

  // ========== RESTORE SCROLL ==========
  useEffect(() => {
    if (shouldRestoreScroll && containerRef.current) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPosition,
          left: 0,
          behavior: "smooth",
        });
        dispatch(enableScrollRestoration());
      });
    }
  }, [shouldRestoreScroll, scrollPosition, dispatch]);

  // ========== SAVE SCROLL ==========
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (containerRef.current) {
        dispatch(saveScrollPosition(window.scrollY));
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dispatch]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      <div className="py-8 px-4 max-w-7xl mx-auto">
        {/* ✅ Show only if loaded successfully AND has data */}
        {bannersSection.loaded && banners.length > 0 && (
          <BannerSection
            banners={banners}
            loading={bannersSection.loading}
            error={bannersSection.error}
          />
        )}

        {categoriesSection.loaded && categories.length > 0 && (
          <CategoriesSection
            categories={categories}
            loading={categoriesSection.loading}
            error={categoriesSection.error}
            limit={8}
            title="Shop by Category"
          />
        )}

        {promotionProductsSection.loaded && promotionProducts.length > 0 && (
          <PromotionsSection
            products={promotionProducts}
            loading={promotionProductsSection.loading}
            error={promotionProductsSection.error}
            limit={6}
            title="🔥 Hot Deals & Promotions"
          />
        )}

        {featuredProductsSection.loaded && featuredProducts.length > 0 && (
          <ProductsSection
            products={featuredProducts}
            loading={featuredProductsSection.loading}
            error={featuredProductsSection.error}
            limit={8}
            title="Featured Products"
            seeAllLink="/products?status=ACTIVE"
          />
        )}

        {brandsSection.loaded && brands.length > 0 && (
          <BrandsSection
            brands={brands}
            loading={brandsSection.loading}
            error={brandsSection.error}
            limit={12}
            title="Shop by Brand"
          />
        )}

        {newArrivalsSection.loaded && newArrivals.length > 0 && (
          <ProductsSection
            products={newArrivals}
            loading={newArrivalsSection.loading}
            error={newArrivalsSection.error}
            limit={4}
            title="🆕 New Arrivals"
            seeAllLink="/products?status=NEW"
          />
        )}
      </div>
    </div>
  );
}
