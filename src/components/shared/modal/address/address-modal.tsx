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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Navigation, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { ModalMode } from "@/constants/app-resource/status/status";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppToast } from "@/components/shared/toast/app-toast";
import { getAddressByIdService } from "@/services/public/address/address.service";
import { AddressModel } from "@/models/public/dashboard/address/address.response";

const AddressRequestSchema = z.object({
  id: z.string().optional(),
  village: z.string().optional(),
  commune: z.string().optional(),
  district: z.string("District is required"),
  province: z.string("District is required"),
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
  addressId?: string; // Changed from data to addressId for edit mode
  data?: AddressFormData | null; // Keep for create mode
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
  addressId,
  mode,
  onSave,
  isSubmitting = false,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const isEdit = mode === ModalMode.UPDATE_MODE;

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [addressData, setAddressData] = useState<AddressModel | null>(null);
  const [markerPosition, setMarkerPosition] =
    useState<google.maps.LatLngLiteral>({
      lat: defaultCenter.lat,
      lng: defaultCenter.lng,
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
      id: "",
      village: "",
      commune: "",
      district: "",
      province: "",
      streetNumber: "",
      houseNumber: "",
      note: "",
      latitude: defaultCenter.lat,
      longitude: defaultCenter.lng,
      isDefault: false,
    },
    mode: "onChange",
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  // Fetch address data for edit mode
  const fetchAddressData = useCallback(async (id: string) => {
    setIsLoadingAddress(true);
    try {
      const response = await getAddressByIdService(id);
      setAddressData(response);
      return response;
    } catch (error) {
      console.error("Error fetching address:", error);
      AppToast({
        type: "error",
        message: "Failed to load address data. Please try again.",
        duration: 5000,
        position: "top-right",
      });
      return null;
    } finally {
      setIsLoadingAddress(false);
    }
  }, []);

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

          // Only update if we don't have existing data or if this is from user interaction
          if (!addressData || isEdit) {
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
          }

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
    [geocoder, setValue, addressData, isEdit]
  );

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // For edit mode with addressId, fetch the data
      if (isEdit && addressId) {
        fetchAddressData(addressId).then((fetchedData) => {
          if (fetchedData) {
            const formData = {
              id: fetchedData.id,
              village: fetchedData.village || "",
              commune: fetchedData.commune || "",
              district: fetchedData.district || "",
              province: fetchedData.province || "",
              streetNumber: fetchedData.streetNumber || "",
              houseNumber: fetchedData.houseNumber || "",
              note: fetchedData.note || "",
              latitude: fetchedData.latitude || defaultCenter.lat,
              longitude: fetchedData.longitude || defaultCenter.lng,
              isDefault: fetchedData.isDefault || false,
            };

            reset(formData);
            setMarkerPosition({
              lat: formData.latitude,
              lng: formData.longitude,
            });

            // Reverse geocode to show address info
            if (fetchedData.latitude && fetchedData.longitude && geocoder) {
              reverseGeocode(fetchedData.latitude, fetchedData.longitude);
            }
          }
        });
      } else {
        // For create mode, use provided data or defaults
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
    } else {
      // Reset when modal closes
      setAddressData(null);
      setAddressInfo({ formatted_address: "", components: {} });
    }
  }, [
    isOpen,
    data,
    addressId,
    isEdit,
    reset,
    geocoder,
    reverseGeocode,
    fetchAddressData,
  ]);

  // Update marker position when coordinates change programmatically
  useEffect(() => {
    if (latitude && longitude) {
      const newPosition = { lat: latitude, lng: longitude };
      setMarkerPosition(newPosition);

      // Center map on new position
      if (map) {
        map.panTo(newPosition);
      }

      // Reverse geocode new position only if it's from user interaction
      if (geocoder && !isLoadingAddress) {
        reverseGeocode(latitude, longitude);
      }
    }
  }, [latitude, longitude, map, geocoder, reverseGeocode, isLoadingAddress]);

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
      AppToast({
        type: "warning",
        message: "Geolocation is not supported by this browser.",
        duration: 3000,
        position: "top-right",
      });

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
        AppToast({
          type: "warning",
          message: " Please select a location on the map.",
          duration: 3000,
          position: "top-right",
        });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const openMapModal = () => {
    setShowMapModal(true);
  };

  const closeMapModal = () => {
    setShowMapModal(false);
  };

  const confirmLocation = () => {
    // Location is already updated in the form via onMapClick and onMarkerDragEnd
    setShowMapModal(false);
  };

  const onSubmit = (formData: AddressFormData) => {
    console.log("Form submitted with mode:", mode, "Data:", formData);

    const payload: AddressFormData = {
      ...(formData.id && { id: formData.id }),
      village: formData.village?.trim() || undefined,
      commune: formData.commune?.trim() || undefined,
      district: formData.district?.trim(),
      province: formData.province?.trim(),
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
    setShowMapModal(false);
    setMap(null);
    setAddressData(null);
    setAddressInfo({ formatted_address: "", components: {} });
    onClose();
  };

  const formatCoordinate = (value: number, type: "lat" | "lng") => {
    if (!value || value === 0) return "";
    const direction =
      type === "lat" ? (value > 0 ? "N" : "S") : value > 0 ? "E" : "W";
    return `${Math.abs(value).toFixed(6)}° ${direction}`;
  };

  // Loading state for edit mode
  if (isEdit && isLoadingAddress) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading address data...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
    <>
      {/* Main Address Form Modal */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl h-[90vh] p-0 gap-0 flex flex-col">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {isCreate ? "Add Address" : "Edit Address"}
            </DialogTitle>
            <DialogDescription>
              {isCreate
                ? "Click 'Select Location' to choose a location on the map."
                : "Update the address details or click 'Select Location' to change the location."}
            </DialogDescription>
          </DialogHeader>

          {/* Content */}
          <ScrollArea className="flex-1 min-h-0">
            {/* Location Selection Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address <span className="text-red-500">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location Selection Buttons */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openMapModal}
                    disabled={isSubmitting || isLoadingAddress}
                    className="flex items-center gap-2 flex-1"
                  >
                    <MapPin className="h-4 w-4" />
                    Select Location
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={
                      isSubmitting || isGettingLocation || isLoadingAddress
                    }
                    className="flex items-center gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    {isGettingLocation ? "Getting..." : "My Location"}
                  </Button>
                </div>

                {/* Show message if no location selected */}
                {(latitude === 0 || longitude === 0) && !isLoadingAddress && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800">
                          No Location Selected
                        </p>
                        <p className="text-sm text-amber-700">
                          Please select a location using the map or your current
                          location
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Address Information Display */}
                {(addressInfo.formatted_address || isGeocodingLocation) && (
                  <Card className="bg-primary-50 border-primary-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {isGeocodingLocation && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Selected Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isGeocodingLocation ? (
                        <p className="text-sm text-muted-foreground">
                          Getting address information...
                        </p>
                      ) : (
                        <div className="text-sm">
                          <p className="font-medium text-blue-800">
                            {addressInfo.formatted_address}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Show existing full address in edit mode */}
                {isEdit && addressData?.fullAddress && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Current Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium text-green-800">
                        {addressData.fullAddress}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Additional Information
                </CardTitle>
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
                        disabled={isSubmitting || isLoadingAddress}
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
                        disabled={isSubmitting || isLoadingAddress}
                      />
                    )}
                  />
                  <Label htmlFor="isDefault" className="text-sm font-medium">
                    Set as default address
                  </Label>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>

          {/* Footer */}
          <div className="flex justify-end items-center gap-2 p-6 border-t bg-muted/30 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || isLoadingAddress}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isGeocodingLocation || isLoadingAddress}
              onClick={handleSubmit(onSubmit)}
            >
              {isSubmitting || isGeocodingLocation || isLoadingAddress
                ? "Processing..."
                : isCreate
                ? "Add Address"
                : "Update Address"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Map Selection Modal */}
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogContent className="max-w-2xl h-[90vh] p-0 gap-0 flex flex-col">
          <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Select Location
                </DialogTitle>
                <DialogDescription>
                  Click on the map or drag the marker to select your address
                  location
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-0">
            {/* Map Container */}
            <div className="w-full h-96 border border-gray-300 rounded-lg">
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

            {/* Current Coordinates */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">Selected Coordinates:</p>
              <p className="text-sm text-muted-foreground">
                {formatCoordinate(latitude, "lat")},{" "}
                {formatCoordinate(longitude, "lng")}
              </p>
            </div>
          </ScrollArea>

          <div className="flex justify-between items-center p-6 border-t bg-muted/30 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              {isGettingLocation ? "Getting..." : "Use My Location"}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={closeMapModal}>
                Cancel
              </Button>
              <Button type="button" onClick={confirmLocation}>
                Confirm Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
