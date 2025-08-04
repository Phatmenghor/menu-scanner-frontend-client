"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { NextIntlClientProvider, useLocale } from "next-intl";
import { locales, defaultLocale, type Locale } from "@/i18n/request";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: any;
  isLoading: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Helper function to get stored locale
function getStoredLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;

  try {
    // Check localStorage first
    const stored = localStorage.getItem("locale");
    if (stored && locales.includes(stored as Locale)) {
      return stored as Locale;
    }

    // Check cookies
    const cookieMatch = document.cookie.match(/locale=([^;]+)/);
    if (cookieMatch && locales.includes(cookieMatch[1] as Locale)) {
      return cookieMatch[1] as Locale;
    }
  } catch (error) {
    console.log("Could not read stored locale:", error);
  }

  return defaultLocale;
}

// Helper function to store locale
function storeLocale(locale: Locale) {
  if (typeof window === "undefined") return;

  localStorage.setItem("locale", locale);
  document.cookie = `locale=${locale}; path=/; max-age=${
    365 * 24 * 60 * 60
  }; SameSite=Lax`;
}

interface LocaleProviderProps {
  children: ReactNode;
  initialMessages: any;
  initialLocale: Locale;
}

export function LocaleProvider({
  children,
  initialMessages,
  initialLocale,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  // On mount, check for stored locale preference
  useEffect(() => {
    const storedLocale = getStoredLocale();
    if (storedLocale !== locale) {
      loadLocale(storedLocale);
    }
  }, []);

  // Function to load messages for a specific locale
  const loadLocale = async (newLocale: Locale) => {
    if (newLocale === locale && messages) return;

    setIsLoading(true);
    try {
      // Fixed import path - changed from ../../messages to ../messages
      const newMessages = await import(`../messages/${newLocale}.json`);

      setMessages(newMessages.default);
      setLocaleState(newLocale);
      storeLocale(newLocale);

      console.log("Client-side locale loaded:", newLocale);
    } catch (error) {
      console.error("Failed to load locale:", newLocale, error);
      // Fallback to default locale if loading fails
      if (newLocale !== defaultLocale) {
        loadLocale(defaultLocale);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setLocale = (newLocale: Locale) => {
    if (newLocale !== locale) {
      loadLocale(newLocale);
    }
  };

  const contextValue: LocaleContextType = {
    locale,
    setLocale,
    messages,
    isLoading,
  };

  return (
    <LocaleContext.Provider value={contextValue}>
      <NextIntlClientProvider
        messages={messages}
        locale={locale}
        timeZone="Asia/Phnom_Penh" // Add timezone for client-side
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

// Hook to use locale context
export function useClientLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useClientLocale must be used within a LocaleProvider");
  }
  return context;
}
