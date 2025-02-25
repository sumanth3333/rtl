"use client";

import { useState } from "react";
import ExpandedRow from "./ExpandedRow";
import { Device, Store } from "@/types/upgradePhoneTypes";
import { useEmployee } from "@/hooks/useEmployee";

interface TableRowProps {
    device: Device;
    setExpandedRow: (id: number | null) => void;
    expandedRow: number | null;
    storeIds: Store[];
    selectedStore: string | null;
}

export default function TableRow({ device, setExpandedRow, expandedRow, storeIds, selectedStore }: TableRowProps) {
    const { store: employeeStore } = useEmployee();
    const [formType, setFormType] = useState<"sale" | "transfer" | null>(null);

    // Disable actions if the selected store does not match employee's store
    const disableActions = selectedStore !== employeeStore?.dealerStoreId;

    const toggleExpand = (type: "sale" | "transfer") => {
        setFormType(expandedRow === device.id ? null : type);
        setExpandedRow(expandedRow === device.id ? null : device.id);
    };

    return (
        <>
            <tr className="hover:bg-gray-50 bg-white text-black dark:bg-gray-800 dark:text-white">
                <td className="border px-3 py-2 md:px-4 md:py-2 break-words text-sm">
                    {device.productName}
                </td>
                <td className="border px-3 py-2 md:px-4 md:py-2 whitespace-nowrap text-sm">
                    {device.imei}
                </td>
                <td className="border px-3 py-2 md:px-4 md:py-2 whitespace-nowrap text-sm">
                    {device.phoneNumber || "N/A"}
                </td>
                <td className="border px-3 py-2 md:px-4 md:py-2 whitespace-nowrap text-sm">
                    {device.activationDate || "N/A"}
                </td>
                <td className="border px-3 py-2 md:px-4 md:py-2 whitespace-nowrap text-sm">
                    {device.daysOld ?? "N/A"}
                </td>
                <td className="border px-3 py-2 md:px-4 md:py-2 whitespace-nowrap text-sm flex justify-center gap-2">
                    <button
                        onClick={() => toggleExpand("sale")}
                        className={`px-2 py-1 text-xs md:text-sm bg-green-500 hover:bg-green-600 text-white rounded transition ${disableActions ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={disableActions}
                    >
                        Sale
                    </button>
                    <button
                        onClick={() => toggleExpand("transfer")}
                        className={`px-2 py-1 text-xs md:text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition ${disableActions ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={disableActions}
                    >
                        Transfer
                    </button>
                </td>
            </tr>
            {expandedRow === device.id && formType && (
                <ExpandedRow
                    device={device}
                    formType={formType}
                    storeIds={storeIds}
                    closeForm={() => setExpandedRow(null)}
                />
            )}
        </>
    );
}
