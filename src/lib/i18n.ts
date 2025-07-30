export const locales = ["en", "zh-CN", "kh"] as const;
export const defaultLocale = "en" as const;
export type Locale = (typeof locales)[number];

export function getLocale(request?: Request): Locale {
  if (typeof window !== "undefined") {
    // Client-side: check browser language
    const stored = localStorage.getItem("locale") as Locale;
    if (stored && locales.includes(stored)) {
      return stored;
    }

    const browserLang = navigator.language;
    if (browserLang.startsWith("zh")) return "zh-CN";
    if (browserLang.startsWith("km")) return "kh";
    return defaultLocale;
  }

  // Server-side: check Accept-Language header
  if (request) {
    const acceptLanguage = request.headers.get("accept-language");
    if (acceptLanguage) {
      if (acceptLanguage.includes("zh")) return "zh-CN";
      if (acceptLanguage.includes("km")) return "kh";
    }
  }

  return defaultLocale;
}

export async function getMessages(locale: Locale = defaultLocale) {
  try {
    const messages = await import(`@/messages/${locale}.json`);
    return messages.default;
  } catch (error) {
    console.warn(
      `Failed to load messages for ${locale}, falling back to ${defaultLocale}`
    );
    const fallback = await import(`@/messages/${defaultLocale}.json`);
    return fallback.default;
  }
}
