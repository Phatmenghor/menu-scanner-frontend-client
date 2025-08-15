// src/constants/app-routed/routes.ts
export const ROUTES = {
  // Public routes
  HOME: "/",

  // Authentication routes
  AUTH: {
    LOGIN: "/auth/admin/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    VERIFY_EMAIL: "/verify-email",
  },

  // Admin routes (protected)
  ADMIN: {
    DASHBOARD: "/admin",

    // User Management
    USERS: "/admin/users",
    USER_ROLES: "/admin/users/roles",
    PERMISSIONS: "/admin/users/permissions",

    // Business Configure
    Business: {
      MY_BUSINESS: "/admin/my-business",
    },

    // Content Management
    PAGES: "/admin/content/pages",
    MEDIA: "/admin/content/media",

    // E-Commerce
    BANNER: "/admin/banner",
    BRAND: "/admin/brand",
    CATEGORIES: "/admin/category",
    PRODUCTS: "/admin/products",
    ORDERS: "/admin/ecommerce/orders",
    PAYMENTS: "/admin/ecommerce/payments",

    // Communication
    MESSAGES: "/admin/communication/messages",
    NOTIFICATIONS: "/admin/communication/notifications",

    // Analytics & Reports
    ANALYTICS: "/admin/analytics",
    REPORTS: "/admin/reports",

    // Settings
    SETTINGS: {
      GENERAL: "/admin/settings/general",
      SECURITY: "/admin/settings/security",
      INTEGRATION: "/admin/settings/integration",
      APPEARANCE: "/admin/settings/appearance",
      NOTIFICATIONS: "/admin/settings/notifications",
    },

    // System
    LOGS: "/admin/system/logs",
    BACKUPS: "/admin/system/backups",
    MAINTENANCE: "/admin/system/maintenance",

    // Profile
    PROFILE: "/admin/profile",
    ACCOUNT: "/admin/account",
  },

  CUSTOMER: {
    DASHBOARD: "/dashboard",
    ADDRESS: "/dashboard/address",
  },
} as const;

// Route utilities
export const getRouteByPath = (path: string): string | null => {
  const findRoute = (obj: any, currentPath: string = ""): string | null => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string" && value === path) {
        return currentPath + key;
      } else if (typeof value === "object" && value !== null) {
        const found = findRoute(value, currentPath + key + ".");
        if (found) return found;
      }
    }
    return null;
  };

  return findRoute(ROUTES);
};

export const isAdminRoute = (path: string): boolean => {
  return path.startsWith("/admin");
};

export const isApiRoute = (path: string): boolean => {
  return path.startsWith("/api");
};

export const isAuthRoute = (path: string): boolean => {
  const authRoutes = Object.values(ROUTES.AUTH);
  return authRoutes.includes(path as any);
};

export const getParentRoute = (path: string): string => {
  const segments = path.split("/").filter(Boolean);
  segments.pop();
  return "/" + segments.join("/");
};

export const getBreadcrumbs = (
  path: string
): Array<{ label: string; href: string }> => {
  const segments = path.split("/").filter(Boolean);
  const breadcrumbs: Array<{ label: string; href: string }> = [];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    breadcrumbs.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: currentPath,
    });
  });

  return breadcrumbs;
};
