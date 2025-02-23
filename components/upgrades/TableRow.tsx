import { useState } from "react";
import ExpandedRow from "./ExpandedRow";
import { Device, Store } from "@/types/upgradePhoneTypes";

interface TableRowProps {
    device: Device;
    setExpandedRow: (id: number | null) => void;
    expandedRow: number | null;
    storeIds: Store[];
}

export default function TableRow({ device, setExpandedRow, expandedRow, storeIds }: TableRowProps) {
    const [formType, setFormType] = useState<"sale" | "transfer" | null>(null);

    const toggleExpand = (type: "sale" | "transfer") => {
        setFormType(expandedRow === device.id ? null : type);
        setExpandedRow(expandedRow === device.id ? null : device.id);
    };

    return (
        <>
            <tr className="hover:bg-gray-50 bg-white text-black dark:bg-gray-800 dark:text-white">
                <td className="border px-4 py-2">{device.productName}</td>
                <td className="border px-4 py-2">{device.imei}</td>
                <td className="border px-4 py-2">{device.phoneNumber || "N/A"}</td>
                <td className="border px-4 py-2">{device.activationDate || "N/A"}</td>
                <td className="border px-4 py-2">{device.daysOld ?? "N/A"}</td>
                <td className="border px-4 py-2 flex justify-center gap-2">
                    <button onClick={() => toggleExpand("sale")} className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded">
                        Sale
                    </button>
                    <button onClick={() => toggleExpand("transfer")} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded">
                        Transfer
                    </button>
                </td>
            </tr>
            {expandedRow === device.id && formType && (
                <ExpandedRow device={device} formType={formType} storeIds={storeIds} closeForm={() => setExpandedRow(null)} />
            )}
        </>
    );
}
