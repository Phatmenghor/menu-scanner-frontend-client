"use client";

import { AppToast } from "@/components/app/components/app-toast";
import { ConfirmDialog } from "@/components/shared/dialog/dialog-confirm";
import { DeleteConfirmationDialog } from "@/components/shared/dialog/dialog-delete";
import UploadbrandModal from "@/components/shared/modal/brand/brand-modal";
import BrandModal from "@/components/shared/modal/brand/brand-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
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
import { brandTableHeaders } from "@/constants/app-resource/table/brand";
import { getUserTableHeaders } from "@/constants/app-resource/table/table";
import { ROUTES } from "@/constants/app-routed/routes";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { BrandRequest } from "@/models/content-manangement/brand/brand.request";
import {
  AllBrand,
  BrandModel,
} from "@/models/content-manangement/brand/brand.response";
import { BrandFormData } from "@/models/content-manangement/brand/brand.schema";
import {
  createBrandService,
  deletedBrandService,
  getAllBrandService,
  updateBrandService,
} from "@/services/dashboard/content-management/brand/brand.service";
import { indexDisplay } from "@/utils/common/common";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { useDebounce } from "@/utils/debounce/debounce";
import { getUserInfo } from "@/utils/local-storage/userInfo";
import { Check, Edit, Search, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function BrandPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [brands, setBrands] = useState<AllBrand | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Status>(Status.ACTIVE);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initializeBrand, setInitializeBrand] = useState<BrandFormData | null>(
    null
  );
  const [selectedBrand, setSelectedBrand] = useState<BrandModel | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBrandToggle, setSelectedBrandToggle] =
    useState<BrandModel | null>(null);
  const [isToggleStatusDialogOpen, setIsToggleStatusDialogOpen] =
    useState(false);

  const t = useTranslations("user");
  const headers = getUserTableHeaders(t);
  const locale = useLocale();
  const pathname = usePathname();

  const user = getUserInfo();
  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTES.ADMIN.BRAND,
      defaultPageSize: 10,
    });

  console.log("Page Debug:", { locale, pathname });

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const loadBrands = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllBrandService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        status: statusFilter,
        businessId: user?.businessId,
        pageSize: 10,
      });
      console.log("Fetched brands:", response);
      setBrands(response);
    } catch (error: any) {
      console.log("Failed to fetch brands: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands, debouncedSearchQuery, statusFilter]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  async function handleSubmit(formData: BrandFormData) {
    console.log("Submitting form:", formData, "mode:", mode);

    setIsSubmitting(true);
    try {
      const isCreate = mode === ModalMode.CREATE_MODE;

      if (isCreate) {
        const createPayload: BrandRequest = {
          description: formData.description,
          name: formData.name,
          imageUrl: formData.imageUrl,
          status: formData.status,
        };

        const response = await createBrandService(createPayload);
        if (response) {
          // Update brands list
          setBrands((prev) =>
            prev
              ? {
                  ...prev,
                  content: [response, ...prev.content],
                  totalElements: prev.totalElements + 1,
                }
              : {
                  content: [response],
                  pageNo: 1,
                  pageSize: 10,
                  totalElements: 1,
                  totalPages: 1,
                  hasNext: false,
                  hasPrevious: false,
                  first: true,
                  last: true,
                }
          );

          AppToast({
            type: "success",
            message: `Brand uploaded successfully`,
            duration: 4000,
            position: "top-right",
          });

          setIsModalOpen(false);
        }
      } else {
        // Update mode
        if (!formData.id) {
          throw new Error("Brand ID is required for update");
        }

        const updatePayload: BrandRequest = {
          description: formData.description,
          name: formData.name,
          imageUrl: formData.imageUrl,
          status: formData.status,
        };

        const response = await updateBrandService(formData.id, updatePayload);
        if (response) {
          // Update brands list
          setBrands((prev) =>
            prev
              ? {
                  ...prev,
                  content: prev.content.map((user) =>
                    user.id === formData.id ? response : user
                  ),
                }
              : prev
          );

          AppToast({
            type: "success",
            message: `Brand updated successfully`,
            duration: 4000,
            position: "top-right",
          });

          setIsModalOpen(false);
        }
      }
    } catch (error: any) {
      console.error("Error submitting brand form:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteBrand() {
    if (!selectedBrand || !selectedBrand.id) return;

    setIsSubmitting(true);
    try {
      const response = await deletedBrandService(selectedBrand.id);

      if (response) {
        AppToast({
          type: "success",
          message: `Brand deleted successfully`,
          duration: 4000,
          position: "top-right",
        });
        // After deletion, check if we need to go back a page
        if (brands && brands.content.length === 1 && currentPage > 1) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadBrands();
        }
      } else {
        AppToast({
          type: "error",
          message: `Failed to delete brand`,
          duration: 4000,
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast.error("An error occurred while deleting the brand");
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  const handleStatusToggle = async (brand: BrandModel | null) => {
    if (!brand?.id) return;

    setIsSubmitting(true);
    try {
      const newStatus =
        brand?.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE;

      const response = await updateBrandService(brand?.id, {
        status: newStatus,
      });

      if (response) {
        // Optimistic update
        setBrands((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((brand) =>
                  brand.id === selectedBrandToggle?.id ? response : brand
                ),
              }
            : prev
        );

        AppToast({
          type: "success",
          message: `brand status updated successfully`,
          duration: 4000,
          position: "top-right",
        });
        setSelectedBrandToggle(null);
        setIsToggleStatusDialogOpen(false);
      } else {
        AppToast({
          type: "error",
          message: `Failed to update brand status`,
          duration: 4000,
          position: "top-right",
        });
        loadBrands(); // reload in case of failure
      }
    } catch (error: any) {
      toast.error(
        error?.message || "An error occurred while updating brand status"
      );
      loadBrands(); // reload in case of failure
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (brand: BrandModel | null) => {
    setSelectedBrandToggle(brand);
    setIsToggleStatusDialogOpen(true);
  };

  const handleEdit = (brand: BrandFormData) => {
    setInitializeBrand(brand);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(!isModalOpen);
  };

  const handleDelete = (brand: BrandModel) => {
    setSelectedBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  // Handle status filter change - directly updates the filter value
  const handleStatusChange = (status: Status) => {
    setStatusFilter(status);
  };

  // Handle status filter change - directly updates the filter value
  const handleViewbrandDetail = (brand: BrandModel) => {
    setSelectedBrand(brand);
    setIsUserDetailOpen(true);
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-start gap-4 w-full">
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="search-brand"
              autoComplete="search-brand"
              type="search"
              placeholder={t("search")}
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
              disabled={isSubmitting}
            />
          </div>

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
                  {brandTableHeaders.map((header) => (
                    <TableHead
                      key={header.key}
                      className="text-xs font-semibold text-muted-foreground"
                      style={{ width: "20%" }}
                    >
                      {header.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {!brands || brands.content.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={brandTableHeaders.length + 2} // +2 for index and image
                      className="text-center py-8 text-muted-foreground"
                    >
                      No brands found
                    </TableCell>
                  </TableRow>
                ) : (
                  brands.content.map((brand, index) => {
                    const imageUrl = brand.imageUrl
                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${brand.imageUrl}`
                      : "";

                    return (
                      <TableRow key={brand.id} className="text-sm">
                        {/* Index */}
                        <TableCell>
                          {indexDisplay(brands.pageNo, brands.pageSize, index)}
                        </TableCell>

                        {/* Image */}
                        <TableCell>
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage src={imageUrl} alt="Brand Image" />
                            <AvatarFallback>
                              {brand?.businessName?.charAt(0).toUpperCase() ||
                                "B"}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>

                        {/* Brand Name */}
                        <TableCell className="font-medium">
                          {brand.name}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Switch
                            checked={brand?.status === "ACTIVE"}
                            onCheckedChange={() => handleToggleStatus(brand)}
                            disabled={isSubmitting}
                            aria-label="Toggle brand status"
                            className={cn(
                              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                              1
                                ? "bg-gray-300 dark:bg-gray-600 data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary"
                                : "bg-gray-300 dark:bg-primary opacity-50 cursor-not-allowed"
                            )}
                          >
                            <div
                              className={cn(
                                "inline-block h-6 w-6 transform rounded-full bg-white dark:bg-gray-100 shadow-md transition-transform",
                                "translate-x-1 data-[state=checked]:translate-x-5"
                              )}
                            >
                              {brand.status === "ACTIVE" && (
                                <Check className="h-6 w-6 m-auto text-orange-600 dark:text-orange-300" />
                              )}
                            </div>
                          </Switch>
                        </TableCell>

                        {/* Total Products */}
                        <TableCell>{brand.totalProducts}</TableCell>

                        {/* Active Products */}
                        <TableCell>{brand.activeProducts}</TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => handleEdit(brand)}
                              className="hover:text-primary"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => handleDelete(brand)}
                              className="text-destructive hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* 
        <UserDetailModal
          open={isUserDetailOpen}
          onClose={() => setIsUserDetailOpen(false)}
          user={selectedBrand}
        /> */}

        <ConfirmDialog
          open={isToggleStatusDialogOpen}
          onOpenChange={() => {
            setIsToggleStatusDialogOpen(false);
            setSelectedBrandToggle(null);
          }}
          centered={true}
          title="Change User Status"
          description={`Are you sure you want to ${
            selectedBrandToggle?.status === "ACTIVE" ? "disable" : "enable"
          } this brand?`}
          confirmButton={{
            text: `${
              selectedBrandToggle?.status === "ACTIVE" ? "Disable" : "Enable"
            }`,
            onClick: () => handleToggleStatus(selectedBrandToggle),
            variant: "primary",
          }}
          cancelButton={{ text: "Cancel", variant: "secondary" }}
          onConfirm={() => handleStatusToggle(selectedBrandToggle)}
        />

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedBrand(null);
          }}
          onDelete={handleDeleteBrand}
          title="Delete Admin"
          description={`Are you sure you want to delete the admin`}
          itemName={selectedBrand?.businessName}
          isSubmitting={isSubmitting}
        />

        <BrandModal
          isOpen={isModalOpen}
          onClose={() => {
            setInitializeBrand(null);
            setIsModalOpen(false);
          }}
          isSubmitting={isSubmitting}
          onSave={handleSubmit}
          data={initializeBrand}
          mode={mode}
        />
      </CardContent>
    </Card>
  );
}
