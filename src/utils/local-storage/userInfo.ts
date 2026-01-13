// utils/local-storage/userInfo.ts
import { getCookie, setCookie, deleteCookie } from "cookies-next";

export function storeUserInfo(userInfo: any): void {
  if (typeof window === "undefined") {
    return;
  }

  setCookie("user-info", JSON.stringify(userInfo), {
    maxAge: 365 * 24 * 60 * 60,
  });
}

export function getUserInfo() {
  const userInfo = getCookie("user-info");

  if (userInfo) {
    try {
      return JSON.parse(userInfo as string);
    } catch (error) {
      console.error("Failed to parse user info:", error);
      return null;
    }
  }

  return null;
}

export function removeUserInfo(): void {
  deleteCookie("user-info");
}
