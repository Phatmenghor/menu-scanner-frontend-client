// src/constants/app-routed/customer-navigation-config.tsx
import { ClipboardList, Heart, MapPin, User } from "lucide-react";

export interface NavItem {
  title: string;
  href?: string;
  icon: any;
  description?: string;
  subroutes?: NavItem[];
  section?: string;
  badge?: string | number;
  disabled?: boolean;
}

export const CustomerSidebarItems: NavItem[] = [
  {
    title: "Order History",
    href: "/dashboard/order-history",
    icon: ClipboardList,
    description: "View your past orders",
  },
  {
    title: "Favorite",
    href: "/dashboard/favorite",
    icon: Heart,
    description: "Your saved items",
  },
  {
    title: "Address",
    href: "/dashboard/address",
    icon: MapPin,
    description: "Manage your delivery addresses",
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
    description: "Edit your profile information",
  },
];
