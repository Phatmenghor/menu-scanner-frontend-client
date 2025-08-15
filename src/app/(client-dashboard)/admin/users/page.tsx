"use client";

import { AppToast } from "@/components/app/components/app-toast";
import { RoleBadge } from "@/components/shared/badge/role-badge";
import PaginationPage from "@/components/shared/common/pagination-page";
import { ConfirmDialog } from "@/components/shared/dialog/dialog-confirm";
import { DeleteConfirmationDialog } from "@/components/shared/dialog/dialog-delete";
import ResetPasswordModal from "@/components/shared/dialog/dialog-reset-password";
import { UserDetailModal } from "@/components/shared/modal/user/user-detail-modal";
import ModalUser from "@/components/shared/modal/user/user-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  BusinessUserRole,
  ModalMode,
  Status,
  STATUS_FILTER,
  UserRole,
} from "@/constants/app-resource/status/status";
import {
  getUserTableHeaders,
  UserTableHeaders,
} from "@/constants/app-resource/table/table";
import { ROUTES } from "@/constants/app-routed/routes";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import {
  CreateUserRequest,
  UpdateUserRequest,
} from "@/models/user/user.request.model";
import { AllUserResponse, UserModel } from "@/models/user/user.response.model";
import { UserFormData } from "@/models/user/user.schema";
import {
  createUserService,
  deletedUserService,
  getAllUserService,
  updateUserService,
} from "@/services/dashboard/user/user.service";
import { indexDisplay } from "@/utils/common/common";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { useDebounce } from "@/utils/debounce/debounce";
import {
  ExcelColumn,
  ExcelExporter,
  ExcelSheet,
} from "@/utils/export-file/excel";
import { getUserInfo } from "@/utils/local-storage/userInfo";
import { Check, Edit, Eye, RotateCw, Search, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function UserPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<AllUserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExportingToExcel, setIsExportingToExcel] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Status>(Status.ACTIVE);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initializeUser, setInitializeUser] = useState<UserFormData | null>(
    null
  );
  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [selectedUserToggle, setSelectedUserToggle] =
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
      baseRoute: ROUTES.ADMIN.USERS,
      defaultPageSize: itemsPerPage, // Use dynamic page size
    });

  console.log("Page Debug:", { locale, pathname });

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllUserService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        accountStatus: statusFilter,
        roles: [
          BusinessUserRole.BUSINESS_OWNER,
          BusinessUserRole.BUSINESS_MANAGER,
          BusinessUserRole.BUSINESS_STAFF,
        ],
        pageSize: itemsPerPage, // Use dynamic page size
      });
      console.log("Fetched users:", response);
      setUsers(response);
    } catch (error: any) {
      console.log("Failed to fetch users: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, currentPage, itemsPerPage]); // Add itemsPerPage dependency

  useEffect(() => {
    loadUsers();
  }, [loadUsers, debouncedSearchQuery, statusFilter, itemsPerPage]); // Add itemsPerPage dependency

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

  async function handleSubmit(formData: UserFormData) {
    console.log("Submitting form:", formData, "mode:", mode);

    setIsSubmitting(true);
    try {
      const isCreate = mode === ModalMode.CREATE_MODE;

      if (isCreate) {
        const createPayload: CreateUserRequest = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email!,
          userType: formData.userType!,
          businessId: formData.businessId,
          password: formData.password!,
          phoneNumber: formData.phoneNumber,
          accountStatus: formData.accountStatus,
          profileImageUrl: formData.profileImageUrl,
          address: formData.address,
          roles: formData.roles || [UserRole.BUSINESS_STAFF],
          userIdentifier: formData?.userIdentifier || "",
          notes: formData.notes,
          position: formData.position,
        };

        const response = await createUserService(createPayload);
        if (response) {
          // Update users list
          setUsers((prev) =>
            prev
              ? {
                  ...prev,
                  content: [response, ...prev.content],
                  totalElements: prev.totalElements + 1,
                }
              : {
                  content: [response],
                  pageNo: 1,
                  pageSize: itemsPerPage,
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
            message: `User ${
              formData.userIdentifier ||
              `${formData.firstName} ${formData.lastName}`
            } added successfully`,
            duration: 4000,
            position: "top-right",
          });

          setIsModalOpen(false);
        }
      } else {
        // Update mode
        if (!formData.id) {
          throw new Error("User ID is required for update");
        }

        const updatePayload: UpdateUserRequest = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          accountStatus: formData.accountStatus,
          profileImageUrl: formData.profileImageUrl,
          address: formData.address,
          businessId: formData.businessId,
          roles: formData.roles,
          notes: formData.notes,
          position: formData.position,
        };

        const response = await updateUserService(formData.id, updatePayload);
        if (response) {
          // Update users list
          setUsers((prev) =>
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
            message: `User ${
              response.username || response.email
            } updated successfully`,
            duration: 4000,
            position: "top-right",
          });

          setIsModalOpen(false);
        }
      }
    } catch (error: any) {
      console.error("Error submitting user form:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteUser() {
    if (!selectedUser || !selectedUser.id) return;

    setIsSubmitting(true);
    try {
      const response = await deletedUserService(selectedUser.id);

      if (response) {
        AppToast({
          type: "success",
          message: `User ${selectedUser.fullName ?? ""} deleted successfully`,
          duration: 4000,
          position: "top-right",
        });
        // After deletion, check if we need to go back a page
        if (users && users.content.length === 1 && currentPage > 1) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadUsers();
        }
      } else {
        AppToast({
          type: "error",
          message: `Failed to delete user`,
          duration: 4000,
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("An error occurred while deleting the user");
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  const handleStatusToggle = async (user: UserModel | null) => {
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      const newStatus =
        user?.accountStatus === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE;

      const response = await updateUserService(user?.id, {
        accountStatus: newStatus,
      });

      if (response) {
        // Optimistic update
        setUsers((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((user) =>
                  user.id === selectedUserToggle?.id ? response : user
                ),
              }
            : prev
        );

        AppToast({
          type: "success",
          message: `User status updated successfully`,
          duration: 4000,
          position: "top-right",
        });
        setSelectedUserToggle(null);
        setIsToggleStatusDialogOpen(false);
      } else {
        AppToast({
          type: "error",
          message: `Failed to update user status`,
          duration: 4000,
          position: "top-right",
        });
        loadUsers(); // reload in case of failure
      }
    } catch (error: any) {
      toast.error(
        error?.message || "An error occurred while updating user status"
      );
      loadUsers(); // reload in case of failure
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportToPdf = async (data: AllUserResponse | null) => {
    setIsExportingToExcel(true);
    try {
      const columns: ExcelColumn[] = [
        {
          header: "Id",
          key: "id",
          width: 15,
          style: { alignment: { horizontal: "right" } },
        },
        { header: "Name", key: "name", width: 15 },
        { header: "Email", key: "email", width: 30 },
        { header: "Role", key: "role", width: 15 },
        { header: "Status", key: "status", width: 15 },
        {
          header: "Join Date",
          key: "createdAt",
          width: 25,
          type: "date",
          format: "mm/dd/yyyy",
        },
      ];

      const exporter = new ExcelExporter({
        filename: "user.xlsx",
        title: "User Report",
        author: "IT Department",
        useAlternateRows: true,
        protection: {
          password: "Mak12pa12",
          deleteRows: false,
        },
      });

      const sheetConfig: ExcelSheet = {
        name: "User",
        data: data?.content ?? [],
        columns,
        autoFilter: true,
        freezeRows: 1,
        sortBy: [{ key: "createAt", order: "desc" }],
      };

      exporter.addSheet(sheetConfig);
      await exporter.export();

      toast.success("Successfully export to excel");
    } catch (err: any) {
      toast.error("Failed to export to excel");
      console.log("Error exporting to excel: ", err);
    } finally {
      setIsExportingToExcel(false);
    }
  };

  const handleResetPassword = (user: UserModel) => {
    setSelectedUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  const handleToggleStatus = (user: UserModel) => {
    setSelectedUserToggle(user);
    setIsToggleStatusDialogOpen(true);
  };

  const handleEditUser = (user: UserFormData) => {
    setInitializeUser(user);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(!isModalOpen);
  };

  const handleDelete = (user: UserModel) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Handle status filter change - directly updates the filter value
  const handleStatusChange = (status: Status) => {
    setStatusFilter(status);
    // Reset to page 1 when filtering to avoid confusion
    updateUrlWithPage(1);
  };

  // Handle status filter change - directly updates the filter value
  const handleViewUserDetail = (user: UserModel) => {
    setSelectedUser(user);
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
            <div>
              <Button
                onClick={() => handleExportToPdf(users)}
                disabled={isExportingToExcel}
              >
                {isExportingToExcel ? "Exporting..." : "Excel"}
              </Button>
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
                    {headers.map((header, index) => (
                      <TableHead
                        key={index}
                        className="text-xs font-semibold text-muted-foreground"
                      >
                        <div className="flex items-center gap-1">
                          {header.icon && <header.icon className="w-4 h-4" />}
                          <span>{header.label}</span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!users || users.content.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={UserTableHeaders.length}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {isLoading ? "Loading users..." : "No users found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.content.map((user, index) => {
                      const profileImageUrl =
                        user?.profileImageUrl &&
                        process.env.NEXT_PUBLIC_API_BASE_URL
                          ? `${user.profileImageUrl}`
                          : undefined;

                      return (
                        <TableRow key={user.id} className="text-sm">
                          {/* Index */}
                          <TableCell className="font-medium truncate">
                            {indexDisplay(users.pageNo, itemsPerPage, index)}
                          </TableCell>

                          {/* Avatar */}
                          <TableCell>
                            <div className="flex items-center gap-3 min-w-[180px]">
                              <Avatar className="h-10 w-10 border-2 border-background dark:border-card shadow-sm group-hover:border-primary/30 transition-all">
                                <AvatarImage
                                  src={
                                    user.profileImageUrl ? profileImageUrl : ""
                                  }
                                  alt="Profile"
                                />
                                <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary font-semibold">
                                  {user?.email?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-semibold">
                                {user?.email}
                              </span>
                            </div>
                          </TableCell>

                          {/* Role */}
                          <TableCell className="text-xs text-muted-foreground">
                            {user.roles?.length > 0
                              ? user.roles.map((role: string) => (
                                  <RoleBadge key={role} role={role} />
                                ))
                              : "---"}
                          </TableCell>

                          {/* Status Switch */}
                          <TableCell>
                            <Switch
                              checked={user?.accountStatus === "ACTIVE"}
                              onCheckedChange={() => handleToggleStatus(user)}
                              disabled={isSubmitting}
                              aria-label="Toggle user status"
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
                                {user.accountStatus === "ACTIVE" && (
                                  <Check className="h-6 w-6 m-auto text-orange-600 dark:text-orange-300" />
                                )}
                              </div>
                            </Switch>
                          </TableCell>

                          {/* Created At */}
                          <TableCell className="text-sm text-muted-foreground">
                            {DateTimeFormat(user?.createdAt)}
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <div className="flex items-center justify-end">
                              <Button
                                variant="ghost"
                                onClick={() => handleViewUserDetail(user)}
                                className="hover:text-primary"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResetPassword(user)}
                              >
                                <RotateCw className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "transition-all duration-200 hover:text-primary"
                                )}
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                onClick={() => handleDelete(user)}
                                className={cn(
                                  "text-destructive hover:text-red-600"
                                )}
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

          {/* All the modals and dialogs remain the same */}
          <UserDetailModal
            open={isUserDetailOpen}
            onClose={() => setIsUserDetailOpen(false)}
            user={selectedUser}
          />

          <ConfirmDialog
            open={isToggleStatusDialogOpen}
            onOpenChange={() => {
              setIsToggleStatusDialogOpen(false);
              setSelectedUserToggle(null);
            }}
            centered={true}
            title="Change User Status"
            description={`Are you sure you want to ${
              selectedUserToggle?.accountStatus === "ACTIVE"
                ? "disable"
                : "enable"
            } this user: ${selectedUserToggle?.email}?`}
            confirmButton={{
              text: `${
                selectedUserToggle?.accountStatus === "ACTIVE"
                  ? "Disable"
                  : "Enable"
              }`,
              onClick: () => handleStatusToggle(selectedUserToggle),
              variant: "primary",
            }}
            cancelButton={{ text: "Cancel", variant: "secondary" }}
            onConfirm={() => handleStatusToggle(selectedUserToggle)}
          />

          <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setSelectedUser(null);
            }}
            onDelete={handleDeleteUser}
            title="Delete Admin"
            description={`Are you sure you want to delete the admin`}
            itemName={selectedUser?.fullName || selectedUser?.email}
            isSubmitting={isSubmitting}
          />

          <ResetPasswordModal
            isOpen={isResetPasswordDialogOpen}
            userName={selectedUser?.fullName || selectedUser?.email}
            onClose={() => {
              setIsResetPasswordDialogOpen(false);
              setSelectedUser(null);
            }}
            userId={selectedUser?.id}
          />

          <ModalUser
            isOpen={isModalOpen}
            onClose={() => {
              setInitializeUser(null);
              setIsModalOpen(false);
            }}
            isSubmitting={isSubmitting}
            onSave={handleSubmit}
            Data={initializeUser}
            mode={mode}
          />
        </CardContent>
      </Card>
      {!isLoading && users && users.totalElements > 0 && (
        <div className="p-5 mb-16">
          <PaginationPage
            currentPage={currentPage}
            totalItems={users.totalElements}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            showItemsPerPage={true}
            showResultsText={true}
          />
        </div>
      )}
    </div>
  );
}
