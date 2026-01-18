/**
 * Scroll Restoration Hook
 * Automatically saves and restores scroll position for a page
 */

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useScrollState } from "@/redux/features/main/store/state/scroll-state";

export interface UseScrollRestorationOptions {
  /**
   * Whether to enable scroll restoration for this page
   * @default true
   */
  enabled?: boolean;

  /**
   * Debounce time for saving scroll position (ms)
   * @default 150
   */
  debounceMs?: number;

  /**
   * Whether to restore scroll position on mount
   * @default true
   */
  restoreOnMount?: boolean;

  /**
   * Whether to include search params in the route key
   * Set to false if you want to restore scroll position even when filters change
   * @default false
   */
  includeSearchParams?: boolean;

  /**
   * Custom route key (overrides automatic path generation)
   */
  customKey?: string;

  /**
   * Delay before restoring scroll (useful for waiting for content to load)
   * @default 100
   */
  restoreDelay?: number;
}

/**
 * Hook for automatic scroll position restoration
 */
export function useScrollRestoration(options: UseScrollRestorationOptions = {}) {
  const {
    enabled = true,
    debounceMs = 150,
    restoreOnMount = true,
    includeSearchParams = false,
    customKey,
    restoreDelay = 100,
  } = options;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { saveScrollPosition, getScrollPosition, setCurrentRoute } =
    useScrollState();

  const hasMounted = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const restoreTimeoutRef = useRef<NodeJS.Timeout>();

  // Generate route key
  const routeKey = customKey
    ? customKey
    : includeSearchParams && searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  // Restore scroll on mount
  useEffect(() => {
    if (!enabled || !restoreOnMount || hasMounted.current) return;

    hasMounted.current = true;
    setCurrentRoute(routeKey);

    const savedPosition = getScrollPosition(routeKey);

    if (savedPosition > 0) {
      restoreTimeoutRef.current = setTimeout(() => {
        window.scrollTo({
          top: savedPosition,
          behavior: "auto",
        });
      }, restoreDelay);
    }

    return () => {
      if (restoreTimeoutRef.current) {
        clearTimeout(restoreTimeoutRef.current);
      }
    };
  }, []);

  // Save scroll position on scroll
  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const scrollY = window.scrollY;
        saveScrollPosition(routeKey, scrollY);
      }, debounceMs);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, routeKey, debounceMs, saveScrollPosition]);

  return {
    routeKey,
    scrollPosition: getScrollPosition(routeKey),
  };
}

/**
 * Hook for pages that should NOT restore scroll (like detail pages)
 */
export function useScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
}
