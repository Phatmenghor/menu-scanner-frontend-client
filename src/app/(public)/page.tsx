import React, { useEffect } from "react";
import { useHomeState } from "@/redux/features/home/store/state/home-state";
import { fetchAllBannerService } from "@/redux/features/master-data/store/thunks/banner-thunks";
import { fetchAllProductService } from "@/redux/features/business/store/thunks/product-thunks";
import { fetchAllBrandService } from "@/redux/features/master-data/store/thunks/brand-thunks";
import { setInitialLoadComplete } from "@/redux/features/home/store/slice/home-slice";
import { BannerSection } from "@/components/home/BannerSection";
import { ProductsSection } from "@/components/home/ProductsSection";
import { PromotionsSection } from "@/components/home/PromotionsSection";
import { BrandsSection } from "@/components/home/BrandsSection";

export const HomePage = () => {
  const {
    dispatch,
    bannersLoading,
    productsLoading,
    brandsLoading,
    bannersError,
    productsError,
    brandsError,
    bannersLoaded,
    productsLoaded,
    brandsLoaded,
    allLoaded,
  } = useHomeState();

  // Progressive loading: Fetch all data simultaneously but render as each completes
  useEffect(() => {
    // Dispatch all fetch operations at once for fastest loading
    const loadData = async () => {
      try {
        await Promise.allSettled([
          dispatch(fetchAllBannerService()).unwrap(),
          dispatch(fetchAllProductService()).unwrap(),
          dispatch(fetchAllBrandService()).unwrap(),
        ]);
      } catch (error) {
        console.error("Error loading home page data:", error);
      } finally {
        dispatch(setInitialLoadComplete());
      }
    };

    // Only load if we haven't loaded everything yet
    if (!allLoaded) {
      loadData();
    }
  }, [dispatch, allLoaded]);

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      {/* Banner Section - Shows first when loaded */}
      <BannerSection loading={bannersLoading} error={bannersError} />

      {/* Special Deals & Promotions Section */}
      <PromotionsSection
        loading={productsLoading}
        error={productsError}
        limit={6}
        title="🔥 Hot Deals & Promotions"
      />

      {/* Featured Products Section */}
      <ProductsSection
        loading={productsLoading}
        error={productsError}
        limit={8}
        title="Featured Products"
      />

      {/* Brands Section */}
      <BrandsSection
        loading={brandsLoading}
        error={brandsError}
        limit={12}
        title="Shop by Brand"
      />

      {/* New Arrivals Section */}
      <ProductsSection
        loading={productsLoading}
        error={productsError}
        limit={4}
        title="New Arrivals"
      />

      {/* Loading indicator for the entire page */}
      {(bannersLoading || productsLoading || brandsLoading) && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg text-sm flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          Loading content...
        </div>
      )}
    </div>
  );
};

export default HomePage;
