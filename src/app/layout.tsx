import type { Metadata } from "next";
import { ClientProviders } from "@/context/client-provider";
import { getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import localFont from "next/font/local";
import { locales, defaultLocale, type Locale } from "@/i18n/request";
import "../styles/globals.css";
import PageProgressBar from "@/components/shared/progress/global-n-progress";
import { LocaleProvider } from "@/context/locale-provider";

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

/**
 * Get locale from cookies
 */
async function getLocale(): Promise<Locale> {
  const cookieStore = cookies();
  const localeCookie = cookieStore.get("locale");

  if (localeCookie?.value && locales.includes(localeCookie.value as Locale)) {
    return localeCookie.value as Locale;
  }

  return defaultLocale;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
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
