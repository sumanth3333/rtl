"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EodReport, eodReportSchema } from "@/types/employeeSchema";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import { useEmployee } from "@/hooks/useEmployee";
import { submitEodReport } from "@/services/employee/employeeService";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "../ui/modals/ConfirmationModal";
import SuccessModal from "../ui/modals/SuccessModal";

export default function EodForm() {
    const { employee, store } = useEmployee();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [hasExpense, setHasExpense] = useState(false);
    const [confirmClockOut, setConfirmClockOut] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState<EodReport | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch,
        reset,
    } = useForm<EodReport>({
        resolver: zodResolver(eodReportSchema),
        mode: "onChange",
        defaultValues: {
            store: { dealerStoreId: store?.dealerStoreId },
            employee: { employeeNtid: employee?.employeeNtid },
            actualCash: 0,
            systemCash: 0,
            actualCard: 0,
            systemCard: 0,
            systemAccessories: 0,
            cashExpense: 0,
            expenseReason: "NONE",
            boxesSold: 0,
            hsiSold: 0,
            tabletsSold: 0,
            watchesSold: 0,
        },
    });

    useEffect(() => {
        if (store?.dealerStoreId && employee?.employeeNtid) {
            reset({
                store: { dealerStoreId: store.dealerStoreId },
                employee: { employeeNtid: employee.employeeNtid },
                actualCash: 0,
                systemCash: 0,
                actualCard: 0,
                systemCard: 0,
                systemAccessories: 0,
                cashExpense: 0,
                expenseReason: "NONE",
                boxesSold: 0,
                hsiSold: 0,
                tabletsSold: 0,
                watchesSold: 0,
            });
        }
    }, [store, employee, reset]);

    // Watch form values to dynamically calculate differences
    const actualCash = Number(watch("actualCash"));
    const systemCash = Number(watch("systemCash"));
    const actualCard = Number(watch("actualCard"));
    const systemCard = Number(watch("systemCard"));

    const cashDifference = actualCash - systemCash;
    const cardDifference = actualCard - systemCard;

    const onSubmit = async (data: EodReport) => {
        if (!confirmClockOut) {
            alert("⚠️ You must confirm clock-out before submitting.");
            return;
        }
        const formattedData = {
            ...data,
            actualCash: parseFloat((data.actualCash ?? 0).toFixed(2)),
            systemCash: parseFloat((data.systemCash ?? 0).toFixed(2)),
            actualCard: parseFloat((data.actualCard ?? 0).toFixed(2)),
            systemCard: parseFloat((data.systemCard ?? 0).toFixed(2)),
            systemAccessories: parseFloat((data.systemAccessories ?? 0).toFixed(2)),
            boxesSold: parseFloat((data.boxesSold ?? 0).toFixed(2)),
            hsiSold: parseFloat((data.hsiSold ?? 0).toFixed(2)),
            tabletsSold: parseFloat((data.tabletsSold ?? 0).toFixed(2)),
            watchesSold: parseFloat((data.watchesSold ?? 0).toFixed(2)),
            cashExpense: hasExpense ? parseFloat((data.cashExpense ?? 0).toFixed(2)) : 0,
            expenseReason: hasExpense ? data.expenseReason ?? "NONE" : "NONE",
        };
        setFormData(formattedData);
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        setShowConfirm(false);
        setLoading(true);
        try {
            await submitEodReport(formData as EodReport);
            setShowSuccess(true);
            reset();
        } catch (error) {
            alert("❌ Failed to submit EOD report.");
        }
        setLoading(false);
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
                {/* Cash Group */}
                <div className="mt-4">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">Cash</h3>
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                        <InputField
                            label="Actual"
                            type="number"
                            step="0.01"
                            {...register("actualCash", { valueAsNumber: true })}
                            error={errors.actualCash?.message}
                        />
                        <InputField
                            label="System"
                            type="number"
                            step="0.01"
                            {...register("systemCash", { valueAsNumber: true })}
                            error={errors.systemCash?.message}
                        />
                        <InputField
                            label="Difference"
                            type="text"
                            value={`$${cashDifference.toFixed(2)}`}
                            readOnly
                        />
                    </div>
                </div>

                {/* Card Group */}
                <div className="mt-4">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">Card</h3>
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                        <InputField
                            label="Actual"
                            type="number"
                            step="0.01"
                            {...register("actualCard", { valueAsNumber: true })}
                            error={errors.actualCard?.message}
                        />
                        <InputField
                            label="System"
                            type="number"
                            step="0.01"
                            {...register("systemCard", { valueAsNumber: true })}
                            error={errors.systemCard?.message}
                        />
                        <InputField
                            label="Difference"
                            type="text"
                            value={`$${cardDifference.toFixed(2)}`}
                            readOnly
                        />
                    </div>
                </div>

                {/* System Accessories Field */}
                <div className="grid grid-cols-2 gap-2 md:gap-4 mt-4">
                    <InputField
                        label="System Accessories"
                        type="number"
                        step="0.01"
                        {...register("systemAccessories", { valueAsNumber: true })}
                        error={errors.systemAccessories?.message}
                    />
                </div>

                {/* Sales Data Fields */}
                <div className="grid grid-cols-2 gap-2 md:gap-4 mt-6">
                    <InputField
                        label="Total Boxes Sold (Acts, Reacts & Upgrades)"
                        type="number"
                        {...register("boxesSold", { valueAsNumber: true })}
                        error={errors.boxesSold?.message}
                    />
                    <InputField
                        label="HSI Sold"
                        type="number"
                        {...register("hsiSold", { valueAsNumber: true })}
                        error={errors.hsiSold?.message}
                    />
                    <InputField
                        label="Tablets Sold"
                        type="number"
                        {...register("tabletsSold", { valueAsNumber: true })}
                        error={errors.tabletsSold?.message}
                    />
                    <InputField
                        label="Watches Sold"
                        type="number"
                        {...register("watchesSold", { valueAsNumber: true })}
                        error={errors.watchesSold?.message}
                    />
                </div>

                {/* Toggle Expense Fields */}
                <div className="mt-4 flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="hasExpense"
                        checked={hasExpense}
                        onChange={() => setHasExpense(!hasExpense)}
                        className="w-4 h-4"
                    />
                    <label htmlFor="hasExpense" className="text-gray-800 dark:text-gray-300 text-sm">
                        Add reason for expense or short
                    </label>
                </div>

                {/* Expense Fields if Selected */}
                {hasExpense && (
                    <div className="grid grid-cols-2 gap-2 md:gap-4 mt-3">
                        <InputField
                            label="Expense Amount"
                            type="number"
                            step="0.01"
                            {...register("cashExpense", { valueAsNumber: true })}
                            error={errors.cashExpense?.message}
                        />
                        <InputField
                            label="Expense Reason"
                            type="text"
                            {...register("expenseReason")}
                            error={errors.expenseReason?.message}
                        />
                    </div>
                )}

                {/* Confirm Clock-Out */}
                <div className="my-6 flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="confirmClockOut"
                        checked={confirmClockOut}
                        onChange={() => setConfirmClockOut(!confirmClockOut)}
                        className="w-4 h-4"
                    />
                    <label htmlFor="confirmClockOut" className="text-gray-800 dark:text-gray-300 text-sm">
                        I understand that submitting this form will <strong>automatically clock me out</strong>.
                    </label>
                </div>

                <Button type="submit" variant="primary" isLoading={loading} fullWidth disabled={!isValid || !confirmClockOut}>
                    Submit Report
                </Button>
            </form>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirm}
                title="Confirm Submission"
                message="Are you sure you want to submit this EOD report?"
                confirmText="Submit"
            />

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="EOD Report Submitted!"
                message="Your report has been successfully recorded."
            />
        </>
    );
}
