import { deleteCookie, getCookie, setCookie } from "cookies-next";

export function storeTokenRemember(token: string | undefined): void {
  if (typeof window === "undefined") {
    return;
  }

  setCookie("auth-token-client", token, { maxAge: 365 * 24 * 60 * 60 });
}

export function getToken() {
  const token = getCookie("auth-token-client");
  return token;
}

export function storeToken(token: string | undefined): void {
  if (typeof window === "undefined") {
    return;
  }

  setCookie("auth-token-client", token);
}

/**
 * Logout the current user
 */
export function clearToken(): void {
  // Delete auth cookie
  deleteCookie("auth-token-client");
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getCookie("auth-token-client");
  return !!token;
}
