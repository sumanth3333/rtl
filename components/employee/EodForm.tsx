"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EodReport, eodReportSchema } from "@/types/employeeSchema";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import { useEmployee } from "@/hooks/useEmployee";
import { getEmployeesWorking, submitEodReport } from "@/services/employee/employeeService";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "../ui/modals/ConfirmationModal";
import SuccessModal from "../ui/modals/SuccessModal";
import { useLogout } from "@/hooks/useLogout";
import { useFieldArray } from "react-hook-form";

export default function EodForm({ initialValues }: { initialValues: EodReport }) {
    const { employee, store } = useEmployee();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [confirmClockOut, setConfirmClockOut] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState<EodReport | null>(null);
    const [employeesWorking, setEmployeesWorking] = useState<{ employeeNtid: string; employeeName: string }[]>([]);
    const [individualEntries, setIndividualEntries] = useState<EodReport[]>([]);
    const [showIndividualForm, setShowIndividualForm] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isActivationsFocused, setIsActivationsFocused] = useState(false);
    const [isUpgradesFocused, setIsUpgradesFocused] = useState(false);
    const [isMigrationsFocused, setIsMigrationsFocused] = useState(false);

    const logout = useLogout();

    const {
        register,
        handleSubmit,
        control, // ✅ Add this line
        formState: { errors, isValid },
        watch,
        reset,
    } = useForm<EodReport>({
        resolver: zodResolver(eodReportSchema),
        mode: "onChange",
        defaultValues: initialValues,
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "expenses"
    });

    // Fetch employees working in the store
    useEffect(() => {
        if (store?.dealerStoreId) {
            getEmployeesWorking(store.dealerStoreId)
                .then((response) => {
                    if (response.count > 1) {
                        setEmployeesWorking(response.employees);
                        setShowIndividualForm(true);
                    }
                })
                .catch((error) => {
                    console.error("❌ Failed to fetch employees working:", error);
                });
        }
    }, [store?.dealerStoreId]);

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
                accessoriesByEmployee: initialValues.accessoriesByEmployee ?? 0,
                lastTransactionTime: initialValues.lastTransactionTime ?? "10:00:00",
                boxesSold: initialValues.boxesSold ?? 0,
                migrations: initialValues.migrations ?? 0,
                upgrade: initialValues.upgrade ?? 0,
                hsiSold: initialValues.hsiSold ?? 0,
                tabletsSold: initialValues.tabletsSold ?? 0,
                watchesSold: initialValues.watchesSold ?? 0,
                expenses: initialValues.expenses?.map((exp) => ({
                    amount: exp.amount ?? 0,
                    reason: exp.reason ?? "",
                    expenseType: exp.expenseType ?? "Short",
                    paymentType: exp.paymentType ?? "Cash",
                })) ?? [],
            });
        }
    }, [store, employee, reset, initialValues]);

    const systemCash = watch("systemCash") ?? 0;
    const systemCard = watch("systemCard") ?? 0;
    const expenses = watch("expenses") ?? [];

    let adjustedActualCash = watch("actualCash") ?? 0;
    let adjustedActualCard = watch("actualCard") ?? 0;

    for (const exp of expenses) {
        if (exp.paymentType === "Cash") {
            adjustedActualCash += exp.expenseType === "Short" ? exp.amount : -exp.amount;
        } else if (exp.paymentType === "Card") {
            adjustedActualCard += exp.expenseType === "Short" ? exp.amount : -exp.amount;
        }
    }

    const cashDifference = parseFloat((adjustedActualCash - systemCash).toFixed(2));
    const cardDifference = parseFloat((adjustedActualCard - systemCard).toFixed(2));
    const accessoriesByEmployee = parseFloat((cashDifference + cardDifference).toFixed(2));


    // Handle individual employee data change
    const handleEmployeeDataChange = (index: number, field: string, value: number) => {

        setIndividualEntries((prevEntries) => {
            const updatedEntries = [...prevEntries];
            updatedEntries[index] = {
                ...updatedEntries[index],
                [field]: value || 0, // Ensure no empty field
                store: { dealerStoreId: store?.dealerStoreId || "" },
                employee: { employeeNtid: employeesWorking[index].employeeNtid },
                systemCash: systemCash,
                actualCash: adjustedActualCash,
                systemCard: systemCard,
                actualCard: adjustedActualCard,
                lastTransactionTime: watch("lastTransactionTime"),
            };
            return updatedEntries;
        });
    };

    const onSubmit = async (data: EodReport) => {
        console.log(data);
        if (!confirmClockOut) {
            alert("⚠️ You must confirm clock-out before submitting.");
            return;
        }
        let adjustedActualCash = data.actualCash ?? 0;
        let adjustedActualCard = data.actualCard ?? 0;

        if (data.expenses && data.expenses.length > 0) {
            for (const exp of data.expenses) {
                if (exp.paymentType === "Cash") {
                    adjustedActualCash += exp.expenseType === "Short" ? exp.amount : -exp.amount;
                } else if (exp.paymentType === "Card") {
                    adjustedActualCard += exp.expenseType === "Short" ? exp.amount : -exp.amount;
                }
            }
        }

        if (showIndividualForm) {
            // Calculate totals
            const totalBoxesSold = individualEntries.reduce((sum, entry) => sum + (entry.boxesSold || 0), 0);
            const totalMigrations = individualEntries.reduce((sum, entry) => sum + (entry.migrations || 0), 0);
            const totalUpgrades = individualEntries.reduce((sum, entry) => sum + (entry.upgrade || 0), 0);
            const totalHSISold = individualEntries.reduce((sum, entry) => sum + (entry.hsiSold || 0), 0);
            const totalTabletsSold = individualEntries.reduce((sum, entry) => sum + (entry.tabletsSold || 0), 0);
            const totalWatchesSold = individualEntries.reduce((sum, entry) => sum + (entry.watchesSold || 0), 0);
            const totalAccessoriesByEmployee = individualEntries.reduce((sum, entry) => sum + (entry.accessoriesByEmployee || 0), 0);
            const totalsystemAccessories = parseFloat(
                individualEntries.reduce((sum, entry) => sum + (entry.systemAccessories || 0), 0).toFixed(2)
            );
            const errors: Record<string, string> = {};

            if (totalBoxesSold !== watch("boxesSold")) { errors["boxesSold"] = "Total does not match sum of individual entries." };
            if (totalMigrations !== watch("migrations")) { errors["migrations"] = "Total does not match sum of individual entries." };
            if (totalUpgrades !== watch("upgrade")) { errors["upgrade"] = "Total does not match sum of individual entries." };
            if (totalHSISold !== watch("hsiSold")) { errors["hsiSold"] = "Total does not match sum of individual entries." };
            if (totalTabletsSold !== watch("tabletsSold")) { errors["tabletsSold"] = "Total does not match sum of individual entries." };
            if (totalWatchesSold !== watch("watchesSold")) { errors["watchesSold"] = "Total does not match sum of individual entries." };
            if (totalAccessoriesByEmployee !== accessoriesByEmployee) { errors["accessoriesByEmployee"] = "Total does not match sum of individual entries." };
            if (totalsystemAccessories !== watch("systemAccessories")) { errors["systemAccessories"] = "Total does not match sum of individual entries." };

            // If errors exist, update state and prevent submission
            if (Object.keys(errors).length > 0) {
                setValidationErrors(errors);
                return;
            }

            setValidationErrors({}); // Clear errors if validation passes
        }
        // Format data before submission
        const formattedData = {
            ...data,
            actualCash: parseFloat(adjustedActualCash.toFixed(2)),
            systemCash: parseFloat((data.systemCash ?? 0).toFixed(2)),
            actualCard: parseFloat(adjustedActualCard.toFixed(2)),
            systemCard: parseFloat((data.systemCard ?? 0).toFixed(2)),
            systemAccessories: parseFloat((data.systemAccessories ?? 0).toFixed(2)),
            accessoriesByEmployee: parseFloat((data.accessoriesByEmployee ?? 0).toFixed(2)),
            lastTransactionTime: data.lastTransactionTime,
            boxesSold: parseFloat((data.boxesSold ?? 0).toFixed(2)),
            migrations: parseFloat((data.migrations ?? 0).toFixed(2)),
            upgrade: parseFloat((data.upgrade ?? 0).toFixed(2)),
            hsiSold: parseFloat((data.hsiSold ?? 0).toFixed(2)),
            tabletsSold: parseFloat((data.tabletsSold ?? 0).toFixed(2)),
            watchesSold: parseFloat((data.watchesSold ?? 0).toFixed(2)),
            expenses: data.expenses?.map(exp => ({
                amount: parseFloat(exp.amount.toFixed(2)),
                reason: exp.reason,
                expenseType: exp.expenseType,
                paymentType: exp.paymentType,
            })) ?? [],
        };

        setFormData(formattedData);
        setShowConfirm(true);
    };


    const handleConfirm = async () => {
        setShowConfirm(false);
        setLoading(true);
        try {
            // Submit main EOD Report
            if (!showIndividualForm) {
                await submitEodReport(formData as EodReport);
            }
            // Submit each employee's individual sales data
            else {
                await Promise.all(
                    individualEntries.map((entry) => submitEodReport(entry))
                );
            }
            setShowSuccess(true);
            reset();

            setTimeout(() => {
                logout();
            }, 3000);

        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 w-full mt-6"
            >

                <section className="mt-10">
                    <div className="border-b border-gray-300 dark:border-gray-700 pb-2 mb-4">
                        <h3 className="text-sm sm:text-base font-semibold tracking-wide text-gray-800 dark:text-gray-100 uppercase">
                            Cash Summary
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            cash collected vs. recorded in the system. Difference is auto-calculated.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <InputField
                            label="Actual Cash"
                            type="number"
                            step="0.01"
                            className="text-sm"
                            {...register("actualCash", { valueAsNumber: true })}
                            error={errors.actualCash?.message}
                        />
                        <InputField
                            label="System Cash"
                            type="number"
                            step="0.01"
                            className="text-sm"
                            {...register("systemCash", { valueAsNumber: true })}
                            error={errors.systemCash?.message}
                        />
                        <InputField
                            label="Cash Accessories"
                            type="text"
                            className="text-sm font-semibold text-blue-700 dark:text-blue-300"
                            value={`$${cashDifference.toFixed(2)}`}
                            readOnly
                        />
                    </div>
                </section>

                <section className="mt-10">
                    <div className="border-b border-gray-300 dark:border-gray-700 pb-2 mb-4">
                        <h3 className="text-sm sm:text-base font-semibold tracking-wide text-gray-800 dark:text-gray-100 uppercase">
                            Card Summary
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Payments in credit card machine vs. recorded in the system. Difference is auto-calculated.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <InputField
                            label="Actual Card"
                            type="number"
                            step="0.01"
                            className="text-sm"
                            {...register("actualCard", { valueAsNumber: true })}
                            error={errors.actualCard?.message}
                        />
                        <InputField
                            label="System Card"
                            type="number"
                            step="0.01"
                            className="text-sm"
                            {...register("systemCard", { valueAsNumber: true })}
                            error={errors.systemCard?.message}
                        />
                        <InputField
                            label="Card Accessories"
                            type="text"
                            className="text-sm font-semibold text-blue-700 dark:text-blue-300"
                            value={`$${cardDifference.toFixed(2)}`}
                            readOnly
                        />
                    </div>
                </section>


                <section className="mt-10">
                    <div className="border-b border-gray-300 dark:border-gray-700 pb-2 mb-4">
                        <h3 className="text-sm sm:text-base font-semibold tracking-wide text-gray-800 dark:text-gray-100 uppercase">
                            Accessories
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            accessories sold in system and extra cash and card totals shown here.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <InputField
                            label="System Accessories($)"
                            type="number"
                            step="0.01"
                            className="text-sm"
                            {...register("systemAccessories", { valueAsNumber: true })}
                            error={errors.systemAccessories?.message}
                        />
                        <InputField
                            label="Cash/Card Accessories($)"
                            type="number"
                            step="0.01"
                            className="text-sm font-medium"
                            value={accessoriesByEmployee.toFixed(2)}
                            error={errors.accessoriesByEmployee?.message}
                            readOnly
                        />
                        <InputField
                            label="Last Transaction Time"
                            type="time"
                            step="1"
                            placeholder="HH:mm:ss"
                            className="text-sm"
                            {...register("lastTransactionTime")}
                            error={errors.lastTransactionTime?.message}
                        />
                    </div>
                </section>


                {/* Sales Section */}
                <div className="mt-6">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">SALES SUMMARY</h3>
                    {/* ⚠️ Activations Warning */}
                    {isActivationsFocused && (
                        <div className="mb-4 px-4 py-3 rounded-md border-l-4 border-yellow-500 bg-yellow-100 dark:bg-yellow-800 animate-pulse-slow">
                            <div className="flex items-start gap-2">
                                <span className="text-yellow-700 dark:text-yellow-200 text-xl">⚠️</span>
                                <div className="text-sm text-yellow-900 dark:text-yellow-100 leading-snug">
                                    <strong>Important:</strong> This count must include <strong>newly preactivated phones, not preact sold</strong>.<br />
                                    An invoice must be created if you <strong>preactivated any phones</strong> today.<br />
                                    <span className="underline">Do not</span> include <strong>Tablets</strong>, <strong>HSI</strong>, or <strong>Watches</strong> here.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ⚠️ Upgrades Warning */}
                    {isUpgradesFocused && (
                        <div className="mb-4 px-4 py-3 rounded-md border-l-4 border-orange-500 bg-orange-100 dark:bg-orange-800 animate-pulse-slow">
                            <div className="flex items-start gap-2">
                                <span className="text-orange-700 dark:text-orange-200 text-xl">⚠️</span>
                                <div className="text-sm text-orange-900 dark:text-orange-100 leading-snug">
                                    <strong>Important:</strong> Selling a <strong>preactivated phone does not count</strong> as an upgrade.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ⚠️ Migrations Warning */}
                    {isMigrationsFocused && (
                        <div className="mb-4 px-4 py-3 rounded-md border-l-4 border-blue-500 bg-blue-100 dark:bg-blue-800 animate-pulse-slow">
                            <div className="flex items-start gap-2">
                                <span className="text-blue-700 dark:text-blue-200 text-xl">⚠️</span>
                                <div className="text-sm text-blue-900 dark:text-blue-100 leading-snug">
                                    <strong>Important:</strong> Migration count is <strong>1 per account, not per line</strong>.
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <InputField
                                label="Activations (incl. BYOD)"
                                type="number"
                                {...register("boxesSold", { valueAsNumber: true })}
                                error={errors.boxesSold?.message}
                                onFocus={() => setIsActivationsFocused(true)}
                                onBlur={() => setIsActivationsFocused(false)}
                            />
                        </div>

                        <InputField
                            label="Upgrades"
                            type="number"
                            {...register("upgrade", { valueAsNumber: true })}
                            error={errors.upgrade?.message}
                            onFocus={() => setIsUpgradesFocused(true)}
                            onBlur={() => setIsUpgradesFocused(false)}
                        />
                        <InputField
                            label="Migrations"
                            type="number"
                            {...register("migrations", { valueAsNumber: true })}
                            error={errors.migrations?.message}
                            onFocus={() => setIsMigrationsFocused(true)}
                            onBlur={() => setIsMigrationsFocused(false)}
                        />
                        <InputField
                            label="HSI"
                            type="number"
                            {...register("hsiSold", { valueAsNumber: true })}
                            error={errors.hsiSold?.message}
                        />
                        <InputField
                            label="Tablets"
                            type="number"
                            {...register("tabletsSold", { valueAsNumber: true })}
                            error={errors.tabletsSold?.message}
                        />
                        <InputField
                            label="Watches"
                            type="number"
                            {...register("watchesSold", { valueAsNumber: true })}
                            error={errors.watchesSold?.message}
                        />
                    </div>
                </div>


                {/* Expenses Section */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        Expenses (Short / Over)
                    </h3>

                    <div className="space-y-6">
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="relative border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 shadow-sm"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <InputField
                                        label="Amount"
                                        type="number"
                                        step="0.01"
                                        {...register(`expenses.${index}.amount`, { valueAsNumber: true })}
                                        error={errors.expenses?.[index]?.amount?.message}
                                    />

                                    <InputField
                                        label="Reason"
                                        type="text"
                                        {...register(`expenses.${index}.reason`)}
                                        error={errors.expenses?.[index]?.reason?.message}
                                    />

                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Type
                                        </label>
                                        <select
                                            {...register(`expenses.${index}.expenseType`)}
                                            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select</option>
                                            <option value="Short">Short</option>
                                            <option value="Over">Over</option>
                                        </select>
                                        {errors.expenses?.[index]?.expenseType?.message && (
                                            <span className="text-xs text-red-500 mt-1">
                                                {errors.expenses[index]?.expenseType?.message}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Method
                                        </label>
                                        <select
                                            {...register(`expenses.${index}.paymentType`)}
                                            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Card">Card</option>
                                        </select>
                                        {errors.expenses?.[index]?.paymentType?.message && (
                                            <span className="text-xs text-red-500 mt-1">
                                                {errors.expenses[index]?.paymentType?.message}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <div className="absolute top-2 right-2">
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="text-red-600 text-xs font-medium hover:underline"
                                    >
                                        ✕ Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Expense Button */}
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={() =>
                                append({
                                    amount: 0,
                                    reason: "",
                                    expenseType: "Short",
                                    paymentType: "Cash",
                                })
                            }
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                        >
                            + Add Expense
                        </button>
                    </div>
                </div>




                {/* Individual Employee Sales Entry */}
                {showIndividualForm && (
                    <div className="mt-6 p-4 sm:p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Individual Employee Sales</h3>
                        {employeesWorking.map((emp, index) => (
                            <div key={emp.employeeNtid} className="mb-4 border-b pb-4">
                                <h4 className="text-md pb-3 font-semibold text-gray-700 dark:text-gray-300">{emp.employeeName} ({emp.employeeNtid})</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <InputField
                                        name="boxesSold"
                                        label="Activations"
                                        type="number"
                                        value={individualEntries[index]?.boxesSold}
                                        onChange={(e) => handleEmployeeDataChange(index, "boxesSold", Number(e.target.value))}
                                        error={validationErrors["boxesSold"]}
                                        required
                                    />
                                    <InputField
                                        name="upgrade"
                                        label="Upgrades"
                                        type="number"
                                        value={individualEntries[index]?.upgrade}
                                        onChange={(e) => handleEmployeeDataChange(index, "upgrade", Number(e.target.value))}
                                        error={validationErrors["upgrade"]}
                                        required
                                    />
                                    <InputField
                                        name="migrations"
                                        label="Migrations"
                                        type="number"
                                        value={individualEntries[index]?.migrations}
                                        onChange={(e) => handleEmployeeDataChange(index, "migrations", Number(e.target.value))}
                                        error={validationErrors["migrations"]}
                                        required
                                    />
                                    <InputField
                                        name="hsiSold"
                                        label="HSI"
                                        type="number"
                                        value={individualEntries[index]?.hsiSold}
                                        onChange={(e) => handleEmployeeDataChange(index, "hsiSold", Number(e.target.value))}
                                        error={validationErrors["hsiSold"]}
                                        required
                                    />
                                    <InputField
                                        name="tabletsSold"
                                        label="Tablets"
                                        type="number"
                                        value={individualEntries[index]?.tabletsSold}
                                        onChange={(e) => handleEmployeeDataChange(index, "tabletsSold", Number(e.target.value))}
                                        error={validationErrors["tabletsSold"]}
                                        required
                                    />
                                    <InputField
                                        name="watchesSold"
                                        label="Watches"
                                        type="number"
                                        value={individualEntries[index]?.watchesSold}
                                        onChange={(e) => handleEmployeeDataChange(index, "watchesSold", Number(e.target.value))}
                                        error={validationErrors["watchesSold"]}
                                        required
                                    />
                                    <InputField
                                        name="accessoriesByEmployee"
                                        label="Total Cash/Card $$"
                                        type="number"
                                        value={individualEntries[index]?.accessoriesByEmployee}
                                        onChange={(e) => handleEmployeeDataChange(index, "accessoriesByEmployee", Number(e.target.value))}
                                        error={validationErrors["accessoriesByEmployee"]}
                                        required
                                    />
                                    <InputField
                                        name="systemAccessories"
                                        label="System $$"
                                        type="number"
                                        value={individualEntries[index]?.systemAccessories}
                                        onChange={(e) => handleEmployeeDataChange(index, "systemAccessories", Number(e.target.value))}
                                        error={validationErrors["systemAccessories"]}
                                        required
                                    />
                                </div>
                            </div>
                        ))}
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
                        I understand that, any inaccurate information provided leads to <strong>loss of pay (or) termination </strong>
                        & submitting this form <strong>automatically clocks me out</strong>.
                    </label>
                </div>

                <Button type="submit" variant="primary" isLoading={loading} fullWidth disabled={!confirmClockOut}>
                    Submit Report
                </Button>
            </form >

            {/* Confirmation Modal */}
            < ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)
                }
                onConfirm={handleConfirm}
                title="Confirm Submission"
                message="Are you sure you want to submit this EOD report?"
                confirmText="Submit"
            />

            {/* Success Modal */}
            < SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="EOD Report Submitted!"
                message="Your report has been successfully recorded & you'll be Logged out in 3 seconds."
            />
        </>
    );
}
