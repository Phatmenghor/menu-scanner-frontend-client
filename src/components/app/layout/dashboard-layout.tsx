"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { DashboardSidebar } from "@/components/shared/dashboard/dashboard-sidebar";
import { TopBar } from "@/components/shared/dashboard/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [pathname, isMobile]);

  return (
    <div className="flex overflow-hidden h-screen w-full bg-background">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div
        className={cn(
          "dashboard-content flex-1 transition-all duration-300 flex flex-col overflow-hidden",
          isMobile ? "w-full" : isSidebarOpen ? "ml-64" : "ml-[60px]"
        )}
      >
        {/* TopBar - Fixed height */}
        <div className="flex-shrink-0">
          <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>

        {/* Main content - Flexible height */}
        <main className="dashboard-main flex-1 overflow-hidden px-4 pt-4 md:pt-6 md:px-6">
          <div className="h-full overflow-hidden">{children}</div>
        </main>
      </div>
    </div>
  );
}
