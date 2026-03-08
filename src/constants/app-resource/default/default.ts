export const AppDefault = {
  RESET_PASSWORD: "88889999",
  BUSINESS_ID: "85bbdf31-e034-45ad-8a20-71b7638667d2",
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
