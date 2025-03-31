"use client";

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

    // ✅ Load from localStorage only on the client side (after mounting)
    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsClockin(localStorage.getItem("clockInStatus") === "true");
            setClockinLocation(localStorage.getItem("clockinLocation") || "N/A");
            setClockinTime(localStorage.getItem("clockinTime") || "N/A");

            const savedEmployee = localStorage.getItem("employeeData");
            setEmployee(savedEmployee ? JSON.parse(savedEmployee) : null);

            const savedStore = localStorage.getItem("storeData");
            setStore(savedStore ? JSON.parse(savedStore) : null);
        }
    }, []);

    // ✅ Save to localStorage when values change
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("clockInStatus", isClockin.toString());
            localStorage.setItem("clockinLocation", clockinLocation || "N/A");
            localStorage.setItem("clockinTime", clockinTime || "N/A");

            if (employee) { localStorage.setItem("employeeData", JSON.stringify(employee)); }
            if (store) { localStorage.setItem("storeData", JSON.stringify(store)); }
        }
    }, [isClockin, clockinLocation, clockinTime, employee, store]);

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

    // ✅ Set Employee Data on Login
    const setEmployeeData = (data: any) => {
        //console.log("Setting Employee Data:", data);

        setEmployee(data.employee);
        setStore(data.store);

        const clockInStatus = data.isClockin === "true";
        setClockIn(clockInStatus, data.clockinLocation || "N/A", data.clockinTime || "N/A");

        if (typeof window !== "undefined") {
            localStorage.setItem("employeeData", JSON.stringify(data.employee));
            localStorage.setItem("storeData", JSON.stringify(data.store));
        }
    };

    // ✅ Clear Employee Data on Logout
    const clearEmployeeData = () => {
        //console.log("Clearing Employee Data");

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
