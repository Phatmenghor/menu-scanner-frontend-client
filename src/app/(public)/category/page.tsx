"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Grid3X3, List, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/utils/debounce/debounce";
import { getUserInfo } from "@/utils/local-storage/userInfo";
import { AppToast } from "@/components/app/components/app-toast";
import { ROUTES } from "@/constants/app-routed/routes";
import { useLoadMorePagination } from "@/hooks/use-loadMore-pagination";
import { LoadMorePagination } from "@/components/ui/load-more-pagination";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { CategoryCard } from "@/components/app/public/category-card";
import { getPublicAllCategoriesService } from "@/services/dashboard/content-management/category/category.public.service";
import {
  appendCategory,
  setAllCategories,
} from "@/store/features/category-slice";

export default function AllCategoriesPage() {
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

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Get products from Redux store
  const { allCategories, isLoadedCategories } = useSelector(
    (store: RootState) => store.category
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

  const loadCategories = useCallback(
    async (append: boolean = false) => {
      if (!append) {
        setIsLoading(true);
      }

      try {
        const pageToLoad = append ? currentPage + 1 : 1;

        const categoryRes = await getPublicAllCategoriesService({
          search: debouncedSearchQuery,
          pageNo: pageToLoad,
          businessId: user?.businessId,
          pageSize: 12,
        });

        console.log("API Response:", categoryRes);
        console.log("Categories content:", categoryRes?.content);

        if (append) {
          // When loading more, APPEND new products to existing ones
          if (categoryRes?.content) {
            dispatch(appendCategory(categoryRes.content));
            setCurrentPage(pageToLoad);
          }
        } else {
          // Initial load or search - REPLACE products
          if (categoryRes) {
            dispatch(setAllCategories(categoryRes)); // Pass the entire response object
            setTotalElements(categoryRes.totalElements || 0);
            setTotalPages(categoryRes.totalPages || 0);
            setCurrentPage(1);
          }
        }
      } catch (error: any) {
        console.log("Failed to load categories:", error);
        AppToast?.({
          type: "error",
          message: "Failed to load categories",
          duration: 3000,
          position: "top-right",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearchQuery, user?.businessId, currentPage, dispatch]
  );

  // Load initial categories when search/sort changes
  useEffect(() => {
    if (!isLoadedCategories || debouncedSearchQuery !== searchQuery) {
      resetPagination();
      setCurrentPage(1);
      loadCategories(false);
    }
  }, [debouncedSearchQuery, sortBy]);

  // Initial load
  useEffect(() => {
    if (!isLoadedCategories) {
      loadCategories(false);
    }
  }, []);

  const onLoadMore = useCallback(async () => {
    await handleLoadMore(async () => {
      await loadCategories(true); // Load next page and append
    });
  }, [handleLoadMore, loadCategories]);

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
  const categoryToDisplay = allCategories?.content || [];
  const displayTotalElements =
    totalElements || allCategories?.totalElements || 0;

  // Check if there are more products to load
  const hasMore = categoryToDisplay.length < displayTotalElements;

  console.log("Redux allCategories:", allCategories);
  console.log("Categories to display:", categoryToDisplay);
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
                Showing {categoryToDisplay.length} of {displayTotalElements}{" "}
                categories
              </>
            ) : isLoading ? (
              ""
            ) : (
              "No category found"
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
        {isLoading && !categoryToDisplay.length && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-pink"></div>
          </div>
        )}

        {/* Products Grid/List */}
        {categoryToDisplay.length > 0 && (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {categoryToDisplay.map((category, index) => {
                console.log(`Rendering product ${index}:`, category);
                return (
                  <CategoryCard
                    key={category.id || index}
                    category={category}
                    onCategoryClick={() => handleToProductDetail(category.id)}
                  />
                );
              })}
            </div>

            {/* Load More Pagination */}
            {hasMore && (
              <LoadMorePagination
                items={categoryToDisplay}
                totalElements={displayTotalElements}
                hasMore={hasMore}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                onLoadMore={onLoadMore}
                loadMoreText="View More Categories"
                loadingText="Loading more..."
                noMoreText="You've seen all categories"
                showCount={false}
                buttonVariant="outline"
                buttonSize="lg"
                className="mt-8"
              />
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && categoryToDisplay.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Grid3X3 className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Category Found
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
