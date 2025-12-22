"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ROUTES, SIDEBAR_MENU } from "@/constants/app-routes/routes";
import Image from "next/image";
import { UserAvatarCard } from "../shared/avator/user-avatar-card";
import { useIsMobile } from "@/redux/store/use-mobile";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { getProfileService } from "@/redux/features/auth/store/thunks/auth-thunks";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Get auth state from Redux
  const { profile, isProfileLoading, dispatch } = useAuthState();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "Master Data": true,
  });
  const [collapsed, setCollapsed] = useState(false);

  // Fetch profile on mount if not already loaded
  useEffect(() => {
    if (!profile && !isProfileLoading) {
      dispatch(getProfileService());
    }
  }, [profile, isProfileLoading, dispatch]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev);
    onToggle();
    if (!collapsed) {
      setOpenSections({});
    }
  };

  const renderNavItems = (isCollapsed = false) => (
    <nav className="flex flex-col gap-1">
      {SIDEBAR_MENU.map((route) => {
        // Check if this route has sub-items (items property exists)
        const hasSubItems = route.items && route.items.length > 0;

        // For items without sub-items, check if the current route matches
        const isActive = route.href ? pathname === route.href : false;

        // For parent items with sub-items, check if any child is active
        const hasActiveChild = hasSubItems
          ? route.items!.some((item) => pathname === item.href)
          : false;

        if (hasSubItems) {
          const isOpen = route.title ? openSections[route.title] : false;

          return (
            <div key={route.title} className="w-full">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start hover:bg-primary/10 hover:text-primary rounded relative",
                  hasActiveChild &&
                    "bg-primary/15 text-primary font-medium border-l-2 border-primary"
                )}
                onClick={() =>
                  route.title && !isCollapsed && toggleSection(route.title)
                }
                aria-expanded={isOpen}
                title={isCollapsed ? route.title : undefined}
              >
                <div className="flex w-full items-center">
                  {route.icon && (
                    <route.icon className="w-5 h-5 flex-shrink-0" />
                  )}
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 truncate">{route.title}</span>
                      <div className="ml-auto">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Button>

              {!isCollapsed && isOpen && (
                <div className="relative ml-6 mt-1 space-y-1">
                  {/* Vertical line */}
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 z-0"></div>

                  {route.items!.map((subItem, index) => (
                    <div key={subItem.title} className="relative">
                      {/* Horizontal line */}
                      <div className="absolute left-0 top-1/2 w-4 h-px bg-gray-300 z-0"></div>

                      {/* Dot */}
                      <div className="absolute left-0 top-1/2 w-1.5 h-1.5 bg-gray-400 rounded-full transform -translate-x-0.5 -translate-y-0.5 z-10"></div>

                      {/* Hide vertical line below last item */}
                      {index === route.items!.length - 1 && (
                        <div
                          className="absolute left-0 top-1/2 w-px bg-background z-10"
                          style={{ height: "50%" }}
                        ></div>
                      )}

                      {/* Small connector line */}
                      <div className="absolute left-4 top-1/2 w-2 h-px bg-gray-200 z-0"></div>

                      <Button
                        variant="ghost"
                        asChild
                        className={cn(
                          "relative w-full justify-start hover:bg-primary/10 hover:text-primary pl-6 rounded z-20 border-l border-transparent hover:border-l-primary/30 transition-all duration-200",
                          pathname === subItem.href &&
                            "bg-primary/15 text-primary font-medium border-l-2 border-primary shadow-sm"
                        )}
                      >
                        <Link
                          href={subItem.href}
                          className="flex items-center gap-2"
                        >
                          <span className="truncate">{subItem.title}</span>
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }

        // Render simple menu item (no sub-items)
        return (
          <Button
            key={route.title}
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start hover:bg-primary/10 hover:text-primary rounded",
              isActive &&
                "bg-primary/15 text-primary font-medium border-l-2 border-primary"
            )}
          >
            <Link
              href={route.href || "#"}
              className="flex items-center gap-3 px-3 py-2"
              title={collapsed ? route.title : undefined}
            >
              {route.icon && <route.icon className="w-5 h-5 flex-shrink-0" />}
              {!collapsed && <span className="truncate">{route.title}</span>}
            </Link>
          </Button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-md"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border/50 bg-background/95 backdrop-blur-xl transition-all duration-300 ease-out shadow-xl",
          collapsed ? "w-16" : "w-60",
          isMobile && !isOpen && "hidden"
        )}
      >
        {/* Header */}
        <div className="relative flex h-20 items-center justify-between border-b border-border/50 px-4 bg-gradient-to-br from-primary/5 via-background/50 to-accent/5">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50 blur-3xl"></div>

          {!collapsed && (
            <Link
              href="/"
              className="relative flex items-center gap-3 group transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-all duration-300 overflow-hidden">
                  <Image
                    src="/assets/favicon.ico"
                    alt="Menu Scanner Logo"
                    width={24}
                    height={24}
                    className="rounded object-contain"
                    priority
                  />
                </div>
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-foreground font-bold text-sm leading-tight tracking-tight">
                  Menu Scanner
                </span>
                <span className="text-muted-foreground text-xs font-medium tracking-wide">
                  Dashboard
                </span>
              </div>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className={cn(
              "relative h-9 w-9 rounded-xl transition-all duration-300 hover:bg-accent/50 hover:scale-110 group",
              collapsed && "ml-auto"
            )}
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ChevronLeft
              className={cn(
                "h-4 w-4 relative z-10 transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-6">
          <div className="px-4 space-y-2">{renderNavItems(collapsed)}</div>
        </ScrollArea>

        {/* User Avatar Card */}
        {profile && (
          <UserAvatarCard
            user={profile}
            collapsed={collapsed}
            isOnline={true}
            isLoading={isProfileLoading}
            profileLink={ROUTES.ADMIN.PROFILE}
            showEmail={true}
            showOnlineIndicator={true}
            enableImagePreview={true}
            avatarSize="md"
          />
        )}
      </div>
    </>
  );
}
