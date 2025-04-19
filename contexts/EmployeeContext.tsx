"use client";

import apiClient from "@/services/api/apiClient";
import { CurrentEmployee, CurrentStore, EmployeeContextType } from "@/types/employeeTypes";
import { createContext, useState, useEffect, ReactNode } from "react";

export const EmployeeContext = createContext<EmployeeContextType>({
    isClockin: false,
    clockinLocation: null,
    clockinTime: null,
    employee: null,
    store: null,
    setClockIn: () => { },
    setEmployeeData: () => { },
    clearEmployeeData: () => { },
});

export function EmployeeProvider({ children }: { children: ReactNode }) {
    const [isClockin, setIsClockin] = useState<boolean>(false);
    const [clockinLocation, setClockinLocation] = useState<string | null>(null);
    const [clockinTime, setClockinTime] = useState<string | null>(null);
    const [employee, setEmployee] = useState<CurrentEmployee | null>(null);
    const [store, setStore] = useState<CurrentStore | null>(null);

    const setClockIn = (status: boolean, location?: string, time?: string) => {
        setIsClockin(status);
        setClockinLocation(location || "N/A");
        setClockinTime(time || "N/A");

        if (typeof window !== "undefined") {
            localStorage.setItem("clockInStatus", status.toString());
            localStorage.setItem("clockinLocation", location || "N/A");
            localStorage.setItem("clockinTime", time || "N/A");
        }
    };

    const fetchClockInStatus = async (employeeNtid: string, date: string) => {
        try {
            const response = await apiClient.get(`/employee/isClockedin`, {
                params: { employeeNtid, date },
            });

            const data = response.data;
            console.log(data);
            if (data.clockinStatus) {
                setClockIn(true, data.dealerStoreId || "N/A", data.clockinTime || "N/A");
            } else {
                setClockIn(false, "N/A", "N/A");
            }
        } catch (error) {
            console.error("Error fetching clock-in status:", error);
            setClockIn(false, "N/A", "N/A");
        }
    };

    const setEmployeeData = (data: any) => {
        setEmployee(data.employee);
        setStore(data.store);

        const today = new Date().toISOString().split("T")[0];
        fetchClockInStatus(data.employee.employeeNtid, today);

        if (typeof window !== "undefined") {
            localStorage.setItem("employeeData", JSON.stringify(data.employee));
            localStorage.setItem("storeData", JSON.stringify(data.store));
        }
    };

    const clearEmployeeData = () => {
        setEmployee(null);
        setStore(null);
        setIsClockin(false);
        setClockinLocation("N/A");
        setClockinTime("N/A");

        if (typeof window !== "undefined") {
            localStorage.removeItem("clockInStatus");
            localStorage.removeItem("clockinLocation");
            localStorage.removeItem("clockinTime");
            localStorage.removeItem("employeeData");
            localStorage.removeItem("storeData");
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsClockin(localStorage.getItem("clockInStatus") === "true");
            setClockinLocation(localStorage.getItem("clockinLocation") || "N/A");
            setClockinTime(localStorage.getItem("clockinTime") || "N/A");

            const savedEmployee = localStorage.getItem("employeeData");
            const savedStore = localStorage.getItem("storeData");

            const parsedEmployee = savedEmployee ? JSON.parse(savedEmployee) : null;
            const parsedStore = savedStore ? JSON.parse(savedStore) : null;

            setEmployee(parsedEmployee);
            setStore(parsedStore);

            const today = new Date().toISOString().split("T")[0];
            if (parsedEmployee.employeeNtid) {
                fetchClockInStatus(parsedEmployee.employeeNtid, today);
            }
        }
    }, []);

    return (
        <EmployeeContext.Provider
            value={{
                isClockin,
                clockinLocation,
                clockinTime,
                employee,
                store,
                setClockIn,
                setEmployeeData,
                clearEmployeeData,
            }}
        >
            {children}
        </EmployeeContext.Provider>
    );
}
