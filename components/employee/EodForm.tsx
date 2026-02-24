"use client";

import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EodReport, eodReportSchema } from "@/types/employeeSchema";
import Button from "@/components/ui/Button";
import { useEmployee } from "@/hooks/useEmployee";
import { getEmployeesWorking } from "@/services/employee/employeeService";
import { useState, useEffect, useMemo, useCallback } from "react";
import ConfirmationModal from "../ui/modals/ConfirmationModal";
import SuccessModal from "../ui/modals/SuccessModal";
import { useLogout } from "@/hooks/useLogout";
import CashSummarySection from "./eod/CashSummarySection";
import CardSummarySection from "./eod/CardSummarySection";
import AccessoriesSection from "./eod/AccessoriesSection";
import SalesSummarySection from "./eod/SalesSummarySection";
import ExpensesSection from "./eod/ExpensesSection";
import IndividualEntriesSection from "./eod/IndividualEntriesSection";
import ConfirmClockOut from "./eod/ConfirmClockOut";
import { useEodSubmission } from "@/hooks/useEodSubmission";

export default function EodForm({ initialValues }: { initialValues: EodReport }) {
    const { employee, store } = useEmployee();
    const [confirmClockOut, setConfirmClockOut] = useState(false);
    const [employeesWorking, setEmployeesWorking] = useState<{ employeeNtid: string; employeeName: string }[]>([]);
    const [individualEntries, setIndividualEntries] = useState<EodReport[]>([]);
    const [showIndividualForm, setShowIndividualForm] = useState(false);

    const logout = useLogout();

    const methods = useForm<EodReport>({
        resolver: zodResolver(eodReportSchema),
        mode: "onChange",
        defaultValues: initialValues,
    });

    const { handleSubmit, control, reset } = methods;

    // Keep watched values stable and memo-friendly
    const watchedValues = useWatch({
        control,
        name: ["actualCash", "actualCard", "systemCash", "systemCard", "expenses", "lastTransactionTime", "boxesSold", "migrations", "upgrade", "hsiSold", "tabletsSold", "watchesSold", "systemAccessories"],
    });
    const [
        watchActualCash,
        watchActualCard,
        watchSystemCash,
        watchSystemCard,
        watchExpenses = [],
        watchLastTxn,
        watchBoxesSold,
        watchMigrations,
        watchUpgrade,
        watchHsiSold,
        watchTabletsSold,
        watchWatchesSold,
        watchSystemAccessories,
    ] = watchedValues;

    // Fetch employees working in the store
    useEffect(() => {
        let isMounted = true;
        if (store?.dealerStoreId) {
            getEmployeesWorking(store.dealerStoreId)
                .then((response) => {
                    if (!isMounted) { return; }
                    if (response.count > 1) {
                        setEmployeesWorking(response.employees);
                        setShowIndividualForm(true);
                    }
                })
                .catch((error) => {
                    if (isMounted) {
                        console.error("❌ Failed to fetch employees working:", error);
                    }
                });
        }
        return () => { isMounted = false; };
    }, [store?.dealerStoreId]);

    // Initialize per-employee entries with zeroed defaults so inputs start at 0
    const lastTransactionTime = watchLastTxn;
    const watchedExpenses = watchExpenses ?? [];

    useEffect(() => {
        if (!employeesWorking.length) { return; }
        setIndividualEntries((prev) => {
            if (prev.length === employeesWorking.length) { return prev; } // keep user edits
            return employeesWorking.map((emp, index) => ({
                ...(prev[index] ?? {}),
                store: { dealerStoreId: store?.dealerStoreId || "" },
                employee: { employeeNtid: emp.employeeNtid },
                systemCash: 0,
                actualCash: 0,
                systemCard: 0,
                actualCard: 0,
                lastTransactionTime: lastTransactionTime,
                expenses: watchedExpenses,
                boxesSold: prev[index]?.boxesSold ?? 0,
                migrations: prev[index]?.migrations ?? 0,
                upgrade: prev[index]?.upgrade ?? 0,
                hsiSold: prev[index]?.hsiSold ?? 0,
                tabletsSold: prev[index]?.tabletsSold ?? 0,
                watchesSold: prev[index]?.watchesSold ?? 0,
                accessoriesByEmployee: prev[index]?.accessoriesByEmployee ?? 0,
                systemAccessories: prev[index]?.systemAccessories ?? 0,
            }));
        });
    }, [employeesWorking, store?.dealerStoreId, lastTransactionTime, watchedExpenses]);

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
                    id: exp.id ?? 0,
                    amount: exp.amount ?? 0,
                    reason: exp.reason ?? "",
                    expenseType: exp.expenseType ?? "Short",
                    paymentType: exp.paymentType ?? "Cash",
                })) ?? [],
            });
        }
    }, [store, employee, reset, initialValues]);

    const { systemCash, systemCard, expenses, adjustedActualCash, adjustedActualCard, cashDifference, cardDifference, accessoriesByEmployee } = useMemo(() => {
        const sysCash = watchSystemCash ?? 0;
        const sysCard = watchSystemCard ?? 0;
        const expList = watchExpenses ?? [];
        let adjCash = watchActualCash ?? 0;
        let adjCard = watchActualCard ?? 0;

        for (const exp of expList) {
            if (exp.paymentType === "Cash") {
                adjCash += exp.expenseType === "Short" ? exp.amount : -exp.amount;
            } else if (exp.paymentType === "Card") {
                adjCard += exp.expenseType === "Short" ? exp.amount : -exp.amount;
            }
        }

        const cashDiff = parseFloat((adjCash - sysCash).toFixed(2));
        const cardDiff = parseFloat((adjCard - sysCard).toFixed(2));
        return {
            systemCash: sysCash,
            systemCard: sysCard,
            expenses: expList,
            adjustedActualCash: adjCash,
            adjustedActualCard: adjCard,
            cashDifference: cashDiff,
            cardDifference: cardDiff,
            accessoriesByEmployee: parseFloat((cashDiff + cardDiff).toFixed(2)),
        };
    }, [watchActualCash, watchActualCard, watchSystemCash, watchSystemCard, watchExpenses]);


    // Handle individual employee data change
    const handleEmployeeDataChange = useCallback((index: number, field: string, value: number) => {
        const currentExpenses = expenses ?? [];
        setIndividualEntries((prevEntries) => {
            const updatedEntries = [...prevEntries];
            const targetEmployee = employeesWorking[index];
            if (!targetEmployee) { return prevEntries; }
            updatedEntries[index] = {
                ...updatedEntries[index],
                [field]: value || 0,
                store: { dealerStoreId: store?.dealerStoreId || "" },
                employee: { employeeNtid: targetEmployee.employeeNtid },
                systemCash,
                actualCash: adjustedActualCash,
                systemCard,
                actualCard: adjustedActualCard,
                lastTransactionTime: watchLastTxn,
                expenses: currentExpenses,
            };
            return updatedEntries;
        });
    }, [employeesWorking, store?.dealerStoreId, systemCash, adjustedActualCash, systemCard, adjustedActualCard, watchLastTxn, expenses]);

    const {
        onSubmit,
        handleConfirm,
        loading,
        showConfirm,
        setShowConfirm,
        showSuccess,
        setShowSuccess,
        validationErrors,
        setValidationErrors,
    } = useEodSubmission({
        confirmClockOut,
        employeesWorking,
        individualEntries,
        setIndividualEntries,
        showIndividualForm,
        accessoriesByEmployee,
        watchBoxesSold,
        watchMigrations,
        watchUpgrade,
        watchHsiSold,
        watchTabletsSold,
        watchWatchesSold,
        watchSystemAccessories,
        adjustedActualCash,
        adjustedActualCard,
        systemCash,
        systemCard,
        watchLastTxn,
        expenses,
        storeDealerStoreId: store?.dealerStoreId,
        resetForm: reset,
        logout,
    });

    return (
        <>
            <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6 w-full mt-6"
                >
                    <CashSummarySection cashDifference={cashDifference} />
                    <CardSummarySection cardDifference={cardDifference} />
                    <AccessoriesSection accessoriesByEmployee={accessoriesByEmployee} />
                    <SalesSummarySection validationErrors={validationErrors} />
                    <ExpensesSection />

                    {showIndividualForm && (
                        <IndividualEntriesSection
                            employeesWorking={employeesWorking}
                            individualEntries={individualEntries}
                            validationErrors={validationErrors}
                            onChange={handleEmployeeDataChange}
                        />
                    )}

                    <ConfirmClockOut
                        confirmClockOut={confirmClockOut}
                        setConfirmClockOut={setConfirmClockOut}
                        validationErrors={validationErrors}
                    />

                    <Button type="submit" variant="primary" isLoading={loading} fullWidth disabled={!confirmClockOut}>
                        Submit Report
                    </Button>
                </form >
            </FormProvider>

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
