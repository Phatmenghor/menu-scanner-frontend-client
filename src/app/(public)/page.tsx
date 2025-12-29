"use client";

import React, { useEffect, useRef } from "react";
import { useAppDispatch } from "@/redux/store";

// Import thunks
import { fetchAllBannerService } from "@/redux/features/master-data/store/thunks/banner-thunks";
import { fetchAllCategoriesService } from "@/redux/features/master-data/store/thunks/categories-thunks";
import { fetchAllProductService } from "@/redux/features/business/store/thunks/product-thunks";
import { fetchAllBrandService } from "@/redux/features/master-data/store/thunks/brand-thunks";

// Import actions
import {
  saveScrollPosition,
  enableScrollRestoration,
  setInitialLoadComplete,
} from "@/redux/features/main/store/slice/home-slice";

// Import UI components
import { BannerSection } from "@/redux/features/main/components/home/banner-section";
import { CategoriesSection } from "@/redux/features/main/components/home/categories-section";
import { PromotionsSection } from "@/redux/features/main/components/home/promotions-section";
import { ProductsSection } from "@/redux/features/main/components/home/products-section";
import { BrandsSection } from "@/redux/features/main/components/home/brand-section";
import { useHomeState } from "@/redux/features/main/store/state/home-state";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);

  // ========== GET ALL STATE FROM STORE ==========
  const {
    // Data
    banners,
    categories,
    products,
    brands,

    // Loading states
    bannersLoading,
    categoriesLoading,
    productsLoading,
    brandsLoading,

    // Loaded flags (CRITICAL)
    bannersLoaded,
    categoriesLoaded,
    productsLoaded,
    brandsLoaded,

    // Errors
    bannersError,
    categoriesError,
    productsError,
    brandsError,

    // Scroll tracking
    shouldRestoreScroll,
    scrollPosition,
  } = useHomeState();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Create array of promises only for data that needs loading
        const promises = [];

        if (!bannersLoaded) {
          promises.push(
            dispatch(fetchAllBannerService({ pageSize: 10 })).unwrap()
          );
        }

        if (!categoriesLoaded) {
          promises.push(
            dispatch(fetchAllCategoriesService({ pageSize: 20 })).unwrap()
          );
        }

        if (!productsLoaded) {
          promises.push(
            dispatch(fetchAllProductService({ pageSize: 50 })).unwrap()
          );
        }

        if (!brandsLoaded) {
          promises.push(
            dispatch(fetchAllBrandService({ pageSize: 20 })).unwrap()
          );
        }

        // Wait for all requests (successfully or with error)
        if (promises.length > 0) {
          await Promise.allSettled(promises);
        }
      } catch (error) {
        console.error("Error loading home page data:", error);
      } finally {
        dispatch(setInitialLoadComplete());
      }
    };

    loadData();
  }, []); // Empty dependency array - run only on mount

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
        {/* 1. BANNER SECTION */}
        {/* Displays carousel of promotional banners */}
        <BannerSection
          banners={banners}
          loading={bannersLoading}
          error={bannersError}
        />

        {/* 2. CATEGORIES SECTION */}
        {/* Shows product categories for easy navigation */}
        <CategoriesSection
          categories={categories}
          loading={categoriesLoading}
          error={categoriesError}
          limit={8}
          title="Shop by Category"
        />

        {/* 3. HOT DEALS & PROMOTIONS SECTION */}
        {/* Highlights products with active promotions */}
        <PromotionsSection
          products={products}
          loading={productsLoading}
          error={productsError}
          limit={6}
          title="🔥 Hot Deals & Promotions"
        />

        {/* 4. FEATURED PRODUCTS SECTION */}
        {/* Displays selected featured products */}
        <ProductsSection
          products={products}
          loading={productsLoading}
          error={productsError}
          limit={8}
          title="Featured Products"
          seeAllLink="/products"
        />

        {/* 5. BRANDS SECTION */}
        {/* Shows brands for filtering products */}
        <BrandsSection
          brands={brands}
          loading={brandsLoading}
          error={brandsError}
          limit={12}
          title="Shop by Brand"
        />

        {/* 6. NEW ARRIVALS SECTION */}
        {/* Displays recently added products */}
        <ProductsSection
          products={products}
          loading={productsLoading}
          error={productsError}
          limit={4}
          title="New Arrivals"
          seeAllLink="/products?sort=newest"
        />

        {/* LOADING INDICATOR */}
        {/* Shows only when data is actively loading on first visit */}
        {(bannersLoading ||
          categoriesLoading ||
          productsLoading ||
          brandsLoading) && (
          <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg text-sm flex items-center gap-2 z-50">
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            Loading content...
          </div>
        )}
      </div>
    </div>
  );
}
