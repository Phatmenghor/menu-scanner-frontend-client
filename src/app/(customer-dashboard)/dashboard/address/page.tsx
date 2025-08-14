"use client";

import { AppToast } from "@/components/app/components/app-toast";
import ModalAddress from "@/components/shared/modal/address/address-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ModalMode,
  Status,
  STATUS_FILTER,
} from "@/constants/app-resource/status/status";
import { addressTableHeaders } from "@/constants/app-resource/table/address";
import { getUserTableHeaders } from "@/constants/app-resource/table/table";
import { ROUTES } from "@/constants/app-routed/routes";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { AddressRequest } from "@/models/public/dashboard/address/address.request";
import { AddressModel } from "@/models/public/dashboard/address/address.response";
import { AddressFormData } from "@/models/public/dashboard/address/address.schema";
import { UserModel } from "@/models/user/user.response.model";
import {
  createAddressService,
  deleteAddressService,
  getAddressService,
  updateAddressService,
} from "@/services/public/address/address.service";
import { useDebounce } from "@/utils/debounce/debounce";
import { getUserInfo } from "@/utils/local-storage/userInfo";
import { Edit, Eye, Search, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function AddressPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [addresses, setAddresses] = useState<AddressModel[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExportingToExcel, setIsExportingToExcel] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Status>(Status.ACTIVE);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initializeAddress, setInitializeAddress] =
    useState<AddressFormData | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressModel | null>(
    null
  );
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [selectedAddressToggle, setSelectedAddressToggle] =
    useState<UserModel | null>(null);
  const [isToggleStatusDialogOpen, setIsToggleStatusDialogOpen] =
    useState(false);

  // Add state for items per page
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const t = useTranslations("user");
  const headers = getUserTableHeaders(t);
  const locale = useLocale();
  const pathname = usePathname();

  const user = getUserInfo();
  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTES.CUSTOMER.ADDRESS,
      defaultPageSize: itemsPerPage, // Use dynamic page size
    });

  console.log("Page Debug:", { locale, pathname });

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAddressService();
      console.log("Fetched addresses:", response);
      setAddresses(response);
    } catch (error: any) {
      console.log("Failed to fetch addresses: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, currentPage, itemsPerPage]); // Add itemsPerPage dependency

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses, debouncedSearchQuery, statusFilter, itemsPerPage]); // Add itemsPerPage dependency

  // Handle items per page change
  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage: number) => {
      setItemsPerPage(newItemsPerPage);
      // Reset to page 1 when changing items per page to avoid confusion
      updateUrlWithPage(1);
    },
    [updateUrlWithPage]
  );

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  async function handleSubmit(formData: AddressFormData) {
    console.log("Submitting form:", formData, "mode:", mode);

    setIsSubmitting(true);
    try {
      const isCreate = mode === ModalMode.CREATE_MODE;

      if (isCreate) {
        const createPayload: AddressRequest = {
          district: formData.district,
          latitude: formData.latitude,
          longitude: formData.longitude,
          province: formData.province,
          commune: formData.commune,
          houseNumber: formData.houseNumber,
          isDefault: formData.isDefault,
          note: formData.note,
          streetNumber: formData.streetNumber,
          village: formData.village,
        };

        const response = await createAddressService(createPayload);
        if (response) {
          // Update addresses list
          setAddresses((prev) => [...(prev || []), response]);

          AppToast({
            type: "success",
            message: `Address added successfully`,
            duration: 4000,
            position: "top-right",
          });

          setIsModalOpen(false);
        }
      } else {
        // Update mode
        if (!formData.id) {
          throw new Error("Address ID is required for update");
        }

        const updatePayload: Partial<AddressRequest> = {
          district: formData.district,
          latitude: formData.latitude,
          longitude: formData.longitude,
          province: formData.province,
          commune: formData.commune,
          houseNumber: formData.houseNumber,
          isDefault: formData.isDefault,
          note: formData.note,
          streetNumber: formData.streetNumber,
          village: formData.village,
        };

        const response = await updateAddressService(formData.id, updatePayload);
        if (response) {
          // Update addresses list
          setAddresses((prev) =>
            prev
              ? {
                  ...prev,
                  content: prev.map((user) =>
                    user.id === formData.id ? response : user
                  ),
                }
              : prev
          );

          AppToast({
            type: "success",
            message: `Address ${
              response.username || response.email
            } updated successfully`,
            duration: 4000,
            position: "top-right",
          });

          setIsModalOpen(false);
        }
      }
    } catch (error: any) {
      console.error("Error submitting address form:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteUser() {
    if (!selectedAddress || !selectedAddress.id) return;

    setIsSubmitting(true);
    try {
      const response = await deleteAddressService(selectedAddress.id);

      if (response) {
        AppToast({
          type: "success",
          message: `Address deleted successfully`,
          duration: 4000,
          position: "top-right",
        });
        // After deletion, check if we need to go back a page
        if (addresses && addresses.length === 1 && currentPage > 1) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadAddresses();
        }
      } else {
        AppToast({
          type: "error",
          message: `Failed to delete address`,
          duration: 4000,
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("An error occurred while deleting the address");
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  const handleSetDefaultAddress = async (address: AddressModel | null) => {
    if (!address?.id) return;

    setIsSubmitting(true);
    try {
      const newDefault = address?.isDefault === true ? false : false;

      const response = await updateAddressService(address?.id, {
        isDefault: newDefault,
      });

      if (response) {
        // Optimistic update
        setAddresses((prev) =>
          prev
            ? {
                ...prev,
                content: prev.map((address) =>
                  address.id === selectedAddressToggle?.id ? response : address
                ),
              }
            : prev
        );

        AppToast({
          type: "success",
          message: `Address set to default successfully`,
          duration: 4000,
          position: "top-right",
        });
        setSelectedAddressToggle(null);
        setIsToggleStatusDialogOpen(false);
      } else {
        AppToast({
          type: "error",
          message: `Failed to update user status`,
          duration: 4000,
          position: "top-right",
        });
        loadAddresses(); // reload in case of failure
      }
    } catch (error: any) {
      toast.error(
        error?.message || "An error occurred while updating user status"
      );
      loadAddresses(); // reload in case of failure
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (user: UserModel) => {
    setSelectedAddressToggle(user);
    setIsToggleStatusDialogOpen(true);
  };

  const handleEditAddress = (user: AddressModel) => {
    setInitializeAddress(user);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(!isModalOpen);
  };

  const handleDelete = (address: AddressModel) => {
    setSelectedAddress(address);
    setIsDeleteDialogOpen(true);
  };

  // Handle status filter change - directly updates the filter value
  const handleStatusChange = (status: Status) => {
    setStatusFilter(status);
    // Reset to page 1 when filtering to avoid confusion
    updateUrlWithPage(1);
  };

  // Handle status filter change - directly updates the filter value
  const handleViewAddressDetail = (address: AddressModel) => {
    setSelectedAddress(address);
    setIsUserDetailOpen(true);
  };

  return (
    <div className="flex flex-col">
      <Card className="flex flex-col">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-start gap-4 w-full">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="search-user"
                autoComplete="search-user"
                type="search"
                placeholder={t("search")}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                disabled={isSubmitting}
              />
            </div>
            {/* <div>
              <Button
                onClick={() => handleExportToPdf(addresses)}
                disabled={isExportingToExcel}
              >
                {isExportingToExcel ? "Exporting..." : "Excel"}
              </Button>
            </div> */}
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={handleStatusChange}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-[150px] text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTER.map((option) => (
                    <SelectItem
                      className="text-xs"
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button
                onClick={() => {
                  setMode(ModalMode.CREATE_MODE);
                  setIsModalOpen(true);
                }}
              >
                New
              </Button>
            </div>
          </div>

          <div className="w-full">
            <Separator className="bg-gray-300" />
          </div>

          <div>
            <div className="rounded-md border overflow-x-auto whitespace-nowrap">
              <Table>
                <TableHeader>
                  <TableRow>
                    {addressTableHeaders.map((header, index) => (
                      <TableHead
                        key={index}
                        className={`text-xs font-semibold text-muted-foreground ${header.className}`}
                      >
                        <div className="flex items-center gap-1">
                          <span>{header.label}</span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!addresses || addresses.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={addressTableHeaders.length}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {isLoading
                          ? "Loading addresses..."
                          : "No addresses found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    addresses.map((address, index) => (
                      <TableRow key={address.id} className="text-sm">
                        {/* Index column */}
                        <TableCell>{index + 1}</TableCell>

                        {/* Address data cells */}
                        <TableCell>{address?.village ?? "---"}</TableCell>
                        <TableCell>{address?.commune ?? "---"}</TableCell>
                        <TableCell>{address?.district ?? "---"}</TableCell>
                        <TableCell>{address?.province ?? "---"}</TableCell>
                        <TableCell>{address?.streetNumber ?? "---"}</TableCell>
                        <TableCell>{address?.houseNumber ?? "---"}</TableCell>
                        <TableCell>{address?.note ?? "---"}</TableCell>
                        <TableCell>{address?.latitude ?? "---"}</TableCell>
                        <TableCell>{address?.longitude ?? "---"}</TableCell>
                        <TableCell>
                          {address?.isDefault ? "Yes" : "No"}
                        </TableCell>
                        <TableCell>{address?.fullAddress ?? "---"}</TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              onClick={() => handleViewAddressDetail(address)}
                              className="hover:text-primary"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              className={cn(
                                "transition-all duration-200 hover:text-primary"
                              )}
                              onClick={() => handleEditAddress(address)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => handleDelete(address)}
                              className={cn(
                                "text-destructive hover:text-red-600"
                              )}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* All the modals and dialogs remain the same */}
          {/* <UserDetailModal
            open={isUserDetailOpen}
            onClose={() => setIsUserDetailOpen(false)}
            user={selectedAddress}
          /> */}

          {/* <ConfirmDialog
            open={isToggleStatusDialogOpen}
            onOpenChange={() => {
              setIsToggleStatusDialogOpen(false);
              setSelectedAddressToggle(null);
            }}
            centered={true}
            title="Change User Status"
            description={`Are you sure you want to ${
              selectedAddressToggle?.accountStatus === "ACTIVE"
                ? "disable"
                : "enable"
            } this user: ${selectedAddressToggle?.email}?`}
            confirmButton={{
              text: `${
                selectedAddressToggle?.accountStatus === "ACTIVE"
                  ? "Disable"
                  : "Enable"
              }`,
              onClick: () => handle(selectedAddressToggle),
              variant: "primary",
            }}
            cancelButton={{ text: "Cancel", variant: "secondary" }}
            onConfirm={() => handleStatusToggle(selectedAddressToggle)}
          /> */}

          {/* <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setSelectedAddress(null);
            }}
            onDelete={handleDeleteUser}
            title="Delete Admin"
            description={`Are you sure you want to delete the admin`}
            itemName={selectedAddress?.fullName || selectedAddress?.email}
            isSubmitting={isSubmitting}
          />

          <ResetPasswordModal
            isOpen={isResetPasswordDialogOpen}
            userName={selectedAddress?.fullName || selectedAddress?.email}
            onClose={() => {
              setIsResetPasswordDialogOpen(false);
              setSelectedAddress(null);
            }}
            userId={selectedAddress?.id}
          /> */}

          <ModalAddress
            isOpen={isModalOpen}
            onClose={() => {
              setInitializeAddress(null);
              setIsModalOpen(false);
            }}
            isSubmitting={isSubmitting}
            onSave={handleSubmit}
            data={initializeAddress}
            mode={mode}
          />
        </CardContent>
      </Card>
    </div>
  );
}
