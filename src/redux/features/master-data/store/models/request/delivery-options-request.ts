import { BaseGetAllRequest } from "@/utils/common/get-all-request";
import { UpdateBannerData } from "../schema/banner-schema";
import { UpdateDeliveryOptionsData } from "../schema/delivery-options-schema";

export interface AllDeliveryOptionsRequest extends BaseGetAllRequest {
  status?: string;
}

export interface UpdateDeliveryOptionsParams {
  id: string;
  payload: UpdateDeliveryOptionsData;
}
