"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  MapPin,
  Calendar,
  User,
  Star,
  StarOff,
  Globe,
  Navigation,
  Building,
  Home,
  FileText,
  CheckCircle,
  XCircle,
  Map,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Loading from "@/components/shared/common/loading";
import { AddressModel } from "@/models/public/dashboard/address/address.response";
import { getAddressByIdService } from "@/services/public/address/address.service";

interface AddressDetailModalProps {
  addressId?: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (addressId: string) => void;
}

export function AddressDetailModal({
  addressId,
  isOpen,
  onClose,
  onEdit,
}: AddressDetailModalProps) {
  const [addressData, setAddressData] = useState<AddressModel | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    const fetchAddressData = async () => {
      if (!addressId || !isOpen) return;

      setIsLoadingData(true);
      try {
        const data = await getAddressByIdService(addressId);
        setAddressData(data);
      } catch (error: any) {
        console.error("Error fetching address data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAddressData();
  }, [addressId, isOpen]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCoordinate = (value: number, type: "lat" | "lng") => {
    if (!value || value === 0) return "N/A";
    const direction =
      type === "lat" ? (value > 0 ? "N" : "S") : value > 0 ? "E" : "W";
    return `${Math.abs(value).toFixed(6)}° ${direction}`;
  };

  const handleClose = () => {
    setAddressData(null);
    onClose();
  };

  const handleEditClick = () => {
    if (addressData?.id && onEdit) {
      onEdit(addressData.id);
    }
  };

  const openInGoogleMaps = () => {
    if (addressData?.latitude && addressData?.longitude) {
      const url = `https://www.google.com/maps?q=${addressData.latitude},${addressData.longitude}`;
      window.open(url, "_blank");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                Address Details
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {addressData?.fullAddress
                  ? `Information for "${addressData.fullAddress}"`
                  : "Loading address information..."}
              </DialogDescription>
              {addressData && (
                <div className="flex items-center gap-2 mt-2">
                  {addressData.isDefault && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Star className="h-3 w-3 mr-1" />
                      Default Address
                    </Badge>
                  )}
                  {addressData.hasCoordinates ? (
                    <Badge className="bg-primary-100 text-blue-800 border-blue-200">
                      <Navigation className="h-3 w-3 mr-1" />
                      Has Coordinates
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                      <MapPin className="h-3 w-3 mr-1" />
                      No Coordinates
                    </Badge>
                  )}
                </div>
              )}
            </div>
            {addressData && onEdit && (
              <Button onClick={handleEditClick} variant="outline" size="sm">
                Edit Address
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            {/* Loading State */}
            {isLoadingData ? (
              <Loading />
            ) : addressData ? (
              <div className="space-y-6">
                {/* Full Address */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">Full Address</h3>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-base font-medium">
                      {addressData.fullAddress}
                    </p>
                  </div>
                </div>

                {/* Address Components */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">
                      Address Components
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label className="text-sm font-medium text-muted-foreground">
                          House Number:
                        </Label>
                        <span className="text-sm flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          {addressData.houseNumber || "---"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Street:
                        </Label>
                        <span className="text-sm">
                          {addressData.streetNumber || "---"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Village:
                        </Label>
                        <span className="text-sm">
                          {addressData.village || "---"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Commune:
                        </Label>
                        <span className="text-sm">
                          {addressData.commune || "---"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label className="text-sm font-medium text-muted-foreground">
                          District:
                        </Label>
                        <span className="text-sm flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {addressData.district || "---"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Province:
                        </Label>
                        <span className="text-sm flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {addressData.province || "---"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Default Address:
                        </Label>
                        <span className="text-sm flex items-center gap-2">
                          {addressData.isDefault ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          {addressData.isDefault ? "Yes" : "No"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Has Coordinates:
                        </Label>
                        <span className="text-sm flex items-center gap-2">
                          {addressData.hasCoordinates ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          {addressData.hasCoordinates ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Coordinates */}
                {addressData.hasCoordinates && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                      <h3 className="text-lg font-semibold">Location</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Latitude:
                        </Label>
                        <span className="text-sm font-mono">
                          {formatCoordinate(addressData.latitude, "lat")}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Longitude:
                        </Label>
                        <span className="text-sm font-mono">
                          {formatCoordinate(addressData.longitude, "lng")}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Coordinates:
                        </Label>
                        <span className="text-sm font-mono">
                          {addressData.latitude.toFixed(6)},{" "}
                          {addressData.longitude.toFixed(6)}
                        </span>
                      </div>

                      <div className="pt-2">
                        <Button
                          onClick={openInGoogleMaps}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Map className="h-4 w-4 mr-2" />
                          View on Google Maps
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {addressData.note && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 bg-orange-600 rounded-full"></div>
                      <h3 className="text-lg font-semibold">Notes</h3>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                        <p className="text-sm">{addressData.note}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* System Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">
                      System Information
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Created By:
                      </Label>
                      <span className="text-sm font-mono">
                        {addressData.createdBy}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Updated By:
                      </Label>
                      <span className="text-sm font-mono">
                        {addressData.updatedBy}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Created:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(addressData.createdAt)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Last Updated:
                      </Label>
                      <span className="text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(addressData.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No address data available
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
