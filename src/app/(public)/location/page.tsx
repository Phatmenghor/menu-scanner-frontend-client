"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectLocations,
  selectLocationIsLoading,
  selectLocationOperations,
  selectPrimaryLocation,
} from "@/redux/features/location/store/selectors/location-selector";
import {
  fetchAllLocationsService,
  deleteLocationService,
  updateLocationService,
} from "@/redux/features/location/store/thunks/location-thunks";
import { LocationResponseModel } from "@/redux/features/location/store/models/response/location-response";
import LocationModal from "@/redux/features/location/components/location-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { showToast } from "@/components/shared/common/show-toast";
import { Loading } from "@/components/shared/common/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Star,
  Navigation,
  StickyNote,
  Home,
  Building2,
  ShoppingBag,
  Briefcase,
  Heart,
  MoreVertical,
  CheckCircle2,
  Map,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const LABEL_ICONS: Record<string, React.ElementType> = {
  home: Home,
  house: Home,
  office: Briefcase,
  work: Briefcase,
  shop: ShoppingBag,
  store: ShoppingBag,
  building: Building2,
  apartment: Building2,
  love: Heart,
  family: Heart,
};

function getLabelIcon(label: string): React.ElementType {
  const lower = label.toLowerCase();
  for (const [key, Icon] of Object.entries(LABEL_ICONS)) {
    if (lower.includes(key)) return Icon;
  }
  return MapPin;
}

function formatAddress(location: LocationResponseModel): string {
  const parts = [
    location.houseNumber,
    location.streetNumber,
    location.village,
    location.commune,
    location.district,
    location.province,
    location.country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "No address details";
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <Map className="h-12 w-12 text-primary/60" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center">
          <Plus className="h-4 w-4 text-primary" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No saved locations
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-8 leading-relaxed">
        Save your favourite delivery spots — use the interactive map or select
        from our location hierarchy.
      </p>
      <Button onClick={onAdd} size="lg" className="shadow-md">
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Location
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Location Card
// ---------------------------------------------------------------------------
interface LocationCardProps {
  location: LocationResponseModel;
  settingPrimaryId: string | null;
  onEdit: (loc: LocationResponseModel) => void;
  onDelete: (loc: LocationResponseModel) => void;
  onSetPrimary: (loc: LocationResponseModel) => void;
}

function LocationCard({
  location,
  settingPrimaryId,
  onEdit,
  onDelete,
  onSetPrimary,
}: LocationCardProps) {
  const LabelIcon = getLabelIcon(location.label);
  const isPrimary = location.isPrimary || location.isDefault;
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
        {/* ---- Header ---- */}
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

        {/* ---- Address ---- */}
        <div className="flex items-start gap-2 mb-3">
          <Navigation className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {formatAddress(location)}
          </p>
        </div>

        {/* ---- Coords ---- */}
        {location.hasCoordinates && (
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin className="h-3 w-3 text-red-400 shrink-0" />
            <span className="text-xs font-mono text-muted-foreground">
              {(location.latitude || 0).toFixed(5)},{" "}
              {(location.longitude || 0).toFixed(5)}
            </span>
          </div>
        )}

        {/* ---- Note ---- */}
        {location.note && (
          <div className="flex items-start gap-2 mb-4">
            <StickyNote className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground italic line-clamp-1">
              {location.note}
            </p>
          </div>
        )}

        {/* ---- Footer actions ---- */}
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function LocationPage() {
  const dispatch = useAppDispatch();
  const locations = useAppSelector(selectLocations);
  const isLoading = useAppSelector(selectLocationIsLoading);
  const operations = useAppSelector(selectLocationOperations);
  const primaryLocation = useAppSelector(selectPrimaryLocation);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<LocationResponseModel | null>(null);
  const [deletingLocation, setDeletingLocation] =
    useState<LocationResponseModel | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Grab user coords on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCurrentCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {}
    );
  }, []);

  useEffect(() => {
    dispatch(fetchAllLocationsService());
  }, [dispatch]);

  const handleAddLocation = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleEditLocation = (location: LocationResponseModel) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleDeleteLocation = async () => {
    if (!deletingLocation) return;
    try {
      await dispatch(deleteLocationService(deletingLocation.id)).unwrap();
      showToast.success("Location deleted successfully");
      setDeletingLocation(null);
    } catch (error: any) {
      showToast.error(error?.message || "Failed to delete location");
    }
  };

  const handleSetPrimary = async (location: LocationResponseModel) => {
    if (location.isPrimary || location.isDefault) return;
    setSettingPrimaryId(location.id);
    try {
      await dispatch(
        updateLocationService({
          locationId: location.id,
          locationData: {
            label: location.label,
            latitude: location.latitude,
            longitude: location.longitude,
            houseNumber: location.houseNumber || "",
            streetNumber: location.streetNumber || "",
            village: location.village || "",
            commune: location.commune || "",
            district: location.district || "",
            province: location.province || "",
            country: location.country || "",
            note: location.note || "",
            isPrimary: true,
          },
        })
      ).unwrap();
      showToast.success("Primary location updated");
    } catch (error: any) {
      showToast.error(error?.message || "Failed to set primary location");
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingLocation(null);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* ===== Page Header ===== */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                My Locations
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-11">
              Manage your saved delivery addresses
            </p>
          </div>
          <Button onClick={handleAddLocation} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>

        {/* ===== Primary Location Banner ===== */}
        {primaryLocation && (
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
                  {primaryLocation.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {formatAddress(primaryLocation)}
              </p>
              {primaryLocation.hasCoordinates && (
                <p className="text-xs font-mono text-muted-foreground/70 mt-1">
                  {(primaryLocation.latitude || 0).toFixed(5)},{" "}
                  {(primaryLocation.longitude || 0).toFixed(5)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ===== Stats ===== */}
        {locations.length > 0 && (
          <div className="flex items-center gap-2 mb-5">
            <Badge variant="secondary" className="text-xs">
              {locations.length} saved location{locations.length !== 1 ? "s" : ""}
            </Badge>
            {primaryLocation && (
              <Badge variant="outline" className="text-xs text-primary border-primary/30">
                1 primary
              </Badge>
            )}
          </div>
        )}

        {/* ===== Content ===== */}
        {locations.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState onAdd={handleAddLocation} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                settingPrimaryId={settingPrimaryId}
                onEdit={handleEditLocation}
                onDelete={setDeletingLocation}
                onSetPrimary={handleSetPrimary}
              />
            ))}

            {/* Add new card */}
            <button
              onClick={handleAddLocation}
              className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-dashed border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-200 min-h-[160px] group"
            >
              <div className="p-3 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                <Plus className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Add Location</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Map or select from list
                </p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* ===== Add/Edit Modal ===== */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editData={editingLocation}
        initialCoords={currentCoords}
      />

      {/* ===== Delete Confirmation ===== */}
      <DeleteConfirmationModal
        isOpen={!!deletingLocation}
        onClose={() => setDeletingLocation(null)}
        onDelete={handleDeleteLocation}
        title="Delete Location"
        description="Are you sure you want to delete this location? This action cannot be undone."
        itemName={deletingLocation?.label}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
