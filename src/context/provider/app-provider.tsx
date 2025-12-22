// providers/AppProviders.tsx
"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import store from "../../redux/store";
interface AppProvidersProps {
  children: ReactNode;
}

export async function AppProviders({ children }: AppProvidersProps) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Provider store={store}>
        {children}
        <Toaster />
      </Provider>
    </NextIntlClientProvider>
  );
}
