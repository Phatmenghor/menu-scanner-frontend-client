import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const locales = ["en", "kh", "zh-CN"] as const;
export const defaultLocale = "en" as const;
export type Locale = (typeof locales)[number];

// Helper function to detect locale from various sources
function detectLocale(): Locale {
  // Check if we're on the server
  if (typeof window === "undefined") {
    try {
      // 1. First, check cookies
      const cookieStore = cookies();
      const localeCookie = cookieStore.get("locale")?.value as Locale;
      if (localeCookie && locales.includes(localeCookie)) {
        return localeCookie;
      }
    } catch (error) {
      // Cookies might not be available in all contexts
      console.log("Could not read cookies:", error);
    }
  } else {
    // Client-side: check localStorage
    try {
      const stored = localStorage.getItem("locale") as Locale;
      if (stored && locales.includes(stored)) {
        return stored;
      }
    } catch (error) {
      console.log("Could not read localStorage:", error);
    }

    // Check browser language
    const browserLang = navigator.language;
    if (browserLang.startsWith("zh")) return "zh-CN";
    if (browserLang.startsWith("km")) return "kh";
  }

  return defaultLocale;
}

export default getRequestConfig(async ({ locale }) => {
  // Since we're not using locale routing, we need to detect locale ourselves
  const detectedLocale = locale || detectLocale();

  console.log("=== i18n getRequestConfig (No Routing) ===");
  console.log("Detected locale:", detectedLocale);

  // Validate that the detected locale is valid
  const validLocale = locales.includes(detectedLocale as Locale)
    ? (detectedLocale as Locale)
    : defaultLocale;

  console.log("Using locale:", validLocale);

  try {
    const messages = (await import(`../messages/${validLocale}.json`)).default;
    console.log("Messages loaded successfully for:", validLocale);

    return {
      messages,
      locale: validLocale,
    };
  } catch (error) {
    console.error("Failed to load messages for locale:", validLocale, error);

    // Fallback to default locale messages
    try {
      const fallbackMessages = (
        await import(`../messages/${defaultLocale}.json`)
      ).default;
      console.log("Fallback messages loaded for:", defaultLocale);

      return {
        locale: defaultLocale,
        messages: fallbackMessages,
      };
    } catch (fallbackError) {
      console.error("Failed to load fallback messages:", fallbackError);

      // Return empty messages as last resort
      return {
        locale: defaultLocale,
        messages: {},
      };
    }
  }
});
