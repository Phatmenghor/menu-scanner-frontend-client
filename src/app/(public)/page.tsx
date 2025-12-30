"use client";

import React, { useEffect, useRef, useCallback } from "react";

import {
  fetchHomeBanners,
  fetchHomeCategories,
  fetchHomePromotionProducts,
  fetchHomeFeaturedProducts,
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
    brands,
    bannersSection,
    categoriesSection,
    promotionProductsSection,
    featuredProductsSection,
    brandsSection,
    featuredPagination,
    shouldRestoreScroll,
    scrollPosition,
  } = useHomeState();

  // Determine if this is initial loading (no products yet + loading)
  const isInitialFeaturedLoading =
    featuredProductsSection.loading &&
    featuredProducts.length === 0 &&
    !featuredProductsSection.loaded;

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      const promises = [];

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
        promises.push(
          dispatch(fetchHomeFeaturedProducts({ pageNo: 1, pageSize: 15 }))
        );
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
    brandsSection.loaded,
    promotionProductsSection.loaded,
    featuredProductsSection.loaded,
  ]);

  // Load more featured products (pagination)
  const handleLoadMoreFeatured = useCallback(() => {
    if (featuredPagination.hasMore && !featuredProductsSection.loading) {
      const nextPage = featuredPagination.currentPage + 1;
      dispatch(fetchHomeFeaturedProducts({ pageNo: nextPage, pageSize: 30 }));
    }
  }, [
    dispatch,
    featuredPagination.hasMore,
    featuredPagination.currentPage,
    featuredProductsSection.loading,
  ]);

  // Restore scroll
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

  // Save scroll
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
        {/* 1. Banner Section */}
        <BannerSection
          banners={banners}
          loading={bannersSection.loading}
          error={bannersSection.error}
        />

        {/* 2. Categories Section */}
        <CategoriesSection
          categories={categories}
          loading={categoriesSection.loading}
          error={categoriesSection.error}
          title="Shop by Category"
        />

        {/* 3. Promotions Section */}
        <PromotionsSection
          products={promotionProducts}
          loading={promotionProductsSection.loading}
          error={promotionProductsSection.error}
          title="Hot Deals & Promotions"
        />

        {/* 4. Featured Products - Infinite Scroll with Pagination Skeletons */}
        <ProductsSection
          products={featuredProducts}
          loading={featuredProductsSection.loading}
          error={featuredProductsSection.error}
          title="Featured Products"
          subtitle="Handpicked products just for you"
          hasMore={featuredPagination.hasMore}
          onLoadMore={handleLoadMoreFeatured}
          isInitialLoading={isInitialFeaturedLoading}
        />
      </div>
    </div>
  );
}
