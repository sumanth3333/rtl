import { Controller, Control, UseFormSetValue } from "react-hook-form";
import InputField from "../ui/InputField";
import { CreateInvoiceFormValues } from "@/types/createInvoiceSchema";

interface PhoneDetailsProps {
    control: Control<CreateInvoiceFormValues>;
    setValue: UseFormSetValue<CreateInvoiceFormValues>; // ✅ Properly type setValue
    inventory: { productName: string }[];
    formValues: CreateInvoiceFormValues;
}

export default function PhoneDetails({ control, setValue, inventory, formValues }: PhoneDetailsProps) {
    const phoneList = formValues.products ?? []; // ✅ Ensure it's always an array

    return (
        <div className="mt-6 space-y-4">
            {phoneList.map((_, index) => (
                <div key={index} className="grid grid-cols-3 gap-4">
                    {/* Product Name Dropdown */}
                    <Controller
                        name={`products.${index}.productName` as const} // ✅ Ensures correct field typing
                        control={control}
                        render={({ field }) => (
                            <div>
                                <label className="text-gray-700 dark:text-gray-300 font-medium">Product Name</label>
                                <select
                                    {...field}
                                    className="w-full border rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white"
                                    onChange={(e) => {
                                        field.onChange(e.target.value);
                                        setValue(`products.${index}.productName`, e.target.value); // ✅ Ensure correct typing
                                    }}
                                >
                                    <option value="">Select Product</option>
                                    {inventory.map((item) => (
                                        <option key={item.productName} value={item.productName}>
                                            {item.productName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    />

                    {/* IMEI Input */}
                    <Controller
                        name={`products.${index}.imei` as const} // ✅ Ensure correct field path
                        control={control}
                        render={({ field }) => (
                            <InputField {...field} label="IMEI" placeholder="Enter IMEI" />
                        )}
                    />

                    {/* Phone Number Input */}
                    <Controller
                        name={`products.${index}.phoneNumber` as const} // ✅ Ensure correct field path
                        control={control}
                        render={({ field }) => (
                            <InputField {...field} label="Phone Number" placeholder="Enter Phone Number" />
                        )}
                    />
                </div>
            ))}
        </div>
    );
}
