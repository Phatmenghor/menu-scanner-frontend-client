import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "kh", "zh-CN"] as const;
export const defaultLocale = "en" as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  const locale: Locale = defaultLocale;
  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    console.log("Messages loaded successfully for:", locale);

    return {
      messages,
      locale,
      timeZone: "Asia/Phnom_Penh",
    };
  } catch (error) {
    console.error("Failed to load messages for locale:", locale, error);

    return {
      locale: defaultLocale,
      messages: {},
      timeZone: "Asia/Phnom_Penh",
    };
  }
});
