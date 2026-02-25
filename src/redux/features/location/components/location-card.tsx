"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Edit2,
  Trash2,
  Star,
  StickyNote,
  Loader2,
  Crown,
  CheckCircle2,
  X,
} from "lucide-react";
import { LocationResponseModel } from "../store/models/response/location-response";
import {
  getLabelIcon,
  formatLocationAddress,
  isLocationPrimary,
} from "../utils/location-helpers";

interface LocationCardProps {
  location: LocationResponseModel;
  settingPrimaryId: string | null;
  isSelected?: boolean;
  onEdit: (location: LocationResponseModel) => void;
  onDelete: (location: LocationResponseModel) => void;
  onSetPrimary: (location: LocationResponseModel) => void;
  onClick?: (location: LocationResponseModel) => void;
}

// Label → theme colours
const LABEL_THEME: Record<string, { bg: string; text: string; accent: string; activeBg: string }> = {
  home:      { bg: "bg-blue-100 dark:bg-blue-900/40",     text: "text-blue-600 dark:text-blue-400",    accent: "bg-blue-500",    activeBg: "bg-blue-50 dark:bg-blue-950/40"    },
  house:     { bg: "bg-blue-100 dark:bg-blue-900/40",     text: "text-blue-600 dark:text-blue-400",    accent: "bg-blue-500",    activeBg: "bg-blue-50 dark:bg-blue-950/40"    },
  office:    { bg: "bg-violet-100 dark:bg-violet-900/40", text: "text-violet-600 dark:text-violet-400",accent: "bg-violet-500",  activeBg: "bg-violet-50 dark:bg-violet-950/40"},
  work:      { bg: "bg-violet-100 dark:bg-violet-900/40", text: "text-violet-600 dark:text-violet-400",accent: "bg-violet-500",  activeBg: "bg-violet-50 dark:bg-violet-950/40"},
  shop:      { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-600 dark:text-orange-400",accent: "bg-orange-500",  activeBg: "bg-orange-50 dark:bg-orange-950/40"},
  store:     { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-600 dark:text-orange-400",accent: "bg-orange-500",  activeBg: "bg-orange-50 dark:bg-orange-950/40"},
  building:  { bg: "bg-slate-100 dark:bg-slate-900/40",   text: "text-slate-600 dark:text-slate-400",  accent: "bg-slate-500",   activeBg: "bg-slate-50 dark:bg-slate-950/40" },
  apartment: { bg: "bg-slate-100 dark:bg-slate-900/40",   text: "text-slate-600 dark:text-slate-400",  accent: "bg-slate-500",   activeBg: "bg-slate-50 dark:bg-slate-950/40" },
  family:    { bg: "bg-rose-100 dark:bg-rose-900/40",     text: "text-rose-600 dark:text-rose-400",    accent: "bg-rose-500",    activeBg: "bg-rose-50 dark:bg-rose-950/40"   },
  love:      { bg: "bg-rose-100 dark:bg-rose-900/40",     text: "text-rose-600 dark:text-rose-400",    accent: "bg-rose-500",    activeBg: "bg-rose-50 dark:bg-rose-950/40"   },
};

function getLabelTheme(label?: string | null) {
  if (!label) return null;
  const lower = label.toLowerCase();
  for (const [key, t] of Object.entries(LABEL_THEME)) {
    if (lower.includes(key)) return t;
  }
  return null;
}

export function LocationCard({
  location,
  settingPrimaryId,
  isSelected = false,
  onEdit,
  onDelete,
  onSetPrimary,
  onClick,
}: LocationCardProps) {
  const LabelIcon = getLabelIcon(location.label);
  const isPrimary = isLocationPrimary(location);
  const isSettingPrimary = settingPrimaryId === location.id;
  const theme = getLabelTheme(location.label);
  const images = location.locationImages ?? [];
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[300] bg-black/85 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Location"
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 rounded-full bg-white/20 text-white p-2 hover:bg-white/40 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Card */}
      <div
        onClick={() => onClick?.(location)}
        className={cn(
          "group relative rounded-xl border bg-card overflow-hidden transition-all duration-200 shadow-sm",
          onClick && "cursor-pointer select-none",
          isSelected
            ? "border-primary/50 shadow-md ring-2 ring-primary/20 ring-offset-1"
            : isPrimary
            ? "border-amber-300/70 dark:border-amber-700/50 shadow-sm"
            : "border-border/60 hover:border-border hover:shadow-md"
        )}
      >
        {/* Left accent strip */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-[3px]",
            isSelected
              ? "bg-primary"
              : isPrimary
              ? "bg-amber-400 dark:bg-amber-500"
              : theme
              ? theme.accent
              : "bg-transparent"
          )}
        />

        <div className="pl-4 pr-3 py-3.5">
          {/* ── Header row ── */}
          <div className="flex items-start gap-3">
            {/* Icon bubble */}
            <div
              className={cn(
                "p-2.5 rounded-xl shrink-0 transition-colors",
                isPrimary
                  ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                  : theme
                  ? `${isSelected ? theme.activeBg : theme.bg} ${theme.text}`
                  : isSelected
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/8 group-hover:text-primary"
              )}
            >
              <LabelIcon className="h-4 w-4" />
            </div>

            {/* Label + address */}
            <div className="flex-1 min-w-0 pt-0.5">
              {/* Label + badges row */}
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span
                  className={cn(
                    "text-sm font-semibold leading-none truncate",
                    isPrimary
                      ? "text-amber-700 dark:text-amber-400"
                      : isSelected && theme
                      ? theme.text
                      : isSelected
                      ? "text-primary"
                      : "text-foreground"
                  )}
                >
                  {location.label || "Location"}
                </span>

                {isPrimary && (
                  <Badge className="h-[18px] px-1.5 text-[9px] font-bold tracking-wide bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-700/50 shrink-0">
                    <Crown className="h-2.5 w-2.5 mr-0.5" />
                    Primary
                  </Badge>
                )}

                {isSelected && !isPrimary && (
                  <Badge className="h-[18px] px-1.5 text-[9px] font-bold tracking-wide bg-primary/10 text-primary border-primary/25 shrink-0">
                    <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                    Selected
                  </Badge>
                )}
              </div>

              {/* Address */}
              <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                {formatLocationAddress(location)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 shrink-0 -mt-0.5">
              {!isPrimary && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  onClick={(e) => { e.stopPropagation(); onSetPrimary(location); }}
                  disabled={isSettingPrimary}
                  title="Set as primary"
                >
                  {isSettingPrimary
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Star className="h-3.5 w-3.5" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                onClick={(e) => { e.stopPropagation(); onEdit(location); }}
                title="Edit"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => { e.stopPropagation(); onDelete(location); }}
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* ── Metadata row ── */}
          {(location.hasCoordinates || location.note) && (
            <div className="mt-2 ml-[52px] flex flex-wrap items-center gap-x-3 gap-y-1">
              {location.hasCoordinates && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-red-400 shrink-0" />
                  <span className="text-[11px] font-mono text-muted-foreground/80">
                    {(location.latitude || 0).toFixed(4)},{" "}
                    {(location.longitude || 0).toFixed(4)}
                  </span>
                </div>
              )}
              {location.note && (
                <div className="flex items-center gap-1 max-w-[220px]">
                  <StickyNote className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                  <span className="text-[11px] text-muted-foreground italic truncate">
                    {location.note}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Image thumbnails ── */}
          {images.length > 0 && (
            <div className="mt-2.5 ml-[52px] flex gap-1.5">
              {images.slice(0, 5).map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-11 w-11 rounded-lg overflow-hidden border border-border/50 cursor-pointer hover:opacity-75 hover:scale-105 transition-all duration-150 shadow-sm"
                  onClick={(e) => { e.stopPropagation(); setLightbox(img.imageUrl); }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  {idx === 4 && images.length > 5 && (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                      <span className="text-white text-[11px] font-bold">+{images.length - 5}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selection ring indicator (bottom-right) */}
        {onClick && (
          <div
            className={cn(
              "absolute bottom-3.5 right-3 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
              isSelected
                ? "border-primary bg-primary scale-110"
                : "border-muted-foreground/25 bg-background group-hover:border-muted-foreground/50"
            )}
          >
            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
          </div>
        )}
      </div>
    </>
  );
}
