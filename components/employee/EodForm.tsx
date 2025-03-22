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

export default function EodForm({ initialValues }: { initialValues: EodReport }) {
    const { employee, store } = useEmployee();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [hasExpense, setHasExpense] = useState(false);
    const [confirmClockOut, setConfirmClockOut] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState<EodReport | null>(null);
    const [employeesWorking, setEmployeesWorking] = useState<{ employeeNtid: string; employeeName: string }[]>([]);
    const [individualEntries, setIndividualEntries] = useState<EodReport[]>([]);
    const [showIndividualForm, setShowIndividualForm] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const logout = useLogout();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch,
        reset,
    } = useForm<EodReport>({
        resolver: zodResolver(eodReportSchema),
        mode: "onChange",
        defaultValues: initialValues,
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
                cashExpense: initialValues.cashExpense ?? 0,
                expenseReason: initialValues.expenseReason ?? "NONE",
                boxesSold: initialValues.boxesSold ?? 0,
                hsiSold: initialValues.hsiSold ?? 0,
                tabletsSold: initialValues.tabletsSold ?? 0,
                watchesSold: initialValues.watchesSold ?? 0,
            });
        }
    }, [store, employee, reset, initialValues]);

    // Watch form values to dynamically calculate differences
    const actualCash = parseFloat(Number(watch("actualCash")).toFixed(2));
    const systemCash = parseFloat(Number(watch("systemCash")).toFixed(2));
    const actualCard = parseFloat(Number(watch("actualCard")).toFixed(2));
    const systemCard = parseFloat(Number(watch("systemCard")).toFixed(2));

    // Calculate differences
    const cashDifference = parseFloat((actualCash - systemCash).toFixed(2));
    const cardDifference = parseFloat((actualCard - systemCard).toFixed(2));
    const accessoriesByEmployee = parseFloat((cashDifference + cardDifference).toFixed(2));

    const expenseReason = watch("expenseReason");

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
                actualCash: actualCash,
                systemCard: systemCard,
                actualCard: actualCard,
                lastTransactionTime: watch("lastTransactionTime"),
                cashExpense: watch("cashExpense"),
                expenseReason: expenseReason,
            };
            return updatedEntries;
        });
    };

    const onSubmit = async (data: EodReport) => {

        if (!confirmClockOut) {
            alert("⚠️ You must confirm clock-out before submitting.");
            return;
        }

        if (showIndividualForm) {
            // Calculate totals
            const totalBoxesSold = individualEntries.reduce((sum, entry) => sum + (entry.boxesSold || 0), 0);
            const totalHSISold = individualEntries.reduce((sum, entry) => sum + (entry.hsiSold || 0), 0);
            const totalTabletsSold = individualEntries.reduce((sum, entry) => sum + (entry.tabletsSold || 0), 0);
            const totalWatchesSold = individualEntries.reduce((sum, entry) => sum + (entry.watchesSold || 0), 0);
            const totalAccessoriesByEmployee = individualEntries.reduce((sum, entry) => sum + (entry.accessoriesByEmployee || 0), 0);
            const totalsystemAccessories = parseFloat(
                individualEntries.reduce((sum, entry) => sum + (entry.systemAccessories || 0), 0).toFixed(2)
            );
            const errors: Record<string, string> = {};

            if (totalBoxesSold !== watch("boxesSold")) { errors["boxesSold"] = "Total does not match sum of individual entries." };
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
            actualCash: parseFloat((data.actualCash ?? 0).toFixed(2)),
            systemCash: parseFloat((data.systemCash ?? 0).toFixed(2)),
            actualCard: parseFloat((data.actualCard ?? 0).toFixed(2)),
            systemCard: parseFloat((data.systemCard ?? 0).toFixed(2)),
            systemAccessories: parseFloat((data.systemAccessories ?? 0).toFixed(2)),
            accessoriesByEmployee: parseFloat((data.accessoriesByEmployee ?? 0).toFixed(2)),
            lastTransactionTime: data.lastTransactionTime,
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
            // Submit main EOD Report
            if (!showIndividualForm) {
                await submitEodReport(formData as EodReport);
            }
            // Submit each employee's individual sales data
            else {
                console.log(individualEntries);
                await Promise.all(
                    individualEntries.map((entry) =>
                        submitEodReport(entry)
                    )
                );
            }
            setShowSuccess(true);
            reset();

            setTimeout(() => {
                logout();
            }, 3000);

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
                    <InputField label="Total(Cash+Card) Accessories" type="number" step="0.01" value={accessoriesByEmployee.toFixed(2)} error={errors.accessoriesByEmployee?.message} readOnly />
                    <InputField label="Last transaction at?(refer Invoice Listing)" type="time" step="1" placeholder="HH:mm:ss" {...register("lastTransactionTime")} error={errors.lastTransactionTime?.message} />
                </div>

                {/* Sales Data Fields */}
                <div className="grid grid-cols-2 gap-2 md:gap-4 mt-6">
                    <InputField label="Total Boxes Sold (Donot include BTS & HSI)" type="number" {...register("boxesSold", { valueAsNumber: true })} error={errors.boxesSold?.message} />
                    <InputField label="HSI Sold" type="number" {...register("hsiSold", { valueAsNumber: true })} error={errors.hsiSold?.message} />
                    <InputField label="Tablets Sold" type="number" {...register("tabletsSold", { valueAsNumber: true })} error={errors.tabletsSold?.message} />
                    <InputField label="Watches Sold" type="number" {...register("watchesSold", { valueAsNumber: true })} error={errors.watchesSold?.message} />
                </div>

                {/* Toggle Expense Fields */}
                <div className="mt-4 flex items-center gap-2">
                    <input type="checkbox" id="hasExpense" checked={hasExpense} onChange={() => setHasExpense(!hasExpense)} className="w-4 h-4" />
                    <label htmlFor="hasExpense" className="text-gray-800 dark:text-gray-300 text-sm">
                        Add reason for expense or short
                    </label>
                </div>

                {/* Expense Fields if Selected */}
                {hasExpense && (
                    <div className="grid grid-cols-2 gap-2 md:gap-4 mt-3">
                        <InputField label="Expense Amount" type="number" step="0.01" {...register("cashExpense", { valueAsNumber: true })} error={errors.cashExpense?.message} />
                        <InputField label="Expense Reason" type="text" {...register("expenseReason")} error={errors.expenseReason?.message} />
                    </div>
                )}

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
                                        label="Boxes Sold"
                                        type="number"
                                        value={individualEntries[index]?.boxesSold}
                                        onChange={(e) => handleEmployeeDataChange(index, "boxesSold", Number(e.target.value))}
                                        error={validationErrors["boxesSold"]}
                                        required
                                    />
                                    <InputField
                                        name="hsiSold"
                                        label="HSI Sold"
                                        type="number"
                                        value={individualEntries[index]?.hsiSold}
                                        onChange={(e) => handleEmployeeDataChange(index, "hsiSold", Number(e.target.value))}
                                        error={validationErrors["hsiSold"]}
                                        required
                                    />
                                    <InputField
                                        name="tabletsSold"
                                        label="Tablets Sold"
                                        type="number"
                                        value={individualEntries[index]?.tabletsSold}
                                        onChange={(e) => handleEmployeeDataChange(index, "tabletsSold", Number(e.target.value))}
                                        error={validationErrors["tabletsSold"]}
                                        required
                                    />
                                    <InputField
                                        name="watchesSold"
                                        label="Watches Sold"
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
                message="Your report has been successfully recorded & you'll be Logged out in 3 seconds."
            />
        </>
    );
}
