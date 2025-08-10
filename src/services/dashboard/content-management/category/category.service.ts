import {
  AllBrandRequest,
  BrandRequest,
} from "@/models/content-manangement/brand/brand.request";
import {
  AllCategoryRequest,
  CategoryRequest,
} from "@/models/content-manangement/category/category.request";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllCategoryService(data: AllCategoryRequest) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.post(
      `/api/v1/categories/all`,
      data
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get all categories:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function getAllMyCategoriesService(data: AllCategoryRequest) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.post(
      `/api/v1/categories/my-business/all`,
      data
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get all my business category:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function getCategoryByIdService(id: string) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.get(`/api/v1/categories/${id}`);
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get category by id:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function createCategoryService(data: CategoryRequest) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.post(`/api/v1/categories`, data);
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error create category:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function updateCategoryService(
  businessId: string,
  data: BrandRequest
) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.put(
      `/api/v1/categories/${businessId}`,
      data
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error update category:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function deletedCategoriesService(id: string) {
  try {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/categories/${id}`
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error deleting category:", error);
    throw error;
  }
}
