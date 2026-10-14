import apiClient from "../api/apiClient";
import { API_ROUTES } from "@/constants/apiRoutes";
import { AdminProductSummary, IdLabelMap, NewProduct, ProductStockAvailabilityResponse } from "@/types/productTypes";

export async function fetchProductCategories(): Promise<IdLabelMap> {
    const response = await apiClient.get(API_ROUTES.PRODUCTS.CATEGORIES);
    return response.data ?? {};
}

export async function fetchBrands(): Promise<IdLabelMap> {
    const response = await apiClient.get(API_ROUTES.PRODUCTS.BRANDS);
    return response.data ?? {};
}

export async function saveNewProducts(products: NewProduct[]): Promise<void> {
    await apiClient.post(API_ROUTES.PRODUCTS.SAVE, products);
}

export async function fetchAllProducts(): Promise<AdminProductSummary[]> {
    const response = await apiClient.get(API_ROUTES.PRODUCTS.LIST);
    return response.data ?? [];
}

export async function getProductStockAvailability(productId: number): Promise<ProductStockAvailabilityResponse> {
    const response = await apiClient.get(API_ROUTES.PRODUCTS.STOCK, { params: { productId } });
    return response.data;
}

export async function deactivateProduct(productId: number): Promise<string> {
    const response = await apiClient.put(API_ROUTES.PRODUCTS.DEACTIVATE, null, { params: { productId } });
    return response.data;
}

export async function reactivateProduct(productId: number): Promise<string> {
    const response = await apiClient.put(API_ROUTES.PRODUCTS.REACTIVATE, null, { params: { productId } });
    return response.data;
}

export async function deleteProduct(productId: number): Promise<string> {
    const response = await apiClient.delete(API_ROUTES.PRODUCTS.DELETE, { params: { productId } });
    return response.data;
}
