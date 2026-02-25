"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Edit,
  Trash2,
  Star,
  Navigation,
  StickyNote,
  Loader2,
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

  return (
    <div
      className={cn(
        "group flex items-start gap-4 p-4 rounded-xl border bg-card transition-all duration-200 hover:shadow-sm",
        isPrimary
          ? "border-primary/50 ring-1 ring-primary/20 shadow-sm"
          : "hover:border-border/80"
      )}
    >
      {/* Left: icon */}
      <div
        className={cn(
          "p-2.5 rounded-xl shrink-0 mt-0.5 transition-colors",
          isPrimary
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
        )}
      >
        <LabelIcon className="h-5 w-5" />
      </div>

      {/* Middle: content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="font-semibold text-sm text-foreground truncate">
            {location.label}
          </h3>
          {isPrimary && (
            <Star className="h-3.5 w-3.5 text-amber-500 shrink-0 fill-amber-500" />
          )}
        </div>

        <div className="flex items-start gap-1.5 mb-1.5">
          <Navigation className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {formatLocationAddress(location)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
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
            <div className="flex items-center gap-1 max-w-[200px]">
              <StickyNote className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground italic truncate">
                {location.note}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 shrink-0">
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
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => onEdit(location)}
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
          onClick={() => onDelete(location)}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
