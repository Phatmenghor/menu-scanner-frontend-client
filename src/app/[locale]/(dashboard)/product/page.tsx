"use client";

import { RoleBadge } from "@/components/shared/badge/role-badge";
import {
  ConfigurableTable,
  TableColumn,
} from "@/components/shared/table/table";
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
import { STATUS_FILTER } from "@/constants/AppResource/status/status";
import {
  getUserTableHeaders,
  UserTableHeaders,
} from "@/constants/AppResource/table/table";
import { cn } from "@/lib/utils";
import {
  getProductsService,
  PaginatedProductsResponse,
  Product,
} from "@/services/dashboard/product/product.service";
import {
  getUsersService,
  PaginatedUsersResponse,
  User,
} from "@/services/dashboard/user/user.service";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { useDebounce } from "@/utils/debounce/debounce";
import {
  ExcelColumn,
  ExcelExporter,
  ExcelSheet,
  quickExport,
} from "@/utils/export-file/excel";
import {
  Archive,
  Calendar,
  Check,
  DollarSign,
  Edit,
  Eye,
  Package,
  Search,
  ToggleLeft,
  Trash2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function UserPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<PaginatedProductsResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExportingToExcel, setIsExportingToExcel] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const t = useTranslations("user");
  const headers = getUserTableHeaders(t);
  const locale = useLocale();
  const pathname = usePathname();

  console.log("Page Debug:", { locale, pathname });

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getProductsService();
      setProducts(response);
    } catch (error: any) {
      console.log("Failed to fetch users: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers, debouncedSearchQuery, statusFilter]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleExportToPdf = async (data: PaginatedUsersResponse | null) => {
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

      // await quickExport(data?.content ?? [], {
      //   filename: "users.xlsx",
      //   title: "User List",
      //   autoFilter: true,
      //   columns: columns,
      //   sortBy: [{ key: "createdAt", order: "desc" }],
      // });

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
      toast.success("Failed to export to excel");
      console.log("Error exporting to excel: ", err);
    } finally {
      setIsExportingToExcel(false);
    }
  };

  // Handle status filter change - directly updates the filter value
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
  };

  const ProductTableColumns: TableColumn[] = [
    {
      key: "name",
      label: "Product",
      icon: Package,
      width: "200px",
      render: (product) => (
        <div className="flex items-center gap-3 min-w-[180px]">
          <Avatar className="h-10 w-10 border-2 border-background dark:border-card shadow-sm group-hover:border-primary/30 transition-all">
            <AvatarImage src={product.imageUrl || ""} alt={product.name} />
            <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary font-semibold">
              {product.name?.charAt(0).toUpperCase() || "P"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold truncate">
              {product.name}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {product.category}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      icon: DollarSign,
      align: "right",
      render: (product) => (
        <span className="font-semibold">${product.price.toFixed(2)}</span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      icon: Archive,
      align: "center",
      render: (product) => (
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            product.stock > 10
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : product.stock > 0
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          )}
        >
          {product.stock} units
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      icon: ToggleLeft,
      align: "center",
      render: (product: Product) => (
        <Switch
          checked={product.status === "ACTIVE"}
          aria-label="Toggle product status"
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            "bg-gray-300 dark:bg-gray-600 data-[state=checked]:bg-orange-500 dark:data-[state=checked]:bg-orange-400"
          )}
        >
          <div
            className={cn(
              "inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-100 shadow-md transition-transform",
              "translate-x-1 data-[state=checked]:translate-x-5"
            )}
          >
            {product.status === "ACTIVE" && (
              <Check className="h-3 w-3 m-auto text-orange-600 dark:text-orange-300" />
            )}
          </div>
        </Switch>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      icon: Calendar,
      render: (product: Product) => (
        <span className="text-muted-foreground">
          {DateTimeFormat(product.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (product: Product) => (
        <div className="flex items-center justify-end">
          <Button variant="ghost" className="hover:text-primary">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" className="hover:text-primary">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="text-destructive hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
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
          <div>
            {/* <Button onClick={() => handleExportToPdf(users)}>Excel</Button> */}
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
        </div>

        <div className="w-full">
          <Separator className="bg-gray-300" />
        </div>

        <div>
          <div className="rounded-md border overflow-x-auto whitespace-nowrap">
            <ConfigurableTable
              columns={ProductTableColumns}
              data={products}
              loading={isLoading}
              emptyMessage="No products found"
              onRowClick={(product) => console.log(product)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
