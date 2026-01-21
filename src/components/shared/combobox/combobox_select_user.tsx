"use client";

import { BaseCombobox, BaseComboboxProps } from "./base-combobox";
import { useAppDispatch } from "@/redux/store";
import { UserResponseModel } from "@/redux/features/auth/store/models/response/users-response";
import { fetchAllUsersService } from "@/redux/features/auth/store/thunks/users-thunks";

interface ComboboxSelectUserProps
  extends Omit<
    BaseComboboxProps<UserResponseModel>,
    "fetchData" | "getDisplayValue" | "getItemId" | "getItemValue" | "value" | "onValueChange" | "renderItem"
  > {
  dataSelect: UserResponseModel | null;
  onChangeSelected: (item: UserResponseModel | null) => void;
}

export function ComboboxSelectUser({
  dataSelect,
  onChangeSelected,
  size = "md",
  label = "User",
  placeholder = "Select a user...",
  ...props
}: ComboboxSelectUserProps) {
  const dispatch = useAppDispatch();

  const fetchUsers = async ({
    search,
    pageNo,
    pageSize = 10,
  }: {
    search: string;
    pageNo: number;
    pageSize?: number;
  }) => {
    const result = await dispatch(
      fetchAllUsersService({ search, pageNo, pageSize })
    ).unwrap();

    return {
      content: result?.content || [],
      pageNo: result?.pageNo || pageNo,
      last: result?.last || true,
    };
  };

  // Custom render to show user roles
  const renderUserItem = (user: UserResponseModel) => {
    return (
      <span>
        {user.fullName}
        {user.roles && user.roles.length > 0 && (
          <span className="text-xs text-muted-foreground ml-1">
            ({user.roles.join(", ")})
          </span>
        )}
      </span>
    );
  };

  return (
    <BaseCombobox<UserResponseModel>
      {...props}
      value={dataSelect}
      onValueChange={onChangeSelected}
      fetchData={fetchUsers}
      getDisplayValue={(item) => item.fullName}
      getItemId={(item) => item.id}
      getItemValue={(item) => item.fullName}
      renderItem={renderUserItem}
      placeholder={placeholder}
      searchPlaceholder="Search user..."
      emptyMessage="No user found."
      noMoreDataMessage="No more users"
      label={label}
      size={size}
      labelClassName="text-sm font-medium"
      enablePagination={true}
    />
  );
}
