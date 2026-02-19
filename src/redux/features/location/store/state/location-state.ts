import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectLocations,
  selectLocationData,
  selectLocationIsLoading,
  selectLocationError,
  selectLocationOperations,
  selectDefaultLocation,
  selectPrimaryLocation,
  selectLocationCount,
} from "../selectors/location-selector";
import {
  fetchAllLocationsService,
  createLocationService,
  updateLocationService,
  deleteLocationService,
  fetchDefaultLocationService,
} from "../thunks/location-thunks";
import { clearLocationError, resetLocationState } from "../slice/location-slice";
import {
  LocationCreateRequest,
  LocationUpdateRequest,
} from "../models/request/location-request";

/**
 * Custom state hook for user location management.
 * Encapsulates Redux dispatch + selectors into a single composable hook.
 */
export const useLocationState = () => {
  const dispatch = useAppDispatch();

  return {
    // ── State ──────────────────────────────────────────────────────────
    locations: useAppSelector(selectLocations),
    data: useAppSelector(selectLocationData),
    defaultLocation: useAppSelector(selectDefaultLocation),
    primaryLocation: useAppSelector(selectPrimaryLocation),
    locationCount: useAppSelector(selectLocationCount),

    // ── Loading / Error ────────────────────────────────────────────────
    isLoading: useAppSelector(selectLocationIsLoading),
    error: useAppSelector(selectLocationError),
    operations: useAppSelector(selectLocationOperations),

    // ── Actions ────────────────────────────────────────────────────────
    fetchAll: () => dispatch(fetchAllLocationsService()),
    create: (data: LocationCreateRequest) =>
      dispatch(createLocationService(data)),
    update: (params: LocationUpdateRequest) =>
      dispatch(updateLocationService(params)),
    remove: (locationId: string) => dispatch(deleteLocationService(locationId)),
    fetchDefault: () => dispatch(fetchDefaultLocationService()),
    clearError: () => dispatch(clearLocationError()),
    reset: () => dispatch(resetLocationState()),

    // ── Raw dispatch ──────────────────────────────────────────────────
    dispatch,
  };
};
