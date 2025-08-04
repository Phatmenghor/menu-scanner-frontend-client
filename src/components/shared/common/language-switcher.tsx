"use client";

import { locales, type Locale } from "@/i18n/request";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Languages, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { localeConfig } from "@/constants/app-resource/language/language";

interface LanguageSwitcherProps {
  variant?: "default" | "compact" | "flag-only";
  showBadge?: boolean;
  className?: string;
}

// Helper function to store locale preference
function storeLocalePreference(locale: Locale) {
  // Store in localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("locale", locale);
  }

  // Store in cookie
  document.cookie = `locale=${locale}; path=/; max-age=${365 * 24 * 60 * 60}`; // 1 year
}

export default function LanguageSwitcher({
  variant = "default",
  showBadge = false,
  className,
}: LanguageSwitcherProps) {
  const currentLocale = useLocale() as Locale;
  const t = useTranslations("common");
  const [isClient, setIsClient] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    startTransition(() => {
      // Store the new locale preference
      storeLocalePreference(newLocale);

      // Reload the page to apply the new locale
      // This will pick up the new locale from localStorage/cookies
      window.location.reload();
    });
  };

  // Don't render until client-side to avoid hydration mismatch
  if (!isClient) {
    return (
      <div
        className={cn("w-10 h-10 animate-pulse bg-muted rounded-md", className)}
      />
    );
  }

  const currentLocaleConfig =
    localeConfig[currentLocale as keyof typeof localeConfig];

  // Compact variant - just flag and code
  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 px-2", className)}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span className="text-sm">{currentLocaleConfig.flag}</span>
                <span className="ml-1 text-xs font-medium">
                  {currentLocaleConfig.code}
                </span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {locales.map((locale) => {
            const config = localeConfig[locale as keyof typeof localeConfig];
            const isSelected = locale === currentLocale;

            return (
              <DropdownMenuItem
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                className={cn(
                  "flex items-center justify-between cursor-pointer",
                  isSelected && "bg-accent"
                )}
                disabled={isPending}
              >
                <div className="flex items-center gap-2">
                  <span>{config.flag}</span>
                  <span className="font-medium">{config.nativeName}</span>
                </div>
                {isSelected && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Flag only variant
  if (variant === "flag-only") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", className)}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <img
                src={currentLocaleConfig.flag}
                alt={`${currentLocaleConfig.nativeName} flag`}
                className="w-5 h-4 object-cover rounded-sm"
              />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {locales.map((locale) => {
            const config = localeConfig[locale as keyof typeof localeConfig];
            const isSelected = locale === currentLocale;

            return (
              <DropdownMenuItem
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                className={cn(
                  "flex items-center justify-between cursor-pointer",
                  isSelected && "bg-accent"
                )}
                disabled={isPending}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={config.flag}
                    alt={`${config.nativeName} flag`}
                    className="w-5 h-4 object-cover rounded-sm"
                  />
                  <span className="font-medium">{config.nativeName}</span>
                </div>
                {isSelected && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant - full featured
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showBadge && (
        <Badge variant="secondary" className="text-xs">
          {t("language")}
        </Badge>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Languages className="h-4 w-4 mr-2" />
            )}
            <span className="hidden sm:inline-block mr-1">
              {currentLocaleConfig.flag}
            </span>
            <span className="font-medium">
              {currentLocaleConfig.nativeName}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-muted-foreground">
              {t("selectLanguage")}
            </p>
          </div>

          {locales.map((locale) => {
            const config = localeConfig[locale as keyof typeof localeConfig];
            const isSelected = locale === currentLocale;

            return (
              <DropdownMenuItem
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                className={cn(
                  "flex items-center justify-between cursor-pointer py-2",
                  isSelected && "bg-accent"
                )}
                disabled={isPending}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{config.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{config.nativeName}</span>
                    <span className="text-xs text-muted-foreground">
                      {config.name}
                    </span>
                  </div>
                </div>
                {isSelected && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
