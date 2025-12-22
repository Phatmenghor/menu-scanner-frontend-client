import { Home, Users, Database, Pin, Bell, LucideIcon } from "lucide-react";

/**
 * Clean Routes Configuration
 * No language prefixes - all routes are language-independent
 */

export const ROUTES = {
  // Public routes
  HOME: "/",
  LOGIN: "/login",

  // Admin routes
  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin",

    // User Management
    PLATFORM_USERS: "/admin/platform-users",
    BUSINESS_USERS: "/admin/business-users",
    BUSINESS_OWNER: "/admin/business-owner",
    CUSTOMER_USER: "/admin/customer-user",

    // Master Data
    BUSINESS: "/admin/business",
    SUBSCRIPTION_PLAN: "/admin/subscription-plan",
    SUBSCRIPTION: "/admin/subscription",
    EXCHANGE_RATE: "/admin/exchange-rate",
    PAYMENT: "/admin/payment",

    // Location Management
    PROVINCE: "/admin/province",
    DISTRICT: "/admin/district",
    COMMUNE: "/admin/commune",
    VILLAGE: "/admin/village",

    // Notifications
    MY_NOTIFICATION: "/admin/my-notification",
    ALL_NOTIFICATION: "/admin/all-notification",

    // Settings
    PROFILE: "/admin/profile",
    SECURITY: "/admin/security",
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
    title: "Master Data",
    icon: Database,
    items: [
      { title: "Business", href: ROUTES.ADMIN.BUSINESS },
      { title: "Subscription Plans", href: ROUTES.ADMIN.SUBSCRIPTION_PLAN },
      { title: "Subscriptions", href: ROUTES.ADMIN.SUBSCRIPTION },
      { title: "Exchange Rates", href: ROUTES.ADMIN.EXCHANGE_RATE },
      { title: "Payments", href: ROUTES.ADMIN.PAYMENT },
    ],
  },

  {
    title: "Platform Users",
    icon: Users,
    items: [{ title: "Users", href: ROUTES.ADMIN.PLATFORM_USERS }],
  },

  {
    title: "Business Users",
    icon: Users,
    items: [
      { title: "Users", href: ROUTES.ADMIN.BUSINESS_USERS },
      { title: "Business Owners", href: ROUTES.ADMIN.BUSINESS_OWNER },
    ],
  },

  {
    title: "Customer Users",
    icon: Users,
    items: [{ title: "Customers", href: ROUTES.ADMIN.CUSTOMER_USER }],
  },

  {
    title: "Locations",
    icon: Pin,
    items: [
      { title: "Provinces", href: ROUTES.ADMIN.PROVINCE },
      { title: "Districts", href: ROUTES.ADMIN.DISTRICT },
      { title: "Communes", href: ROUTES.ADMIN.COMMUNE },
      { title: "Villages", href: ROUTES.ADMIN.VILLAGE },
    ],
  },

  {
    title: "Notifications",
    icon: Bell,
    items: [
      { title: "My Notifications", href: ROUTES.ADMIN.MY_NOTIFICATION },
      { title: "All Notifications", href: ROUTES.ADMIN.ALL_NOTIFICATION },
    ],
  },
];

/**
 * Route Helpers
 */

export const isPublicRoute = (pathname: string): boolean => {
  return pathname === ROUTES.HOME || pathname === ROUTES.LOGIN;
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
  return ROUTES.ADMIN.PLATFORM_USERS;
};

export const getLoginRedirectUrl = (): string => {
  return ROUTES.LOGIN;
};

export const getDashboardRedirectUrl = (): string => {
  return getDefaultAdminRoute();
};
