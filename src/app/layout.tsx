// src/app/layout.tsx
import type { Metadata } from "next";
import { ClientProviders } from "@/context/client-provider";
import { getMessages } from "next-intl/server";
import localFont from "next/font/local";
import { locales, defaultLocale, type Locale } from "@/i18n/request";
import "../styles/globals.css";
import PageProgressBar from "@/components/shared/progress/global-n-progress";
import { LocaleProvider } from "@/context/locale-provider";
import { headers } from "next/headers";

const geistSans = localFont({
  src: "../../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Menu Scanner Admin",
  description: "Admin panel for Menu Scanner application",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get locale from header set by middleware
  const headersList = headers();
  const localeHeader = headersList.get("x-locale");
  const locale = (
    localeHeader && locales.includes(localeHeader as Locale)
      ? localeHeader
      : defaultLocale
  ) as Locale;

  // Get messages for the locale
  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <LocaleProvider initialLocale={locale} initialMessages={messages}>
          <ClientProviders>
            <PageProgressBar />
            {children}
          </ClientProviders>
        </LocaleProvider>
      </body>
    </html>
  );
}
