/**
 * Store Reducers Configuration
 * Centralized configuration for all Redux reducers
 */

import authReducer from "../features/auth/store/slice/auth-slice";
import usersReducer from "../features/auth/store/slice/users-slice";

import bannerReducer from "../features/master-data/store/slice/banner-slice";
import brandReducer from "../features/master-data/store/slice/brand-slice";
import categoriesReducer from "../features/master-data/store/slice/categories-slice";
import exchangeRateReducer from "../features/master-data/store/slice/exchange-rate-slice";
import deliveryOptionsReducer from "../features/master-data/store/slice/delivery-options-slice";

/**
 * Root reducer configuration
 * Add new feature reducers here
 */
export const reducers = {
  auth: authReducer,
  users: usersReducer,
  banner: bannerReducer,
  brand: brandReducer,
  categories: categoriesReducer,
  exchangeRate: exchangeRateReducer,
  deliveryOptions: deliveryOptionsReducer,
};
