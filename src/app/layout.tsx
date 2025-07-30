// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Template App",
  description: "Template description",
};

// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className="overflow-y-hidden">{children}</body>
    </html>
  );
}
