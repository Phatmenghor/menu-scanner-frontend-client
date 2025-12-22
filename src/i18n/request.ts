import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const locales = ["en", "kh", "zh-CN"] as const;
export const defaultLocale = "en" as const;
export type Locale = (typeof locales)[number];

/**
 * Get locale from cookies or use default
 */
async function getLocale(): Promise<Locale> {
  const cookieStore = cookies();
  const localeCookie = cookieStore.get("locale");

  if (localeCookie?.value && locales.includes(localeCookie.value as Locale)) {
    return localeCookie.value as Locale;
  }

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await getLocale();

  try {
    const messages = (await import(`../messages/${locale}.json`)).default;

    return {
      locale,
      messages,
      timeZone: "Asia/Phnom_Penh",
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);

    // Fallback to default locale
    const fallbackMessages = (await import(`../messages/${defaultLocale}.json`))
      .default;

    return {
      locale: defaultLocale,
      messages: fallbackMessages,
      timeZone: "Asia/Phnom_Penh",
    };
  }
});
