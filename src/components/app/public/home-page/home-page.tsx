"use client";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { AllCategories } from "@/models/content-manangement/category/category.response";
import { usePagination } from "@/hooks/use-pagination";
import { ROUTES } from "@/constants/app-routed/routes";
import { useDebounce } from "@/utils/debounce/debounce";
import { getUserInfo } from "@/utils/local-storage/userInfo";
import { AppToast } from "@/components/app/components/app-toast";
import { AllProduct } from "@/models/content-manangement/product/product.response";
import { ProductCard } from "@/components/app/public/product/product-card";
import { CategoryCard } from "@/components/app/public/category-card";
import { AllBanner } from "@/models/content-manangement/banner/banner.response";
import { BannerCarousel } from "@/components/app/public/banner/banner-carousel";
import { getAllPublicProductService } from "@/services/public/product/product.service";
import { getPublicAllCategoriesService } from "@/services/dashboard/content-management/category/category.public.service";
import { getAllPublicBannerService } from "@/services/dashboard/content-management/banner/banner.public.service";
import { useRouter } from "next/navigation";

export default function HomePageContent() {
  const [categories, setCategories] = useState<AllCategories | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<AllProduct | null>(null);
  const [banners, setBanners] = useState<AllBanner | null>(null);

  const user = getUserInfo();
  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.HOME,
    defaultPageSize: 10,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const router = useRouter();

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [bannersRes, categoriesRes, productsRes] = await Promise.all([
        getAllPublicBannerService({
          search: debouncedSearchQuery,
          pageNo: currentPage,
          businessId: user?.businessId,
          pageSize: 10,
        }),
        getPublicAllCategoriesService({
          search: debouncedSearchQuery,
          pageNo: currentPage,
          businessId: user?.businessId,
          pageSize: 10,
        }),
        getAllPublicProductService({
          search: debouncedSearchQuery,
          pageNo: currentPage,
          businessId: user?.businessId,
          pageSize: 10,
        }),
      ]);

      console.log("Fetched banners:", bannersRes);
      console.log("Fetched categories:", categoriesRes);
      console.log("Fetched products:", productsRes);

      setBanners(bannersRes);
      setCategories(categoriesRes);
      setProducts(productsRes);
    } catch (error: any) {
      console.log("Failed to load data:", error);
      AppToast?.({
        type: "error",
        message: "Failed to load some data",
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage, user?.businessId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleToProductDetail = (id: string) => {
    router.push(ROUTES.E_COMMERCE.PRODUCT.DETAIL(id));
  };

  const handleViewAllProducts = () => {
    router.push(ROUTES.E_COMMERCE.PRODUCT.VIEW_ALL);
  };

  return (
    <div className="min-h-screen text-primary bg-gray-50">
      <main className="container mx-auto px-4 py-4">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="relative w-full rounded-lg overflow-hidden">
            <BannerCarousel
              banners={banners?.content ?? []}
              autoPlay={true}
              onBannerClick={() => {}}
              autoPlayInterval={7000}
              showIndicators={true}
              showControls={true}
            />
          </div>
        </section>

        <section></section>
        {/* LICK FAMILY Section */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-primary-pink">
            LICK FAMILY
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories?.content.map((category) => (
              <CategoryCard
                category={category}
                key={category.id}
                onCategoryClick={() => {}}
                showProductCount={true}
                size="small"
              />
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Button className="bg-primary px-8 py-3 rounded-full flex items-center gap-2">
              View All <span className="text-xl">&rarr;</span>
            </Button>
          </div>
        </section>

        {/* BEST PRODUCT Section */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-primary-pink">
            BEST PRODUCT
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.content.map((product) => (
              <ProductCard
                product={product}
                key={product.id}
                onProductClick={() => handleToProductDetail(product?.id)}
                onWishlistToggle={() => {}}
              />
            ))}
          </div>
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
