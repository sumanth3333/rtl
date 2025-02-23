import React from "react";
import { Receive } from "@/types/transferTypes";

interface ReceiveRowProps {
    device: Receive;
    isSelected: boolean;
    onSelect: () => void;
}

export default function ReceiveRow({ device, isSelected, onSelect }: ReceiveRowProps) {
    return (
        <tr
            className={`hover:bg-gray-100 cursor-pointer ${isSelected ? "bg-blue-100" : "bg-white"
                }`}
            onClick={onSelect}
        >
            <td className="border px-4 py-2 text-center">
                <input type="radio" name="receiveSelection" checked={isSelected} readOnly />
            </td>
            <td className="border px-4 py-2">{device.deviceName}</td>
            <td className="border px-4 py-2">{device.imei}</td>
            <td className="border px-4 py-2">{device.transferredFrom}</td>
            <td className="border px-4 py-2">{device.transferredBy}</td>
            <td className="border px-4 py-2">{device.date}</td>
        </tr>
    );
}
