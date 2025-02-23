import { useContext } from "react";
import { OwnerContext } from "@/contexts/OwnerContext";

export function useOwner() {
    const context = useContext(OwnerContext);
    if (!context) {
        throw new Error("useOwner must be used within an OwnerProvider");
    }
    return context;
}
