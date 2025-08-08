"use client";

import { AppToast } from "@/components/app/components/app-toast";
import PaginationPage from "@/components/shared/common/pagination-page";
import { ConfirmDialog } from "@/components/shared/dialog/dialog-confirm";
import { DeleteConfirmationDialog } from "@/components/shared/dialog/dialog-delete";
import ProductDetailModal from "@/components/shared/modal/product/product-detail-modal";
import { ProductModal } from "@/components/shared/modal/product/product-modal";
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
import { productTableHeaders } from "@/constants/app-resource/table/product";
import { getUserTableHeaders } from "@/constants/app-resource/table/table";
import { ROUTES } from "@/constants/app-routed/routes";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { ProductFormData } from "@/models/(content-manangement)/product/product.request";
import {
  AllProduct,
  ProductModel,
} from "@/models/(content-manangement)/product/product.response";
import { productFormData } from "@/models/(content-manangement)/product/product.schema";
import {
  createProductService,
  deletedProductService,
  getAllProductService,
  updateProductService,
} from "@/services/dashboard/content-management/product/product.service";
import { indexDisplay } from "@/utils/common/common";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { useDebounce } from "@/utils/debounce/debounce";
import { getUserInfo } from "@/utils/local-storage/userInfo";
import { Edit, Eye, Search, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProductPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<AllProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Status>(Status.ACTIVE);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initializeProduct, setInitializeProduct] =
    useState<productFormData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductModel | null>(
    null
  );
  const [selectedProductToDelete, setSelectedProductToDelete] =
    useState<ProductModel | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProductToggle, setSelectedProductToggle] =
    useState<ProductModel | null>(null);

  const t = useTranslations("user");
  const headers = getUserTableHeaders(t);
  const locale = useLocale();
  const pathname = usePathname();

  const user = getUserInfo();
  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTES.ADMIN.PRODUCTS,
      defaultPageSize: 10,
    });

  console.log("Page Debug:", { locale, pathname });

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllProductService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        status: statusFilter,
        businessId: user?.businessId,
        pageSize: 10,
      });
      console.log("Fetched products:", response);
      setProducts(response);
    } catch (error: any) {
      console.log("Failed to fetch products: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts, debouncedSearchQuery, statusFilter]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  async function handleSubmit(formData: productFormData) {
    console.log("Submitting form:", formData, "mode:", mode);

    setIsSubmitting(true);
    try {
      const isCreate = mode === ModalMode.CREATE_MODE;

      if (isCreate) {
        const createPayload: ProductFormData = {
          categoryId: formData.categoryId,
          images: formData.images,
          name: formData.name,
          brandId: formData.brandId,
          description: formData.description,
          price: formData.price,
          promotionFromDate: formData.promotionFromDate,
          promotionToDate: formData.promotionToDate,
          promotionType: formData.promotionType,
          promotionValue: formData.promotionValue,
          sizes: formData.sizes,
          status: formData.status,
        };

        const response = await createProductService(createPayload);
        if (response) {
          // Update products list
          setProducts((prev) =>
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
            message: `Product uploaded successfully`,
            duration: 4000,
            position: "top-right",
          });

          setIsModalOpen(false);
        }
      } else {
        if (!formData.id) {
          throw new Error("Product ID is required for update");
        }

        const updatePayload: ProductFormData = {
          categoryId: formData.categoryId,
          images: formData.images,
          name: formData.name,
          brandId: formData.brandId,
          description: formData.description,
          price: formData.price,
          promotionFromDate: formData.promotionFromDate,
          promotionToDate: formData.promotionToDate,
          promotionType: formData.promotionType,
          promotionValue: formData.promotionValue,
          sizes: formData.sizes,
          status: formData.status,
        };

        const response = await updateProductService(formData.id, updatePayload);
        if (response) {
          // Update products list
          setProducts((prev) =>
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
            message: `Product updated successfully`,
            duration: 4000,
            position: "top-right",
          });

          setIsModalOpen(false);
        }
      }
    } catch (error: any) {
      console.error("Error submitting Product form:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteProduct() {
    if (!selectedProduct || !selectedProduct.id) return;

    setIsSubmitting(true);
    try {
      const response = await deletedProductService(selectedProduct.id);

      if (response) {
        AppToast({
          type: "success",
          message: `Product deleted successfully`,
          duration: 4000,
          position: "top-right",
        });
        // After deletion, check if we need to go back a page
        if (products && products.content.length === 1 && currentPage > 1) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadProducts();
        }
      } else {
        AppToast({
          type: "error",
          message: `Failed to delete Product`,
          duration: 4000,
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error deleting Product:", error);
      toast.error("An error occurred while deleting the Product");
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  const getAdminDisplayPrice = (product: ProductModel): string => {
    // If product has sizes, show price range
    if (product.hasSizes && product.sizes && product.sizes.length > 0) {
      const prices = product.sizes.map((size) => size.finalPrice || size.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      // Same price for all sizes
      if (minPrice === maxPrice) {
        return `$${minPrice.toFixed(2)}`;
      }

      // Different prices - show range
      return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
    }

    // No sizes - use main product price
    return `$${(product.displayPrice || product.price || 0).toFixed(2)}`;
  };

  // const handleToggleStatus = (Product: ProductModel | null) => {
  //   setSelectedProductToggle(Product);
  //   setIsToggleStatusDialogOpen(true);
  // };

  const handleEdit = (Product: productFormData) => {
    setInitializeProduct(Product);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(!isModalOpen);
  };

  const handleDelete = (Product: ProductModel) => {
    setSelectedProductToDelete(Product);
    setIsDeleteDialogOpen(true);
  };

  // Handle status filter change - directly updates the filter value
  const handleStatusChange = (status: Status) => {
    setStatusFilter(status);
  };

  // Handle status filter change - directly updates the filter value
  const handleViewProductDetail = (Product: ProductModel) => {
    setSelectedProduct(Product);
    setIsUserDetailOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex flex-col">
        <CardContent className="space-y-6 p-6 flex-1 flex flex-col min-h-0">
          {/* Fixed Header Section */}
          <div className="flex-shrink-0 space-y-4">
            <div className="flex flex-wrap items-center justify-start gap-4 w-full">
              <div className="relative w-full md:w-[350px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  aria-label="search-Product"
                  autoComplete="search-Product"
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

            <Separator className="bg-gray-300" />
          </div>

          {/* Scrollable Table Section */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full border rounded-lg overflow-hidden bg-white">
              <div className="h-full overflow-x-auto overflow-y-auto">
                <Table className="min-w-[1400px] w-full relative">
                  <TableHeader className="sticky top-0 bg-white z-20 shadow-sm border-b-2">
                    <TableRow className="bg-gray-50">
                      {productTableHeaders.map((header, index) => (
                        <TableHead
                          key={header.key}
                          className={`text-xs font-bold text-gray-700 bg-gray-50 border-r last:border-r-0 px-4 py-3 ${
                            index === productTableHeaders.length - 1
                              ? "sticky right-0 bg-gray-50 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]"
                              : ""
                          } ${header.className || ""}`}
                        >
                          {header.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={productTableHeaders.length}
                          className="text-center py-8 text-muted-foreground"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span>Loading products...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : !products || products.content.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={productTableHeaders.length}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No products found
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.content.map((product, index) => {
                        const findThumbnail = product?.images?.find(
                          (image) => image.imageType === "MAIN"
                        );

                        const imageUrl = findThumbnail
                          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${findThumbnail.imageUrl}`
                          : "";

                        return (
                          <TableRow
                            key={product.id}
                            className="text-sm hover:bg-muted/50"
                          >
                            {/* Index */}
                            <TableCell className="font-medium text-center w-[60px]">
                              {indexDisplay(
                                products.pageNo,
                                products.pageSize,
                                index
                              )}
                            </TableCell>

                            {/* Image */}
                            <TableCell className="w-[80px]">
                              <Avatar className="h-12 w-12 border">
                                <AvatarImage
                                  src={imageUrl}
                                  alt="Product Image"
                                  className="object-cover"
                                />
                                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                                  {product?.name?.charAt(0).toUpperCase() ||
                                    "P"}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>

                            {/* Name */}
                            <TableCell className="font-semibold min-w-[200px] max-w-[250px]">
                              <div
                                className="truncate w-full"
                                title={product.name}
                              >
                                {product.name}
                              </div>
                            </TableCell>

                            {/* Category */}
                            <TableCell className="font-medium min-w-[120px] max-w-[150px]">
                              <div
                                className="truncate"
                                title={product.categoryName}
                              >
                                {product.categoryName || "N/A"}
                              </div>
                            </TableCell>

                            {/* Brand */}
                            <TableCell className="font-medium min-w-[120px] max-w-[150px]">
                              <div
                                className="truncate"
                                title={product.brandName}
                              >
                                {product.brandName || "N/A"}
                              </div>
                            </TableCell>

                            {/* Price */}
                            <TableCell className="text-right">
                              <div className="font-bold text-lg text-green-600">
                                {getAdminDisplayPrice(product)}
                              </div>
                              {product.hasSizes &&
                                product.sizes &&
                                product.sizes.length > 0 && (
                                  <div className="text-xs text-gray-500 font-medium">
                                    {product.sizes.length} size
                                    {product.sizes.length > 1 ? "s" : ""}
                                  </div>
                                )}
                            </TableCell>

                            {/* Status */}
                            <TableCell className="min-w-[100px]">
                              <Badge
                                variant={
                                  product.status === "ACTIVE"
                                    ? "default"
                                    : "secondary"
                                }
                                className={`text-xs ${
                                  product.status === "ACTIVE"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                }`}
                              >
                                {product.status}
                              </Badge>
                            </TableCell>

                            {/* Promotion */}
                            <TableCell className="min-w-[100px]">
                              <Badge
                                variant={
                                  product.hasPromotionActive
                                    ? "default"
                                    : "outline"
                                }
                                className={`text-xs ${
                                  product.hasPromotionActive
                                    ? "bg-orange-100 text-orange-800 border-orange-200"
                                    : "bg-gray-50 text-gray-600 border-gray-200"
                                }`}
                              >
                                {product.hasPromotionActive ? "Active" : "None"}
                              </Badge>
                            </TableCell>

                            {/* Favorites */}
                            <TableCell className="text-center min-w-[100px]">
                              <div className="flex items-center justify-center">
                                <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-xs font-medium">
                                  ❤️ {product.favoriteCount || 0}
                                </span>
                              </div>
                            </TableCell>

                            {/* Views */}
                            <TableCell className="text-center min-w-[100px]">
                              <div className="flex items-center justify-center">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                  👁️ {product.viewCount || 0}
                                </span>
                              </div>
                            </TableCell>

                            {/* Created At */}
                            <TableCell className="text-muted-foreground min-w-[120px]">
                              <div className="text-xs">
                                {DateTimeFormat(product.createdAt)}
                              </div>
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="w-[100px] sticky right-0 bg-background">
                              <div className="flex items-center gap-1 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleViewProductDetail(product)
                                  }
                                  className="hover:text-primary h-8 w-8 p-0 border-blue-200 hover:bg-blue-50"
                                  title="Edit product"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(product)}
                                  className="hover:text-primary h-8 w-8 p-0 border-blue-200 hover:bg-blue-50"
                                  title="Edit product"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(product)}
                                  className="text-destructive hover:text-red-700 hover:bg-red-50 border-red-200 h-8 w-8 p-0"
                                  title="Delete product"
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
          </div>

          <ProductDetailModal
            product={selectedProduct}
            open={isUserDetailOpen}
            onClose={() => {
              setSelectedProduct(null);
              setIsModalOpen(false);
            }}
          />

          <ProductModal
            data={initializeProduct}
            isOpen={isModalOpen}
            mode={mode}
            onClose={() => {
              setInitializeProduct(null);
              setSelectedProduct(null);
              setIsModalOpen(false);
            }}
            onSave={handleSubmit}
          />

          <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setSelectedProductToDelete(null);
            }}
            onDelete={handleDeleteProduct}
            title="Delete Product"
            description={`Are you sure you want to delete this product`}
            itemName={selectedProduct?.name || selectedProduct?.brandName}
            isSubmitting={isSubmitting}
          />

          {/* Pagination could go here if needed */}
          {products && products.totalElements > 0 && (
            <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {products.content.length} of {products.totalElements}{" "}
                products
              </div>
              <PaginationPage
                currentPage={currentPage}
                totalPages={products?.totalPages ?? 10}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
