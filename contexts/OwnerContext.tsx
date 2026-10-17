"use client";

import { createContext, useState, useEffect, useCallback, useContext, ReactNode } from "react";
import { OwnerContextType } from "@/types/ownerTypes";
import { AuthContext } from "@/contexts/AuthContext";
import { fetchAuthenticatedUser } from "@/services/auth/authService";

export const OwnerContext = createContext<OwnerContextType>({
    companyName: "",
    ownerEmail: "",
    isOwner: false,
    setOwnerData: () => { },
    clearOwnerData: () => { },
});

export default function OwnerProvider({ children }: { children: ReactNode }) {
    const [companyName, setCompanyName] = useState<string>("");
    const [ownerEmail, setOwnerEmail] = useState<string>("");
    const [isOwner, setIsOwner] = useState<boolean>(false);

    // AuthContext is an ancestor of this provider (see app/layout.tsx) - read directly
    // rather than via the useAuth() hook, which throws outside an AuthProvider.
    const auth = useContext(AuthContext);
    const isAuthenticated = auth?.isAuthenticated ?? false;
    const role = auth?.role ?? null;

    // ✅ Load owner details from localStorage (only in client)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedCompanyName = localStorage.getItem("companyName") || "";
            const storedOwnerEmail = localStorage.getItem("ownerEmail") || "";
            const storedIsOwner = localStorage.getItem("isOwner") === "true";

            setCompanyName(storedCompanyName);
            setOwnerEmail(storedOwnerEmail);
            setIsOwner(storedIsOwner);
        }
    }, []);

    // ✅ Save owner details to localStorage
    const setOwnerData = useCallback((company: string, email: string) => {
        setCompanyName(company);
        setOwnerEmail(email);
        setIsOwner(true);

        localStorage.setItem("companyName", company);
        localStorage.setItem("ownerEmail", email);
        localStorage.setItem("isOwner", "true");
    }, []);

    // ✅ Clear owner details on logout
    const clearOwnerData = useCallback(() => {
        setCompanyName("");
        setOwnerEmail("");
        setIsOwner(false);

        localStorage.removeItem("companyName");
        localStorage.removeItem("ownerEmail");
        localStorage.removeItem("isOwner");
    }, []);

    // Fallback: authenticated as OWNER/MANAGER but localStorage has nothing (cleared,
    // different device, private window, ...) - re-fetch from the session instead of every
    // page that needs companyName hanging forever with no request ever firing.
    useEffect(() => {
        if (!isAuthenticated || (role !== "OWNER" && role !== "MANAGER") || companyName) { return; }
        let cancelled = false;
        fetchAuthenticatedUser().then((data) => {
            if (cancelled || !data?.loginPerson) { return; }
            setOwnerData(data.loginPerson, data.loginEmail ?? "");
        });
        return () => { cancelled = true; };
    }, [isAuthenticated, role, companyName, setOwnerData]);

    return (
        <OwnerContext.Provider value={{ companyName, ownerEmail, isOwner, setOwnerData, clearOwnerData }}>
            {children}
        </OwnerContext.Provider>
    );
}
