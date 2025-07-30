import type { Metadata } from "next";
import { ClientProviders } from "@/context/provider/client-provider";
import { getLocale, getMessages } from "@/lib/i18n";
import { NextIntlClientProvider } from "next-intl";
import { headers } from "next/headers";
import PageProgressBar from "@/components/shared/progressbar/Nprogressbar/global-n-progress";
import localFont from "next/font/local";
import "@/styles/globals.css";

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
  // Get locale from browser/request
  const headersList = headers();
  const request = new Request("", {
    headers: Object.fromEntries(headersList.entries()),
  });
  const locale = getLocale(request);
  const messages = await getMessages(locale);

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
