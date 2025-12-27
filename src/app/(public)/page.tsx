"use client";

import React, { useEffect } from "react";
import { fetchAllBannerService } from "@/redux/features/master-data/store/thunks/banner-thunks";
import { fetchAllProductService } from "@/redux/features/business/store/thunks/product-thunks";
import { fetchAllBrandService } from "@/redux/features/master-data/store/thunks/brand-thunks";
import { useAppSelector } from "@/redux/store";
import { selecBannerContent } from "@/redux/features/master-data/store/selectors/banner-selector";
import { selectCategoriesContent } from "@/redux/features/master-data/store/selectors/categories-selector";
import { selectProductContent } from "@/redux/features/business/store/selectors/product-selector";
import { selectBrandContent } from "@/redux/features/master-data/store/selectors/brand-selector";
import { useHomeState } from "@/redux/features/main/store/state/home-state";
import { fetchAllCategoriesService } from "@/redux/features/master-data/store/thunks/categories-thunks";
import { setInitialLoadComplete } from "@/redux/features/main/store/slice/home-slice";
import { BannerSection } from "@/redux/features/main/components/home/banner-section";
import { CategoriesSection } from "@/redux/features/main/components/home/categories-section";
import { PromotionsSection } from "@/redux/features/main/components/home/promotions-section";
import { ProductsSection } from "@/redux/features/main/components/home/products-section";
import { BrandsSection } from "@/redux/features/main/components/home/brand-section";

export default function HomePage() {
  const {
    dispatch,
    bannersLoading,
    productsLoading,
    brandsLoading,
    bannersError,
    productsError,
    brandsError,
    allLoaded,
  } = useHomeState();

  // Get data from selectors
  const banners = useAppSelector(selecBannerContent);
  const categories = useAppSelector(selectCategoriesContent);
  const products = useAppSelector(selectProductContent);
  const brands = useAppSelector(selectBrandContent);

  // Categories loading state
  const categoriesLoading = useAppSelector(
    (state) => state.categories.isLoading
  );
  const categoriesError = useAppSelector((state) => state.categories.error);

  // Progressive loading: Fetch all data simultaneously
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.allSettled([
          dispatch(fetchAllBannerService({ pageSize: 10 })).unwrap(),
          dispatch(fetchAllCategoriesService({ pageSize: 20 })).unwrap(),
          dispatch(fetchAllProductService({ pageSize: 50 })).unwrap(),
          dispatch(fetchAllBrandService({ pageSize: 20 })).unwrap(),
        ]);
      } catch (error) {
        console.error("Error loading home page data:", error);
      } finally {
        dispatch(setInitialLoadComplete());
      }
    };

    if (!allLoaded) {
      loadData();
    }
  }, [dispatch, allLoaded]);

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      {/* 1. Banner Section */}
      <BannerSection
        banners={banners}
        loading={bannersLoading}
        error={bannersError}
      />

      {/* 2. Categories Section */}
      <CategoriesSection
        categories={categories}
        loading={categoriesLoading}
        error={categoriesError}
        limit={8}
        title="Shop by Category"
      />

      {/* 3. Promotions Section */}
      <PromotionsSection
        products={products}
        loading={productsLoading}
        error={productsError}
        limit={6}
        title="🔥 Hot Deals & Promotions"
      />

      {/* 4. Featured Products */}
      <ProductsSection
        products={products}
        loading={productsLoading}
        error={productsError}
        limit={8}
        title="Featured Products"
        seeAllLink="/products"
      />

      {/* 5. Brands Section */}
      <BrandsSection
        brands={brands}
        loading={brandsLoading}
        error={brandsError}
        limit={12}
        title="Shop by Brand"
      />

      {/* 6. New Arrivals */}
      <ProductsSection
        products={products}
        loading={productsLoading}
        error={productsError}
        limit={4}
        title="New Arrivals"
        seeAllLink="/products?sort=newest"
      />

      {/* Loading indicator */}
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
  );
}
