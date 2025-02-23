import { Controller } from "react-hook-form";
import InputField from "../ui/InputField";
import { InventoryItem } from "@/services/inventory/inventoryService";

interface PhoneFormProps {
    index: number;
    control: any;
    inventory: InventoryItem[];
}

export default function PhoneForm({ index, control, inventory }: PhoneFormProps) {
    return (
        <div className="grid grid-cols-3 gap-4">
            {/* ✅ Product Name Dropdown */}
            <Controller
                name={`products.${index}.productName`}
                control={control}
                render={({ field }) => (
                    <select
                        {...field}
                        value={field.value || ""}
                        className="w-full border rounded-lg px-4 py-2"
                    >
                        <option value="">Select Product</option>
                        {inventory.map((item) => (
                            <option key={item.productName} value={item.productName}>
                                {item.productName}
                            </option>
                        ))}
                    </select>
                )}
            />

            {/* ✅ IMEI Input */}
            <Controller
                name={`phones.${index}.imei`}
                control={control}
                render={({ field }) => <InputField {...field} label="IMEI" />}
            />

            {/* ✅ Phone Number Input */}
            <Controller
                name={`phones.${index}.phoneNumber`}
                control={control}
                render={({ field }) => <InputField {...field} label="Phone Number" />}
            />
        </div>
    );
}
