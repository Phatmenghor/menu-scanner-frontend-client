import { AddressRequest } from "@/models/public/dashboard/address/address.request";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getAddressService() {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.get(`/api/v1/addresses`);
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get customer addresses:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function setDefaultAddressService(id: string) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.put(
      `/api/v1/addresses/${id}/set-default`
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error(`Error set customer address id ${id} to default:`, error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function getDefaultAddressService() {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.get(`/api/v1/addresses/default`);
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get customer default addresses:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function createAddressService(data: AddressRequest) {
  try {
    // POST request to create address
    const response = await axiosClientWithAuth.post(`/api/v1/addresses`, data);
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error create customer addresses:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function updateAddressService(
  id: string,
  data: Partial<AddressRequest>
) {
  try {
    // Put request to update address
    const response = await axiosClientWithAuth.put(
      `/api/v1/addresses/${id}`,
      data
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error update customer addresses:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function deleteAddressService(id: string) {
  try {
    // Put request to update address
    const response = await axiosClientWithAuth.delete(
      `/api/v1/addresses/${id}`
    );
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error delete customer address:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}
