import {
  AllBrandRequest,
  BrandRequest,
} from "@/models/(content-manangement)/brand/brand.request";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllBrandService(data: AllBrandRequest) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.post(`/api/v1/brands/all`, data);
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get all brand:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function getAllMyBannerService(data: AllBrandRequest) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.post(
      `/api/v1/brands/my-business/all`,
      data
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get all my business brand:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function createBrandService(data: BrandRequest) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.post(`/api/v1/brands`, data);
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error create brand:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function updateBrandService(
  businessId: string,
  data: BrandRequest
) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.put(
      `/api/v1/brands/${businessId}`,
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

export async function deletedBrandService(id: string) {
  try {
    const response = await axiosClientWithAuth.delete(`/api/v1/brands/${id}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error deleting brand:", error);
    throw error;
  }
}
