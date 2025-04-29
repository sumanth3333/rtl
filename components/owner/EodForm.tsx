"use client";

import { useForm } from "react-hook-form";
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
    const [hasExpense, setHasExpense] = useState(false);
    const [confirmClockOut, setConfirmClockOut] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState<EodReportByOwner | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch,
        reset,
    } = useForm<EodReportByOwner>({
        resolver: zodResolver(eodReportSchema),
        mode: "onChange",
        defaultValues: initialValues,
    });

    useEffect(() => {
        if (store?.dealerStoreId && employee?.employeeNtid) {
            reset({
                store: { dealerStoreId: store.dealerStoreId },
                employee: { employeeNtid: employee.employeeNtid },
                actualCash: initialValues.actualCash ?? 0,
                systemCash: initialValues.systemCash ?? 0,
                actualCard: initialValues.actualCard ?? 0,
                systemCard: initialValues.systemCard ?? 0,
                systemAccessories: initialValues.systemAccessories ?? 0,
                accessories: initialValues.accessories ?? 0,
                lastTransactionTime: initialValues.lastTransactionTime ?? "10:00:00",
                clockinTime: initialValues.clockinTime ?? "10:00:00",
                clockoutTime: initialValues.clockoutTime ?? "10:00:00",
                cashExpense: initialValues.cashExpense ?? 0,
                expenseReason: initialValues.expenseReason ?? "NONE",
                boxesSold: initialValues.boxesSold ?? 0,
                upgrade: initialValues.upgrade ?? 0,
                hsiSold: initialValues.hsiSold ?? 0,
                tabletsSold: initialValues.tabletsSold ?? 0,
                watchesSold: initialValues.watchesSold ?? 0,
            });
        }
    }, [store, employee, reset, initialValues]);

    const actualCashRaw = watch("actualCash") ?? 0;
    const systemCash = watch("systemCash") ?? 0;
    const actualCardRaw = watch("actualCard") ?? 0;
    const systemCard = watch("systemCard") ?? 0;
    const cashExpense = watch("cashExpense") ?? 0;
    const expenseType = watch("expenseType");
    const paymentMethod = watch("paymentMethod");

    let adjustedActualCash = actualCashRaw;
    let adjustedActualCard = actualCardRaw;

    if (hasExpense && expenseType && paymentMethod && cashExpense) {
        if (paymentMethod === "Cash") {
            adjustedActualCash = expenseType === "Short"
                ? actualCashRaw + cashExpense
                : actualCashRaw - cashExpense;
        } else if (paymentMethod === "Card") {
            adjustedActualCard = expenseType === "Short"
                ? actualCardRaw + cashExpense
                : actualCardRaw - cashExpense;
        }
    }

    const cashDifference = parseFloat((adjustedActualCash - systemCash).toFixed(2));
    const cardDifference = parseFloat((adjustedActualCard - systemCard).toFixed(2));
    const accessoriesByEmployee = parseFloat((cashDifference + cardDifference).toFixed(2));

    const expenseReason = watch("expenseReason");

    const onSubmit = async (data: EodReportByOwner) => {
        if (!confirmClockOut) {
            alert("⚠️ You must confirm clock-out before submitting.");
            return;
        }
        let adjustedActualCash = data.actualCash ?? 0;
        let adjustedActualCard = data.actualCard ?? 0;

        if (hasExpense) {
            const expenseAmount = data.cashExpense ?? 0;
            const expenseType = data.expenseType;
            const paymentMethod = data.paymentMethod;

            if (expenseType && paymentMethod && expenseAmount) {
                if (paymentMethod === "Cash") {
                    if (expenseType === "Short") {
                        adjustedActualCash += expenseAmount;
                    } else if (expenseType === "Over") {
                        adjustedActualCash -= expenseAmount;
                    }
                } else if (paymentMethod === "Card") {
                    if (expenseType === "Short") {
                        adjustedActualCard += expenseAmount;
                    } else if (expenseType === "Over") {
                        adjustedActualCard -= expenseAmount;
                    }
                }
            }
        }
        const formattedData = {
            ...data,
            actualCash: parseFloat((data.actualCash ?? 0).toFixed(2)),
            systemCash: parseFloat((data.systemCash ?? 0).toFixed(2)),
            actualCard: parseFloat((data.actualCard ?? 0).toFixed(2)),
            systemCard: parseFloat((data.systemCard ?? 0).toFixed(2)),
            systemAccessories: parseFloat((data.systemAccessories ?? 0).toFixed(2)),
            accessories: parseFloat((data.accessories ?? 0).toFixed(2)),
            lastTransactionTime: data.lastTransactionTime,
            clockinTime: data.clockinTime,
            clockoutTime: data.clockoutTime,
            saleDate: saleDate,
            boxesSold: parseFloat((data.boxesSold ?? 0).toFixed(2)),
            upgrade: parseFloat((data.upgrade ?? 0).toFixed(2)),
            hsiSold: parseFloat((data.hsiSold ?? 0).toFixed(2)),
            tabletsSold: parseFloat((data.tabletsSold ?? 0).toFixed(2)),
            watchesSold: parseFloat((data.watchesSold ?? 0).toFixed(2)),
            cashExpense: parseFloat((data.cashExpense ?? 0).toFixed(2)),
            expenseReason: data.expenseReason ?? "NONE",
        };
        console.log(errors.root?.message);
        console.log(formattedData);
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
                {/* Clock-In and Clock-Out Time Fields */}
                <div className="grid grid-cols-2 gap-2 md:gap-2 mt-4">
                    <InputField
                        label="Clock-In Time"
                        type="time"
                        step="1"
                        placeholder="HH:mm:ss"
                        {...register("clockinTime")}
                        error={errors.clockinTime?.message}
                    />
                    <InputField
                        label="Clock-Out Time"
                        type="time"
                        step="1"
                        placeholder="HH:mm:ss"
                        {...register("clockoutTime")}
                        error={errors.clockoutTime?.message}
                    />
                </div>

                {/* Cash Group */}
                <div className="mt-4">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">Cash</h3>
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                        <InputField label="Actual" type="number" step="0.01" {...register("actualCash", { valueAsNumber: true })} error={errors.actualCash?.message} />
                        <InputField label="System" type="number" step="0.01" {...register("systemCash", { valueAsNumber: true })} error={errors.systemCash?.message} />
                        <InputField label="Difference" type="text" value={`$${cashDifference.toFixed(2)}`} readOnly />
                    </div>
                </div>

                {/* Card Group */}
                <div className="mt-4">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">Card</h3>
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                        <InputField label="Actual" type="number" step="0.01" {...register("actualCard", { valueAsNumber: true })} error={errors.actualCard?.message} />
                        <InputField label="System" type="number" step="0.01" {...register("systemCard", { valueAsNumber: true })} error={errors.systemCard?.message} />
                        <InputField label="Difference" type="text" value={`$${cardDifference.toFixed(2)}`} readOnly />
                    </div>
                </div>

                {/* System Accessories Field */}
                <div className="grid grid-cols-3 gap-2 md:gap-2 mt-4">
                    <InputField label="System Accessories" type="number" step="0.01" {...register("systemAccessories", { valueAsNumber: true })} error={errors.systemAccessories?.message} />
                    <InputField label="Total Accessories" type="number" step="0.01" {...register("accessories", { valueAsNumber: true })} error={errors.accessories?.message} />
                    <InputField label="Last transaction at?(refer Invoice Listing)" type="time" step="1" placeholder="HH:mm:ss" {...register("lastTransactionTime")} error={errors.lastTransactionTime?.message} />
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-4 mt-6">
                    <InputField label="Activations(inc. reactivations & BYOD)" type="number" {...register("boxesSold", { valueAsNumber: true })} error={errors.boxesSold?.message} />
                    <InputField label="Upgrades" type="number" {...register("upgrade", { valueAsNumber: true })} error={errors.upgrade?.message} />
                    <InputField label="HSI" type="number" {...register("hsiSold", { valueAsNumber: true })} error={errors.hsiSold?.message} />
                    <InputField label="Tablets" type="number" {...register("tabletsSold", { valueAsNumber: true })} error={errors.tabletsSold?.message} />
                    <InputField label="Watches" type="number" {...register("watchesSold", { valueAsNumber: true })} error={errors.watchesSold?.message} />
                </div>

                {/* Toggle Expense Fields */}
                <div className="mt-4 flex items-center gap-2">
                    <input type="checkbox" id="hasExpense" checked={hasExpense} onChange={() => setHasExpense(!hasExpense)} className="w-4 h-4" />
                    <label htmlFor="hasExpense" className="text-gray-800 dark:text-gray-300 text-sm">
                        Add reason for Over/(Short)
                    </label>
                </div>

                {/* Expense Fields if Selected */}
                {hasExpense && (
                    <div>
                        <div className="grid grid-cols-3 gap-2 md:gap-4 mt-3">
                            {/* Expense Amount */}
                            <InputField
                                label="Amount"
                                type="number"
                                step="0.01"
                                {...register("cashExpense", { valueAsNumber: true })}
                                error={errors.cashExpense?.message}
                            />

                            {/* Expense Type: Short or Over */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">Expense Type</label>
                                <select
                                    {...register("expenseType")}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                    <option value="">Select</option>
                                    <option value="Short">Short</option>
                                    <option value="Over">Over</option>
                                </select>
                                {errors.expenseType && (
                                    <span className="text-xs text-red-500 mt-1">{errors.expenseType.message}</span>
                                )}
                            </div>

                            {/* Payment Method: Cash or Card */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">Payment Method</label>
                                <select
                                    {...register("paymentMethod")}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                    <option value="">Select</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                </select>
                                {errors.paymentMethod && (
                                    <span className="text-xs text-red-500 mt-1">{errors.paymentMethod.message}</span>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1">
                            {/* Expense Reason */}
                            <InputField
                                label="Reason"
                                type="text"
                                {...register("expenseReason")}
                                error={errors.expenseReason?.message}
                            />
                        </div>

                    </div>
                )}

                {/* Confirm Clock-Out */}
                <div className="my-6 flex items-center gap-2">
                    <input type="checkbox" id="confirmClockOut" checked={confirmClockOut}
                        onChange={() => {
                            setConfirmClockOut(!confirmClockOut);
                        }
                        }
                        className="w-4 h-4"
                    />
                    <label htmlFor="confirmClockOut" className="text-gray-800 dark:text-gray-300 text-sm">
                        I understand that, I'm updating the report of {employeeName} worked at {storeName} on the date {saleDate}.
                    </label>
                </div>

                <Button type="submit" variant="primary" isLoading={loading} fullWidth disabled={!confirmClockOut}>
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
                message="Your report has been successfully recorded"
            />
        </>
    );
}
