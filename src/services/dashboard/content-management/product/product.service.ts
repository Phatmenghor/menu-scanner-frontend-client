import {
  AllProductRequest,
  ProductFormData,
} from "@/models/(content-manangement)/product/product.request";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllProductService(data: AllProductRequest) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.post(
      `/api/v1/products/all`,
      data
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get all products:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function getProductByIdService(id: string) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.get(`/api/v1/products/${id}`);
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get product by id:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function getAllMyProductsService(data: AllProductRequest) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.post(
      `/api/v1/products/my-business/all`,
      data
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get all my business products:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function createProductService(data: ProductFormData) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.post(`/api/v1/products`, data);
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error create product:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function updateProductService(
  businessId: string,
  data: ProductFormData
) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.put(
      `/api/v1/products/${businessId}`,
      data
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error update product:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function deletedProductService(id: string) {
  try {
    const response = await axiosClientWithAuth.delete(`/api/v1/products/${id}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error deleting product:", error);
    throw error;
  }
}
