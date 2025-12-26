import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar - Shared across all public pages */}
      <Navbar />

      {/* Main Content - Changes per page */}
      <main className="flex-1">{children}</main>

      {/* Footer - Shared across all public pages */}
      <Footer />
    </div>
  );
}
