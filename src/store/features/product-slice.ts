// store/productSlice.ts
import {
  AllProduct,
  ProductModel,
} from "@/models/content-manangement/product/product.response";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProductState {
  allProducts: AllProduct;
  isLoadedProducts: boolean;
}

const initialState: ProductState = {
  allProducts: {
    content: [],
    pageNo: 1,
    pageSize: 12,
    totalElements: 0,
    totalPages: 0,
    last: false,
    first: true,
    hasNext: false,
    hasPrevious: false,
  },
  isLoadedProducts: false,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setAllProducts: (state, action: PayloadAction<AllProduct>) => {
      state.allProducts = action.payload;
      state.isLoadedProducts = true;
    },
    appendProducts: (state, action: PayloadAction<ProductModel[]>) => {
      state.allProducts.content = [
        ...state.allProducts.content,
        ...action.payload,
      ];
      state.allProducts.pageNo += 1;
    },
    resetProducts: () => initialState,
  },
});

export const { setAllProducts, appendProducts, resetProducts } =
  productSlice.actions;

export default productSlice.reducer;
