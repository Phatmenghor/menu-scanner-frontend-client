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
          dispatch(fetchHomeFeaturedProducts({ pageNo: 1, pageSize: 15 })),
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Banner Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4">
          <BannerSection
            banners={banners}
            loading={bannersSection.loading}
            error={bannersSection.error}
          />
        </div>
      </div>

      {/* Categories Section - With Background */}
      <div className="relative py-12 bg-gradient-to-br from-background via-muted/10 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <CategoriesSection
            categories={categories}
            loading={categoriesSection.loading}
            error={categoriesSection.error}
            title="Shop by Category"
          />
        </div>
      </div>

      {/* Promotions Section - Highlighted Background */}
      <div className="relative py-12 bg-gradient-to-r from-amber-50/50 via-orange-50/30 to-amber-50/50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-amber-950/20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <PromotionsSection
            products={featuredProducts}
            loading={featuredProductsSection.loading}
            error={featuredProductsSection.error}
            title="Hot Deals & Promotions"
          />
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="relative py-12">
        <div className="max-w-7xl mx-auto px-4">
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
    </div>
  );
}
