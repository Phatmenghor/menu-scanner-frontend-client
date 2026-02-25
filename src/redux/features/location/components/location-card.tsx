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
  Navigation,
  StickyNote,
  Loader2,
  Crown,
  ChevronRight,
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

const LABEL_COLORS: Record<string, { bg: string; icon: string; activeBg: string }> = {
  home: { bg: "bg-blue-50 dark:bg-blue-950/30", icon: "text-blue-600 dark:text-blue-400", activeBg: "bg-blue-100 dark:bg-blue-900/40" },
  house: { bg: "bg-blue-50 dark:bg-blue-950/30", icon: "text-blue-600 dark:text-blue-400", activeBg: "bg-blue-100 dark:bg-blue-900/40" },
  office: { bg: "bg-violet-50 dark:bg-violet-950/30", icon: "text-violet-600 dark:text-violet-400", activeBg: "bg-violet-100 dark:bg-violet-900/40" },
  work: { bg: "bg-violet-50 dark:bg-violet-950/30", icon: "text-violet-600 dark:text-violet-400", activeBg: "bg-violet-100 dark:bg-violet-900/40" },
  shop: { bg: "bg-orange-50 dark:bg-orange-950/30", icon: "text-orange-600 dark:text-orange-400", activeBg: "bg-orange-100 dark:bg-orange-900/40" },
  store: { bg: "bg-orange-50 dark:bg-orange-950/30", icon: "text-orange-600 dark:text-orange-400", activeBg: "bg-orange-100 dark:bg-orange-900/40" },
  building: { bg: "bg-slate-50 dark:bg-slate-950/30", icon: "text-slate-600 dark:text-slate-400", activeBg: "bg-slate-100 dark:bg-slate-900/40" },
  apartment: { bg: "bg-slate-50 dark:bg-slate-950/30", icon: "text-slate-600 dark:text-slate-400", activeBg: "bg-slate-100 dark:bg-slate-900/40" },
  love: { bg: "bg-rose-50 dark:bg-rose-950/30", icon: "text-rose-600 dark:text-rose-400", activeBg: "bg-rose-100 dark:bg-rose-900/40" },
  family: { bg: "bg-rose-50 dark:bg-rose-950/30", icon: "text-rose-600 dark:text-rose-400", activeBg: "bg-rose-100 dark:bg-rose-900/40" },
};

function getLabelColor(label?: string | null) {
  if (!label) return null;
  const lower = label.toLowerCase();
  for (const [key, c] of Object.entries(LABEL_COLORS)) {
    if (lower.includes(key)) return c;
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
  const labelColor = getLabelColor(location.label);
  const images = location.locationImages ?? [];
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <>
      {/* Image lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[300] bg-black/85 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="Location" className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl" />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 rounded-full bg-white/20 text-white p-2 hover:bg-white/40 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div
        onClick={() => onClick?.(location)}
        className={cn(
          "group flex items-start gap-3 p-4 rounded-xl border bg-card transition-all duration-200",
          onClick && "cursor-pointer",
          isSelected
            ? labelColor
              ? `${labelColor.activeBg} border-current ring-2 ring-offset-1 shadow-md`
              : "bg-primary/8 border-primary/50 ring-2 ring-primary/30 ring-offset-1 shadow-md"
            : isPrimary
            ? "border-amber-300/70 ring-1 ring-amber-200/60 shadow-sm bg-amber-50/30 dark:bg-amber-950/10 dark:border-amber-700/50"
            : "border-border/60 hover:border-border hover:shadow-sm"
        )}
      >
        {/* Left icon */}
        <div
          className={cn(
            "p-2.5 rounded-xl shrink-0 mt-0.5 transition-colors",
            isPrimary
              ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
              : labelColor
              ? `${isSelected ? labelColor.activeBg : labelColor.bg} ${labelColor.icon}`
              : isSelected
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground group-hover:bg-primary/8 group-hover:text-primary"
          )}
        >
          <LabelIcon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className={cn(
              "font-semibold text-sm truncate",
              isPrimary
                ? "text-amber-700 dark:text-amber-400"
                : isSelected && labelColor
                ? labelColor.icon
                : isSelected
                ? "text-primary"
                : "text-foreground"
            )}>
              {location.label}
            </h3>
            {isPrimary && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 shrink-0">
                <Crown className="h-2.5 w-2.5 mr-0.5" />
                Primary
              </Badge>
            )}
            {isSelected && !isPrimary && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold shrink-0 bg-primary/10 text-primary border-primary/20">
                Selected
              </Badge>
            )}
          </div>

          {/* Address */}
          <div className="flex items-start gap-1.5 mb-1.5">
            <Navigation className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {formatLocationAddress(location)}
            </p>
          </div>

          {/* Coords + Note */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-2">
            {location.hasCoordinates && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-red-400 shrink-0" />
                <span className="text-xs font-mono text-muted-foreground/80">
                  {(location.latitude || 0).toFixed(4)}, {(location.longitude || 0).toFixed(4)}
                </span>
              </div>
            )}
            {location.note && (
              <div className="flex items-center gap-1 max-w-[180px]">
                <StickyNote className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground italic truncate">{location.note}</span>
              </div>
            )}
          </div>

          {/* Image thumbnails */}
          {images.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-1">
              {images.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-12 w-12 rounded-md overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); setLightbox(img.imageUrl); }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.imageUrl} alt={`img-${idx}`} className="w-full h-full object-cover" />
                  {idx === 3 && images.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">+{images.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          {onClick && (
            <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center mb-1 transition-colors",
              isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
            )}>
              {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
          )}
          {!isPrimary && (
            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              onClick={(e) => { e.stopPropagation(); onSetPrimary(location); }}
              disabled={isSettingPrimary}
              title="Set as primary"
            >
              {isSettingPrimary ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
            </Button>
          )}
          <Button
            variant="ghost" size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
            onClick={(e) => { e.stopPropagation(); onEdit(location); }}
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/8"
            onClick={(e) => { e.stopPropagation(); onDelete(location); }}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
