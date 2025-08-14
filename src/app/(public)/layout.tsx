import type { Metadata } from "next";
import "@/styles/globals.css";
import { Header } from "@/components/app/public/header";
import { Footer } from "@/components/app/public/footer";

export const metadata: Metadata = {
  title: "Menu Scanner Admin",
  description: "Admin panel for Menu Scanner application",
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 text-gray-800 flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">{children}</div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
