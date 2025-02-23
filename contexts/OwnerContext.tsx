"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import { OwnerContextType } from "@/types/ownerTypes";

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
    const setOwnerData = (company: string, email: string) => {
        setCompanyName(company);
        setOwnerEmail(email);
        setIsOwner(true);

        localStorage.setItem("companyName", company);
        localStorage.setItem("ownerEmail", email);
        localStorage.setItem("isOwner", "true");
    };

    // ✅ Clear owner details on logout
    const clearOwnerData = () => {
        setCompanyName("");
        setOwnerEmail("");
        setIsOwner(false);

        localStorage.removeItem("companyName");
        localStorage.removeItem("ownerEmail");
        localStorage.removeItem("isOwner");
    };

    return (
        <OwnerContext.Provider value={{ companyName, ownerEmail, isOwner, setOwnerData, clearOwnerData }}>
            {children}
        </OwnerContext.Provider>
    );
}
