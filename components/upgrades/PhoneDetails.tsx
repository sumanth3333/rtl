import { Controller, Control, UseFormSetValue } from "react-hook-form";
import InputField from "../ui/InputField";
import { CreateInvoiceFormValues } from "@/types/createInvoiceSchema";

interface PhoneDetailsProps {
    control: Control<CreateInvoiceFormValues>;
    setValue: UseFormSetValue<CreateInvoiceFormValues>;
    inventory: { productName: string }[];
    formValues: CreateInvoiceFormValues;
}

export default function PhoneDetails({ control, setValue, inventory, formValues }: PhoneDetailsProps) {
    const phoneList = formValues.products ?? [];

    return (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {phoneList.map((_, index) => (
                <div
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 shadow-sm"
                >
                    <div className="space-y-4">
                        {/* Product Name Dropdown */}
                        <Controller
                            name={`products.${index}.productName` as const}
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                                        Product Name
                                    </label>
                                    <select
                                        {...field}
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                            setValue(`products.${index}.productName`, e.target.value);
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
                            name={`products.${index}.imei` as const}
                            control={control}
                            render={({ field }) => (
                                <InputField {...field} label="IMEI" placeholder="Enter IMEI" />
                            )}
                        />

                        {/* Phone Number Input */}
                        <Controller
                            name={`products.${index}.phoneNumber` as const}
                            control={control}
                            render={({ field }) => (
                                <InputField {...field} label="Phone Number" placeholder="Enter Phone Number" />
                            )}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
