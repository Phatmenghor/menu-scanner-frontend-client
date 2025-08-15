// src/app/(auth)/layout.tsx
import { TopBarAuth } from "@/components/app/layout/topbar-auth";
import { Loader2 } from "lucide-react";
import { ReactNode, Suspense } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBarAuth />
      <div className="flex flex-1 items-center justify-center">
        <Suspense fallback={<AuthLoading />}>{children}</Suspense>
      </div>
    </div>
  );
}
