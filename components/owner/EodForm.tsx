"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import { useEmployee } from "@/hooks/useEmployee";
import { useState, useEffect } from "react";
import ConfirmationModal from "../ui/modals/ConfirmationModal";
import SuccessModal from "../ui/modals/SuccessModal";
import { EodReportByOwner, eodReportSchema } from "@/types/ownerTypes";
import { submitEodReport } from "@/services/owner/ownerService";

export default function EodForm({ initialValues, storeName, employeeName, saleDate }: { initialValues: EodReportByOwner, storeName: string, employeeName: string, saleDate: string }) {
    const { employee, store } = useEmployee();
    const [loading, setLoading] = useState(false);
    const [confirmClockOut, setConfirmClockOut] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState<EodReportByOwner | null>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        watch,
        reset,
    } = useForm<EodReportByOwner>({
        resolver: zodResolver(eodReportSchema),
        mode: "onChange",
        defaultValues: initialValues,
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "expenses",
    });

    useEffect(() => {
        if (store?.dealerStoreId && employee?.employeeNtid) {
            reset({
                ...initialValues,
                store: { dealerStoreId: store.dealerStoreId },
                employee: { employeeNtid: employee.employeeNtid },
                saleDate,
                expenses: initialValues.expenses ?? [],
            });
        }
    }, [store, employee, reset, initialValues]);

    const actualCash = watch("actualCash") ?? 0;
    const systemCash = watch("systemCash") ?? 0;
    const actualCard = watch("actualCard") ?? 0;
    const systemCard = watch("systemCard") ?? 0;
    const expenses = watch("expenses") ?? [];

    let adjustedActualCash = actualCash;
    let adjustedActualCard = actualCard;

    expenses.forEach((exp: any) => {
        if (exp.method === "Cash") {
            adjustedActualCash += exp.type === "Short" ? exp.amount : -exp.amount;
        } else if (exp.method === "Card") {
            adjustedActualCard += exp.type === "Short" ? exp.amount : -exp.amount;
        }
    });

    const cashDifference = parseFloat((adjustedActualCash - systemCash).toFixed(2));
    const cardDifference = parseFloat((adjustedActualCard - systemCard).toFixed(2));

    const onSubmit = async (data: EodReportByOwner) => {
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
            accessories: parseFloat((data.accessories ?? 0).toFixed(2)),
            saleDate,
        };

        setFormData(formattedData);
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        setShowConfirm(false);
        setLoading(true);
        try {
            await submitEodReport(formData as EodReportByOwner);
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
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <InputField label="Clock-In Time" type="time" step="1" {...register("clockinTime")} error={errors.clockinTime?.message} />
                    <InputField label="Clock-Out Time" type="time" step="1" {...register("clockoutTime")} error={errors.clockoutTime?.message} />
                </div>

                <div className="mt-4">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">Cash</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <InputField label="Actual" type="number" step="0.01" {...register("actualCash", { valueAsNumber: true })} error={errors.actualCash?.message} />
                        <InputField label="System" type="number" step="0.01" {...register("systemCash", { valueAsNumber: true })} error={errors.systemCash?.message} />
                        <InputField label="Difference" type="text" value={`$${cashDifference.toFixed(2)}`} readOnly />
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">Card</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <InputField label="Actual" type="number" step="0.01" {...register("actualCard", { valueAsNumber: true })} error={errors.actualCard?.message} />
                        <InputField label="System" type="number" step="0.01" {...register("systemCard", { valueAsNumber: true })} error={errors.systemCard?.message} />
                        <InputField label="Difference" type="text" value={`$${cardDifference.toFixed(2)}`} readOnly />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                    <InputField label="System Accessories" type="number" step="0.01" {...register("systemAccessories", { valueAsNumber: true })} error={errors.systemAccessories?.message} />
                    <InputField label="Total Accessories" type="number" step="0.01" {...register("accessories", { valueAsNumber: true })} error={errors.accessories?.message} />
                    <InputField label="Last Transaction Time" type="time" step="1" {...register("lastTransactionTime")} error={errors.lastTransactionTime?.message} />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                    <InputField label="Activations" type="number" {...register("boxesSold", { valueAsNumber: true })} error={errors.boxesSold?.message} />
                    <InputField label="Upgrades" type="number" {...register("upgrade", { valueAsNumber: true })} error={errors.upgrade?.message} />
                    <InputField label="Migrations" type="number" {...register("migrations", { valueAsNumber: true })} error={errors.migrations?.message} />
                    <InputField label="HSI" type="number" {...register("hsiSold", { valueAsNumber: true })} error={errors.hsiSold?.message} />
                    <InputField label="BTS" type="number" {...register("tabletsSold", { valueAsNumber: true })} error={errors.tabletsSold?.message} />
                    <InputField label="Free Lines" type="number" {...register("watchesSold", { valueAsNumber: true })} error={errors.watchesSold?.message} />
                </div>

                <div className="mt-6">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">Over / Short Expenses</h3>
                    <button type="button" onClick={() => append({ amount: 0, expenseType: "Short", paymentType: "Cash", reason: "" })} className="text-blue-600 text-sm mb-4 underline">+ Add Expense</button>
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-4 gap-3 mb-3">
                            <InputField label="Amount" type="number" step="0.01" {...register(`expenses.${index}.amount`, { valueAsNumber: true })} error={errors.expenses?.[index]?.amount?.message} />
                            <Controller
                                control={control}
                                name={`expenses.${index}.expenseType`}
                                render={({ field }) => (
                                    <select {...field} className="...">
                                        <option value="">Select</option>
                                        <option value="Short">Short</option>
                                        <option value="Over">Over</option>
                                    </select>
                                )}
                            />

                            <Controller
                                control={control}
                                name={`expenses.${index}.paymentType`}
                                render={({ field }) => (
                                    <select {...field} className="...">
                                        <option value="">Select</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Card">Card</option>
                                    </select>
                                )}
                            />

                            <InputField label="Reason" type="text" {...register(`expenses.${index}.reason`)} error={errors.expenses?.[index]?.reason?.message} />
                            <button type="button" onClick={() => remove(index)} className="text-xs text-red-600 underline ml-1 mt-1">Remove</button>
                        </div>
                    ))}
                </div>

                <div className="my-6 flex items-center gap-2">
                    <input type="checkbox" id="confirmClockOut" checked={confirmClockOut} onChange={() => setConfirmClockOut(!confirmClockOut)} className="w-4 h-4" />
                    <label htmlFor="confirmClockOut" className="text-gray-800 dark:text-gray-300 text-sm">
                        I confirm I'm submitting the EOD for {employeeName} at {storeName} on {saleDate}.
                    </label>
                </div>

                <Button type="submit" variant="primary" isLoading={loading} fullWidth disabled={!confirmClockOut}>
                    Submit Report
                </Button>
            </form>

            <ConfirmationModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleConfirm} title="Confirm Submission" message="Are you sure you want to submit this EOD report?" confirmText="Submit" />
            <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="EOD Report Submitted!" message="Your report has been successfully recorded." />
        </>
    );
}
