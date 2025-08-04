import type { Metadata } from "next";
import { ClientProviders } from "@/context/provider/client-provider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import PageProgressBar from "@/components/shared/progressbar/Nprogressbar/global-n-progress";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { locales, defaultLocale, type Locale } from "@/i18n/request";

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

// Helper function to detect locale from cookies
function getLocaleFromCookies(): Locale {
  try {
    const cookieStore = cookies();
    const localeCookie = cookieStore.get("locale")?.value as Locale;

    if (localeCookie && locales.includes(localeCookie)) {
      return localeCookie;
    }
  } catch (error) {
    console.log("Could not read locale cookie:", error);
  }

  return defaultLocale;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // FIXED: Get locale from cookies instead of URL or headers
  const locale = getLocaleFromCookies();

  console.log("Layout locale detection:", locale);

  // Get messages for the detected locale
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
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ClientProviders>
            <PageProgressBar />
            {children}
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
