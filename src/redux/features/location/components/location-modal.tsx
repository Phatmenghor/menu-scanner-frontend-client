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
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { CheckboxField } from "@/components/shared/form-field/checkbox-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createLocationService,
  updateLocationService,
} from "../store/thunks/location-thunks";
import {
  fetchProvincesService,
  fetchDistrictsService,
  fetchCommunesService,
  fetchVillagesService,
} from "../store/thunks/public-location-thunks";
import {
  setSelectedProvince,
  setSelectedDistrict,
  setSelectedCommune,
  resetPublicLocation,
} from "../store/slice/public-location-slice";
import {
  selectProvinces,
  selectDistricts,
  selectCommunes,
  selectVillages,
  selectSelectedProvince,
  selectSelectedDistrict,
  selectSelectedCommune,
  selectPublicLocationLoading,
} from "../store/selectors/public-location-selector";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import { clearLocationError } from "../store/slice/location-slice";
import {
  selectLocationError,
  selectLocationOperations,
} from "../store/selectors/location-selector";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import {
  createLocationSchema,
  LocationFormData,
} from "../store/models/schema/location-schema";
import { LocationResponseModel } from "../store/models/response/location-response";
import {
  ProvinceResponseModel,
  DistrictResponseModel,
  CommuneResponseModel,
  VillageResponseModel,
} from "../store/models/response/location-response";
import {
  MapPin,
  Search,
  Loader2,
  Maximize2,
  Minimize2,
  LocateFixed,
  AlertTriangle,
  Map,
  ListFilter,
  ChevronRight,
  Navigation2,
  CheckCircle2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Google Maps script loader (singleton promise)
// ---------------------------------------------------------------------------
let gmapLoadPromise: Promise<void> | null = null;

function loadGoogleMapsScript(): Promise<void> {
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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  editData?: LocationResponseModel | null;
  initialCoords?: { lat: number; lng: number } | null;
};

// ---------------------------------------------------------------------------
// LocationModal Component
// ---------------------------------------------------------------------------
export default function LocationModal({
  isOpen,
  onClose,
  editData,
  initialCoords,
}: Props) {
  const isCreate = !editData;
  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectLocationOperations);
  const reduxError = useAppSelector(selectLocationError);
  const { isCreating, isUpdating } = operations;

  // Public location data
  const provinces = useAppSelector(selectProvinces);
  const districts = useAppSelector(selectDistricts);
  const communes = useAppSelector(selectCommunes);
  const villages = useAppSelector(selectVillages);
  const selectedProvince = useAppSelector(selectSelectedProvince);
  const selectedDistrict = useAppSelector(selectSelectedDistrict);
  const selectedCommune = useAppSelector(selectSelectedCommune);
  const publicLoading = useAppSelector(selectPublicLocationLoading);

  // Mode
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("map");

  // Select mode local state
  const [selectedVillage, setSelectedVillage] =
    useState<VillageResponseModel | null>(null);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [geocodedCoords, setGeocodedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geocodeSuccess, setGeocodeSuccess] = useState(false);

  // Map refs/state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const normalSearchInputRef = useRef<HTMLInputElement>(null);
  const fullscreenSearchInputRef = useRef<HTMLInputElement>(null);
  const normalAutocompleteRef =
    useRef<google.maps.places.Autocomplete | null>(null);
  const fullscreenAutocompleteRef =
    useRef<google.maps.places.Autocomplete | null>(null);
  const geocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setValueRef = useRef<typeof setValue>(null!);

  const [isMapReady, setIsMapReady] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Form
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

  setValueRef.current = setValue;
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  // ---------------------------------------------------------------------------
  // Load provinces on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isOpen && provinces.length === 0) {
      dispatch(fetchProvincesService());
    }
  }, [isOpen, dispatch, provinces.length]);

  // ---------------------------------------------------------------------------
  // Map: Reverse geocode
  // ---------------------------------------------------------------------------
  const reverseGeocode = useCallback((lat: number, lng: number) => {
    const geocoder = geocoderRef.current;
    if (!geocoder) return;

    setIsReverseGeocoding(true);
    geocoder.geocode(
      { location: { lat, lng } },
      (
        results: google.maps.GeocoderResult[] | null,
        status: google.maps.GeocoderStatus
      ) => {
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
          } else if (
            t.includes("sublocality_level_1") ||
            t.includes("sublocality")
          ) {
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

  const onMapIdle = useCallback(() => {
    const map = googleMapRef.current;
    if (!map) return;
    const center = map.getCenter();
    if (!center) return;

    const lat = center.lat();
    const lng = center.lng();
    const sv = setValueRef.current;
    sv("latitude", lat, { shouldDirty: true });
    sv("longitude", lng, { shouldDirty: true });
    setIsDragging(false);

    if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
    geocodeTimeoutRef.current = setTimeout(() => {
      reverseGeocode(lat, lng);
    }, 400);
  }, [reverseGeocode]);

  const setupAutocomplete = useCallback(
    (
      input: HTMLInputElement,
      autocompleteRef: React.MutableRefObject<google.maps.places.Autocomplete | null>
    ) => {
      const map = googleMapRef.current;
      if (!map || !google.maps.places) return;
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ["geocode", "establishment"],
      });
      autocomplete.bindTo("bounds", map);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }
      });
      autocompleteRef.current = autocomplete;
    },
    []
  );

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

      const sv = setValueRef.current;
      sv("latitude", lat, { shouldDirty: true });
      sv("longitude", lng, { shouldDirty: true });
      reverseGeocode(lat, lng);

      if (normalSearchInputRef.current && google.maps.places) {
        setupAutocomplete(normalSearchInputRef.current, normalAutocompleteRef);
      }
    },
    [onMapIdle, reverseGeocode, setupAutocomplete]
  );

  // Load script & init map when modal opens and mode is map
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
        if (!cancelled) setMapError(err?.message || "Failed to load map");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, selectionMode]);

  useEffect(() => {
    if (!isMapReady || !mapContainerRef.current || selectionMode !== "map")
      return;

    let lat: number;
    let lng: number;
    if (editData) {
      lat = editData.latitude || 11.5564;
      lng = editData.longitude || 104.9282;
    } else if (initialCoords) {
      lat = initialCoords.lat;
      lng = initialCoords.lng;
    } else {
      lat = 11.5564;
      lng = 104.9282;
    }

    initMap(mapContainerRef.current, lat, lng);

    return () => {
      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
      googleMapRef.current = null;
      geocoderRef.current = null;
      normalAutocompleteRef.current = null;
      fullscreenAutocompleteRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapReady, selectionMode]);

  // Fullscreen resize
  useEffect(() => {
    const map = googleMapRef.current;
    if (!map || !isMapReady) return;

    const resizeTimeout = setTimeout(() => {
      google.maps.event.trigger(map, "resize");
      const center = map.getCenter();
      if (center) map.setCenter(center);
    }, 100);

    if (isFullScreen && fullscreenSearchInputRef.current && google.maps.places) {
      const autocompleteTimeout = setTimeout(() => {
        if (fullscreenSearchInputRef.current) {
          setupAutocomplete(
            fullscreenSearchInputRef.current,
            fullscreenAutocompleteRef
          );
        }
      }, 150);
      return () => {
        clearTimeout(resizeTimeout);
        clearTimeout(autocompleteTimeout);
      };
    }
    return () => clearTimeout(resizeTimeout);
  }, [isFullScreen, isMapReady, setupAutocomplete]);

  // Reset form
  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      reset({
        label: editData.label || "",
        latitude: editData.latitude || 0,
        longitude: editData.longitude || 0,
        houseNumber: editData.houseNumber || "",
        streetNumber: editData.streetNumber || "",
        village: editData.village || "",
        commune: editData.commune || "",
        district: editData.district || "",
        province: editData.province || "",
        country: editData.country || "",
        note: editData.note || "",
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
    dispatch(clearLocationError());
  }, [isOpen, editData, reset, dispatch]);

  // My location
  const handleMyLocation = () => {
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
  };

  // ---------------------------------------------------------------------------
  // Select mode: province/district/commune/village handlers
  // ---------------------------------------------------------------------------
  const handleProvinceChange = (provinceCode: string) => {
    const province = provinces.find((p) => p.provinceCode === provinceCode);
    if (!province) return;
    dispatch(setSelectedProvince(province));
    setSelectedVillage(null);
    setGeocodeSuccess(false);
    setGeocodedCoords(null);
    dispatch(fetchDistrictsService({ provinceCode }));
    setValue("province", province.provinceEn, { shouldDirty: true });
    setValue("district", "", { shouldDirty: true });
    setValue("commune", "", { shouldDirty: true });
    setValue("village", "", { shouldDirty: true });
    setValue("latitude", 0, { shouldDirty: true });
    setValue("longitude", 0, { shouldDirty: true });
  };

  const handleDistrictChange = (districtCode: string) => {
    const district = districts.find((d) => d.districtCode === districtCode);
    if (!district) return;
    dispatch(setSelectedDistrict(district));
    setSelectedVillage(null);
    setGeocodeSuccess(false);
    setGeocodedCoords(null);
    dispatch(fetchCommunesService({ districtCode }));
    setValue("district", district.districtEn, { shouldDirty: true });
    setValue("commune", "", { shouldDirty: true });
    setValue("village", "", { shouldDirty: true });
    setValue("latitude", 0, { shouldDirty: true });
    setValue("longitude", 0, { shouldDirty: true });
  };

  const handleCommuneChange = (communeCode: string) => {
    const commune = communes.find((c) => c.communeCode === communeCode);
    if (!commune) return;
    dispatch(setSelectedCommune(commune));
    setSelectedVillage(null);
    setGeocodeSuccess(false);
    setGeocodedCoords(null);
    dispatch(fetchVillagesService({ communeCode }));
    setValue("commune", commune.communeEn, { shouldDirty: true });
    setValue("village", "", { shouldDirty: true });
    setValue("latitude", 0, { shouldDirty: true });
    setValue("longitude", 0, { shouldDirty: true });
  };

  const handleVillageChange = (villageCode: string) => {
    const village = villages.find((v) => v.villageCode === villageCode);
    if (!village) return;
    setSelectedVillage(village);
    setGeocodeSuccess(false);
    setGeocodedCoords(null);
    setValue("village", village.villageEn, { shouldDirty: true });
    setValue("latitude", 0, { shouldDirty: true });
    setValue("longitude", 0, { shouldDirty: true });
  };

  // Geocode the selected address to get lat/lng
  const handleGeocodeAddress = async () => {
    const province = watch("province");
    const district = watch("district");
    const commune = watch("commune");
    const village = watch("village");
    const street = watch("streetNumber");
    const house = watch("houseNumber");

    const addressParts = [house, street, village, commune, district, province].filter(Boolean);
    if (addressParts.length === 0) {
      showToast.error("Please select at least a province to geocode");
      return;
    }

    const address = addressParts.join(", ");
    setIsGeocodingAddress(true);
    setGeocodeSuccess(false);

    try {
      await loadGoogleMapsScript();
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { address },
        (
          results: google.maps.GeocoderResult[] | null,
          status: google.maps.GeocoderStatus
        ) => {
          setIsGeocodingAddress(false);
          if (status === "OK" && results && results.length > 0) {
            const loc = results[0].geometry.location;
            const lat = loc.lat();
            const lng = loc.lng();
            setValue("latitude", lat, { shouldDirty: true });
            setValue("longitude", lng, { shouldDirty: true });
            setGeocodedCoords({ lat, lng });
            setGeocodeSuccess(true);
            showToast.success("Coordinates found successfully");
          } else {
            showToast.error(
              "Could not find coordinates for this address. Try adding more details."
            );
          }
        }
      );
    } catch (err: any) {
      setIsGeocodingAddress(false);
      showToast.error(err?.message || "Failed to geocode address");
    }
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------
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
        await dispatch(createLocationService(payload)).unwrap();
        showToast.success("Location created successfully");
      } else {
        await dispatch(
          updateLocationService({
            locationId: editData!.id,
            locationData: payload,
          })
        ).unwrap();
        showToast.success("Location updated successfully");
      }
      handleClose();
    } catch (error: any) {
      showToast.error(
        error?.message ||
          `Failed to ${isCreate ? "create" : "update"} location`
      );
    }
  };

  const handleClose = () => {
    setIsFullScreen(false);
    setSelectionMode("map");
    setSelectedVillage(null);
    setGeocodedCoords(null);
    setGeocodeSuccess(false);
    dispatch(resetPublicLocation());
    reset();
    dispatch(clearLocationError());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;

  // ---------------------------------------------------------------------------
  // Shared UI
  // ---------------------------------------------------------------------------
  const CenterPin = ({ size = "h-9 w-9" }: { size?: string }) => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10">
      <div
        className={`transition-transform duration-150 ${
          isDragging ? "-translate-y-3 scale-110" : "translate-y-0 scale-100"
        }`}
      >
        <MapPin
          className={`${size} text-red-500 drop-shadow-lg`}
          fill="currentColor"
          strokeWidth={1.5}
        />
      </div>
      <div
        className={`h-1 bg-black/30 rounded-full mx-auto transition-all duration-150 ${
          isDragging ? "w-3 opacity-40" : "w-2 opacity-60"
        }`}
      />
    </div>
  );

  const CoordsBadge = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <MapPin className="h-3 w-3 text-red-500 shrink-0" />
      <span className="font-mono">
        {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
      </span>
      {(isReverseGeocoding || isGeocodingAddress) && (
        <Loader2 className="h-3 w-3 animate-spin shrink-0" />
      )}
    </div>
  );

  const MapErrorBanner = () => (
    <div className="absolute top-2 left-2 right-2 z-20 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
      <div className="text-xs text-yellow-800">
        <p className="font-medium">Google Maps API key issue</p>
        <p className="mt-0.5">
          Enable Maps JavaScript API, Geocoding API &amp; Places API in your{" "}
          <span className="font-medium">Google Cloud Console</span>, and ensure
          billing is active.
        </p>
      </div>
    </div>
  );

  // Build selected address text for Select mode
  const selectedAddressText = useMemo(() => {
    const parts = [
      watch("houseNumber"),
      watch("streetNumber"),
      watch("village"),
      watch("commune"),
      watch("district"),
      watch("province"),
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  }, [
    watch("houseNumber"),
    watch("streetNumber"),
    watch("village"),
    watch("commune"),
    watch("district"),
    watch("province"),
  ]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
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
        {/* ======= FULLSCREEN MAP OVERLAY ======= */}
        {isFullScreen && (
          <div className="absolute inset-0 z-50 flex flex-col bg-background">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-background z-10 shrink-0">
              <h2 className="text-lg font-semibold">Select Location on Map</h2>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleMyLocation}
                >
                  <LocateFixed className="h-4 w-4 mr-1" />
                  My Location
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullScreen(false)}
                >
                  <Minimize2 className="h-4 w-4 mr-1" />
                  Done
                </Button>
              </div>
            </div>
            <div className="px-4 py-2 border-b bg-background z-10 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={fullscreenSearchInputRef}
                  type="text"
                  placeholder="Search for a place..."
                  className="pl-10"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="flex-1 relative">
              <CenterPin size="h-10 w-10" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg z-10">
                <CoordsBadge />
              </div>
              {!isMapReady && !mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {mapError && <MapErrorBanner />}
            </div>
          </div>
        )}

        {/* ======= NORMAL MODAL ======= */}
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`flex flex-col flex-1 overflow-hidden ${
            isFullScreen ? "h-0" : ""
          }`}
        >
          <FormBody>
            {reduxError && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  {reduxError}
                </p>
              </div>
            )}

            <div className="space-y-5">
              {/* ===== Mode Tabs ===== */}
              <Tabs
                value={selectionMode}
                onValueChange={(v) => {
                  setSelectionMode(v as SelectionMode);
                  if (v === "select") {
                    // Reset map-derived coords when switching to select
                    setValue("latitude", 0, { shouldDirty: true });
                    setValue("longitude", 0, { shouldDirty: true });
                    setGeocodeSuccess(false);
                    setGeocodedCoords(null);
                  }
                }}
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

                {/* ===== MAP TAB ===== */}
                <TabsContent value="map" className="mt-4 space-y-3">
                  {/* Search + actions */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        ref={normalSearchInputRef}
                        type="text"
                        placeholder="Search for a place..."
                        className="pl-10"
                        autoComplete="off"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleMyLocation}
                      title="Use my location"
                    >
                      <LocateFixed className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setIsFullScreen(true)}
                      title="Fullscreen map"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Map container */}
                  <div
                    className={`relative ${
                      isFullScreen
                        ? "fixed inset-0 z-[49] top-[105px] visible"
                        : "rounded-lg overflow-hidden border"
                    }`}
                  >
                    <div
                      ref={mapContainerRef}
                      className={
                        isFullScreen ? "w-full h-full visible" : "w-full h-[260px]"
                      }
                    />
                    {!isFullScreen && <CenterPin />}
                    {!isFullScreen && !isMapReady && !mapError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">
                            Loading map...
                          </span>
                        </div>
                      </div>
                    )}
                    {!isFullScreen && mapError && <MapErrorBanner />}
                  </div>

                  {/* Coords bar */}
                  {!isFullScreen && (latitude !== 0 || longitude !== 0) && (
                    <div className="bg-muted/50 px-3 py-2 rounded-md flex items-center justify-between">
                      <CoordsBadge className="text-muted-foreground" />
                      <Badge variant="secondary" className="text-xs">
                        Pin dropped
                      </Badge>
                    </div>
                  )}
                </TabsContent>

                {/* ===== SELECT TAB ===== */}
                <TabsContent value="select" className="mt-4 space-y-4">
                  <div className="bg-muted/40 rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Navigation2 className="h-4 w-4 text-primary shrink-0" />
                      <p>
                        Select your location hierarchy. After selecting, click
                        &quot;Get Coordinates&quot; to resolve lat/lng.
                      </p>
                    </div>

                    {/* Province */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">
                        Province / City <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedProvince?.provinceCode || ""}
                        onValueChange={handleProvinceChange}
                        disabled={publicLoading.provinces}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              publicLoading.provinces
                                ? "Loading provinces..."
                                : "Select province..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {provinces.map((p) => (
                            <SelectItem
                              key={p.provinceCode}
                              value={p.provinceCode}
                            >
                              <span>{p.provinceEn}</span>
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
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        District / Khan
                      </Label>
                      <Select
                        value={selectedDistrict?.districtCode || ""}
                        onValueChange={handleDistrictChange}
                        disabled={!selectedProvince || publicLoading.districts}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedProvince
                                ? "Select province first"
                                : publicLoading.districts
                                ? "Loading districts..."
                                : "Select district..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {districts.map((d) => (
                            <SelectItem
                              key={d.districtCode}
                              value={d.districtCode}
                            >
                              <span>{d.districtEn}</span>
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
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <ChevronRight className="h-3.5 w-3.5 -ml-2.5 text-muted-foreground" />
                        Commune / Sangkat
                      </Label>
                      <Select
                        value={selectedCommune?.communeCode || ""}
                        onValueChange={handleCommuneChange}
                        disabled={!selectedDistrict || publicLoading.communes}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedDistrict
                                ? "Select district first"
                                : publicLoading.communes
                                ? "Loading communes..."
                                : "Select commune..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {communes.map((c) => (
                            <SelectItem
                              key={c.communeCode}
                              value={c.communeCode}
                            >
                              <span>{c.communeEn}</span>
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
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <ChevronRight className="h-3.5 w-3.5 -ml-2.5 text-muted-foreground" />
                        <ChevronRight className="h-3.5 w-3.5 -ml-2.5 text-muted-foreground" />
                        Village / Phum
                        <span className="text-muted-foreground text-xs font-normal ml-1">
                          (optional)
                        </span>
                      </Label>
                      <Select
                        value={selectedVillage?.villageCode || ""}
                        onValueChange={handleVillageChange}
                        disabled={!selectedCommune || publicLoading.villages}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedCommune
                                ? "Select commune first"
                                : publicLoading.villages
                                ? "Loading villages..."
                                : "Select village..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {villages.map((v) => (
                            <SelectItem
                              key={v.villageCode}
                              value={v.villageCode}
                            >
                              <span>{v.villageEn}</span>
                              <span className="ml-2 text-muted-foreground text-xs">
                                {v.villageKh}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Selected address preview */}
                  {selectedAddressText && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-primary mb-1">
                            Selected Address
                          </p>
                          <p className="text-sm text-foreground leading-relaxed">
                            {selectedAddressText}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Geocode button + result */}
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGeocodeAddress}
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
                            {geocodedCoords.lat.toFixed(6)},{" "}
                            {geocodedCoords.lng.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* ===== SHARED FIELDS ===== */}
              <div className="pt-2 border-t space-y-4">
                {/* Label */}
                <TextField
                  control={control}
                  name="label"
                  label="Label"
                  placeholder="e.g., Home, Office, Shop"
                  required
                  disabled={isSubmitting}
                  error={errors.label}
                />

                {/* Address Details */}
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
