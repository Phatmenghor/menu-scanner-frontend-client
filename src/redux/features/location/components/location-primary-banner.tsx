"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import { LocationResponseModel } from "../store/models/response/location-response";
import { formatLocationAddress } from "../utils/location-helpers";

interface LocationPrimaryBannerProps {
  location: LocationResponseModel;
}

export function LocationPrimaryBanner({ location }: LocationPrimaryBannerProps) {
  return (
    <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
        <Star className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-foreground">
            Primary Location
          </p>
          <Badge variant="default" className="text-xs">
            {location.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {formatLocationAddress(location)}
        </p>
        {location.hasCoordinates && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <MapPin className="h-3 w-3 text-red-400 shrink-0" />
            <p className="text-xs font-mono text-muted-foreground/70">
              {(location.latitude || 0).toFixed(5)},{" "}
              {(location.longitude || 0).toFixed(5)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
