// Fixed All Products Page
"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Grid3X3, List, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/app/public/product/product-card";
import { getAllPublicProductService } from "@/services/public/product/product.service";
import { useDebounce } from "@/utils/debounce/debounce";
import { getUserInfo } from "@/utils/local-storage/userInfo";
import { AppToast } from "@/components/shared/toast/app-toast";
import { ROUTES } from "@/constants/app-routed/routes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLoadMorePagination } from "@/hooks/use-loadMore-pagination";
import { LoadMorePagination } from "@/components/ui/load-more-pagination";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { appendProducts, setAllProducts } from "@/store/features/product-slice";

export default function AllProductsInCategoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");

  // Store pagination info separately
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const user = getUserInfo();

  const params = useParams();
  const categoryId = params.categoryId as string;

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Get products from Redux store
  const { allProducts, isLoadedProducts } = useSelector(
    (store: RootState) => store.products
  );
  const dispatch = useDispatch();

  const { pageSize, isLoadingMore, handleLoadMore, resetPagination } =
    useLoadMorePagination(12, 12);

  // Initialize search from URL params
  useEffect(() => {
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "newest";
    setSearchQuery(search);
    setSortBy(sort);
  }, [searchParams]);

  const loadProducts = useCallback(
    async (append: boolean = false) => {
      if (!append) {
        setIsLoading(true);
      }

      try {
        const pageToLoad = append ? currentPage + 1 : 1;

        const productsRes = await getAllPublicProductService({
          search: debouncedSearchQuery,
          pageNo: pageToLoad,
          categoryId: categoryId,
          businessId: user?.businessId,
          pageSize: 12,
        });

        console.log("API Response:", productsRes);
        console.log("Products content:", productsRes?.content);

        if (append) {
          // When loading more, APPEND new products to existing ones
          if (productsRes?.content) {
            dispatch(appendProducts(productsRes.content));
            setCurrentPage(pageToLoad);
          }
        } else {
          // Initial load or search - REPLACE products
          if (productsRes) {
            dispatch(setAllProducts(productsRes)); // Pass the entire response object
            setTotalElements(productsRes.totalElements || 0);
            setTotalPages(productsRes.totalPages || 0);
            setCurrentPage(1);
          }
        }
      } catch (error: any) {
        console.log("Failed to load products:", error);
        AppToast?.({
          type: "error",
          message: "Failed to load products",
          duration: 3000,
          position: "top-right",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearchQuery, user?.businessId, currentPage, dispatch]
  );

  // Load initial products when search/sort changes
  useEffect(() => {
    if (!isLoadedProducts || debouncedSearchQuery !== searchQuery) {
      resetPagination();
      setCurrentPage(1);
      loadProducts(false);
    }
  }, [debouncedSearchQuery, sortBy]);

  // Initial load
  useEffect(() => {
    if (!isLoadedProducts) {
      loadProducts(false);
    }
  }, []);

  const onLoadMore = useCallback(async () => {
    await handleLoadMore(async () => {
      await loadProducts(true); // Load next page and append
    });
  }, [handleLoadMore, loadProducts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Update URL with search parameter
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`${ROUTES.E_COMMERCE.PRODUCT.VIEW_ALL}?${params.toString()}`);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);

    // Update URL with sort parameter
    const params = new URLSearchParams(searchParams);
    params.set("sort", newSort);
    router.push(`${ROUTES.E_COMMERCE.PRODUCT.VIEW_ALL}?${params.toString()}`);
  };

  const handleToProductDetail = (id: string) => {
    router.push(ROUTES.E_COMMERCE.PRODUCT.DETAIL(id));
  };

  const handleBackToHome = () => {
    router.back();
  };

  // Get the actual products array from the Redux store
  const productsToDisplay = allProducts?.content || [];
  const displayTotalElements = totalElements || allProducts?.totalElements || 0;

  // Check if there are more products to load
  const hasMore = productsToDisplay.length < displayTotalElements;

  console.log("Redux allProducts:", allProducts);
  console.log("Products to display:", productsToDisplay);
  console.log("Display total:", displayTotalElements);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <Select
                value={sortBy}
                onValueChange={(value) => handleSortChange(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="px-3 py-1"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="px-3 py-1"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {displayTotalElements > 0 ? (
              <>
                Showing {productsToDisplay.length} of {displayTotalElements}{" "}
                products
              </>
            ) : isLoading ? (
              ""
            ) : (
              "No products found"
            )}
            {searchQuery && <span className="ml-2">for "{searchQuery}"</span>}
          </p>
        </div>

        {/* Debug Info - Remove this in production */}
        {/* {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              Debug: Products array length: {productsToDisplay.length} | Total
              elements: {displayTotalElements} | Is loading:{" "}
              {isLoading.toString()} | Redux loaded: {isLoaded.toString()}
            </p>
          </div>
        )} */}

        {/* Loading State */}
        {isLoading && !productsToDisplay.length && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-pink"></div>
          </div>
        )}

        {/* Products Grid/List */}
        {productsToDisplay.length > 0 && (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {productsToDisplay.map((product, index) => {
                console.log(`Rendering product ${index}:`, product);
                return (
                  <ProductCard
                    key={product.id || index}
                    product={product}
                    onProductClick={() => handleToProductDetail(product.id)}
                    onWishlistToggle={() => {}}
                    viewMode={viewMode}
                  />
                );
              })}
            </div>

            {/* Load More Pagination */}
            {hasMore && (
              <LoadMorePagination
                items={productsToDisplay}
                totalElements={displayTotalElements}
                hasMore={hasMore}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                onLoadMore={onLoadMore}
                loadMoreText="View More Products"
                loadingText="Loading more..."
                noMoreText="You've seen all products"
                showCount={false}
                buttonVariant="outline"
                buttonSize="lg"
                className="mt-8"
              />
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && productsToDisplay.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Grid3X3 className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Products Found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? `No products match "${searchQuery}"`
                : "No products available at the moment"}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
