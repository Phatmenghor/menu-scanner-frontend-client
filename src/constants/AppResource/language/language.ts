const AppLanguageFlag = {
  kh: "/flags/kh.svg",
  usa: "/flags/usa.svg",
  "zh-CN": "/flags/zh-CN.svg",
};

// Define locale display names and flags
export const localeConfig = {
  en: {
    name: "English",
    nativeName: "English",
    flag: AppLanguageFlag.usa,
    code: "EN",
  },
  kh: {
    name: "Khmer",
    nativeName: "ខ្មែរ",
    flag: AppLanguageFlag.kh,
    code: "KH",
  },
  "zh-CN": {
    name: "Chinese",
    nativeName: "简体中文",
    flag: AppLanguageFlag["zh-CN"],
    code: "ZH",
  },
} as const;
