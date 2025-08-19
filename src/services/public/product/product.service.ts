import { AllProductRequest } from "@/models/content-manangement/product/product.request";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getPublicProductByIdService(id: string) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.get(
      `/api/v1/public/products/${id}`
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get public product by id:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function getAllPublicProductService(data: AllProductRequest) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.post(
      `/api/v1/public/products/all`,
      data
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get public products:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}
