import { StoreTarget, EmployeeTarget, StoreTargetResponse, EmployeeTargetResponse, EmployeeTargetRequest, StoreTargetRequest } from "@/types/targetTypes";
import apiClient from "../api/apiClient";

const BASE_URL = "/company";

export async function getStoreTargets(companyName: string, targetMonth: string): Promise<StoreTargetResponse[]> {
    const response = await apiClient.get(`${BASE_URL}/viewStoresTargets`, { params: { companyName, targetMonth } });
    return response.data;
}

export async function getEmployeeTargets(companyName: string, targetMonth: string): Promise<EmployeeTargetResponse[]> {
    const response = await apiClient.get(`${BASE_URL}/viewEmployeesTargets`, { params: { companyName, targetMonth } });
    return response.data;
}

export async function updateStoreTarget(storeTarget: StoreTargetRequest): Promise<string> {
    const storeTargetPayload = {
        store: {
            dealerStoreId: storeTarget.store.dealerStoreId,
        },
        activationTargetToStore: storeTarget.target.activationTargetToStore,
        upgradeTargetToStore: storeTarget.target.upgradeTargetToStore,
        migrationTargetToStore: storeTarget.target.migrationTargetToStore,
        accessoriesTargetToStore: storeTarget.target.accessoriesTargetToStore,
        hsiTargetToStore: storeTarget.target.hsiTargetToStore,
        tabletsTargetToStore: storeTarget.target.tabletsTargetToStore,
        smartwatchTragetToStore: storeTarget.target.smartwatchTragetToStore,
        targetMonth: storeTarget.target.targetMonth,
    }
    const response = await apiClient.post(`${BASE_URL}/storeTarget`, storeTargetPayload);
    return response.data;
}

export async function updateEmployeeTarget(employeeTarget: EmployeeTargetRequest): Promise<string> {
    const employeeTargetPayload = {
        employee: {
            employeeNtid: employeeTarget.employee.employeeNtid,
        },
        phonesTargetToEmployee: employeeTarget.target.phonesTargetToEmployee,
        upgradeTargetToEmployee: employeeTarget.target.upgradeTargetToEmployee,
        migrationTargetToEmployee: employeeTarget.target.migrationTargetToEmployee,
        accessoriesTargetByEmployee: employeeTarget.target.accessoriesTargetByEmployee,
        hsiTarget: employeeTarget.target.hsiTarget,
        tabletsTargetByEmployee: employeeTarget.target.tabletsTargetByEmployee,
        smartwatchTargetByEmployee: employeeTarget.target.smartwatchTargetByEmployee,
        targetMonth: employeeTarget.target.targetMonth,
    }
    const response = await apiClient.post(`${BASE_URL}/employeeTarget`, employeeTargetPayload);
    return response.data;
}