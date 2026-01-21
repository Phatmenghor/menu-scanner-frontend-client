"use client";

import { BaseCombobox, BaseComboboxProps } from "./base-combobox";
import { useAppDispatch } from "@/redux/store";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { fetchAllBrandService } from "@/redux/features/master-data/store/thunks/brand-thunks";

const ALL_OPTION: BrandResponseModel = {
  id: "all",
  name: "All",
  description: "",
} as unknown as BrandResponseModel;

interface ComboboxSelectBrandProps
  extends Omit<
    BaseComboboxProps<BrandResponseModel>,
    "fetchData" | "getDisplayValue" | "getItemId" | "getItemValue" | "customOptions" | "isCustomOption" | "value" | "onValueChange"
  > {
  dataSelect: BrandResponseModel | null;
  onChangeSelected: (item: BrandResponseModel | null) => void;
  showAllOption?: boolean;
}

export function ComboboxSelectBrand({
  dataSelect,
  onChangeSelected,
  showAllOption = true,
  size = "md",
  label = "Brand",
  placeholder = "Select a brand...",
  ...props
}: ComboboxSelectBrandProps) {
  const dispatch = useAppDispatch();

  const fetchBrands = async ({
    search,
    pageNo,
    pageSize = 10,
  }: {
    search: string;
    pageNo: number;
    pageSize?: number;
  }) => {
    const result = await dispatch(
      fetchAllBrandService({ search, pageNo, pageSize })
    ).unwrap();

    return {
      content: result?.content || [],
      pageNo: result?.pageNo || pageNo,
      last: result?.last || true,
    };
  };

  return (
    <BaseCombobox<BrandResponseModel>
      {...props}
      value={dataSelect}
      onValueChange={onChangeSelected}
      fetchData={fetchBrands}
      getDisplayValue={(item) => item.name}
      getItemId={(item) => item.id}
      getItemValue={(item) => item.name}
      customOptions={showAllOption ? [ALL_OPTION] : []}
      showCustomOptions={showAllOption}
      isCustomOption={(item) => item.id === "all"}
      placeholder={placeholder}
      searchPlaceholder="Search brand..."
      emptyMessage="No brand found."
      noMoreDataMessage="No more brands"
      label={label}
      size={size}
      labelClassName="text-[12px] font-normal text-gray-300"
      enablePagination={true}
      fetchOnMount={true}
    />
  );
}
