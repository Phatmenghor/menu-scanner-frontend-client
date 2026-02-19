"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Star } from "lucide-react";
import { Loading } from "@/components/shared/common/loading";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { showToast } from "@/components/shared/common/show-toast";

import { useLocationState } from "@/redux/features/location/store/state/location-state";
import { LocationResponseModel } from "@/redux/features/location/store/models/response/location-response";
import LocationModal from "@/redux/features/location/components/location-modal";
import { LocationCard } from "@/redux/features/location/components/location-card";
import { LocationEmptyState } from "@/redux/features/location/components/location-empty-state";
import { LocationPrimaryBanner } from "@/redux/features/location/components/location-primary-banner";
import { isLocationPrimary } from "@/redux/features/location/utils/location-helpers";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function LocationPage() {
  const {
    locations,
    primaryLocation,
    locationCount,
    isLoading,
    operations,
    fetchAll,
    update,
    remove,
  } = useLocationState();

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

  // Grab user GPS coords once on mount
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

  // Fetch saved locations on mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleAddLocation = useCallback(() => {
    setEditingLocation(null);
    setIsModalOpen(true);
  }, []);

  const handleEditLocation = useCallback((location: LocationResponseModel) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingLocation(null);
  }, []);

  const handleDeleteLocation = async () => {
    if (!deletingLocation) return;
    try {
      await remove(deletingLocation.id).unwrap();
      showToast.success("Location deleted successfully");
      setDeletingLocation(null);
    } catch (error: any) {
      showToast.error(error?.message || "Failed to delete location");
    }
  };

  const handleSetPrimary = async (location: LocationResponseModel) => {
    if (isLocationPrimary(location)) return;
    setSettingPrimaryId(location.id);
    try {
      await update({
        locationId: location.id,
        locationData: {
          label: location.label ?? "",
          latitude: location.latitude ?? 0,
          longitude: location.longitude ?? 0,
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
      }).unwrap();
      showToast.success("Primary location updated");
    } catch (error: any) {
      showToast.error(error?.message || "Failed to set primary location");
    } finally {
      setSettingPrimaryId(null);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <Loading />
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">

        {/* ── Page header ── */}
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

        {/* ── Primary location banner ── */}
        {primaryLocation && (
          <LocationPrimaryBanner location={primaryLocation} />
        )}

        {/* ── Stats ── */}
        {locationCount > 0 && (
          <div className="flex items-center gap-2 mb-5">
            <Badge variant="secondary" className="text-xs">
              {locationCount} saved location{locationCount !== 1 ? "s" : ""}
            </Badge>
            {primaryLocation && (
              <Badge variant="outline" className="text-xs">
                <Star className="h-3 w-3 mr-1 text-amber-500" />
                1 primary
              </Badge>
            )}
          </div>
        )}

        {/* ── Content ── */}
        {locations.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <LocationEmptyState onAdd={handleAddLocation} />
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

            {/* Add-new card */}
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

      {/* ── Add / Edit modal ── */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editData={editingLocation}
        initialCoords={currentCoords}
      />

      {/* ── Delete confirmation ── */}
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
