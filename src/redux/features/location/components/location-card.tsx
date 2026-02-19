"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  Edit,
  Trash2,
  Star,
  Navigation,
  StickyNote,
  MoreVertical,
  CheckCircle2,
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
    <Card
      className={`group relative transition-all duration-200 hover:shadow-md ${
        isPrimary
          ? "border-primary ring-1 ring-primary/20 shadow-sm"
          : "hover:border-border/80"
      }`}
    >
      <CardContent className="p-5">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                isPrimary
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
              }`}
            >
              <LabelIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate text-base">
                {location.label}
              </h3>
              {isPrimary && (
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  <span className="text-xs text-primary font-medium">
                    Primary location
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {!isPrimary && (
                <>
                  <DropdownMenuItem
                    onClick={() => onSetPrimary(location)}
                    disabled={isSettingPrimary}
                  >
                    <Star className="h-4 w-4 mr-2 text-amber-500" />
                    {isSettingPrimary ? "Setting..." : "Set as Primary"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => onEdit(location)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(location)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── Address ── */}
        <div className="flex items-start gap-2 mb-3">
          <Navigation className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {formatLocationAddress(location)}
          </p>
        </div>

        {/* ── Coordinates ── */}
        {location.hasCoordinates && (
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin className="h-3 w-3 text-red-400 shrink-0" />
            <span className="text-xs font-mono text-muted-foreground">
              {(location.latitude || 0).toFixed(5)},{" "}
              {(location.longitude || 0).toFixed(5)}
            </span>
          </div>
        )}

        {/* ── Note ── */}
        {location.note && (
          <div className="flex items-start gap-2 mb-4">
            <StickyNote className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground italic line-clamp-1">
              {location.note}
            </p>
          </div>
        )}

        {/* ── Footer actions ── */}
        <div className="flex items-center gap-2 pt-3 border-t">
          {!isPrimary && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8"
              onClick={() => onSetPrimary(location)}
              disabled={isSettingPrimary}
            >
              <Star className="h-3 w-3 mr-1.5 text-amber-500" />
              {isSettingPrimary ? "Setting..." : "Set Primary"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => onEdit(location)}
          >
            <Edit className="h-3 w-3 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/5"
            onClick={() => onDelete(location)}
          >
            <Trash2 className="h-3 w-3 mr-1.5" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
