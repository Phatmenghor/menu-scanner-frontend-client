import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/user-slice";
import productReducer from "./features/product-slice";
import categoryReducer from "./features/category-slice";
export const store = configureStore({
  reducer: {
    user: userReducer,
    products: productReducer,
    category: categoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
