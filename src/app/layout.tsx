import type { Metadata } from "next";
import { ClientProviders } from "@/context/client-provider";
import { getMessages, getLocale } from "next-intl/server";
import PageProgressBar from "@/components/shared/progressbar/Nprogressbar/global-n-progress";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { LocaleProvider } from "@/context/locale-provider";
import { type Locale } from "@/i18n/request";

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
  // Get initial server-side locale and messages (always default for clean URLs)
  const serverLocale = (await getLocale()) as Locale;
  const serverMessages = await getMessages();

  console.log("Layout - Server locale:", serverLocale);

  return (
    <html
      lang={serverLocale}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <LocaleProvider
          initialLocale={serverLocale}
          initialMessages={serverMessages}
        >
          <ClientProviders>
            <PageProgressBar />
            {children}
          </ClientProviders>
        </LocaleProvider>
      </body>
    </html>
  );
}
