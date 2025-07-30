// app/[locale]/layout.tsx
import { TopBarAuth } from "@/components/app/layout/main/topbar-auth";
import { ReactNode } from "react";

interface LocaleLayoutProps {
  children: ReactNode;
}

export default async function LocaleLayout({ children }: LocaleLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBarAuth />
      <div className="flex flex-1 items-center justify-center">{children}</div>
    </div>
  );
}
