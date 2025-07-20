import { locales } from "@/i18n";

export enum Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const STATUS_FILTER = [
  { value: "ALL", label: "All Status" },
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.INACTIVE, label: "Inactive" },
];

// Define locale display names and flags
export const localeConfig = {
  en: {
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    code: "EN",
  },
  kh: {
    name: "Khmer",
    nativeName: "ខ្មែរ",
    flag: "🇰🇭",
    code: "KH",
  },
  "zh-CN": {
    name: "Chinese",
    nativeName: "简体中文",
    flag: "🇨🇳",
    code: "ZH",
  },
} as const;
