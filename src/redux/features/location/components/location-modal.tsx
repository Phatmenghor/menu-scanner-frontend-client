"use client";

import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
  useMemo,
} from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { CheckboxField } from "@/components/shared/form-field/checkbox-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { showToast } from "@/components/shared/common/show-toast";
import { Map, ListFilter } from "lucide-react";

import { useLocationState } from "../store/state/location-state";
import { usePublicLocationState } from "../store/state/public-location-state";
import {
  createLocationSchema,
  LocationFormData,
} from "../store/models/schema/location-schema";
import {
  LocationResponseModel,
  ProvinceResponseModel,
  DistrictResponseModel,
  CommuneResponseModel,
  VillageResponseModel,
} from "../store/models/response/location-response";
import { LocationMapTab } from "./location-map-tab";
import { LocationSelectTab } from "./location-select-tab";

// ---------------------------------------------------------------------------
// Google Maps script loader (singleton promise)
// ---------------------------------------------------------------------------
let gmapLoadPromise: Promise<void> | null = null;

export function loadGoogleMapsScript(): Promise<void> {
  if (gmapLoadPromise) return gmapLoadPromise;

  gmapLoadPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.maps?.Map) {
      resolve();
      return;
    }

    const existing = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    ) as HTMLScriptElement | null;

    if (existing) {
      const id = setInterval(() => {
        if (window.google?.maps?.Map) {
          clearInterval(id);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(id);
        if (window.google?.maps?.Map) resolve();
        else reject(new Error("Timeout waiting for Google Maps"));
      }, 10000);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured"));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const id = setInterval(() => {
        if (window.google?.maps?.Map) {
          clearInterval(id);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(id);
        if (window.google?.maps?.Map) resolve();
        else reject(new Error("Google Maps loaded but Map unavailable"));
      }, 10000);
    };
    script.onerror = () => {
      gmapLoadPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });

  gmapLoadPromise.catch(() => {
    gmapLoadPromise = null;
  });
  return gmapLoadPromise;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SelectionMode = "map" | "select";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: LocationResponseModel | null;
  initialCoords?: { lat: number; lng: number } | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function LocationModal({
  isOpen,
  onClose,
  editData,
  initialCoords,
}: LocationModalProps) {
  const isCreate = !editData;

  const { create, update, operations, error: reduxError, clearError } =
    useLocationState();
  const {
    selectedProvince,
    selectedDistrict,
    selectedCommune,
    selectProvince,
    selectDistrict,
    selectCommune,
    reset: resetPublicLocation,
  } = usePublicLocationState();

  const { isCreating, isUpdating } = operations;
  const isSubmitting = isCreate ? isCreating : isUpdating;

  // ── Mode state ──────────────────────────────────────────────────────────
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("map");

  // ── Map state ───────────────────────────────────────────────────────────
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const normalSearchRef = useRef<HTMLInputElement>(null);
  const fullscreenSearchRef = useRef<HTMLInputElement>(null);
  const normalAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const fullscreenAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setValueRef = useRef<typeof setValue>(null!);

  const [isMapReady, setIsMapReady] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // ── Select-mode state ───────────────────────────────────────────────────
  const [selectedVillage, setSelectedVillage] =
    useState<VillageResponseModel | null>(null);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [geocodedCoords, setGeocodedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geocodeSuccess, setGeocodeSuccess] = useState(false);

  // ── Form ────────────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<LocationFormData>({
    resolver: zodResolver(createLocationSchema) as any,
    defaultValues: {
      label: "",
      latitude: 0,
      longitude: 0,
      houseNumber: "",
      streetNumber: "",
      village: "",
      commune: "",
      district: "",
      province: "",
      country: "",
      note: "",
      isPrimary: false,
    },
    mode: "onChange",
  });

  // Keep setValue ref fresh for callbacks
  setValueRef.current = setValue;
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  // ── Build address preview for Select mode ───────────────────────────────
  const addressPreview = useMemo(() => {
    const parts = [
      watch("houseNumber"),
      watch("streetNumber"),
      watch("village"),
      watch("commune"),
      watch("district"),
      watch("province"),
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watch("houseNumber"),
    watch("streetNumber"),
    watch("village"),
    watch("commune"),
    watch("district"),
    watch("province"),
  ]);

  // ── Reset form on open/close ────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      reset({
        label: editData.label ?? "",
        latitude: editData.latitude ?? 0,
        longitude: editData.longitude ?? 0,
        houseNumber: editData.houseNumber ?? "",
        streetNumber: editData.streetNumber ?? "",
        village: editData.village ?? "",
        commune: editData.commune ?? "",
        district: editData.district ?? "",
        province: editData.province ?? "",
        country: editData.country ?? "",
        note: editData.note ?? "",
        isPrimary: editData.isPrimary || editData.isDefault || false,
      });
    } else {
      reset({
        label: "",
        latitude: 0,
        longitude: 0,
        houseNumber: "",
        streetNumber: "",
        village: "",
        commune: "",
        district: "",
        province: "",
        country: "",
        note: "",
        isPrimary: false,
      });
    }
    clearError();
  }, [isOpen, editData, reset, clearError]);

  // ── Load Google Maps when in map mode ───────────────────────────────────
  useEffect(() => {
    if (!isOpen || selectionMode !== "map") {
      if (!isOpen) {
        setIsMapReady(false);
        setIsFullScreen(false);
        setMapError(null);
      }
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        await loadGoogleMapsScript();
        if (!cancelled) setIsMapReady(true);
      } catch (err: any) {
        if (!cancelled) setMapError(err?.message ?? "Failed to load map");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, selectionMode]);

  // ── Reverse geocode ─────────────────────────────────────────────────────
  const reverseGeocode = useCallback((lat: number, lng: number) => {
    const geocoder = geocoderRef.current;
    if (!geocoder) return;

    setIsReverseGeocoding(true);
    geocoder.geocode(
      { location: { lat, lng } },
      (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        setIsReverseGeocoding(false);
        if (status !== "OK" || !results?.length) return;

        const components = results[0].address_components || [];
        let streetNumber = "";
        let village = "";
        let commune = "";
        let district = "";
        let province = "";
        let country = "";

        for (const comp of components) {
          const t = comp.types;
          if (t.includes("street_number")) {
            streetNumber = comp.long_name;
          } else if (t.includes("route")) {
            streetNumber = streetNumber
              ? `${streetNumber} ${comp.long_name}`
              : comp.long_name;
          } else if (t.includes("sublocality_level_1") || t.includes("sublocality")) {
            village = comp.long_name;
          } else if (t.includes("locality")) {
            commune = comp.long_name;
          } else if (t.includes("administrative_area_level_2")) {
            district = comp.long_name;
          } else if (t.includes("administrative_area_level_1")) {
            province = comp.long_name;
          } else if (t.includes("country")) {
            country = comp.long_name;
          }
        }

        const sv = setValueRef.current;
        sv("streetNumber", streetNumber, { shouldDirty: true });
        sv("village", village, { shouldDirty: true });
        sv("commune", commune, { shouldDirty: true });
        sv("district", district, { shouldDirty: true });
        sv("province", province, { shouldDirty: true });
        sv("country", country, { shouldDirty: true });
      }
    );
  }, []);

  // ── Map idle handler ────────────────────────────────────────────────────
  const onMapIdle = useCallback(() => {
    const map = googleMapRef.current;
    if (!map) return;
    const center = map.getCenter();
    if (!center) return;

    const lat = center.lat();
    const lng = center.lng();
    setValueRef.current("latitude", lat, { shouldDirty: true });
    setValueRef.current("longitude", lng, { shouldDirty: true });
    setIsDragging(false);

    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
    geocodeTimerRef.current = setTimeout(() => reverseGeocode(lat, lng), 400);
  }, [reverseGeocode]);

  // ── Setup autocomplete ──────────────────────────────────────────────────
  const setupAutocomplete = useCallback(
    (
      input: HTMLInputElement,
      ref: React.MutableRefObject<google.maps.places.Autocomplete | null>
    ) => {
      const map = googleMapRef.current;
      if (!map || !google.maps.places) return;
      if (ref.current) google.maps.event.clearInstanceListeners(ref.current);

      const ac = new google.maps.places.Autocomplete(input, {
        types: ["geocode", "establishment"],
      });
      ac.bindTo("bounds", map);
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (place.geometry?.location) {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }
      });
      ref.current = ac;
    },
    []
  );

  // ── Init map ────────────────────────────────────────────────────────────
  const initMap = useCallback(
    (container: HTMLDivElement, lat: number, lng: number) => {
      const map = new google.maps.Map(container, {
        center: { lat, lng },
        zoom: 17,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: "greedy",
      });
      googleMapRef.current = map;
      geocoderRef.current = new google.maps.Geocoder();

      map.addListener("dragstart", () => setIsDragging(true));
      map.addListener("dragend", () => setIsDragging(false));
      map.addListener("idle", onMapIdle);

      setValueRef.current("latitude", lat, { shouldDirty: true });
      setValueRef.current("longitude", lng, { shouldDirty: true });
      reverseGeocode(lat, lng);

      if (normalSearchRef.current && google.maps.places) {
        setupAutocomplete(normalSearchRef.current, normalAutocompleteRef);
      }
    },
    [onMapIdle, reverseGeocode, setupAutocomplete]
  );

  // ── Create map when ready ───────────────────────────────────────────────
  useEffect(() => {
    if (!isMapReady || !mapContainerRef.current || selectionMode !== "map") return;

    const lat = editData?.latitude || initialCoords?.lat || 11.5564;
    const lng = editData?.longitude || initialCoords?.lng || 104.9282;

    initMap(mapContainerRef.current, lat, lng);
    return () => {
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
      googleMapRef.current = null;
      geocoderRef.current = null;
      normalAutocompleteRef.current = null;
      fullscreenAutocompleteRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapReady, selectionMode]);

  // ── Handle fullscreen resize ────────────────────────────────────────────
  useEffect(() => {
    const map = googleMapRef.current;
    if (!map || !isMapReady) return;

    const resizeTimer = setTimeout(() => {
      google.maps.event.trigger(map, "resize");
      const center = map.getCenter();
      if (center) map.setCenter(center);
    }, 100);

    if (isFullScreen && fullscreenSearchRef.current && google.maps.places) {
      const acTimer = setTimeout(() => {
        if (fullscreenSearchRef.current) {
          setupAutocomplete(fullscreenSearchRef.current, fullscreenAutocompleteRef);
        }
      }, 150);
      return () => {
        clearTimeout(resizeTimer);
        clearTimeout(acTimer);
      };
    }
    return () => clearTimeout(resizeTimer);
  }, [isFullScreen, isMapReady, setupAutocomplete]);

  // ── My location ─────────────────────────────────────────────────────────
  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showToast.error("Geolocation is not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const map = googleMapRef.current;
        if (map) {
          map.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          map.setZoom(17);
        }
      },
      () => showToast.error("Unable to retrieve your location")
    );
  }, []);

  // ── Select-mode handlers ────────────────────────────────────────────────
  const handleProvinceChange = useCallback(
    (province: ProvinceResponseModel | null) => {
      if (!province) return;
      selectProvince(province);
      selectDistrict(null);
      selectCommune(null);
      setSelectedVillage(null);
      setGeocodeSuccess(false);
      setGeocodedCoords(null);
      setValue("province", province.provinceEn, { shouldDirty: true });
      setValue("district", "", { shouldDirty: true });
      setValue("commune", "", { shouldDirty: true });
      setValue("village", "", { shouldDirty: true });
      setValue("latitude", 0, { shouldDirty: true });
      setValue("longitude", 0, { shouldDirty: true });
    },
    [selectProvince, selectDistrict, selectCommune, setValue]
  );

  const handleDistrictChange = useCallback(
    (district: DistrictResponseModel | null) => {
      if (!district) return;
      selectDistrict(district);
      selectCommune(null);
      setSelectedVillage(null);
      setGeocodeSuccess(false);
      setGeocodedCoords(null);
      setValue("district", district.districtEn, { shouldDirty: true });
      setValue("commune", "", { shouldDirty: true });
      setValue("village", "", { shouldDirty: true });
      setValue("latitude", 0, { shouldDirty: true });
      setValue("longitude", 0, { shouldDirty: true });
    },
    [selectDistrict, selectCommune, setValue]
  );

  const handleCommuneChange = useCallback(
    (commune: CommuneResponseModel | null) => {
      if (!commune) return;
      selectCommune(commune);
      setSelectedVillage(null);
      setGeocodeSuccess(false);
      setGeocodedCoords(null);
      setValue("commune", commune.communeEn, { shouldDirty: true });
      setValue("village", "", { shouldDirty: true });
      setValue("latitude", 0, { shouldDirty: true });
      setValue("longitude", 0, { shouldDirty: true });
    },
    [selectCommune, setValue]
  );

  const handleVillageChange = useCallback(
    (village: VillageResponseModel | null) => {
      setSelectedVillage(village);
      setGeocodeSuccess(false);
      setGeocodedCoords(null);
      setValue("village", village?.villageEn ?? "", { shouldDirty: true });
      setValue("latitude", 0, { shouldDirty: true });
      setValue("longitude", 0, { shouldDirty: true });
    },
    [setValue]
  );

  const handleGetCoordinates = useCallback(async () => {
    const parts = [
      watch("houseNumber"),
      watch("streetNumber"),
      watch("village"),
      watch("commune"),
      watch("district"),
      watch("province"),
    ].filter(Boolean);

    if (parts.length === 0) {
      showToast.error("Please select at least a province");
      return;
    }

    setIsGeocodingAddress(true);
    setGeocodeSuccess(false);

    try {
      await loadGoogleMapsScript();
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { address: parts.join(", ") },
        (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          setIsGeocodingAddress(false);
          if (status === "OK" && results?.length) {
            const loc = results[0].geometry.location;
            const lat = loc.lat();
            const lng = loc.lng();
            setValue("latitude", lat, { shouldDirty: true });
            setValue("longitude", lng, { shouldDirty: true });
            setGeocodedCoords({ lat, lng });
            setGeocodeSuccess(true);
            showToast.success("Coordinates found successfully");
          } else {
            showToast.error("Could not resolve coordinates. Add more address details.");
          }
        }
      );
    } catch (err: any) {
      setIsGeocodingAddress(false);
      showToast.error(err?.message ?? "Failed to geocode address");
    }
  }, [watch, setValue]);

  // ── Submit ──────────────────────────────────────────────────────────────
  const onSubmit = async (data: LocationFormData) => {
    try {
      const payload = {
        label: data.label,
        latitude: data.latitude,
        longitude: data.longitude,
        houseNumber: data.houseNumber || "",
        streetNumber: data.streetNumber || "",
        village: data.village || "",
        commune: data.commune || "",
        district: data.district || "",
        province: data.province || "",
        country: data.country || "",
        note: data.note || "",
        isPrimary: data.isPrimary,
      };

      if (isCreate) {
        await create(payload).unwrap();
        showToast.success("Location created successfully");
      } else {
        await update({ locationId: editData!.id, locationData: payload }).unwrap();
        showToast.success("Location updated successfully");
      }
      handleClose();
    } catch (error: any) {
      showToast.error(
        error?.message ?? `Failed to ${isCreate ? "create" : "update"} location`
      );
    }
  };

  // ── Close ───────────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    setIsFullScreen(false);
    setSelectionMode("map");
    setSelectedVillage(null);
    setGeocodedCoords(null);
    setGeocodeSuccess(false);
    resetPublicLocation();
    reset();
    clearError();
    onClose();
  }, [reset, clearError, onClose, resetPublicLocation]);

  const handleModeChange = (mode: SelectionMode) => {
    setSelectionMode(mode);
    if (mode === "select") {
      setValue("latitude", 0, { shouldDirty: true });
      setValue("longitude", 0, { shouldDirty: true });
      setGeocodeSuccess(false);
      setGeocodedCoords(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`p-0 flex flex-col transition-all duration-300 overflow-hidden ${
          isFullScreen
            ? "w-screen max-w-none h-screen max-h-none rounded-none m-0"
            : "w-[95%] max-w-4xl max-h-[90vh]"
        }`}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest(".pac-container")) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest(".pac-container")) e.preventDefault();
        }}
      >
        {/* ── Modal header (hidden during fullscreen) ── */}
        <div className={isFullScreen ? "invisible h-0 overflow-hidden" : ""}>
          <FormHeader
            title={isCreate ? "Add New Location" : "Edit Location"}
            description={
              isCreate
                ? "Choose how you want to select your location"
                : "Update your location information"
            }
            isCreate={isCreate}
          />
        </div>

        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`flex flex-col flex-1 overflow-hidden ${
            isFullScreen ? "h-0" : ""
          }`}
        >
          <FormBody>
            {/* Redux error banner */}
            {reduxError && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  {reduxError}
                </p>
              </div>
            )}

            <div className="space-y-5">
              {/* ── Mode Tabs ── */}
              <Tabs
                value={selectionMode}
                onValueChange={(v) => handleModeChange(v as SelectionMode)}
              >
                <TabsList className="grid w-full grid-cols-2 h-11">
                  <TabsTrigger value="map" className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    Map Selection
                  </TabsTrigger>
                  <TabsTrigger
                    value="select"
                    className="flex items-center gap-2"
                  >
                    <ListFilter className="h-4 w-4" />
                    Location Selector
                  </TabsTrigger>
                </TabsList>

                {/* ── Map tab ── */}
                <TabsContent value="map" className="mt-4">
                  <LocationMapTab
                    mapContainerRef={mapContainerRef}
                    searchInputRef={normalSearchRef}
                    fullscreenSearchInputRef={fullscreenSearchRef}
                    isMapReady={isMapReady}
                    isFullScreen={isFullScreen}
                    isDragging={isDragging}
                    isReverseGeocoding={isReverseGeocoding}
                    mapError={mapError}
                    latitude={latitude}
                    longitude={longitude}
                    onMyLocation={handleMyLocation}
                    onToggleFullscreen={() => setIsFullScreen((v) => !v)}
                  />
                </TabsContent>

                {/* ── Select tab ── */}
                <TabsContent value="select" className="mt-4">
                  <LocationSelectTab
                    selectedProvince={selectedProvince}
                    selectedDistrict={selectedDistrict}
                    selectedCommune={selectedCommune}
                    selectedVillage={selectedVillage}
                    isGeocodingAddress={isGeocodingAddress}
                    geocodedCoords={geocodedCoords}
                    geocodeSuccess={geocodeSuccess}
                    addressPreview={addressPreview}
                    onProvinceChange={handleProvinceChange}
                    onDistrictChange={handleDistrictChange}
                    onCommuneChange={handleCommuneChange}
                    onVillageChange={handleVillageChange}
                    onGetCoordinates={handleGetCoordinates}
                  />
                </TabsContent>
              </Tabs>

              {/* ── Shared fields ── */}
              <div className="pt-2 border-t space-y-4">
                <TextField
                  control={control}
                  name="label"
                  label="Label"
                  placeholder="e.g., Home, Office, Shop"
                  required
                  disabled={isSubmitting}
                  error={errors.label}
                />

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold">Address Details</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectionMode === "map"
                        ? "Auto-filled from map. Edit if needed."
                        : "Add house/street number for a precise address."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextField
                      control={control}
                      name="houseNumber"
                      label="House Number"
                      placeholder="Enter house number"
                      disabled={isSubmitting}
                      error={errors.houseNumber}
                    />
                    <TextField
                      control={control}
                      name="streetNumber"
                      label="Street"
                      placeholder="Enter street"
                      disabled={isSubmitting}
                      error={errors.streetNumber}
                    />

                    {/* Extra fields only shown for map mode */}
                    {selectionMode === "map" && (
                      <>
                        <TextField
                          control={control}
                          name="village"
                          label="Village / Sangkat"
                          placeholder="Auto-filled"
                          disabled={isSubmitting}
                          error={errors.village}
                        />
                        <TextField
                          control={control}
                          name="commune"
                          label="Commune / City"
                          placeholder="Auto-filled"
                          disabled={isSubmitting}
                          error={errors.commune}
                        />
                        <TextField
                          control={control}
                          name="district"
                          label="District / Khan"
                          placeholder="Auto-filled"
                          disabled={isSubmitting}
                          error={errors.district}
                        />
                        <TextField
                          control={control}
                          name="province"
                          label="Province"
                          placeholder="Auto-filled"
                          disabled={isSubmitting}
                          error={errors.province}
                        />
                        <TextField
                          control={control}
                          name="country"
                          label="Country"
                          placeholder="Auto-filled"
                          disabled={isSubmitting}
                          error={errors.country}
                        />
                      </>
                    )}
                  </div>
                </div>

                <TextareaField
                  control={control}
                  name="note"
                  label="Note"
                  placeholder="Delivery instructions or extra details"
                  rows={2}
                  disabled={isSubmitting}
                  error={errors.note}
                />

                <CheckboxField
                  control={control}
                  name="isPrimary"
                  label="Set as primary location"
                  disabled={isSubmitting}
                  error={errors.isPrimary}
                />
              </div>
            </div>
          </FormBody>

          <FormFooter
            isSubmitting={isSubmitting}
            isDirty={isDirty}
            isCreate={isCreate}
            createMessage="Creating location..."
            updateMessage="Updating location..."
          >
            <CancelButton onClick={handleClose} disabled={isSubmitting} />
            <SubmitButton
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createText="Add Location"
              updateText="Update Location"
              submittingCreateText="Creating..."
              submittingUpdateText="Updating..."
            />
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
