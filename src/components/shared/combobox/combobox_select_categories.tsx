"use client";

import { BaseCombobox, BaseComboboxProps } from "./base-combobox";
import { useAppDispatch } from "@/redux/store";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { fetchAllCategoriesService } from "@/redux/features/master-data/store/thunks/categories-thunks";

const ALL_OPTION: CategoriesResponseModel = {
  id: "all",
  name: "All",
  description: "",
} as unknown as CategoriesResponseModel;

interface ComboboxSelectCategoryProps
  extends Omit<
    BaseComboboxProps<CategoriesResponseModel>,
    "fetchData" | "getDisplayValue" | "getItemId" | "getItemValue" | "customOptions" | "isCustomOption" | "value" | "onValueChange"
  > {
  dataSelect: CategoriesResponseModel | null;
  onChangeSelected: (item: CategoriesResponseModel | null) => void;
  showAllOption?: boolean;
}

export function ComboboxSelectCategories({
  dataSelect,
  onChangeSelected,
  showAllOption = true,
  size = "md",
  label = "Category",
  placeholder = "Select a category...",
  ...props
}: ComboboxSelectCategoryProps) {
  const dispatch = useAppDispatch();

  const fetchCategories = async ({
    search,
    pageNo,
    pageSize = 10,
  }: {
    search: string;
    pageNo: number;
    pageSize?: number;
  }) => {
    const result = await dispatch(
      fetchAllCategoriesService({ search, pageNo, pageSize })
    ).unwrap();

    return {
      content: result?.content || [],
      pageNo: result?.pageNo || pageNo,
      last: result?.last || true,
    };
  };

  return (
    <BaseCombobox<CategoriesResponseModel>
      {...props}
      value={dataSelect}
      onValueChange={onChangeSelected}
      fetchData={fetchCategories}
      getDisplayValue={(item) => item.name}
      getItemId={(item) => item.id}
      getItemValue={(item) => item.name}
      customOptions={showAllOption ? [ALL_OPTION] : []}
      showCustomOptions={showAllOption}
      isCustomOption={(item) => item.id === "all"}
      placeholder={placeholder}
      searchPlaceholder="Search category..."
      emptyMessage="No category found."
      noMoreDataMessage="No more categories"
      label={label}
      size={size}
      labelClassName="text-[12px] font-normal text-gray-300"
      enablePagination={true}
    />
  );
}
