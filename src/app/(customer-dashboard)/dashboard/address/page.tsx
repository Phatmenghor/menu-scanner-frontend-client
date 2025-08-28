"use client";

import { AppToast } from "@/components/shared/toast/app-toast";
import ModalAddress from "@/components/shared/modal/address/address-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ModalMode,
  Status,
  STATUS_FILTER,
} from "@/constants/app-resource/status/status";
import { ROUTES } from "@/constants/app-routed/routes";
import { usePagination } from "@/hooks/use-pagination";
import { AddressRequest } from "@/models/public/dashboard/address/address.request";
import { AddressModel } from "@/models/public/dashboard/address/address.response";
import { AddressFormData } from "@/models/public/dashboard/address/address.schema";
import {
  createAddressService,
  deleteAddressService,
  getAddressService,
  setDefaultAddressService,
  updateAddressService,
} from "@/services/public/address/address.service";
import { useDebounce } from "@/utils/debounce/debounce";
import { Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/table/data-table";
import { createAddressTableColumns } from "@/components/app/customer-dashboard/table/address-content";
import { CustomSelect } from "@/components/shared/select/custom-select";
import { DeleteConfirmationDialog } from "@/components/shared/dialog/dialog-delete";
import { AddressDetailModal } from "@/components/shared/modal/address/address-modal-detail";

export default function AddressPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [addresses, setAddresses] = useState<AddressModel[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Status>(Status.ACTIVE);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initializeAddress, setInitializeAddress] =
    useState<AddressFormData | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressModel | null>(
    null
  );
  const [isAddressDetailOpen, setIsAddressDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAddressToggle, setSelectedAddressToggle] =
    useState<AddressModel | null>(null);
  const [isToggleStatusDialogOpen, setIsToggleStatusDialogOpen] =
    useState(false);

  // Add state for items per page
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const t = useTranslations("address");
  const locale = useLocale();
  const pathname = usePathname();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTES.CUSTOMER.ADDRESS,
      defaultPageSize: itemsPerPage,
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
  }, [debouncedSearchQuery, statusFilter, currentPage, itemsPerPage]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses, debouncedSearchQuery, statusFilter, itemsPerPage]);

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
          // Update addresses list - Fixed: addresses is an array, not paginated object
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
          // Update addresses list - Fixed: addresses is an array, not paginated object
          setAddresses((prev) =>
            prev
              ? prev.map((address) =>
                  address.id === formData.id ? response : address
                )
              : prev
          );

          AppToast({
            type: "success",
            message: `Address updated successfully`,
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

  async function handleDeleteAddress() {
    if (!selectedAddress || !selectedAddress.id) return;

    setIsSubmitting(true);
    try {
      const response = await deleteAddressService(selectedAddress.id);

      if (response) {
        // Update state by removing the deleted address
        setAddresses((prev) =>
          prev
            ? prev.filter((address) => address.id !== selectedAddress.id)
            : prev
        );

        AppToast({
          type: "success",
          message: `Address deleted successfully`,
          duration: 4000,
          position: "top-right",
        });

        // After deletion, check if we need to go back a page
        if (addresses && addresses.length === 1 && currentPage > 1) {
          updateUrlWithPage(currentPage - 1);
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

  const handleSetDefaultAddress = async (address: AddressModel) => {
    if (!address?.id) return;

    setIsSubmitting(true);
    try {
      // If the clicked address is already default, do nothing or toggle off if you want
      if (address.isDefault) return;

      // Call API to set the selected address as default
      const response = await setDefaultAddressService(address.id);

      if (response) {
        // Optimistically update the UI: set this one true, others false
        setAddresses((prev) =>
          prev
            ? prev.map((addr) =>
                addr.id === address.id
                  ? { ...addr, isDefault: true }
                  : { ...addr, isDefault: false }
              )
            : prev
        );

        AppToast({
          type: "success",
          message: `Address set as default successfully`,
          duration: 4000,
          position: "top-right",
        });

        setSelectedAddressToggle(null);
        setIsToggleStatusDialogOpen(false);
      } else {
        AppToast({
          type: "error",
          message: `Failed to update default address`,
          duration: 4000,
          position: "top-right",
        });
        loadAddresses(); // reload from server in case of failure
      }
    } catch (error: any) {
      toast.error(
        error?.message || "An error occurred while updating default address"
      );
      loadAddresses(); // reload from server
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDefaultAddressToggle = (address: AddressModel) => {
    setSelectedAddressToggle(address);
    setIsToggleStatusDialogOpen(true);
  };

  const handleOpenEditAddressDialog = (address: AddressModel) => {
    setInitializeAddress(address);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(!isModalOpen);
  };

  const handleOpenDeleteAddressDialog = (address: AddressModel) => {
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
  const handleOpenViewAddressDetailDialog = (address: AddressModel) => {
    setSelectedAddress(address);
    setIsAddressDetailOpen(true);
  };

  const addressList = Array.isArray(addresses) ? addresses : [];

  return (
    <div className="flex flex-col">
      <Card className="flex flex-col">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-start gap-4 w-full">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="search-address"
                autoComplete="search-address"
                type="search"
                placeholder={t("search")}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center gap-2">
              <CustomSelect
                options={STATUS_FILTER}
                value={statusFilter}
                placeholder={t("all")}
                onValueChange={(value) => setStatusFilter(value as Status)}
              />
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
              <DataTable
                data={addressList || []}
                columns={createAddressTableColumns({
                  data: addressList,
                  handlers: {
                    handleSetDefaultAddress,
                    handleOpenEditAddressDialog,
                    handleOpenViewAddressDetailDialog,
                    handleOpenDeleteAddressDialog,
                  },
                })}
                loading={isLoading}
                emptyMessage="No address found"
                getRowKey={(address) => address.id}
              />
            </div>
          </div>

          {/* All the modals and dialogs remain the same */}
          <AddressDetailModal
            isOpen={isAddressDetailOpen}
            onClose={() => setIsAddressDetailOpen(false)}
            addressId={selectedAddress?.id}
          />

          <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setSelectedAddress(null);
            }}
            onDelete={handleDeleteAddress}
            title="Delete Address"
            description={`Are you sure you want to delete this address`}
            itemName={selectedAddress?.commune}
            isSubmitting={isSubmitting}
          />

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
