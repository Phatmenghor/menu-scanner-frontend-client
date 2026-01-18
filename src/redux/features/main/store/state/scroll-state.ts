/**
 * Scroll State Hook
 */

import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectScrollState,
  selectCurrentRoute,
  selectAllRoutes,
  selectRouteScrollPosition,
  selectHasScrollPosition,
} from "../selectors/scroll-selectors";
import {
  saveScrollPosition,
  restoreScrollPosition,
  setCurrentRoute,
  clearScrollPosition,
  clearAllScrollPositions,
  cleanupScrollPositions,
} from "../slice/scroll-slice";

/**
 * Hook for scroll state management
 */
export const useScrollState = () => {
  const dispatch = useAppDispatch();
  const scrollState = useAppSelector(selectScrollState);
  const currentRoute = useAppSelector(selectCurrentRoute);
  const allRoutes = useAppSelector(selectAllRoutes);

  return {
    // State
    scrollState,
    currentRoute,
    allRoutes,

    // Actions
    saveScrollPosition: (path: string, scrollY: number) =>
      dispatch(saveScrollPosition({ path, scrollY })),
    restoreScrollPosition: (path: string) =>
      dispatch(restoreScrollPosition(path)),
    setCurrentRoute: (path: string) => dispatch(setCurrentRoute(path)),
    clearScrollPosition: (path: string) => dispatch(clearScrollPosition(path)),
    clearAllScrollPositions: () => dispatch(clearAllScrollPositions()),
    cleanupScrollPositions: () => dispatch(cleanupScrollPositions()),

    // Helpers
    getScrollPosition: (path: string) =>
      useAppSelector((state) => selectRouteScrollPosition(path)(state)),
    hasScrollPosition: (path: string) =>
      useAppSelector((state) => selectHasScrollPosition(path)(state)),

    // Dispatch (for advanced usage)
    dispatch,
  };
};
