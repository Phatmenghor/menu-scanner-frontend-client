// store/productSlice.ts
import {
  AllCategories,
  CategoryModel,
} from "@/models/content-manangement/category/category.response";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CategoryState {
  allCategories: AllCategories;
  isLoadedCategories: boolean;
}

const initialState: CategoryState = {
  allCategories: {
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
  isLoadedCategories: false,
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setAllCategories: (state, action: PayloadAction<AllCategories>) => {
      state.allCategories = action.payload;
      state.isLoadedCategories = true;
    },
    appendCategory: (state, action: PayloadAction<CategoryModel[]>) => {
      state.allCategories.content = [
        ...state.allCategories.content,
        ...action.payload,
      ];
      state.allCategories.pageNo += 1;
    },
    resetCategory: () => initialState,
  },
});

export const { setAllCategories, appendCategory, resetCategory } =
  categorySlice.actions;

export default categorySlice.reducer;
