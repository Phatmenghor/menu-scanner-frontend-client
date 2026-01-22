import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";

export interface WishlistItemResponseModel {
  id: string;
  productId: string;
  product: ProductDetailResponseModel;
  createdAt: string;
}

export interface WishlistResponseModel {
  items: WishlistItemResponseModel[];
  totalItems: number;
}
