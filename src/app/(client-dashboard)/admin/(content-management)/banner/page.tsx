"use client";

import { AppToast } from "@/components/app/components/app-toast";
import PaginationPage from "@/components/shared/common/pagination-page";
import { ConfirmDialog } from "@/components/shared/dialog/dialog-confirm";
import { DeleteConfirmationDialog } from "@/components/shared/dialog/dialog-delete";
import UploadBannerModal from "@/components/shared/modal/banner/banner-modal";
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
import { bannerTableHead } from "@/constants/app-resource/table/banner";
import { getUserTableHeaders } from "@/constants/app-resource/table/table";
import { ROUTES } from "@/constants/app-routed/routes";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { UploadBannerRequest } from "@/models/content-manangement/banner/banner.request";
import {
  AllBanner,
  BannerModel,
} from "@/models/content-manangement/banner/banner.response";
import { UploadBannerFormData } from "@/models/content-manangement/banner/banner.schema";
import { AllUserResponse } from "@/models/user/user.response.model";
import {
  deletedBannerService,
  getAllBannerService,
  updateBannerService,
  uploadBannerService,
} from "@/services/dashboard/content-management/banner/banner.service";
import { indexDisplay } from "@/utils/common/common";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { useDebounce } from "@/utils/debounce/debounce";
import {
  ExcelColumn,
  ExcelExporter,
  ExcelSheet,
} from "@/utils/export-file/excel";
import { getUserInfo } from "@/utils/local-storage/userInfo";
import { Check, Edit, Search, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function BannerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [banners, setBanners] = useState<AllBanner | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Status>(Status.ACTIVE);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initializeBanner, setInitializeBanner] =
    useState<UploadBannerFormData | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<BannerModel | null>(
    null
  );
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBannerToggle, setSelectedBannerToggle] =
    useState<BannerModel | null>(null);
  const [isToggleStatusDialogOpen, setIsToggleStatusDialogOpen] =
    useState(false);

  //Pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const t = useTranslations("user");
  const headers = getUserTableHeaders(t);
  const locale = useLocale();
  const pathname = usePathname();

  const user = getUserInfo();
  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTES.ADMIN.BANNER,
      defaultPageSize: 10,
    });

  console.log("Page Debug:", { locale, pathname });

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const loadBanners = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllBannerService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        status: statusFilter,
        businessId: user?.businessId,
        pageSize: 10,
      });
      console.log("Fetched banners:", response);
      setBanners(response);
    } catch (error: any) {
      console.log("Failed to fetch banners: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners, debouncedSearchQuery, statusFilter]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  // Handle items per page change
  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage: number) => {
      setItemsPerPage(newItemsPerPage);
      // Reset to page 1 when changing items per page to avoid confusion
      updateUrlWithPage(1);
    },
    [updateUrlWithPage]
  );

  async function handleSubmit(formData: UploadBannerFormData) {
    console.log("Submitting form:", formData, "mode:", mode);

    setIsSubmitting(true);
    try {
      const isCreate = mode === ModalMode.CREATE_MODE;

      if (isCreate) {
        const createPayload: UploadBannerRequest = {
          imageUrl: formData.imageUrl,
          linkUrl: formData.linkUrl,
          status: formData.status,
        };

        const response = await uploadBannerService(createPayload);
        if (response) {
          // Update banners list
          setBanners((prev) =>
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
            message: `Banner uploaded successfully`,
            duration: 4000,
            position: "top-right",
          });

          setIsModalOpen(false);
        }
      } else {
        // Update mode
        if (!formData.id) {
          throw new Error("Banner ID is required for update");
        }

        const updatePayload: UploadBannerRequest = {
          imageUrl: formData.imageUrl,
          linkUrl: formData.linkUrl,
          status: formData.status,
        };

        const response = await updateBannerService(formData.id, updatePayload);
        if (response) {
          // Update banners list
          setBanners((prev) =>
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
            message: `Banner updated successfully`,
            duration: 4000,
            position: "top-right",
          });

          setIsModalOpen(false);
        }
      }
    } catch (error: any) {
      console.error("Error submitting banner form:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteBanner() {
    if (!selectedBanner || !selectedBanner.id) return;

    setIsSubmitting(true);
    try {
      const response = await deletedBannerService(selectedBanner.id);

      if (response) {
        AppToast({
          type: "success",
          message: `Banner deleted successfully`,
          duration: 4000,
          position: "top-right",
        });
        // After deletion, check if we need to go back a page
        if (banners && banners.content.length === 1 && currentPage > 1) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadBanners();
        }
      } else {
        AppToast({
          type: "error",
          message: `Failed to delete banner`,
          duration: 4000,
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("An error occurred while deleting the banner");
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  const handleStatusToggle = async (banner: BannerModel | null) => {
    if (!banner?.id) return;

    setIsSubmitting(true);
    try {
      const newStatus =
        banner?.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE;

      const response = await updateBannerService(banner?.id, {
        status: newStatus,
      });

      if (response) {
        // Optimistic update
        setBanners((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((banner) =>
                  banner.id === selectedBannerToggle?.id ? response : banner
                ),
              }
            : prev
        );

        AppToast({
          type: "success",
          message: `Banner status updated successfully`,
          duration: 4000,
          position: "top-right",
        });
        setSelectedBannerToggle(null);
        setIsToggleStatusDialogOpen(false);
      } else {
        AppToast({
          type: "error",
          message: `Failed to update banner status`,
          duration: 4000,
          position: "top-right",
        });
        loadBanners(); // reload in case of failure
      }
    } catch (error: any) {
      toast.error(
        error?.message || "An error occurred while updating banner status"
      );
      loadBanners(); // reload in case of failure
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (banner: BannerModel | null) => {
    setSelectedBannerToggle(banner);
    setIsToggleStatusDialogOpen(true);
  };

  const handleEditBanner = (banner: UploadBannerFormData) => {
    setInitializeBanner(banner);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(!isModalOpen);
  };

  const handleDelete = (banner: BannerModel) => {
    setSelectedBanner(banner);
    setIsDeleteDialogOpen(true);
  };

  // Handle status filter change - directly updates the filter value
  const handleStatusChange = (status: Status) => {
    setStatusFilter(status);
  };

  // Handle status filter change - directly updates the filter value
  const handleViewBannerDetail = (banner: BannerModel) => {
    setSelectedBanner(banner);
    setIsUserDetailOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <Card>
        <CardContent className="space-y-6 p-6">
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
                    {bannerTableHead.map((header) => (
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
                  {!banners || banners.content.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={bannerTableHead.length}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No banners found
                      </TableCell>
                    </TableRow>
                  ) : (
                    banners.content.map((banner, index) => {
                      const imageUrl = banner.imageUrl
                        ? `${banner.imageUrl}`
                        : "";

                      return (
                        <TableRow key={banner.id} className="text-sm">
                          {/* Index */}
                          <TableCell>
                            {indexDisplay(
                              banners.pageNo,
                              banners.pageSize,
                              index
                            )}
                          </TableCell>

                          {/* Image */}
                          <TableCell>
                            <Avatar className="h-10 w-10 border">
                              <AvatarImage src={imageUrl} alt="Banner Image" />
                              <AvatarFallback>
                                {banner?.businessName
                                  ?.charAt(0)
                                  .toUpperCase() || "B"}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>

                          {/* Link URL */}
                          <TableCell className="whitespace-nowrap text-blue-600 hover:underline">
                            <a
                              href={banner.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {banner?.linkUrl || "---"}
                            </a>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Switch
                              checked={banner?.status === "ACTIVE"}
                              onCheckedChange={() => handleToggleStatus(banner)}
                              disabled={isSubmitting}
                              aria-label="Toggle user status"
                              className={cn(
                                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                                // canModify
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
                                {banner.status === "ACTIVE" && (
                                  <Check className="h-6 w-6 m-auto text-orange-600 dark:text-orange-300" />
                                )}
                              </div>
                            </Switch>
                          </TableCell>

                          {/* Created At */}
                          <TableCell className="text-muted-foreground">
                            {DateTimeFormat(banner?.createdAt || "---")}
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                variant="outline"
                                onClick={() => handleEditBanner(banner)}
                                className="hover:text-primary"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => handleDelete(banner)}
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
          user={selectedBanner}
        /> */}

          <ConfirmDialog
            open={isToggleStatusDialogOpen}
            onOpenChange={() => {
              setIsToggleStatusDialogOpen(false);
              setSelectedBannerToggle(null);
            }}
            centered={true}
            title="Change User Status"
            description={`Are you sure you want to ${
              selectedBannerToggle?.status === "ACTIVE" ? "disable" : "enable"
            } this banner?`}
            confirmButton={{
              text: `${
                selectedBannerToggle?.status === "ACTIVE" ? "Disable" : "Enable"
              }`,
              onClick: () => handleToggleStatus(selectedBannerToggle),
              variant: "primary",
            }}
            cancelButton={{ text: "Cancel", variant: "secondary" }}
            onConfirm={() => handleStatusToggle(selectedBannerToggle)}
          />

          <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setSelectedBanner(null);
            }}
            onDelete={handleDeleteBanner}
            title="Delete Admin"
            description={`Are you sure you want to delete the admin`}
            itemName={selectedBanner?.businessName}
            isSubmitting={isSubmitting}
          />

          <UploadBannerModal
            isOpen={isModalOpen}
            onClose={() => {
              setInitializeBanner(null);
              setIsModalOpen(false);
            }}
            isSubmitting={isSubmitting}
            onSave={handleSubmit}
            data={initializeBanner}
            mode={mode}
          />
        </CardContent>
      </Card>
      {/* Pagination */}
      {banners && banners.totalElements > 0 && (
        <div className="flex-shrink-0 flex items-center justify-between p-5 mb-16 border-t">
          <PaginationPage
            currentPage={currentPage}
            totalItems={banners.totalElements}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            showItemsPerPage={true}
            itemsPerPageOptions={[5, 10, 20, 50]}
            showResultsText={true}
          />
        </div>
      )}
    </div>
  );
}
