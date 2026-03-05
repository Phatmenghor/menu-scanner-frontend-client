export const AppDefault = {
  RESET_PASSWORD: "88889999",
  BUSINESS_ID: "e502ce0d-6f36-4390-ae79-7c54f7dd8c86",
  PAGE_SIZE: 15,
  PAGE_SIZE_OPTIONS: [10, 15, 20, 50, 100],
};

/**
 * Social Auth Configuration
 */
export const SocialAuthConfig = {
  // Telegram Bot username (without @) - used for widget script
  TELEGRAM_BOT_NAME:
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "CambodiaEMenuBot",
  // Telegram Bot numeric ID - used for OAuth popup
  TELEGRAM_BOT_ID: process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || "8464259107",
};
