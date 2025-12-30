/**
 * home-slice.ts
 * Simplified - only track loading, loaded, error
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BannerResponseModel } from "@/redux/features/master-data/store/models/response/banner-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";

import {
  fetchHomeBanners,
  fetchHomeCategories,
  fetchHomePromotionProducts,
  fetchHomeFeaturedProducts,
  fetchHomeNewArrivals,
  fetchHomeBrands,
} from "../thunks/home-thunks";

interface ScrollState {
  position: number;
  savedAt: number;
}

interface SectionState {
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

interface HomePageState {
  // ========== CACHED DATA ==========
  banners: BannerResponseModel[];
  categories: CategoriesResponseModel[];
  promotionProducts: ProductDetailResponseModel[];
  featuredProducts: ProductDetailResponseModel[];
  newArrivals: ProductDetailResponseModel[];
  brands: BrandResponseModel[];

  // ========== SECTION STATES ==========
  sections: {
    banners: SectionState;
    categories: SectionState;
    promotionProducts: SectionState;
    featuredProducts: SectionState;
    newArrivals: SectionState;
    brands: SectionState;
  };

  // ========== PAGE STATE ==========
  initialLoadComplete: boolean;
  lastFetchTimestamp: number | null;

  // ========== SCROLL TRACKING ==========
  scrollState: ScrollState;
  shouldRestoreScroll: boolean;
  lastDetailPage: string | null;
}

const initialSectionState: SectionState = {
  loading: false,
  loaded: false,
  error: null,
};

const initialState: HomePageState = {
  banners: [],
  categories: [],
  promotionProducts: [],
  featuredProducts: [],
  newArrivals: [],
  brands: [],
  sections: {
    banners: { ...initialSectionState },
    categories: { ...initialSectionState },
    promotionProducts: { ...initialSectionState },
    featuredProducts: { ...initialSectionState },
    newArrivals: { ...initialSectionState },
    brands: { ...initialSectionState },
  },
  initialLoadComplete: false,
  lastFetchTimestamp: null,
  scrollState: { position: 0, savedAt: 0 },
  shouldRestoreScroll: false,
  lastDetailPage: null,
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    saveScrollPosition: (state, action: PayloadAction<number>) => {
      state.scrollState = {
        position: action.payload,
        savedAt: Date.now(),
      };
    },

    enableScrollRestoration: (state) => {
      state.shouldRestoreScroll = true;
    },

    disableScrollRestoration: (state) => {
      state.shouldRestoreScroll = false;
    },

    setLastDetailPage: (state, action: PayloadAction<string | null>) => {
      state.lastDetailPage = action.payload;
    },

    setInitialLoadComplete: (state) => {
      state.initialLoadComplete = true;
      state.lastFetchTimestamp = Date.now();
    },

    forceRefresh: (state) => {
      state.banners = [];
      state.categories = [];
      state.promotionProducts = [];
      state.featuredProducts = [];
      state.newArrivals = [];
      state.brands = [];
      state.sections = {
        banners: { ...initialSectionState },
        categories: { ...initialSectionState },
        promotionProducts: { ...initialSectionState },
        featuredProducts: { ...initialSectionState },
        newArrivals: { ...initialSectionState },
        brands: { ...initialSectionState },
      };
      state.initialLoadComplete = false;
      state.lastFetchTimestamp = null;
    },

    resetHomeState: () => initialState,
  },

  extraReducers: (builder) => {
    // ==================== BANNERS ====================
    builder
      .addCase(fetchHomeBanners.pending, (state) => {
        state.sections.banners.loading = true;
        state.sections.banners.error = null;
      })
      .addCase(fetchHomeBanners.fulfilled, (state, action) => {
        state.banners = action.payload.content || [];
        state.sections.banners.loading = false;
        state.sections.banners.loaded = true;
        state.sections.banners.error = null;
      })
      .addCase(fetchHomeBanners.rejected, (state, action) => {
        state.sections.banners.loading = false;
        state.sections.banners.loaded = false;
        state.sections.banners.error = action.payload as string;
      });

    // ==================== CATEGORIES ====================
    builder
      .addCase(fetchHomeCategories.pending, (state) => {
        state.sections.categories.loading = true;
        state.sections.categories.error = null;
      })
      .addCase(fetchHomeCategories.fulfilled, (state, action) => {
        state.categories = action.payload.content || [];
        state.sections.categories.loading = false;
        state.sections.categories.loaded = true;
        state.sections.categories.error = null;
      })
      .addCase(fetchHomeCategories.rejected, (state, action) => {
        state.sections.categories.loading = false;
        state.sections.categories.loaded = false;
        state.sections.categories.error = action.payload as string;
      });

    // ==================== PROMOTION PRODUCTS ====================
    builder
      .addCase(fetchHomePromotionProducts.pending, (state) => {
        state.sections.promotionProducts.loading = true;
        state.sections.promotionProducts.error = null;
      })
      .addCase(fetchHomePromotionProducts.fulfilled, (state, action) => {
        state.promotionProducts = action.payload.content || [];
        state.sections.promotionProducts.loading = false;
        state.sections.promotionProducts.loaded = true;
        state.sections.promotionProducts.error = null;
      })
      .addCase(fetchHomePromotionProducts.rejected, (state, action) => {
        state.sections.promotionProducts.loading = false;
        state.sections.promotionProducts.loaded = false;
        state.sections.promotionProducts.error = action.payload as string;
      });

    // ==================== FEATURED PRODUCTS ====================
    builder
      .addCase(fetchHomeFeaturedProducts.pending, (state) => {
        state.sections.featuredProducts.loading = true;
        state.sections.featuredProducts.error = null;
      })
      .addCase(fetchHomeFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload.content || [];
        state.sections.featuredProducts.loading = false;
        state.sections.featuredProducts.loaded = true;
        state.sections.featuredProducts.error = null;
      })
      .addCase(fetchHomeFeaturedProducts.rejected, (state, action) => {
        state.sections.featuredProducts.loading = false;
        state.sections.featuredProducts.loaded = false;
        state.sections.featuredProducts.error = action.payload as string;
      });

    // ==================== NEW ARRIVALS ====================
    builder
      .addCase(fetchHomeNewArrivals.pending, (state) => {
        state.sections.newArrivals.loading = true;
        state.sections.newArrivals.error = null;
      })
      .addCase(fetchHomeNewArrivals.fulfilled, (state, action) => {
        state.newArrivals = action.payload.content || [];
        state.sections.newArrivals.loading = false;
        state.sections.newArrivals.loaded = true;
        state.sections.newArrivals.error = null;
      })
      .addCase(fetchHomeNewArrivals.rejected, (state, action) => {
        state.sections.newArrivals.loading = false;
        state.sections.newArrivals.loaded = false;
        state.sections.newArrivals.error = action.payload as string;
      });

    // ==================== BRANDS ====================
    builder
      .addCase(fetchHomeBrands.pending, (state) => {
        state.sections.brands.loading = true;
        state.sections.brands.error = null;
      })
      .addCase(fetchHomeBrands.fulfilled, (state, action) => {
        state.brands = action.payload.content || [];
        state.sections.brands.loading = false;
        state.sections.brands.loaded = true;
        state.sections.brands.error = null;
      })
      .addCase(fetchHomeBrands.rejected, (state, action) => {
        state.sections.brands.loading = false;
        state.sections.brands.loaded = false;
        state.sections.brands.error = action.payload as string;
      });
  },
});

export const {
  saveScrollPosition,
  enableScrollRestoration,
  disableScrollRestoration,
  setLastDetailPage,
  setInitialLoadComplete,
  forceRefresh,
  resetHomeState,
} = homeSlice.actions;

export default homeSlice.reducer;
