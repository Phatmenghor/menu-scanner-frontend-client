"use client";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { ROUTES } from "@/constants/app-routed/routes";
import { useDebounce } from "@/utils/debounce/debounce";
import { getUserInfo } from "@/utils/local-storage/userInfo";
import { AppToast } from "@/components/shared/toast/app-toast";
import { ProductCard } from "@/components/app/public/product/product-card";
import { CategoryCard } from "@/components/app/public/category/category-card";
import { BannerModel } from "@/models/content-manangement/banner/banner.response";
import { getAllPublicProductService } from "@/services/public/product/product.service";
import { getAllPublicCategoriesService } from "@/services/dashboard/content-management/category/category.public.service";
import { getAllPublicBannerService } from "@/services/dashboard/content-management/banner/banner.public.service";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setAllProducts } from "@/store/features/product-slice";
import { BannerCarousel } from "../banner/banner-carousel";
import { setAllCategories } from "@/store/features/category-slice";
import { AllBrand } from "@/models/content-manangement/brand/brand.response";
import { getAllPublicBrandService } from "@/services/dashboard/content-management/brand/brand.service";
import { BrandCard } from "../brand/brand-card";

export default function HomePageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [banners, setBanners] = useState<BannerModel[] | null>(null);
  const [AllBrands, setAllBrands] = useState<AllBrand | null>(null);

  // Individual loading states for better UX
  const [bannersLoading, setBannersLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [brandLoading, setBrandLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  const user = getUserInfo();

  const { allProducts, isLoadedProducts } = useSelector(
    (state: RootState) => state.products
  );

  const { allCategories, isLoadedCategories } = useSelector(
    (state: RootState) => state.category
  );

  const dispatch = useDispatch();

  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const router = useRouter();

  // Separate API call functions
  const loadBanners = useCallback(async () => {
    setBannersLoading(true);
    try {
      const bannersRes = await getAllPublicBannerService({
        search: debouncedSearchQuery,
        businessId: user?.businessId,
      });

      console.log("Fetched banners:", bannersRes);
      setBanners(bannersRes);

      return bannersRes;
    } catch (error: any) {
      console.log("Failed to load banners:", error);
      AppToast?.({
        type: "error",
        message: "Failed to load banners",
        duration: 3000,
        position: "top-right",
      });
      throw error;
    } finally {
      setBannersLoading(false);
    }
  }, [debouncedSearchQuery, user?.businessId]);

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const categoriesRes = await getAllPublicCategoriesService({
        search: debouncedSearchQuery,
        pageNo: 1,
        businessId: user?.businessId,
        pageSize: 4,
      });

      console.log("Fetched categories:", categoriesRes);
      dispatch(setAllCategories(categoriesRes));

      return categoriesRes;
    } catch (error: any) {
      console.log("Failed to load categories:", error);
      AppToast?.({
        type: "error",
        message: "Failed to load categories",
        duration: 3000,
        position: "top-right",
      });
      throw error;
    } finally {
      setCategoriesLoading(false);
    }
  }, [debouncedSearchQuery, user?.businessId, dispatch]);

  const loadBrands = useCallback(async () => {
    setBrandLoading(true);
    try {
      const brandsRes = await getAllPublicBrandService({
        search: debouncedSearchQuery,
        pageNo: 1,
        businessId: user?.businessId,
        pageSize: 4,
      });

      console.log("Fetched brand:", brandsRes);
      setAllBrands(brandsRes);

      return brandsRes;
    } catch (error: any) {
      console.log("Failed to load brand:", error);
      AppToast?.({
        type: "error",
        message: "Failed to load brand",
        duration: 3000,
        position: "top-right",
      });
      throw error;
    } finally {
      setBrandLoading(false);
    }
  }, [debouncedSearchQuery, user?.businessId]);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const productsRes = await getAllPublicProductService({
        search: debouncedSearchQuery,
        pageNo: 1,
        businessId: user?.businessId,
        pageSize: 10,
      });

      console.log("Fetched products:", productsRes);
      dispatch(setAllProducts(productsRes));

      return productsRes;
    } catch (error: any) {
      console.log("Failed to load products:", error);
      AppToast?.({
        type: "error",
        message: "Failed to load products",
        duration: 3000,
        position: "top-right",
      });
      throw error;
    } finally {
      setProductsLoading(false);
    }
  }, [debouncedSearchQuery, user?.businessId, dispatch]);

  // Load data in sequence (one after another)
  const loadDataSequentially = useCallback(async () => {
    setIsLoading(true);

    try {
      // Load banners first
      await loadBanners();

      // Then load categories
      await loadCategories();

      // Then load brands
      await loadBrands();

      // Finally load products
      await loadProducts();
    } catch (error: any) {
      console.log("Failed to load data:", error);
      // Individual error handling is already done in each function
    } finally {
      setIsLoading(false);
    }
  }, [loadBanners, loadCategories, loadProducts, loadBrands]);

  useEffect(() => {
    if (!isLoadedProducts || !isLoadedCategories) {
      loadDataSequentially(); // or loadDataInParallel()
    }
  }, [loadDataSequentially, isLoadedProducts, isLoadedCategories]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleToProductDetail = (id: string) => {
    router.push(ROUTES.E_COMMERCE.PRODUCT.DETAIL(id));
  };

  const handleViewAllProducts = () => {
    router.push(ROUTES.E_COMMERCE.PRODUCT.VIEW_ALL);
  };

  const handleViewAllCategory = () => {
    router.push(ROUTES.E_COMMERCE.CATEGORY.VIEW_ALL);
  };

  const handleToListOfProductInCategory = (id: string) => {
    router.push(ROUTES.E_COMMERCE.CATEGORY.CATEGORY_PRODUCTS(id));
  };

  return (
    <div className="min-h-screen text-primary bg-gray-50">
      <main className="container mx-auto px-4 py-4">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="relative w-full rounded-lg overflow-hidden">
            {bannersLoading ? (
              <div className="h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Loading banners...</span>
              </div>
            ) : (
              <BannerCarousel
                banners={banners ?? []}
                autoPlay={true}
                onBannerClick={() => {}}
                autoPlayInterval={7000}
                showIndicators={true}
                showControls={true}
              />
            )}
          </div>
        </section>

        {/* LICK FAMILY Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-primary-pink">
              CATEGORY
            </h2>
            {categoriesLoading && (
              <span className="text-sm text-gray-500">Loading...</span>
            )}
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCategories?.content?.map((category) => (
                <CategoryCard
                  category={category}
                  key={category.id}
                  onCategoryClick={handleToListOfProductInCategory}
                  size="small"
                />
              ))}
            </div>
          )}

          <div className="flex justify-center mt-8">
            <Button
              onClick={handleViewAllCategory}
              className="bg-primary px-8 py-3 rounded-full flex items-center gap-2"
            >
              View All <span className="text-xl">&rarr;</span>
            </Button>
          </div>
        </section>

        {/* LICK FAMILY Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-primary-pink">
              BRAND
            </h2>
            {brandLoading && (
              <span className="text-sm text-gray-500">Loading...</span>
            )}
          </div>

          {brandLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {AllBrands?.content.map((brand) => (
                <BrandCard
                  brand={brand}
                  onBrandClick={handleToListOfProductInCategory}
                  showBrandCount={true}
                  size="small"
                />
              ))}
            </div>
          )}

          <div className="flex justify-center mt-8">
            <Button
              onClick={handleViewAllCategory}
              className="bg-primary px-8 py-3 rounded-full flex items-center gap-2"
            >
              View All <span className="text-xl">&rarr;</span>
            </Button>
          </div>
        </section>

        {/* BEST PRODUCT Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-primary-pink">
              BEST PRODUCT
            </h2>
            {productsLoading && (
              <span className="text-sm text-gray-500">Loading...</span>
            )}
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {allProducts?.content.map((product) => (
                <ProductCard
                  product={product}
                  key={product.id}
                  onProductClick={() => handleToProductDetail(product?.id)}
                  onWishlistToggle={() => {}}
                />
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-center mt-8">
          <Button
            className="bg-primary px-8 py-3 rounded-full flex items-center gap-2"
            onClick={handleViewAllProducts}
          >
            View All <span className="text-xl">&rarr;</span>
          </Button>
        </div>
      </main>

      {/* Floating Chat Button */}
      <Button className="fixed bottom-6 right-6 bg-primary-pink hover:bg-primary-pink/90 rounded-full p-4 shadow-lg flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        Chat?
      </Button>
    </div>
  );
}
