/**
 * Store Reducers Configuration
 * Centralized configuration for all Redux reducers
 */

import authReducer from "../features/auth/store/slice/auth-slice";
import usersReducer from "../features/auth/store/slice/users-slice";
import businessOwnerReducer from "../features/auth/store/slice/business-owner-slice";

import communeReducer from "../features/location/store/slice/commune-slice";
import provinceReducer from "../features/location/store/slice/province-slice";
import districtReducer from "../features/location/store/slice/district-slice";
import villageReducer from "../features/location/store/slice/village-slice";

/**
 * Root reducer configuration
 * Add new feature reducers here
 */
export const reducers = {
  auth: authReducer,
  users: usersReducer,
  commune: communeReducer,
  province: provinceReducer,
  district: districtReducer,
  village: villageReducer,
  businessOwner: businessOwnerReducer,
};
