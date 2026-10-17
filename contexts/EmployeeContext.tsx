"use client";

import apiClient from "@/services/api/apiClient";
import { CurrentEmployee, CurrentStore, EmployeeContextType } from "@/types/employeeTypes";
import { createContext, useState, useEffect, useCallback, useContext, ReactNode } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { fetchAuthenticatedUser } from "@/services/auth/authService";

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

    const fetchClockInStatus = async (employeeNtid: string, dealerStoreId: string, date: string) => {
        try {
            const response = await apiClient.get(`/employee/isClockedin`, {
                params: { employeeNtid, dealerStoreId, date },
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

    const setEmployeeData = useCallback((data: any) => {
        setEmployee(data.employee);
        setStore(data.store);

        const today = new Date().toLocaleDateString("en-CA");
        fetchClockInStatus(data.employee.employeeNtid, data.store.dealerStoreId, today);

        if (typeof window !== "undefined") {
            localStorage.setItem("employeeData", JSON.stringify(data.employee));
            localStorage.setItem("storeData", JSON.stringify(data.store));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const clearEmployeeData = useCallback(() => {
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
    }, []);

    // AuthContext is an ancestor of this provider (see app/layout.tsx).
    const auth = useContext(AuthContext);
    const isAuthenticated = auth?.isAuthenticated ?? false;
    const role = auth?.role ?? null;

    // Fallback: authenticated as EMPLOYEE but localStorage has nothing (cleared, different
    // device, private window, ...) - re-fetch from the session instead of every page that
    // needs employee/store data hanging forever with no request ever firing.
    useEffect(() => {
        if (!isAuthenticated || role !== "EMPLOYEE" || (employee && store)) { return; }
        let cancelled = false;
        fetchAuthenticatedUser().then((data) => {
            if (cancelled || !data?.employee || !data?.store) { return; }
            setEmployeeData(data);
        });
        return () => { cancelled = true; };
    }, [isAuthenticated, role, employee, store, setEmployeeData]);

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

            // Only worth checking clock-in status when there's an active employee session on
            // an employee route — stale localStorage data (e.g. after cookie expiry without an
            // explicit logout) would otherwise trigger an authenticated call on every page,
            // including /auth/login, causing a redirect loop when that call 401s.
            const today = new Date().toLocaleDateString("en-CA");
            if (parsedEmployee?.employeeNtid && window.location.pathname.startsWith("/dashboard/employee")) {
                fetchClockInStatus(parsedEmployee?.employeeNtid, parsedStore.dealerStoreId, today);
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
