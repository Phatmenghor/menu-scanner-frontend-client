import React, { useEffect, useState, useCallback } from "react";
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
import { MapPin, Navigation, Maximize, Minimize, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { ModalMode } from "@/constants/app-resource/status/status";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";

const AddressRequestSchema = z.object({
  id: z.string().optional(),
  village: z.string().optional(),
  commune: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
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

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocodeResult {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: {
    location: google.maps.LatLng;
  };
}

const libraries: ("places" | "geometry")[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// Default center (Phnom Penh, Cambodia)
const defaultCenter = {
  lat: 11.5564,
  lng: 104.9282,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  gestureHandling: "cooperative" as const,
  clickableIcons: false,
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
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [markerPosition, setMarkerPosition] =
    useState<google.maps.LatLngLiteral>({
      lat: data?.latitude || defaultCenter.lat,
      lng: data?.longitude || defaultCenter.lng,
    });
  const [addressInfo, setAddressInfo] = useState<{
    formatted_address: string;
    components: {
      province?: string;
      district?: string;
      commune?: string;
      village?: string;
      streetNumber?: string;
      houseNumber?: string;
    };
  }>({
    formatted_address: "",
    components: {},
  });

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
    libraries,
    version: "weekly",
  });

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
      latitude: data?.latitude || defaultCenter.lat,
      longitude: data?.longitude || defaultCenter.lng,
      isDefault: false,
    },
    mode: "onChange",
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  // Initialize geocoder when Maps API is loaded
  useEffect(() => {
    if (isLoaded && window.google && window.google.maps) {
      setGeocoder(new window.google.maps.Geocoder());
    }
  }, [isLoaded]);

  // Parse address components based on Cambodia's administrative structure
  const parseAddressComponents = (components: AddressComponent[]) => {
    const parsed = {
      province: "",
      district: "",
      commune: "",
      village: "",
      streetNumber: "",
      houseNumber: "",
    };

    components.forEach((component) => {
      const types = component.types;

      // Cambodia administrative levels mapping
      if (types.includes("administrative_area_level_1")) {
        parsed.province = component.long_name;
      } else if (types.includes("administrative_area_level_2")) {
        parsed.district = component.long_name;
      } else if (types.includes("administrative_area_level_3")) {
        parsed.commune = component.long_name;
      } else if (types.includes("locality") || types.includes("sublocality")) {
        parsed.village = component.long_name;
      } else if (types.includes("street_number")) {
        parsed.houseNumber = component.long_name;
      } else if (types.includes("route")) {
        parsed.streetNumber = component.long_name;
      }
    });

    return parsed;
  };

  // Reverse geocode coordinates to get address
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      if (!geocoder) return;

      setIsGeocodingLocation(true);

      try {
        const response = await new Promise<google.maps.GeocoderResponse>(
          (resolve, reject) => {
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === "OK") {
                resolve({ results: results || [], status });
              } else {
                reject(new Error(`Geocoding failed: ${status}`));
              }
            });
          }
        );

        if (response.results && response.results.length > 0) {
          const result = response.results[0];
          const components = parseAddressComponents(result.address_components);

          // Update form with geocoded data
          setValue("province", components.province, { shouldValidate: true });
          setValue("district", components.district, { shouldValidate: true });
          setValue("commune", components.commune, { shouldValidate: true });
          setValue("village", components.village, { shouldValidate: true });
          setValue("streetNumber", components.streetNumber, {
            shouldValidate: true,
          });
          setValue("houseNumber", components.houseNumber, {
            shouldValidate: true,
          });

          setAddressInfo({
            formatted_address: result.formatted_address,
            components,
          });
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        setAddressInfo({
          formatted_address: "Unable to determine address",
          components: {},
        });
      } finally {
        setIsGeocodingLocation(false);
      }
    },
    [geocoder, setValue]
  );

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
        latitude: data?.latitude || defaultCenter.lat,
        longitude: data?.longitude || defaultCenter.lng,
        isDefault: data?.isDefault || false,
      };

      reset(formData);
      setMarkerPosition({
        lat: formData.latitude,
        lng: formData.longitude,
      });

      // If we have existing data, reverse geocode to show address info
      if (data?.latitude && data?.longitude && geocoder) {
        reverseGeocode(data.latitude, data.longitude);
      }
    }
  }, [isOpen, data, reset, geocoder, reverseGeocode]);

  // Update marker position when coordinates change programmatically
  useEffect(() => {
    if (latitude && longitude) {
      const newPosition = { lat: latitude, lng: longitude };
      setMarkerPosition(newPosition);

      // Center map on new position
      if (map) {
        map.panTo(newPosition);
      }

      // Reverse geocode new position
      if (geocoder) {
        reverseGeocode(latitude, longitude);
      }
    }
  }, [latitude, longitude, map, geocoder, reverseGeocode]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle map click
  const onMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = Number(event.latLng.lat().toFixed(6));
        const lng = Number(event.latLng.lng().toFixed(6));

        setMarkerPosition({ lat, lng });
        setValue("latitude", lat, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("longitude", lng, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    },
    [setValue]
  );

  // Handle marker drag
  const onMarkerDragEnd = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = Number(event.latLng.lat().toFixed(6));
        const lng = Number(event.latLng.lng().toFixed(6));

        setMarkerPosition({ lat, lng });
        setValue("latitude", lat, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("longitude", lng, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    },
    [setValue]
  );

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

        setMarkerPosition({ lat, lng });

        // Center map on new location
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }

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
      district: formData.district?.trim() || undefined,
      province: formData.province?.trim() || undefined,
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
    reset();
    setMapExpanded(false);
    setMap(null);
    setAddressInfo({ formatted_address: "", components: {} });
    onClose();
  };

  const formatCoordinate = (value: number, type: "lat" | "lng") => {
    if (!value || value === 0) return "";
    const direction =
      type === "lat" ? (value > 0 ? "N" : "S") : value > 0 ? "E" : "W";
    return `${Math.abs(value).toFixed(6)}° ${direction}`;
  };

  if (loadError) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <div className="text-center py-8">
            <p className="text-red-500">Error loading Google Maps</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please check your API key configuration
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
              ? "Select a location on the map to add a new address."
              : "Update the location by clicking on the map or dragging the marker."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Interactive Map Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Select Location <span className="text-red-500">*</span>
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

              {/* Google Map Container */}
              <div
                className={`w-full border border-gray-300 rounded-lg transition-all duration-300 ${
                  mapExpanded ? "h-96" : "h-64"
                }`}
              >
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={markerPosition}
                    zoom={13}
                    options={mapOptions}
                    onClick={onMapClick}
                    onLoad={onMapLoad}
                    onUnmount={onMapUnmount}
                  >
                    <MarkerF
                      position={markerPosition}
                      draggable={true}
                      onDragEnd={onMarkerDragEnd}
                      icon={{
                        url:
                          "data:image/svg+xml;charset=UTF-8," +
                          encodeURIComponent(`
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="12" fill="#dc2626" stroke="white" stroke-width="4"/>
                          </svg>
                        `),
                        scaledSize: new window.google.maps.Size(32, 32),
                        anchor: new window.google.maps.Point(16, 16),
                      }}
                    />
                  </GoogleMap>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded-lg">
                    Loading Google Maps...
                  </div>
                )}
              </div>

              {/* Address Information Display */}
              {(addressInfo.formatted_address || isGeocodingLocation) && (
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {isGeocodingLocation && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Address Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {isGeocodingLocation ? (
                      <p className="text-sm text-muted-foreground">
                        Getting address information...
                      </p>
                    ) : (
                      <>
                        <div className="text-sm">
                          <p className="font-medium">
                            {addressInfo.formatted_address}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          {addressInfo.components.province && (
                            <div>
                              <span className="font-medium">Province:</span>{" "}
                              {addressInfo.components.province}
                            </div>
                          )}
                          {addressInfo.components.district && (
                            <div>
                              <span className="font-medium">District:</span>{" "}
                              {addressInfo.components.district}
                            </div>
                          )}
                          {addressInfo.components.commune && (
                            <div>
                              <span className="font-medium">Commune:</span>{" "}
                              {addressInfo.components.commune}
                            </div>
                          )}
                          {addressInfo.components.village && (
                            <div>
                              <span className="font-medium">Village:</span>{" "}
                              {addressInfo.components.village}
                            </div>
                          )}
                          {addressInfo.components.streetNumber && (
                            <div>
                              <span className="font-medium">Street:</span>{" "}
                              {addressInfo.components.streetNumber}
                            </div>
                          )}
                          {addressInfo.components.houseNumber && (
                            <div>
                              <span className="font-medium">House No:</span>{" "}
                              {addressInfo.components.houseNumber}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

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
                  <p className="text-sm font-medium">Selected Coordinates:</p>
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
              disabled={isSubmitting || isGeocodingLocation}
              onClick={handleSubmit(onSubmit)}
            >
              {isSubmitting || isGeocodingLocation
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
