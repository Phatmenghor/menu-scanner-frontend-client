import { UpdateMyBusinessSetting } from "@/models/(business)/business-setting/business-setting.request";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getMyBusinessSettingService() {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.get(
      `/api/v1/business/settings/my-business`
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get my business setting:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function updateMyBusinessSettingService(
  data: UpdateMyBusinessSetting
) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.put(
      `/api/v1/business/settings/my-business`,
      data
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error update my business setting:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function updateBusinessByIdService(
  businessId: string,
  data: UpdateMyBusinessSetting
) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.put(
      `/api/v1/business/settings/${businessId}`,
      data
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error update business setting by id:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}
