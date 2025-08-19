import { useCallback, useState } from "react";

// Hook for managing load more state
export function useLoadMorePagination(
  initialPageSize: number = 12,
  incrementSize: number = 12
) {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = useCallback(
    async (loadFunction: () => Promise<void>) => {
      setIsLoadingMore(true);
      try {
        // Increase page size
        setPageSize((prev) => prev + incrementSize);

        // Call the load function
        await loadFunction();
      } catch (error) {
        console.error("Error loading more items:", error);
        // Revert page size on error
        setPageSize((prev) => prev - incrementSize);
        throw error;
      } finally {
        setIsLoadingMore(false);
      }
    },
    [incrementSize]
  );

  const resetPagination = useCallback(() => {
    setPageSize(initialPageSize);
    setIsLoadingMore(false);
  }, [initialPageSize]);

  return {
    pageSize,
    isLoadingMore,
    handleLoadMore,
    resetPagination,
  };
}
