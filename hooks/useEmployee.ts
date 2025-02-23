import { EmployeeContext } from "@/contexts/EmployeeContext";
import { useContext } from "react";

// ✅ Custom Hook to Use Employee Context
export const useEmployee = () => {
    const context = useContext(EmployeeContext);
    if (!context) {
        throw new Error("useEmployee must be used within an EmployeeProvider");
    }
    return context;
};