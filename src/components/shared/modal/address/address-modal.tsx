import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Navigation, Maximize, Minimize } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { ModalMode } from "@/constants/app-resource/status/status";
import {
  GoogleMap,
  InfoWindow,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";

// TypeScript declarations for Leaflet
declare global {
  interface Window {
    L: any;
  }
}

// Leaflet types
interface LeafletMap {
  setView: (center: [number, number], zoom: number) => LeafletMap;
  on: (event: string, handler: (e: any) => void) => LeafletMap;
  remove: () => void;
  invalidateSize: () => void;
  getZoom: () => number;
}

interface LeafletMarker {
  setLatLng: (latlng: [number, number]) => LeafletMarker;
  on: (event: string, handler: (e: any) => void) => LeafletMarker;
  getLatLng: () => { lat: number; lng: number };
}

interface LeafletEvent {
  latlng: { lat: number; lng: number };
  target: { getLatLng: () => { lat: number; lng: number } };
}

const AddressRequestSchema = z.object({
  id: z.string().optional(),
  village: z.string().optional(),
  commune: z.string().optional(),
  district: z.string().min(1, "District is required"),
  province: z.string().min(1, "Province is required"),
  streetNumber: z.string().optional(),
  houseNumber: z.string().optional(),
  note: z.string().optional(),
  latitude: z.number().min(-90).max(90, "Invalid latitude"),
  longitude: z.number().min(-180).max(180, "Invalid longitude"),
  isDefault: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof AddressRequestSchema>;

type Props = {
  mode: ModalMode;
  data?: AddressFormData | null;
  onClose: () => void;
  isOpen: boolean;
  isSubmitting?: boolean;
  onSave: (data: AddressFormData) => void;
};

export default function ModalAddress({
  isOpen,
  onClose,
  data,
  mode,
  onSave,
  isSubmitting = false,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Load Leaflet CSS and initialize map
  useEffect(() => {
    if (!isOpen) return;

    // Load Leaflet CSS
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
    cssLink.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    cssLink.crossOrigin = "anonymous";

    if (!document.querySelector(`link[href="${cssLink.href}"]`)) {
      document.head.appendChild(cssLink);
    }

    // Load Leaflet JS
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "anonymous";

    const existingScript = document.querySelector(
      `script[src="${script.src}"]`
    );

    if (!existingScript) {
      script.onload = () => {
        setMapReady(true);
        setTimeout(initializeMap, 100);
      };
      document.head.appendChild(script);
    } else {
      if (window.L) {
        setMapReady(true);
        setTimeout(initializeMap, 100);
      }
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  const initializeMap = () => {
    if (!window.L || !isOpen || mapRef.current) return;

    const mapContainer = document.getElementById("address-map");
    if (!mapContainer) return;

    try {
      // Default to Phnom Penh coordinates
      const defaultLat = data?.latitude || 11.5564;
      const defaultLng = data?.longitude || 104.9282;

      const map = window.L.map("address-map", {
        center: [defaultLat, defaultLng],
        zoom: 13,
        scrollWheelZoom: true,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
      });

      // Add OpenStreetMap tile layer
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon using HTML
      const customIcon = window.L.divIcon({
        html: `<div style="
          background-color: #dc2626; 
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          position: relative;
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: "custom-marker",
      });

      // Add draggable marker
      const marker = window.L.marker([defaultLat, defaultLng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      // Update coordinates when marker is dragged
      marker.on("dragend", (e: LeafletEvent) => {
        const position = e.target.getLatLng();
        setValue("latitude", Number(position.lat.toFixed(6)), {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("longitude", Number(position.lng.toFixed(6)), {
          shouldValidate: true,
          shouldDirty: true,
        });
      });

      // Update marker position when clicking on map
      map.on("click", (e: LeafletEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setValue("latitude", Number(lat.toFixed(6)), {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("longitude", Number(lng.toFixed(6)), {
          shouldValidate: true,
          shouldDirty: true,
        });
      });

      // Store references
      mapRef.current = map;
      markerRef.current = marker;

      // Invalidate size after a short delay to ensure proper rendering
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 250);
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  // Update marker position when coordinates change programmatically
  const updateMarkerPosition = (lat: number, lng: number) => {
    if (markerRef.current && mapRef.current && lat !== 0 && lng !== 0) {
      try {
        markerRef.current.setLatLng([lat, lng]);
        mapRef.current.setView([lat, lng], mapRef.current.getZoom());
      } catch (error) {
        console.error("Error updating marker position:", error);
      }
    }
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(AddressRequestSchema),
    defaultValues: {
      id: data?.id ?? "",
      village: "",
      commune: "",
      district: "",
      province: "",
      streetNumber: "",
      houseNumber: "",
      note: "",
      latitude: data?.latitude || 11.5564,
      longitude: data?.longitude || 104.9282,
      isDefault: false,
    },
    mode: "onChange",
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      const formData = {
        id: data?.id || "",
        village: data?.village || "",
        commune: data?.commune || "",
        district: data?.district || "",
        province: data?.province || "",
        streetNumber: data?.streetNumber || "",
        houseNumber: data?.houseNumber || "",
        note: data?.note || "",
        latitude: data?.latitude || 11.5564,
        longitude: data?.longitude || 104.9282,
        isDefault: data?.isDefault || false,
      };

      reset(formData);
    }
  }, [isOpen, data, reset]);

  // Update marker when coordinates change
  useEffect(() => {
    if (mapReady && latitude && longitude) {
      updateMarkerPosition(latitude, longitude);
    }
  }, [latitude, longitude, mapReady]);

  // Handle map resize when expanded/minimized
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef?.current?.invalidateSize();
      }, 300);
    }
  }, [mapExpanded]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));

        setValue("latitude", lat, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("longitude", lng, {
          shouldValidate: true,
          shouldDirty: true,
        });

        updateMarkerPosition(lat, lng);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Unable to retrieve your location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        alert(errorMessage + " Please select a location on the map.");
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const onSubmit = (formData: AddressFormData) => {
    console.log("Form submitted with mode:", mode, "Data:", formData);

    const payload: AddressFormData = {
      ...(formData.id && { id: formData.id }),
      village: formData.village?.trim() || undefined,
      commune: formData.commune?.trim() || undefined,
      district: formData.district.trim(),
      province: formData.province.trim(),
      streetNumber: formData.streetNumber?.trim() || undefined,
      houseNumber: formData.houseNumber?.trim() || undefined,
      note: formData.note?.trim() || undefined,
      latitude: formData.latitude,
      longitude: formData.longitude,
      isDefault: formData.isDefault || false,
    };

    console.log("Payload:", payload);
    onSave(payload);
    handleClose();
  };

  const handleClose = () => {
    // Clean up map
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (error) {
        console.error("Error cleaning up map:", error);
      }
      mapRef.current = null;
      markerRef.current = null;
    }

    reset();
    setMapExpanded(false);
    setMapReady(false);
    onClose();
  };

  const formatCoordinate = (value: number, type: "lat" | "lng") => {
    if (!value || value === 0) return "";
    const direction =
      type === "lat" ? (value > 0 ? "N" : "S") : value > 0 ? "E" : "W";
    return `${Math.abs(value).toFixed(6)}° ${direction}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isCreate ? "Add Address" : "Edit Address"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Fill out the form to add a new address."
              : "Update address information below."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Location Details Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Location Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Province and District - Required Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="province">
                    Province <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="province"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="province"
                        type="text"
                        placeholder="Enter province"
                        disabled={isSubmitting}
                        className={errors.province ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.province && (
                    <p className="text-sm text-destructive">
                      {errors.province.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="district">
                    District <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="district"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="district"
                        type="text"
                        placeholder="Enter district"
                        disabled={isSubmitting}
                        className={errors.district ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.district && (
                    <p className="text-sm text-destructive">
                      {errors.district.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Commune and Village */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="commune">Commune</Label>
                  <Controller
                    control={control}
                    name="commune"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="commune"
                        type="text"
                        placeholder="Enter commune"
                        disabled={isSubmitting}
                        className={errors.commune ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.commune && (
                    <p className="text-sm text-destructive">
                      {errors.commune.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="village">Village</Label>
                  <Controller
                    control={control}
                    name="village"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="village"
                        type="text"
                        placeholder="Enter village"
                        disabled={isSubmitting}
                        className={errors.village ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.village && (
                    <p className="text-sm text-destructive">
                      {errors.village.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Street Number and House Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="streetNumber">Street Number</Label>
                  <Controller
                    control={control}
                    name="streetNumber"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="streetNumber"
                        type="text"
                        placeholder="e.g., Street 271"
                        disabled={isSubmitting}
                        className={errors.streetNumber ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.streetNumber && (
                    <p className="text-sm text-destructive">
                      {errors.streetNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="houseNumber">House Number</Label>
                  <Controller
                    control={control}
                    name="houseNumber"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="houseNumber"
                        type="text"
                        placeholder="e.g., #123"
                        disabled={isSubmitting}
                        className={errors.houseNumber ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.houseNumber && (
                    <p className="text-sm text-destructive">
                      {errors.houseNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Map Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location Map <span className="text-red-500">*</span>
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMapExpanded(!mapExpanded)}
                  className="flex items-center gap-2"
                >
                  {mapExpanded ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                  {mapExpanded ? "Minimize" : "Expand"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Click on the map or drag the marker to set location
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={isSubmitting || isGettingLocation}
                  className="flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  {isGettingLocation ? "Getting..." : "My Location"}
                </Button>
              </div>

              {/* Map Container */}
              <div
                id="address-map"
                className={`w-full border border-gray-300 rounded-lg transition-all duration-300 ${
                  mapExpanded ? "h-96" : "h-64"
                }`}
                style={{
                  minHeight: mapExpanded ? "384px" : "256px",
                  background: mapReady ? "transparent" : "#f3f4f6",
                }}
              >
                {!mapReady && (
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                    Loading map...
                  </div>
                )}
              </div>

              {/* Coordinates Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="latitude">
                    Latitude <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="latitude"
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Input
                          {...field}
                          id="latitude"
                          type="number"
                          step="any"
                          placeholder="e.g., 11.5564"
                          disabled={isSubmitting}
                          className={errors.latitude ? "border-red-500" : ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue =
                              value === ""
                                ? 0
                                : Number(parseFloat(value).toFixed(6));
                            field.onChange(numValue);
                          }}
                        />
                        {latitude !== 0 && (
                          <p className="text-xs text-muted-foreground">
                            {formatCoordinate(latitude, "lat")}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  {errors.latitude && (
                    <p className="text-sm text-destructive">
                      {errors.latitude.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="longitude">
                    Longitude <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="longitude"
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Input
                          {...field}
                          id="longitude"
                          type="number"
                          step="any"
                          placeholder="e.g., 104.9282"
                          disabled={isSubmitting}
                          className={errors.longitude ? "border-red-500" : ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue =
                              value === ""
                                ? 0
                                : Number(parseFloat(value).toFixed(6));
                            field.onChange(numValue);
                          }}
                        />
                        {longitude !== 0 && (
                          <p className="text-xs text-muted-foreground">
                            {formatCoordinate(longitude, "lng")}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  {errors.longitude && (
                    <p className="text-sm text-destructive">
                      {errors.longitude.message}
                    </p>
                  )}
                </div>
              </div>

              {(latitude !== 0 || longitude !== 0) && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Selected Location:</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCoordinate(latitude, "lat")},{" "}
                    {formatCoordinate(longitude, "lng")}
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    View on Google Maps
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Notes Field */}
              <div className="space-y-1">
                <Label htmlFor="note">Notes</Label>
                <Controller
                  control={control}
                  name="note"
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="note"
                      placeholder="Additional notes about this address..."
                      disabled={isSubmitting}
                      className={errors.note ? "border-red-500" : ""}
                      rows={3}
                    />
                  )}
                />
                {errors.note && (
                  <p className="text-sm text-destructive">
                    {errors.note.message}
                  </p>
                )}
              </div>

              {/* Default Address Checkbox */}
              <div className="flex items-center space-x-2">
                <Controller
                  control={control}
                  name="isDefault"
                  render={({ field }) => (
                    <Checkbox
                      id="isDefault"
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  )}
                />
                <Label htmlFor="isDefault" className="text-sm font-medium">
                  Set as default address
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
            >
              {isSubmitting
                ? "Processing..."
                : isCreate
                ? "Add Address"
                : "Update Address"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
