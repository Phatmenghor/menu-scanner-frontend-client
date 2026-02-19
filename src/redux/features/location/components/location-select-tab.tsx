"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Loader2,
  Navigation2,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import {
  ProvinceResponseModel,
  DistrictResponseModel,
  CommuneResponseModel,
  VillageResponseModel,
} from "../store/models/response/location-response";

interface SelectTabLoading {
  provinces: boolean;
  districts: boolean;
  communes: boolean;
  villages: boolean;
}

interface LocationSelectTabProps {
  // Data
  provinces: ProvinceResponseModel[];
  districts: DistrictResponseModel[];
  communes: CommuneResponseModel[];
  villages: VillageResponseModel[];

  // Selected values
  selectedProvince: ProvinceResponseModel | null;
  selectedDistrict: DistrictResponseModel | null;
  selectedCommune: CommuneResponseModel | null;
  selectedVillage: VillageResponseModel | null;

  // Loading
  loading: SelectTabLoading;

  // Geocode state
  isGeocodingAddress: boolean;
  geocodedCoords: { lat: number; lng: number } | null;
  geocodeSuccess: boolean;

  // Address preview text
  addressPreview: string | null;

  // Handlers
  onProvinceChange: (code: string) => void;
  onDistrictChange: (code: string) => void;
  onCommuneChange: (code: string) => void;
  onVillageChange: (code: string) => void;
  onGetCoordinates: () => void;
}

function HierarchyLabel({
  level,
  children,
}: {
  level: 1 | 2 | 3;
  children: React.ReactNode;
}) {
  return (
    <span className="text-sm font-medium flex items-center gap-0.5">
      {Array.from({ length: level }).map((_, i) => (
        <ChevronRight
          key={i}
          className={`h-3.5 w-3.5 text-muted-foreground ${i > 0 ? "-ml-2.5" : ""}`}
        />
      ))}
      {children}
    </span>
  );
}

export function LocationSelectTab({
  provinces,
  districts,
  communes,
  villages,
  selectedProvince,
  selectedDistrict,
  selectedCommune,
  selectedVillage,
  loading,
  isGeocodingAddress,
  geocodedCoords,
  geocodeSuccess,
  addressPreview,
  onProvinceChange,
  onDistrictChange,
  onCommuneChange,
  onVillageChange,
  onGetCoordinates,
}: LocationSelectTabProps) {
  return (
    <div className="space-y-4">
      {/* ── Hierarchy selectors ── */}
      <div className="bg-muted/40 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Navigation2 className="h-4 w-4 text-primary shrink-0" />
          <p>
            Select your location hierarchy, then click &quot;Get
            Coordinates&quot; to resolve lat/lng.
          </p>
        </div>

        {/* Province */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">
            Province / City <span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedProvince?.provinceCode ?? ""}
            onValueChange={onProvinceChange}
            disabled={loading.provinces}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  loading.provinces ? "Loading provinces..." : "Select province..."
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {provinces.map((p) => (
                <SelectItem key={p.provinceCode} value={p.provinceCode}>
                  {p.provinceEn}
                  <span className="ml-2 text-muted-foreground text-xs">
                    {p.provinceKh}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District */}
        <div className="space-y-1.5">
          <Label>
            <HierarchyLabel level={1}>District / Khan</HierarchyLabel>
          </Label>
          <Select
            value={selectedDistrict?.districtCode ?? ""}
            onValueChange={onDistrictChange}
            disabled={!selectedProvince || loading.districts}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !selectedProvince
                    ? "Select province first"
                    : loading.districts
                    ? "Loading districts..."
                    : "Select district..."
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {districts.map((d) => (
                <SelectItem key={d.districtCode} value={d.districtCode}>
                  {d.districtEn}
                  <span className="ml-2 text-muted-foreground text-xs">
                    {d.districtKh}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Commune */}
        <div className="space-y-1.5">
          <Label>
            <HierarchyLabel level={2}>Commune / Sangkat</HierarchyLabel>
          </Label>
          <Select
            value={selectedCommune?.communeCode ?? ""}
            onValueChange={onCommuneChange}
            disabled={!selectedDistrict || loading.communes}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !selectedDistrict
                    ? "Select district first"
                    : loading.communes
                    ? "Loading communes..."
                    : "Select commune..."
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {communes.map((c) => (
                <SelectItem key={c.communeCode} value={c.communeCode}>
                  {c.communeEn}
                  <span className="ml-2 text-muted-foreground text-xs">
                    {c.communeKh}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Village */}
        <div className="space-y-1.5">
          <Label>
            <HierarchyLabel level={3}>
              Village / Phum
              <span className="text-muted-foreground text-xs font-normal ml-1">
                (optional)
              </span>
            </HierarchyLabel>
          </Label>
          <Select
            value={selectedVillage?.villageCode ?? ""}
            onValueChange={onVillageChange}
            disabled={!selectedCommune || loading.villages}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !selectedCommune
                    ? "Select commune first"
                    : loading.villages
                    ? "Loading villages..."
                    : "Select village..."
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {villages.map((v) => (
                <SelectItem key={v.villageCode} value={v.villageCode}>
                  {v.villageEn}
                  <span className="ml-2 text-muted-foreground text-xs">
                    {v.villageKh}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Address preview ── */}
      {addressPreview && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-primary mb-1">
                Selected Address
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {addressPreview}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Get coordinates ── */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onGetCoordinates}
          disabled={!selectedProvince || isGeocodingAddress}
        >
          {isGeocodingAddress ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Getting Coordinates...
            </>
          ) : (
            <>
              <Navigation2 className="h-4 w-4 mr-2" />
              Get Coordinates
            </>
          )}
        </Button>

        {geocodeSuccess && geocodedCoords && (
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2.5">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <div>
              <p className="text-xs font-medium text-green-700 dark:text-green-400">
                Coordinates resolved
              </p>
              <p className="text-xs font-mono text-green-600 dark:text-green-500 mt-0.5">
                {geocodedCoords.lat.toFixed(6)}, {geocodedCoords.lng.toFixed(6)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
