import DashboardLayout from "@/components/app/layout/main/dashboard-layout";
import type { ReactNode } from "react";

export default function DashboardGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
