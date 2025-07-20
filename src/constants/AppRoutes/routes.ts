import { List, User2 } from "lucide-react";

export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
  },
  DASHBOARD: {
    INDEX: "/user",
    PRODUCT: "/product",
  },
};

export const navItems = [
  {
    title: "Users",
    href: ROUTES.DASHBOARD.INDEX,
    icon: User2,
  },
  {
    title: "Products",
    href: ROUTES.DASHBOARD.PRODUCT,
    icon: List,
  },
];
