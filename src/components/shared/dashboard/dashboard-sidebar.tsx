"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { User } from "@/services/dashboard/user/user.service";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navItems, ROUTES } from "@/constants/AppRoutes/routes";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);
      try {
        // const response = await getUsersProfileService();
        // setAuthUser(response || null);
      } catch (error) {
        return;
      } finally {
        setIsLoading(false);
      }
    };
    loadUserProfile();
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-[70px]",
          isMobile && !isOpen && "hidden"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          {isOpen && (
            <Link
              href={ROUTES.DASHBOARD.INDEX}
              className={cn(
                "flex items-center gap-2 font-semibold",
                !isOpen && "justify-center"
              )}
            >
              <img
                src="/assets/favicon.ico"
                alt="Special Account"
                className="w-8 h-8"
              />
              <span>Template Account</span>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "transition-transform duration-300",
              !isOpen && "rotate-180"
            )}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground overflow-hidden",
                  pathname === item.href && "bg-accent text-accent-foreground",
                  !isOpen && "justify-center px-0"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span
                  className={cn(
                    "whitespace-nowrap transition-all duration-300 ease-in-out",
                    isOpen
                      ? "opacity-100 translate-x-0 max-w-xs"
                      : "opacity-0 -translate-x-4 max-w-0"
                  )}
                >
                  {item.title}
                </span>
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <div className="border-t p-4"></div>
      </div>
    </>
  );
}
