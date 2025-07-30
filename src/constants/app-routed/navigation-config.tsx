import { BarChart3, Home, LucideIcon, Settings, Users } from "lucide-react";
import { ROUTES } from "./routes";

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
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
        title: "Users",
        href: ROUTES.ADMIN.USERS,
        icon: Users,
        description: "Manage system users",
      },
      {
        title: "Analytics",
        href: ROUTES.ADMIN.ANALYTICS,
        icon: BarChart3,
        description: "View analytics and reports",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        href: ROUTES.ADMIN.SETTINGS,
        icon: Settings,
        description: "System configuration",
      },
    ],
  },
];

// Flatten for sidebar usage
export const sidebarItems = navigationConfig.flatMap(
  (section) => section.items
);
