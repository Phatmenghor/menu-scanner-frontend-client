import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "kh", "zh-CN"] as const;
export const defaultLocale = "en" as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  // For clean URLs without locale routing, we'll handle locale dynamically on client
  // Server always uses default locale for initial render
  const locale: Locale = defaultLocale;

  console.log("=== i18n getRequestConfig (Server-side) ===");
  console.log("Server using locale:", locale);

  try {
    // Always load default locale messages for server-side rendering
    const messages = (await import(`../messages/${locale}.json`)).default;
    console.log("Messages loaded successfully for:", locale);

    return {
      messages,
      locale,
      // Add timezone configuration to prevent hydration mismatches
      timeZone: "Asia/Phnom_Penh", // Cambodia timezone
      // Alternative: Use UTC for consistency across environments
      // timeZone: "UTC",
    };
  } catch (error) {
    console.error("Failed to load messages for locale:", locale, error);

    // Return empty messages as fallback
    return {
      locale: defaultLocale,
      messages: {},
      timeZone: "Asia/Phnom_Penh", // Add timezone to fallback as well
    };
  }
});
