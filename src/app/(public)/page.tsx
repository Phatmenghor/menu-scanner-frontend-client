"use client";

import React, { useEffect, useCallback } from "react";

import {
  fetchHomeBanners,
  fetchHomeCategories,
  fetchHomePromotionProducts,
  fetchHomeFeaturedProducts,
} from "@/redux/features/main/store/thunks/home-thunks";

import { setInitialLoadComplete } from "@/redux/features/main/store/slice/home-slice";

import { useHomeState } from "@/redux/features/main/store/state/home-state";

import { BannerSection } from "@/redux/features/main/components/home/banner-section";
import { CategoriesSection } from "@/redux/features/main/components/home/categories-section";
import { PromotionsSection } from "@/redux/features/main/components/home/promotions-section";
import { ProductsSection } from "@/redux/features/main/components/home/products-section";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";

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
  } = useHomeState();

  // Scroll restoration
  useScrollRestoration({
    enabled: true,
    restoreOnMount: true,
    customKey: "home",
  });

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
          products={featuredProducts}
          loading={featuredProductsSection.loading}
          error={featuredProductsSection.error}
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
