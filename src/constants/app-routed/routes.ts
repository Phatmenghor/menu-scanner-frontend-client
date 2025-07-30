export const ROUTES = {
  // Public routes
  HOME: "/",
  LOGIN: "/login",

  // Admin routes (protected)
  ADMIN: {
    DASHBOARD: "/admin",
    USERS: "/admin/users",
    SETTINGS: "/admin/settings",
    ANALYTICS: "/admin/analytics",
  },
} as const;
