"use client";

import React, { useEffect, useCallback } from "react";

import {
  fetchHomeBanners,
  fetchHomeCategories,
  fetchHomePromotionProducts,
  fetchHomeFeaturedProducts,
} from "@/redux/features/main/store/thunks/home-thunks";

import {
  setScrollY,
  setInitialLoadComplete,
} from "@/redux/features/main/store/slice/home-slice";

import { useHomeState } from "@/redux/features/main/store/state/home-state";

import { BannerSection } from "@/redux/features/main/components/home/banner-section";
import { CategoriesSection } from "@/redux/features/main/components/home/categories-section";
import { PromotionsSection } from "@/redux/features/main/components/home/promotions-section";
import { ProductsSection } from "@/redux/features/main/components/home/products-section";
import { Status } from "@/constants/status/status";
import { AppDefault } from "@/constants/app-resource/default/default";

export default function HomePage() {
  const {
    dispatch,
    banners,
    categories,
    promotionProducts,
    featuredProducts,
    bannersSection,
    categoriesSection,
    promotionProductsSection,
    featuredProductsSection,
    featuredPagination,
    scrollY, // Simple!
  } = useHomeState();

  const isInitialFeaturedLoading =
    featuredProductsSection.loading &&
    featuredProducts.length === 0 &&
    !featuredProductsSection.loaded;

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      const promises = [];

      if (!bannersSection.loaded) {
        promises.push(dispatch(fetchHomeBanners({})));
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
    promotionProductsSection.loaded,
    featuredProductsSection.loaded,
  ]);

  // Restore scroll on mount (if coming back)
  useEffect(() => {
    if (scrollY > 0) {
      setTimeout(() => {
        window.scrollTo(0, scrollY);
      }, 0);
    }
  }, []); // Run once on mount

  // Save scroll on scroll (debounced)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        dispatch(setScrollY(window.scrollY));
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [dispatch]);

  // Load more featured products
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

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8 px-4 max-w-7xl mx-auto">
        <BannerSection
          banners={banners}
          loading={bannersSection.loading}
          error={bannersSection.error}
        />

        <CategoriesSection
          categories={categories}
          loading={categoriesSection.loading}
          error={categoriesSection.error}
          title="Shop by Category"
        />

        <PromotionsSection
          products={promotionProducts}
          loading={promotionProductsSection.loading}
          error={promotionProductsSection.error}
          title="Hot Deals & Promotions"
        />

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
