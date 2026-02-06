/**
 * Cookie key constants - single source of truth for all cookie names
 */
export const COOKIE_KEYS = {
  ACCESS_TOKEN: "auth-token-client",
  REFRESH_TOKEN: "auth-refresh-token",
  USER_INFO: "user-info",
} as const;
