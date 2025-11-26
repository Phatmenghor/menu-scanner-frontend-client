import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function MapModal() {
  return (
    <div>
      {/* Map Selection Modal */}
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
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

          <div className="space-y-4 overflow-y-auto">
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

            {/* Action Buttons for Map Modal */}
          </div>
          <DialogFooter>
            <div className="flex justify-between items-center pt-2">
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
