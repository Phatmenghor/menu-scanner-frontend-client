// src/constants/app-routed/navigation-config.tsx
import {
  BarChart3,
  Home,
  LucideIcon,
  Settings,
  Users,
  Shield,
  Database,
  FileText,
  Mail,
  Phone,
  Globe,
  UserCheck,
  Calendar,
  CreditCard,
  Package,
  ShoppingCart,
  Briefcase,
  Building,
  Boxes,
  Tags,
  Image,
  LayoutDashboard,
} from "lucide-react";
import { ROUTES } from "./routes";

export interface NavItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  description?: string;
  subroutes?: NavItem[];
  section?: string;
  badge?: string | number;
  disabled?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigationConfig: NavSection[] = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        href: ROUTES.ADMIN.DASHBOARD,
        icon: Home,
        description: "Overview and statistics",
      },
      {
        title: "User Management",
        icon: Users,
        section: "users",
        description: "Manage system users",
        subroutes: [
          {
            title: "All Users",
            href: ROUTES.ADMIN.USERS,
            icon: Users,
            description: "View all users",
          },
        ],
      },
      {
        title: "Business Management",
        icon: Building,
        section: "Content",
        description: "Configure and manage your business information",
        subroutes: [
          {
            title: "My Business",
            href: ROUTES.ADMIN.Business.MY_BUSINESS,
            icon: Briefcase,
            description: "View and update business details",
          },
        ],
      },
      {
        title: "Content Management",
        icon: LayoutDashboard, // Represents overall content management or admin section
        section: "content",
        description: "Manage application content",
        subroutes: [
          {
            title: "Banner",
            href: ROUTES.ADMIN.BANNER,
            icon: Image, // Banners are often images
            description: "Manage banner",
          },
          {
            title: "Brand",
            href: ROUTES.ADMIN.BRAND,
            icon: Tags, // Tags icon works well for brands/labels
            description: "Manage brand",
          },
          {
            title: "Category",
            href: ROUTES.ADMIN.CATEGORIES,
            icon: Boxes, // Represents multiple items/groups = category
            description: "Manage category",
          },
        ],
      },
      {
        title: "Analytics",
        href: ROUTES.ADMIN.ANALYTICS,
        icon: BarChart3,
        description: "View analytics and reports",
        badge: "New",
      },
    ],
  },
  {
    title: "E-Commerce",
    items: [
      {
        title: "Products",
        icon: Package,
        section: "products",
        description: "Product management",
        subroutes: [
          {
            title: "Product",
            href: ROUTES.ADMIN.PRODUCTS,
            icon: Package, // Represents a product/package
            description: "Manage product",
          },
          {
            title: "Categories",
            href: ROUTES.ADMIN.CATEGORIES,
            icon: Database,
            description: "Manage categories",
          },
        ],
      },
      {
        title: "Orders",
        href: ROUTES.ADMIN.ORDERS,
        icon: ShoppingCart,
        description: "Order management",
        badge: 5,
      },
      {
        title: "Payments",
        href: ROUTES.ADMIN.PAYMENTS,
        icon: CreditCard,
        description: "Payment transactions",
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        title: "Messages",
        href: ROUTES.ADMIN.MESSAGES,
        icon: Mail,
        description: "User messages",
        badge: 12,
      },
      {
        title: "Notifications",
        href: ROUTES.ADMIN.NOTIFICATIONS,
        icon: Phone,
        description: "System notifications",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        icon: Settings,
        section: "settings",
        description: "System configuration",
        subroutes: [
          {
            title: "General",
            href: ROUTES.ADMIN.SETTINGS.GENERAL,
            icon: Settings,
            description: "General settings",
          },
          {
            title: "Security",
            href: ROUTES.ADMIN.SETTINGS.SECURITY,
            icon: Shield,
            description: "Security settings",
          },
          {
            title: "Integration",
            href: ROUTES.ADMIN.SETTINGS.INTEGRATION,
            icon: Globe,
            description: "Third-party integrations",
          },
        ],
      },
      {
        title: "Logs",
        href: ROUTES.ADMIN.LOGS,
        icon: FileText,
        description: "System logs",
      },
    ],
  },
];

// Flatten for sidebar usage
export const sidebarItems = navigationConfig.flatMap(
  (section) => section.items
);
