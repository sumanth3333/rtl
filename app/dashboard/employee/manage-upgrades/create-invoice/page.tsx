"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEmployee } from "@/hooks/useEmployee";
import ConfirmationModal from "@/components/ui/modals/ConfirmationModal";
import SuccessModal from "@/components/ui/modals/SuccessModal";
import { CreateInvoiceFormValues, createInvoiceSchema } from "@/types/createInvoiceSchema";
import PhoneDetails from "@/components/upgrades/PhoneDetails";
import { useFetchInventory } from "@/hooks/useFetchInventory";
import { useCreateInvoice } from "@/hooks/useCreateInvoice";

export default function CreateInvoicePage() {
    const { employee, store } = useEmployee();
    const { inventory } = useFetchInventory(store?.dealerStoreId || "");
    const { createNewInvoice, isSubmitting } = useCreateInvoice();

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<CreateInvoiceFormValues>({
        resolver: zodResolver(createInvoiceSchema),
        defaultValues: {
            employeeNtid: employee?.employeeNtid || "",
            dealerStoreId: store?.dealerStoreId || "",
            accountNumber: "", // ✅ Fix for uncontrolled input issue
            activatedDate: "",
            amount: 0, // ✅ Fix for uncontrolled input issue
            numberOfPhones: 0, // ✅ Ensure dropdown starts at 1
            products: [],
        },
    });

    const formValues = watch();

    const handlePhoneCountChange = (newCount: number) => {
        const updatedProducts = Array.from({ length: newCount }, () => ({
            productName: "",
            imei: "",
            phoneNumber: "",
        }));
        setValue("products", updatedProducts as CreateInvoiceFormValues["products"]);
    };

    const onSubmit = async (data: CreateInvoiceFormValues) => {
        try {
            if (data.products.length === 0) {
                throw new Error("At least one product is required.");
            }

            const payload = {
                employeeNtid: data.employeeNtid,
                dealerStoreId: data.dealerStoreId,
                accountNumber: Number(data.accountNumber),
                activatedDate: data.activatedDate,
                amount: Number(data.amount),
                products: [...data.products],
            };

            await createNewInvoice(payload);

            reset({
                employeeNtid: data.employeeNtid,
                dealerStoreId: data.dealerStoreId,
                accountNumber: "",
                activatedDate: "",
                amount: 0,
                numberOfPhones: 0,
                products: [],
            });

            setIsConfirmModalOpen(false);
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error("Invoice creation failed:", error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto mt-10 p-6 sm:p-8 bg-white dark:bg-gray-900 shadow-sm rounded-lg">
            <h2 className="text-2xl sm:text-3xl font-semibold text-center text-gray-900 dark:text-gray-200 mb-6">
                📜 Create Invoice
            </h2>

            <form onSubmit={handleSubmit(() => setIsConfirmModalOpen(true))} className="space-y-6">
                {/* Invoice Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Controller
                        name="accountNumber"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                                    Account Number
                                </label>
                                <input
                                    {...field}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d{9}"
                                    placeholder="Enter 9-digit Account Number"
                                    className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white"
                                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 9))}
                                />
                                {errors.accountNumber && (
                                    <p className="text-red-500 text-xs mt-1">{errors.accountNumber.message}</p>
                                )}
                            </div>
                        )}
                    />


                    <Controller
                        name="activatedDate"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                                    Activated Date
                                </label>
                                <input
                                    {...field}
                                    type="date"
                                    className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white"
                                />
                                {errors.activatedDate && (
                                    <p className="text-red-500 text-xs mt-1">{errors.activatedDate.message}</p>
                                )}
                            </div>
                        )}
                    />

                    <Controller
                        name="amount"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                                    Amount
                                </label>
                                <input
                                    {...field}
                                    type="text"
                                    inputMode="decimal"
                                    pattern="^\d+(\.\d{1,2})?$"
                                    placeholder="Enter Amount (e.g., 99.99)"
                                    className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white"
                                    onChange={(e) => field.onChange(e.target.value.replace(/[^0-9.]/g, ""))}
                                />
                                {errors.amount && (
                                    <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
                                )}
                            </div>
                        )}
                    />



                    <Controller
                        name="numberOfPhones"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                                    Number of Phones
                                </label>
                                <select
                                    {...field}
                                    className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white"
                                    onChange={(e) => {
                                        const newCount = Number(e.target.value);
                                        field.onChange(newCount);
                                        handlePhoneCountChange(newCount);
                                    }}
                                >
                                    {[0, 1, 2, 3, 4, 5].map((num) => (
                                        <option key={num} value={num}>
                                            {num}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    />

                </div>

                {/* Show PhoneDetails if Phones are Selected */}
                {formValues.products.length > 0 && (
                    <PhoneDetails control={control} setValue={setValue} inventory={inventory} formValues={formValues} errors={errors} />
                )}

                {/* Submit Button */}
                <div className="mt-6 flex justify-center">
                    <button
                        type="submit"
                        className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating..." : "Create Invoice"}
                    </button>
                </div>
            </form>

            {/* Confirmation & Success Modals */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onConfirm={handleSubmit(onSubmit)}
                onClose={() => setIsConfirmModalOpen(false)}
                title="Create Invoice"
            />
            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="Invoice Created"
                message="The invoice was successfully created."
            />
        </div>
    );
}
