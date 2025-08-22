"use client";

import { AppToast } from "@/components/app/components/app-toast";
import PaginationPage from "@/components/shared/common/pagination-page";
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
import { ROUTES } from "@/constants/app-routed/routes";
import { usePagination } from "@/hooks/use-pagination";
import {
  AllProduct,
  ProductModel,
} from "@/models/content-manangement/product/product.response";
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

// Product Form Data Type (simplified without schema)
type ProductFormData = {
  id?: string;
  name: string;
  categoryId: string;
  images: Array<{
    imageUrl: string;
    imageType: string;
  }>;
  description?: string;
  brandId?: string;
  price?: number;
  promotionType?: string;
  promotionValue?: number;
  promotionFromDate?: string;
  promotionToDate?: string;
  sizes?: Array<{
    name: string;
    price: number;
    promotionType?: string;
    promotionValue?: number;
    promotionFromDate?: string;
    promotionToDate?: string;
  }>;
  status?: string;
};

export default function ProductPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<AllProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Status>(Status.ACTIVE);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initializeProduct, setInitializeProduct] = useState<string | null>(
    null
  );
  const [selectedProduct, setSelectedProduct] = useState<ProductModel | null>(
    null
  );
  const [selectedProductToDelete, setSelectedProductToDelete] =
    useState<ProductModel | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  //Pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const t = useTranslations("user");
  const locale = useLocale();
  const pathname = usePathname();

  const user = getUserInfo();
  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.PRODUCTS,
    defaultPageSize: 10,
  });

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
      AppToast({
        type: "error",
        message: "Failed to load products",
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, currentPage, user?.businessId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  async function handleSubmit(formData: ProductFormData) {
    console.log("Submitting form:", formData, "mode:", mode);

    setIsSubmitting(true);
    try {
      const isCreate = mode === ModalMode.CREATE_MODE;

      // Prepare the payload for the API
      const payload = {
        name: formData.name,
        categoryId: formData.categoryId,
        images: formData.images,
        description: formData.description,
        brandId: formData.brandId || undefined,
        price: formData.price,
        promotionType: formData.promotionType || undefined,
        promotionValue: formData.promotionValue || undefined,
        promotionFromDate: formData.promotionFromDate || undefined,
        promotionToDate: formData.promotionToDate || undefined,
        sizes: formData.sizes || [],
        status: formData.status || "ACTIVE",
      };

      let response: any;
      if (isCreate) {
        response = await createProductService(payload);
        if (response) {
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
            message: "Product created successfully",
            duration: 4000,
            position: "top-right",
          });
        }
      } else {
        if (!formData.id) {
          throw new Error("Product ID is required for update");
        }

        response = await updateProductService(formData.id, payload);
        if (response) {
          setProducts((prev) =>
            prev
              ? {
                  ...prev,
                  content: prev.content.map((product) =>
                    product.id === formData.id ? response : product
                  ),
                }
              : prev
          );

          AppToast({
            type: "success",
            message: "Product updated successfully",
            duration: 4000,
            position: "top-right",
          });
        }
      }

      setIsModalOpen(false);
      setInitializeProduct(null);
    } catch (error: any) {
      console.error("Error submitting Product form:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred";

      AppToast({
        type: "error",
        message: errorMessage,
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteProduct() {
    if (!selectedProductToDelete || !selectedProductToDelete.id) return;

    setIsSubmitting(true);
    try {
      const response = await deletedProductService(selectedProductToDelete.id);

      if (response) {
        AppToast({
          type: "success",
          message: "Product deleted successfully",
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
          message: "Failed to delete Product",
          duration: 4000,
          position: "top-right",
        });
      }
    } catch (error: any) {
      console.error("Error deleting Product:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "An error occurred while deleting the product";

      AppToast({
        type: "error",
        message: errorMessage,
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setSelectedProductToDelete(null);
    }
  }

  // Handle items per page change
  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage: number) => {
      setItemsPerPage(newItemsPerPage);
      // Reset to page 1 when changing items per page to avoid confusion
      updateUrlWithPage(1);
    },
    [updateUrlWithPage]
  );

  const handleEdit = (product: ProductModel) => {
    setInitializeProduct(product?.id);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleDelete = (product: ProductModel) => {
    setSelectedProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleStatusChange = (status: Status) => {
    setStatusFilter(status);
  };

  const handleViewProductDetail = (product: ProductModel) => {
    setSelectedProduct(product);
    setIsUserDetailOpen(true);
  };

  const handleCreateNew = () => {
    setInitializeProduct(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setInitializeProduct(null);
    setSelectedProduct(null);
  };

  const handleCloseDetailModal = () => {
    setIsUserDetailOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex flex-col">
        <CardContent className="space-y-4 p-4 flex-1 flex flex-col min-h-0">
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
                <Button onClick={handleCreateNew} disabled={isSubmitting}>
                  New Product
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
                        return (
                          <TableRow
                            key={product.id}
                            className="text-sm hover:bg-muted/50"
                          >
                            {/* Index */}
                            <TableCell className="font-medium text-center">
                              {indexDisplay(
                                products.pageNo,
                                products.pageSize,
                                index
                              )}
                            </TableCell>

                            {/* Image */}
                            <TableCell>
                              <Avatar className="h-12 w-12 border">
                                <AvatarImage
                                  src={product.mainImageUrl}
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
                                {product.price}
                              </div>
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
                                  product.hasPromotion ? "default" : "outline"
                                }
                                className={`text-xs ${
                                  product.hasPromotion
                                    ? "bg-orange-100 text-orange-800 border-orange-200"
                                    : "bg-gray-50 text-gray-600 border-gray-200"
                                }`}
                              >
                                {product.hasPromotion ? "Active" : "None"}
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
                                  title="View product details"
                                  disabled={isSubmitting}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(product)}
                                  className="hover:text-primary h-8 w-8 p-0 border-blue-200 hover:bg-blue-50"
                                  title="Edit product"
                                  disabled={isSubmitting}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(product)}
                                  className="text-destructive hover:text-red-700 hover:bg-red-50 border-red-200 h-8 w-8 p-0"
                                  title="Delete product"
                                  disabled={isSubmitting}
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

          {/* Modals */}
          <ProductDetailModal
            productId={selectedProduct?.id || ""}
            open={isUserDetailOpen}
            onClose={handleCloseDetailModal}
          />

          <ProductModal
            productId={initializeProduct}
            isOpen={isModalOpen}
            mode={mode}
            onClose={handleCloseModal}
            onSave={handleSubmit}
            isSubmitting={isSubmitting}
          />

          <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setSelectedProductToDelete(null);
            }}
            onDelete={handleDeleteProduct}
            title="Delete Product"
            description="Are you sure you want to delete this product? This action cannot be undone."
            itemName={selectedProductToDelete?.name}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {products && products.totalElements > 0 && (
        <div className="flex-shrink-0 flex items-center justify-between p-5 mb-16 border-t">
          <PaginationPage
            currentPage={currentPage}
            totalItems={products.totalElements}
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
