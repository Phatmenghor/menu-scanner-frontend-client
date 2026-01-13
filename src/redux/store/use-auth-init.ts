// hooks/use-auth-init.ts
"use client";

import { useEffect, useRef } from "react";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { setUser } from "@/redux/features/auth/store/slice/auth-slice";
import { getProfileService } from "@/redux/features/auth/store/thunks/auth-thunks";
import { getToken } from "@/utils/local-storage/token";
import { getUserInfo } from "@/utils/local-storage/userInfo";

export function useAuthInit() {
  const { dispatch, isAuthenticated } = useAuthState();
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
          // Restore user to Redux state
          dispatch(setUser(userInfo));

          // Fetch fresh profile data
          try {
            await dispatch(getProfileService()).unwrap();
          } catch (error) {
            console.error("Failed to fetch profile:", error);
          }
        }
      }
    };

    initAuth();
  }, [dispatch]);

  return { isAuthenticated };
}
