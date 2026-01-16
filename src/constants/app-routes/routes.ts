import {
  Home,
  Users,
  Database,
  LucideIcon,
  LucideBriefcaseBusiness,
} from "lucide-react";

export const ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/login",
  },

  // Admin routes
  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin",
    PROFILE: "/admin/profile",
    USERS: "/admin/users",
    BRAND: "/admin/brand",
    BANNER: "/admin/banner",
    CATEGORIES: "/admin/categories",
    EXCHANGE_RATE: "/admin/exchange-rate",
    DELIVERY_OPTIONS: "/admin/delivery-options",
    PRODUCTS: "/admin/products",
  },
} as const;

/**
 * Route Groups for Sidebar Navigation
 */

interface MenuItem {
  title: string;
  href?: string;
  icon?: LucideIcon;
  items?: Array<{
    title: string;
    href: string;
  }>;
}

export const SIDEBAR_MENU: MenuItem[] = [
  {
    title: "Dashboard",
    href: ROUTES.ADMIN.DASHBOARD,
    icon: Home,
  },
  {
    title: "User",
    href: ROUTES.ADMIN.USERS,
    icon: Users,
  },

  {
    title: "HR",
    icon: Database,
    items: [
      {
        title: "Work Schedules",
        href: ROUTES.ADMIN.BANNER,
      },
      {
        title: "Leave Type",
        href: ROUTES.ADMIN.CATEGORIES,
      },
      {
        title: "Leave Status",
        href: ROUTES.ADMIN.BRAND,
      },
      {
        title: "Exchange Rate",
        href: ROUTES.ADMIN.EXCHANGE_RATE,
      },
    ],
  },

  {
    title: "Master Data",
    icon: Database,
    items: [
      {
        title: "Banner",
        href: ROUTES.ADMIN.BANNER,
      },
      {
        title: "Categories",
        href: ROUTES.ADMIN.CATEGORIES,
      },
      {
        title: "Brand",
        href: ROUTES.ADMIN.BRAND,
      },
      {
        title: "Exchange Rate",
        href: ROUTES.ADMIN.EXCHANGE_RATE,
      },
      {
        title: "Delivery Options",
        href: ROUTES.ADMIN.DELIVERY_OPTIONS,
      },
    ],
  },
  {
    title: "Business",
    icon: LucideBriefcaseBusiness,
    items: [
      {
        title: "Products",
        href: ROUTES.ADMIN.PRODUCTS,
      },
    ],
  },
];

/**
 * Route Helpers
 */

export const isPublicRoute = (pathname: string): boolean => {
  return pathname === ROUTES.HOME || pathname === ROUTES.AUTH.LOGIN;
};

export const isAdminRoute = (pathname: string): boolean => {
  return pathname.startsWith(ROUTES.ADMIN.ROOT);
};

export const getActiveMenuItem = (pathname: string): MenuItem | null => {
  for (const item of SIDEBAR_MENU) {
    if (item.href === pathname) return item;

    if (item.items) {
      const found = item.items.find((subItem) => subItem.href === pathname);
      if (found) return item;
    }
  }
  return null;
};

/**
 * Breadcrumb Helpers
 */

export interface Breadcrumb {
  label: string;
  href?: string;
}

export const getBreadcrumbs = (pathname: string): Breadcrumb[] => {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [{ label: "Home", href: ROUTES.HOME }];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Format segment name
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    breadcrumbs.push({
      label,
      href: index === segments.length - 1 ? undefined : currentPath,
    });
  });

  return breadcrumbs;
};

/**
 * Navigation Helpers
 */

export const getDefaultAdminRoute = (): string => {
  return "PLATFORM_USERS";
};

export const getLoginRedirectUrl = (): string => {
  return ROUTES.AUTH.LOGIN;
};

export const getDashboardRedirectUrl = (): string => {
  return getDefaultAdminRoute();
};
