"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { locales, defaultLocale, type Locale } from "./request";

// Client-side language management utilities

export function useLanguage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLanguage = (locale: Locale) => {
    if (!locales.includes(locale)) {
      console.warn(
        `Invalid locale: ${locale}. Using default: ${defaultLocale}`
      );
      locale = defaultLocale;
    }

    startTransition(() => {
      // Store in localStorage
      localStorage.setItem("locale", locale);

      // Store in cookie
      document.cookie = `locale=${locale}; path=/; max-age=${
        365 * 24 * 60 * 60
      }; SameSite=Lax`;

      // Refresh the page to apply the new locale
      // This triggers the server to pick up the new locale from cookies
      window.location.reload();
    });
  };

  const getCurrentLanguage = (): Locale => {
    if (typeof window === "undefined") return defaultLocale;

    try {
      const stored = localStorage.getItem("locale") as Locale;
      if (stored && locales.includes(stored)) {
        return stored;
      }
    } catch (error) {
      console.log("Could not read localStorage:", error);
    }

    return defaultLocale;
  };

  return {
    setLanguage,
    getCurrentLanguage,
    isPending,
    availableLanguages: locales,
  };
}

// Server action equivalent for language switching
export function setLanguagePreference(locale: Locale) {
  if (typeof window === "undefined") {
    console.warn("setLanguagePreference called on server side");
    return;
  }

  if (!locales.includes(locale)) {
    console.warn(`Invalid locale: ${locale}. Using default: ${defaultLocale}`);
    locale = defaultLocale;
  }

  // Store in localStorage
  localStorage.setItem("locale", locale);

  // Store in cookie with proper settings
  document.cookie = `locale=${locale}; path=/; max-age=${
    365 * 24 * 60 * 60
  }; SameSite=Lax`;

  // Reload to apply changes
  window.location.reload();
}

// Get current language from storage
export function getStoredLanguage(): Locale {
  if (typeof window === "undefined") return defaultLocale;

  try {
    // Check localStorage first
    const stored = localStorage.getItem("locale") as Locale;
    if (stored && locales.includes(stored)) {
      return stored;
    }

    // Check cookies as fallback
    const cookieMatch = document.cookie.match(/locale=([^;]+)/);
    if (cookieMatch) {
      const cookieLocale = cookieMatch[1] as Locale;
      if (locales.includes(cookieLocale)) {
        return cookieLocale;
      }
    }
  } catch (error) {
    console.log("Could not read stored language:", error);
  }

  return defaultLocale;
}

// Detect browser language as fallback
export function detectBrowserLanguage(): Locale {
  if (typeof window === "undefined") return defaultLocale;

  try {
    const browserLang = navigator.language.toLowerCase();

    if (browserLang.startsWith("zh")) return "zh-CN";
    if (browserLang.startsWith("km") || browserLang.startsWith("kh"))
      return "kh";
    if (browserLang.startsWith("en")) return "en";
  } catch (error) {
    console.log("Could not detect browser language:", error);
  }

  return defaultLocale;
}

// Initialize language on first visit
export function initializeLanguage(): Locale {
  const stored = getStoredLanguage();
  if (stored !== defaultLocale) {
    return stored;
  }

  // If no stored preference, detect from browser
  const detected = detectBrowserLanguage();
  if (detected !== defaultLocale) {
    setLanguagePreference(detected);
    return detected;
  }

  return defaultLocale;
}
