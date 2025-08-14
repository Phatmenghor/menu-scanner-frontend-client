import CustomerDashboardLayout from "@/components/app/layout/dashboard-client";
import { Loader2 } from "lucide-react";
import { Suspense, type ReactNode } from "react";

function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <CustomerDashboardLayout>{children}</CustomerDashboardLayout>
    </Suspense>
  );
}
