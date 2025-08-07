"use client";

import { AppToast } from "@/components/app/components/app-toast";
import { ConfirmDialog } from "@/components/shared/dialog/dialog-confirm";
import { DeleteConfirmationDialog } from "@/components/shared/dialog/dialog-delete";
import CategoryDetailModal from "@/components/shared/modal/category/category-detail-modal";
import CategoryModal from "@/components/shared/modal/category/category-modal";
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
import { categoryTableHeaders } from "@/constants/app-resource/table/category";
import { getUserTableHeaders } from "@/constants/app-resource/table/table";
import { ROUTES } from "@/constants/app-routed/routes";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { CategoryRequest } from "@/models/(content-manangement)/category/category.request";
import {
  AllCategories,
  CategoryModel,
} from "@/models/(content-manangement)/category/category.response";
import { CategoryFormData } from "@/models/(content-manangement)/category/category.schema";
import {
  createCategoryService,
  deletedCategoriesService,
  getAllCategoryService,
  updateCategoryService,
} from "@/services/dashboard/content-management/category/category.service";
import { indexDisplay } from "@/utils/common/common";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { useDebounce } from "@/utils/debounce/debounce";
import { getUserInfo } from "@/utils/local-storage/userInfo";
import { Check, Edit, Search, Trash2, View } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function CategoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<AllCategories | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Status>(Status.ACTIVE);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initializeCategory, setInitializeCategory] =
    useState<CategoryFormData | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryModel | null>(null);
  const [isCategoryDetailOpen, setIsCategoryDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategoryToggle, setSelectedCategoryToggle] =
    useState<CategoryModel | null>(null);
  const [isToggleStatusDialogOpen, setIsToggleStatusDialogOpen] =
    useState(false);

  const t = useTranslations("user");
  const headers = getUserTableHeaders(t);
  const locale = useLocale();
  const pathname = usePathname();

  const user = getUserInfo();
  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTES.ADMIN.CATEGORIES,
      defaultPageSize: 10,
    });

  console.log("Page Debug:", { locale, pathname });

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllCategoryService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        status: statusFilter,
        businessId: user?.businessId,
        pageSize: 10,
      });
      console.log("Fetched categories:", response);
      setCategories(response);
    } catch (error: any) {
      console.log("Failed to fetch categories: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories, debouncedSearchQuery, statusFilter]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  async function handleSubmit(formData: CategoryFormData) {
    console.log("Submitting form:", formData, "mode:", mode);

    setIsSubmitting(true);
    try {
      const isCreate = mode === ModalMode.CREATE_MODE;

      if (isCreate) {
        const createPayload: CategoryRequest = {
          name: formData.name,
          imageUrl: formData.imageUrl,
          status: formData.status,
        };

        const response = await createCategoryService(createPayload);
        if (response) {
          // Update categories list
          setCategories((prev) =>
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
            message: `Category uploaded successfully`,
            duration: 4000,
            position: "top-right",
          });

          setIsModalOpen(false);
        }
      } else {
        // Update mode
        if (!formData.id) {
          throw new Error("Category ID is required for update");
        }

        const updatePayload: CategoryRequest = {
          name: formData.name,
          imageUrl: formData.imageUrl,
          status: formData.status,
        };

        const response = await updateCategoryService(
          formData.id,
          updatePayload
        );
        if (response) {
          // Update categories list
          setCategories((prev) =>
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
            message: `Category updated successfully`,
            duration: 4000,
            position: "top-right",
          });

          setIsModalOpen(false);
        }
      }
    } catch (error: any) {
      console.error("Error submitting Category form:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCategory() {
    if (!selectedCategory || !selectedCategory.id) return;

    setIsSubmitting(true);
    try {
      const response = await deletedCategoriesService(selectedCategory.id);

      if (response) {
        AppToast({
          type: "success",
          message: `Category deleted successfully`,
          duration: 4000,
          position: "top-right",
        });
        // After deletion, check if we need to go back a page
        if (categories && categories.content.length === 1 && currentPage > 1) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadCategories();
        }
      } else {
        AppToast({
          type: "error",
          message: `Failed to delete Category`,
          duration: 4000,
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error deleting Category:", error);
      toast.error("An error occurred while deleting the Category");
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  const handleStatusToggle = async (Category: CategoryModel | null) => {
    if (!Category?.id) return;

    setIsSubmitting(true);
    try {
      const newStatus =
        Category?.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE;

      const response = await updateCategoryService(Category?.id, {
        status: newStatus,
      });

      if (response) {
        // Optimistic update
        setCategories((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((Category) =>
                  Category.id === selectedCategoryToggle?.id
                    ? response
                    : Category
                ),
              }
            : prev
        );

        AppToast({
          type: "success",
          message: `Category status updated successfully`,
          duration: 4000,
          position: "top-right",
        });
        setSelectedCategoryToggle(null);
        setIsToggleStatusDialogOpen(false);
      } else {
        AppToast({
          type: "error",
          message: `Failed to update Category status`,
          duration: 4000,
          position: "top-right",
        });
        loadCategories(); // reload in case of failure
      }
    } catch (error: any) {
      toast.error(
        error?.message || "An error occurred while updating Category status"
      );
      loadCategories(); // reload in case of failure
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (Category: CategoryModel | null) => {
    setSelectedCategoryToggle(Category);
    setIsToggleStatusDialogOpen(true);
  };

  const handleEdit = (Category: CategoryFormData) => {
    setInitializeCategory(Category);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(!isModalOpen);
  };

  const handleDelete = (Category: any) => {
    setSelectedCategory(Category);
    setIsDeleteDialogOpen(true);
  };

  // Handle status filter change - directly updates the filter value
  const handleStatusChange = (status: Status) => {
    setStatusFilter(status);
  };

  // Handle status filter change - directly updates the filter value
  const handleViewCategoryDetail = (Category: CategoryModel) => {
    setSelectedCategory(Category);
    setInitializeCategory(Category);
    setIsCategoryDetailOpen(true);
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-start gap-4 w-full">
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="search-Category"
              autoComplete="search-Category"
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
                  {categoryTableHeaders.map((header) => (
                    <TableHead
                      key={header.key}
                      className="text-xs font-semibold text-muted-foreground"
                      style={{ width: header.className }}
                    >
                      {header.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {!categories || categories.content.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={categoryTableHeaders.length} // index + image + actions
                      className="text-center py-8 text-muted-foreground"
                    >
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.content.map((Category, index) => {
                    const imageUrl = Category.imageUrl
                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${Category.imageUrl}`
                      : "";

                    return (
                      <TableRow key={Category.id} className="text-sm">
                        {/* Index */}
                        <TableCell>
                          {indexDisplay(
                            categories.pageNo,
                            categories.pageSize,
                            index
                          )}
                        </TableCell>

                        <TableCell>{Category?.name || "---"}</TableCell>

                        {/* Image */}
                        <TableCell>
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage src={imageUrl} alt="Category Image" />
                            <AvatarFallback>
                              {Category?.businessName
                                ?.charAt(0)
                                .toUpperCase() || "B"}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>

                        <TableCell>
                          <Switch
                            checked={Category.status === "ACTIVE"}
                            onCheckedChange={() => handleToggleStatus(Category)}
                            disabled={isSubmitting}
                            aria-label="Toggle Category status"
                            className={cn(
                              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                              "bg-gray-300 dark:bg-gray-600 data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary"
                            )}
                          >
                            <div
                              className={cn(
                                "inline-block h-6 w-6 transform rounded-full bg-white dark:bg-gray-100 shadow-md transition-transform",
                                "translate-x-1 data-[state=checked]:translate-x-5"
                              )}
                            >
                              {Category.status === "ACTIVE" && (
                                <Check className="h-6 w-6 m-auto text-orange-600 dark:text-orange-300" />
                              )}
                            </div>
                          </Switch>
                        </TableCell>

                        <TableCell>{Category?.totalProducts || "0"}</TableCell>

                        <TableCell>
                          {DateTimeFormat(Category?.createdAt) || "---"}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="flex justify-center gap-2 items-center">
                          <Button
                            variant="outline"
                            onClick={() => handleViewCategoryDetail(Category)}
                            className="text-destructive hover:text-red-600"
                          >
                            <View className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleEdit(Category)}
                            className="hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleDelete(Category)}
                            className="text-destructive hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <CategoryDetailModal
          data={initializeCategory}
          isOpen={isCategoryDetailOpen}
          onClose={() => {
            setInitializeCategory(null);
            setIsModalOpen(false);
          }}
          onDelete={handleDelete}
          onEdit={handleEdit}
          showActions
        />

        <ConfirmDialog
          open={isToggleStatusDialogOpen}
          onOpenChange={() => {
            setIsToggleStatusDialogOpen(false);
            setSelectedCategoryToggle(null);
            setIsModalOpen(false);
            setIsCategoryDetailOpen(false);
          }}
          centered={true}
          title="Change User Status"
          description={`Are you sure you want to ${
            selectedCategoryToggle?.status === "ACTIVE" ? "disable" : "enable"
          } this Category?`}
          confirmButton={{
            text: `${
              selectedCategoryToggle?.status === "ACTIVE" ? "Disable" : "Enable"
            }`,
            onClick: () => handleToggleStatus(selectedCategoryToggle),
            variant: "primary",
          }}
          cancelButton={{ text: "Cancel", variant: "secondary" }}
          onConfirm={() => handleStatusToggle(selectedCategoryToggle)}
        />

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedCategory(null);
            setIsModalOpen(false);
          }}
          onDelete={handleDeleteCategory}
          title="Delete Admin"
          description={`Are you sure you want to delete the admin`}
          itemName={selectedCategory?.businessName}
          isSubmitting={isSubmitting}
        />

        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => {
            setInitializeCategory(null);
            setIsModalOpen(false);
            setIsCategoryDetailOpen(false);
          }}
          isSubmitting={isSubmitting}
          onSave={handleSubmit}
          data={initializeCategory}
          mode={mode}
        />
      </CardContent>
    </Card>
  );
}
