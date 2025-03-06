import apiClient from "@/services/api/apiClient";
import { Employee, EodReport } from "@/types/employeeSchema";
import { Store } from "@/schemas/storeSchema";

// ✅ Fetch all stores
export const getStores = async (companyName: string): Promise<Store[]> => {
    try {
        const response = await apiClient.get(`/company/viewAllStoresUnderTheCompany`, {
            params: { companyName },
        });
        console.log(response.data);
        return response.data.stores || [];
    } catch (error) {
        console.error("❌ Error fetching stores:", error);
        return [];
    }
};


// ✅ Fetch all stores
export const getEmployees = async (companyName: string): Promise<Employee[]> => {
    console.log("Company name sending to getEmployee List: ", companyName)
    try {
        const response = await apiClient.get(`/company/viewAllEmployeesUnderTheCompany`, {
            params: { companyName },
        });
        console.log(response.data);
        return response.data.employees || [];
    } catch (error) {
        console.error("❌ Error fetching employees:", error);
        return [];
    }
};

// ✅ Add store and then refetch stores
export const addStore = async (companyName: string, newStore: Store): Promise<Store[]> => {
    try {
        await apiClient.post("/company/storeRegistration", newStore, {
            headers: { "Content-Type": "application/json" },
        });

        // ✅ After adding a store, refetch all stores
        return await getStores(companyName);
    } catch (error) {
        console.error("❌ Error adding store:", error);
        return [];
    }
};

export const addEmployee = async (companyName: string, newStore: Employee): Promise<Employee[]> => {
    try {
        await apiClient.post("/company/employeeRegistration", newStore, {
            headers: { "Content-Type": "application/json" },
        });
        return await getEmployees(companyName);
    } catch (error) {
        console.error("❌ Error adding employee:", error);
        return [];
    }
};

// ✅ Delete a store
export const deleteStore = async (id: string): Promise<boolean> => {
    try {
        await apiClient.delete(`/stores/${id}`);
        return true;
    } catch (error) {
        console.error("Error deleting store:", error);
        return false;
    }
};

export const getManagers = (companyName: string): { id: string; name: string; }[] => {
    const managers = [{ id: "1", name: "Sumanth" }, { id: "2", name: "Naveen" }];
    return managers;
};

export const deleteEmployee = async (employeeNtid: string): Promise<string> => {
    try {
        const response = await apiClient.delete(`/company/deleteEmployee`, {
            params: { employeeNtid }
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting store: ", error)
        return "Error deleting employee";
    }

}

export const updateEmployee = async (companyName: string, employee: Employee): Promise<Employee[]> => {
    try {
        const response = await apiClient.put(`/company/updateEmployee`, { employee });
        return await getEmployees(companyName);
    }
    catch (error) {
        console.log("Error Updating store: ", error);
        return [];
    }
}

export const getWhoIsWorking = async (companyName: string) => {
    try {
        const response = await apiClient.get("/company/whoIsWorking", {
            params: { companyName },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching working employees:", error);
        return [];
    }
};

export const getLatestEodDetails = async (companyName: string) => {
    try {
        const response = await apiClient.get("/sale/fetchSubmittedSales", {
            params: {
                companyName
            }
        });
        return response.data; // Return the API response if needed
    } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === "string") {
            errorMessage = error;
        } else if (error && typeof error === "object" && "response" in error) {
            errorMessage =
                (error as any).response?.data?.message || "API request failed";
        }
        console.error("❌ Failed to fetch EOD Report details:", errorMessage);
        throw new Error(errorMessage); // Re-throw error for UI handling
    }
};
