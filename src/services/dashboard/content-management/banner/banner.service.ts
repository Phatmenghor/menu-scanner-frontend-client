import {
  AllBannerRequest,
  UploadBannerRequest,
} from "@/models/(content-manangement)/banner/banner.requeset";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllBannerService(data: AllBannerRequest) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.post(
      `/api/v1/banners/all`,
      data
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get all banner:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function getAllMyBannerService(data: AllBannerRequest) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.post(
      `/api/v1/banners/my-business/all`,
      data
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get all my business banner:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function uploadBannerMyBusinessService(data: AllBannerRequest) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.post(
      `/api/v1/banners/my-business`,
      data
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error upload banner:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function uploadBannerService(data: UploadBannerRequest) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.post(`/api/v1/banners`, data);
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error upload banner:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function updateBannerService(
  businessId: string,
  data: UploadBannerRequest
) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.put(
      `/api/v1/business/${businessId}`,
      data
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error update business:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function deletedBannerService(id: string) {
  try {
    const response = await axiosClientWithAuth.delete(`/api/v1/banners/${id}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error deleting banner:", error);
    throw error;
  }
}
