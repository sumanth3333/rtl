import { Controller, Control, UseFormSetValue, FieldErrors } from "react-hook-form";
import InputField from "../ui/InputField";
import { CreateInvoiceFormValues } from "@/types/createInvoiceSchema";

interface PhoneDetailsProps {
    control: Control<CreateInvoiceFormValues>;
    setValue: UseFormSetValue<CreateInvoiceFormValues>;
    inventory: { productName: string }[];
    formValues: CreateInvoiceFormValues;
    errors: FieldErrors<CreateInvoiceFormValues>;
}

export default function PhoneDetails({ control, setValue, inventory, formValues, errors }: PhoneDetailsProps) {
    const phoneList = formValues.products ?? [];

    return (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {phoneList.map((_, index) => (
                <div
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 shadow-sm"
                >
                    <div className="space-y-4">
                        {/* ✅ Product Name Dropdown */}
                        <Controller
                            name={`products.${index}.productName`}
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
                                    {errors.products?.[index]?.productName && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.products[index]?.productName?.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        {/* ✅ IMEI Input (Restricted to 15 digits) */}
                        <Controller
                            name={`products.${index}.imei`}
                            control={control}
                            render={({ field }) => (
                                <InputField
                                    {...field}
                                    label="IMEI"
                                    placeholder="Enter IMEI (15 digits)"
                                    maxLength={15}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "").slice(0, 15);
                                        field.onChange(value);
                                    }}
                                    error={errors.products?.[index]?.imei?.message}
                                />
                            )}
                        />

                        {/* ✅ Phone Number Input (Restricted to 10 digits) */}
                        <Controller
                            name={`products.${index}.phoneNumber`}
                            control={control}
                            render={({ field }) => (
                                <InputField
                                    {...field}
                                    label="Phone Number"
                                    placeholder="Enter Phone Number (10 digits)"
                                    maxLength={10}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                                        field.onChange(value);
                                    }}
                                    error={errors.products?.[index]?.phoneNumber?.message}
                                />
                            )}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
