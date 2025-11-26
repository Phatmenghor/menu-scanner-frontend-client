import { Home, LucideIcon, User } from "lucide-react";

const ADMIN = "/admin";
export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
  },
  DASHBOARD: {
    INDEX: `${ADMIN}/user`,
    PROFILE: `${ADMIN}/profile`,
  },
};

type Subroute = {
  title: string;
  href: string;
};

type SidebarItem = {
  title: string;
  href?: string;
  icon?: LucideIcon;
  image?: string;
  section?: string;
  subroutes?: Subroute[];
};

export const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: ROUTES.DASHBOARD.INDEX,
    icon: Home,
  },
  {
    title: "Manage",
    section: "Manage User",
    icon: User,
    subroutes: [
      {
        title: "users",
        href: ROUTES.DASHBOARD.INDEX,
      },
    ],
  },
];
