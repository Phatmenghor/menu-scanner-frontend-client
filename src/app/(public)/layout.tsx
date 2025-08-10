import type { Metadata } from "next";
import "@/styles/globals.css";
import { Header } from "@/components/app/public/header";
import { Footer } from "@/components/app/public/footer";

export const metadata: Metadata = {
  title: "Menu Scanner Admin",
  description: "Admin panel for Menu Scanner application",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
