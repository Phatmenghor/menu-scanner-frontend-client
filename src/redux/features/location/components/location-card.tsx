"use client";

import React from "react";
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
  Image as ImageIcon,
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
  onEdit: (location: LocationResponseModel) => void;
  onDelete: (location: LocationResponseModel) => void;
  onSetPrimary: (location: LocationResponseModel) => void;
}

const LABEL_COLORS: Record<string, { bg: string; icon: string; border: string }> = {
  home: { bg: "bg-blue-50 dark:bg-blue-950/30", icon: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  house: { bg: "bg-blue-50 dark:bg-blue-950/30", icon: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  office: { bg: "bg-violet-50 dark:bg-violet-950/30", icon: "text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-800" },
  work: { bg: "bg-violet-50 dark:bg-violet-950/30", icon: "text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-800" },
  shop: { bg: "bg-orange-50 dark:bg-orange-950/30", icon: "text-orange-600 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800" },
  store: { bg: "bg-orange-50 dark:bg-orange-950/30", icon: "text-orange-600 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800" },
  building: { bg: "bg-slate-50 dark:bg-slate-950/30", icon: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700" },
  apartment: { bg: "bg-slate-50 dark:bg-slate-950/30", icon: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700" },
  love: { bg: "bg-rose-50 dark:bg-rose-950/30", icon: "text-rose-600 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800" },
  family: { bg: "bg-rose-50 dark:bg-rose-950/30", icon: "text-rose-600 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800" },
};

function getLabelColor(label?: string | null) {
  if (!label) return null;
  const lower = label.toLowerCase();
  for (const [key, colors] of Object.entries(LABEL_COLORS)) {
    if (lower.includes(key)) return colors;
  }
  return null;
}

export function LocationCard({
  location,
  settingPrimaryId,
  onEdit,
  onDelete,
  onSetPrimary,
}: LocationCardProps) {
  const LabelIcon = getLabelIcon(location.label);
  const isPrimary = isLocationPrimary(location);
  const isSettingPrimary = settingPrimaryId === location.id;
  const labelColor = getLabelColor(location.label);
  const imageCount = location.locationImages?.length ?? 0;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-4 rounded-xl border bg-card transition-all duration-200",
        isPrimary
          ? "border-amber-300/70 ring-1 ring-amber-200/60 shadow-sm bg-amber-50/30 dark:bg-amber-950/10 dark:border-amber-700/50"
          : "border-border/60 hover:border-border hover:shadow-sm"
      )}
    >
      {/* Left: colored icon */}
      <div
        className={cn(
          "p-2.5 rounded-xl shrink-0 mt-0.5 transition-colors",
          isPrimary
            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
            : labelColor
            ? `${labelColor.bg} ${labelColor.icon}`
            : "bg-muted text-muted-foreground group-hover:bg-primary/8 group-hover:text-primary"
        )}
      >
        <LabelIcon className="h-5 w-5" />
      </div>

      {/* Middle: content */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-center gap-1.5 mb-1">
          <h3
            className={cn(
              "font-semibold text-sm truncate",
              isPrimary
                ? "text-amber-700 dark:text-amber-400"
                : labelColor
                ? labelColor.icon
                : "text-foreground"
            )}
          >
            {location.label}
          </h3>
          {isPrimary && (
            <Badge
              variant="secondary"
              className="h-5 px-1.5 text-[10px] font-semibold bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-700 shrink-0"
            >
              <Crown className="h-2.5 w-2.5 mr-0.5" />
              Primary
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

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          {location.hasCoordinates && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-red-400 shrink-0" />
              <span className="text-xs font-mono text-muted-foreground/80">
                {(location.latitude || 0).toFixed(4)},{" "}
                {(location.longitude || 0).toFixed(4)}
              </span>
            </div>
          )}
          {location.note && (
            <div className="flex items-center gap-1 max-w-[180px]">
              <StickyNote className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground italic truncate">
                {location.note}
              </span>
            </div>
          )}
          {imageCount > 0 && (
            <div className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">
                {imageCount} photo{imageCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        {!isPrimary && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            onClick={() => onSetPrimary(location)}
            disabled={isSettingPrimary}
            title="Set as primary"
          >
            {isSettingPrimary ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Star className="h-4 w-4" />
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          onClick={() => onEdit(location)}
          title="Edit"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/8"
          onClick={() => onDelete(location)}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
