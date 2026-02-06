// hooks/use-auth-init.ts
"use client";

import { useEffect, useRef } from "react";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import {
  setUser,
  setAuthReady,
} from "@/redux/features/auth/store/slice/auth-slice";
import { getProfileService } from "@/redux/features/auth/store/thunks/auth-thunks";
import { getToken } from "@/utils/local-storage/token";
import { getUserInfo } from "@/utils/local-storage/userInfo";

export function useAuthInit() {
  const { dispatch, isAuthenticated, authReady } = useAuthState();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initAuth = async () => {
      // Check if token exists in cookies
      const token = getToken();

      if (token) {
        // Get user info from cookies
        const userInfo = getUserInfo();

        if (userInfo) {
          // Restore user to Redux state (this also sets authReady = true)
          dispatch(setUser(userInfo));

          // Fetch fresh profile data
          try {
            await dispatch(getProfileService()).unwrap();
          } catch (error) {
            console.error("Failed to fetch profile:", error);
          }
        } else {
          // Token exists but no user info - mark auth as ready
          dispatch(setAuthReady());
        }
      } else {
        // No token found - mark auth as ready (not authenticated)
        dispatch(setAuthReady());
      }
    };

    initAuth();
  }, [dispatch]);

  return { isAuthenticated, authReady };
}
