import { useCallback, useState } from "react";
import { EmployeeSaleEntry, EodReport, EodSubmissionRequest } from "@/types/employeeSchema";
import { submitEodReport } from "@/services/employee/employeeService";

type EmployeeMeta = { employeeNtid: string; employeeName: string };

interface Params {
    confirmClockOut: boolean;
    employeesWorking: EmployeeMeta[];
    individualEntries: EodReport[];
    setIndividualEntries: React.Dispatch<React.SetStateAction<EodReport[]>>;
    showIndividualForm: boolean;
    crossStoreEntries: EmployeeSaleEntry[];
    hasExpenses: boolean | null;
    accessoriesByEmployee: number;
    watchBoxesSold: number;
    watchMigrations: number;
    watchUpgrade: number;
    watchHsiSold: number;
    watchTabletsSold: number;
    watchWatchesSold: number;
    watchSystemAccessories: number;
    adjustedActualCash: number;
    adjustedActualCard: number;
    systemCash: number;
    systemCard: number;
    watchLastTxn: string | undefined;
    expenses: EodReport["expenses"];
    storeDealerStoreId?: string;
    resetForm: () => void;
    logout: () => Promise<void> | void;
}

export function useEodSubmission({
    confirmClockOut,
    employeesWorking,
    individualEntries,
    setIndividualEntries,
    showIndividualForm,
    crossStoreEntries,
    hasExpenses,
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
    storeDealerStoreId,
    resetForm,
    logout,
}: Params) {
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<EodSubmissionRequest | null>(null);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const toEmployeeSaleEntry = useCallback(
        (entry: EodReport, salesCreditOnly: boolean): EmployeeSaleEntry => ({
            employeeNtid: entry.employee.employeeNtid,
            salesCreditOnly,
            boxesSold: entry.boxesSold || 0,
            systemAccessories: entry.systemAccessories || 0,
            accessoriesByEmployee: entry.accessoriesByEmployee || 0,
            upgrade: entry.upgrade || 0,
            tabletsSold: entry.tabletsSold || 0,
            hsiSold: entry.hsiSold || 0,
            watchesSold: entry.watchesSold || 0,
            migrations: entry.migrations || 0,
        }),
        []
    );

    const onSubmit = useCallback((data: EodReport) => {
        if (!confirmClockOut) {
            setValidationErrors((prev) => ({
                ...prev,
                confirmClockOut: "You must confirm clock-out before submitting.",
            }));
            return;
        }

        let adjCash = data.actualCash ?? 0;
        let adjCard = data.actualCard ?? 0;

        if (data.expenses && data.expenses.length > 0) {
            for (const exp of data.expenses) {
                if (exp.paymentType === "Cash") {
                    adjCash += exp.expenseType === "Short" ? exp.amount : -exp.amount;
                } else if (exp.paymentType === "Card") {
                    adjCard += exp.expenseType === "Short" ? exp.amount : -exp.amount;
                }
            }
        }

        let employeeSales: EmployeeSaleEntry[];

        if (showIndividualForm) {
            const preparedEntries = employeesWorking.map((emp, index) => ({
                store: { dealerStoreId: storeDealerStoreId || "" },
                employee: { employeeNtid: emp.employeeNtid },
                systemCash: data.systemCash,
                actualCash: adjCash,
                systemCard: data.systemCard,
                actualCard: adjCard,
                creditCard: data.creditCard ?? 0,
                debitCard: data.debitCard ?? 0,
                lastTransactionTime: data.lastTransactionTime,
                expenses: data.expenses ?? [],
                boxesSold: individualEntries[index]?.boxesSold || 0,
                migrations: individualEntries[index]?.migrations || 0,
                upgrade: individualEntries[index]?.upgrade || 0,
                hsiSold: individualEntries[index]?.hsiSold || 0,
                tabletsSold: individualEntries[index]?.tabletsSold || 0,
                watchesSold: individualEntries[index]?.watchesSold || 0,
                accessoriesByEmployee: individualEntries[index]?.accessoriesByEmployee || 0,
                systemAccessories: individualEntries[index]?.systemAccessories || 0,
            }));

            // ✅ Store totals must equal the sum of everyone credited here, including cross-store entries
            const totalBoxesSold = preparedEntries.reduce((sum, entry) => sum + entry.boxesSold, 0)
                + crossStoreEntries.reduce((sum, entry) => sum + entry.boxesSold, 0);
            const totalMigrations = preparedEntries.reduce((sum, entry) => sum + entry.migrations, 0)
                + crossStoreEntries.reduce((sum, entry) => sum + entry.migrations, 0);
            const totalUpgrades = preparedEntries.reduce((sum, entry) => sum + entry.upgrade, 0)
                + crossStoreEntries.reduce((sum, entry) => sum + entry.upgrade, 0);
            const totalHSISold = preparedEntries.reduce((sum, entry) => sum + entry.hsiSold, 0)
                + crossStoreEntries.reduce((sum, entry) => sum + entry.hsiSold, 0);
            const totalTabletsSold = preparedEntries.reduce((sum, entry) => sum + entry.tabletsSold, 0)
                + crossStoreEntries.reduce((sum, entry) => sum + entry.tabletsSold, 0);
            const totalWatchesSold = preparedEntries.reduce((sum, entry) => sum + entry.watchesSold, 0)
                + crossStoreEntries.reduce((sum, entry) => sum + entry.watchesSold, 0);
            const totalAccessoriesByEmployee = parseFloat(
                (preparedEntries.reduce((sum, entry) => sum + entry.accessoriesByEmployee, 0)
                    + crossStoreEntries.reduce((sum, entry) => sum + entry.accessoriesByEmployee, 0)).toFixed(2)
            );
            const totalsystemAccessories = parseFloat(
                (preparedEntries.reduce((sum, entry) => sum + entry.systemAccessories, 0)
                    + crossStoreEntries.reduce((sum, entry) => sum + entry.systemAccessories, 0)).toFixed(2)
            );

            const errors: Record<string, string> = {};
            if (totalBoxesSold !== watchBoxesSold) { errors["boxesSold"] = "Total does not match sum of individual entries."; }
            if (totalMigrations !== watchMigrations) { errors["migrations"] = "Total does not match sum of individual entries."; }
            if (totalUpgrades !== watchUpgrade) { errors["upgrade"] = "Total does not match sum of individual entries."; }
            if (totalHSISold !== watchHsiSold) { errors["hsiSold"] = "Total does not match sum of individual entries."; }
            if (totalTabletsSold !== watchTabletsSold) { errors["tabletsSold"] = "Total does not match sum of individual entries."; }
            if (totalWatchesSold !== watchWatchesSold) { errors["watchesSold"] = "Total does not match sum of individual entries."; }
            if (totalAccessoriesByEmployee !== accessoriesByEmployee) { errors["accessoriesByEmployee"] = "Total does not match sum of individual entries."; }
            if (totalsystemAccessories !== watchSystemAccessories) { errors["systemAccessories"] = "Total does not match sum of individual entries."; }

            if (Object.keys(errors).length > 0) {
                setValidationErrors(errors);
                return;
            }

            setValidationErrors({});
            setIndividualEntries(preparedEntries);

            employeeSales = [
                ...preparedEntries.map((entry) => toEmployeeSaleEntry(entry, false)),
                ...crossStoreEntries,
            ];
        } else {
            setValidationErrors({});
            employeeSales = [
                toEmployeeSaleEntry(data, false),
                ...crossStoreEntries,
            ];
        }

        const payload: EodSubmissionRequest = {
            dealerStoreId: storeDealerStoreId || "",
            systemCash: parseFloat((data.systemCash ?? 0).toFixed(2)),
            systemCard: parseFloat((data.systemCard ?? 0).toFixed(2)),
            actualCash: parseFloat(adjCash.toFixed(2)),
            actualCard: parseFloat(adjCard.toFixed(2)),
            creditCard: parseFloat((data.creditCard ?? 0).toFixed(2)),
            debitCard: parseFloat((data.debitCard ?? 0).toFixed(2)),
            lastTransactionTime: data.lastTransactionTime,
            employeeSales,
            expenses: hasExpenses
                ? (data.expenses ?? []).map((exp) => ({
                    id: exp.id,
                    amount: parseFloat(exp.amount.toFixed(2)),
                    reason: exp.reason,
                    expenseType: exp.expenseType,
                    paymentType: exp.paymentType,
                }))
                : [],
        };

        setFormData(payload);
        setShowConfirm(true);
    }, [
        accessoriesByEmployee,
        confirmClockOut,
        crossStoreEntries,
        employeesWorking,
        hasExpenses,
        individualEntries,
        setIndividualEntries,
        showIndividualForm,
        storeDealerStoreId,
        toEmployeeSaleEntry,
        watchBoxesSold,
        watchHsiSold,
        watchMigrations,
        watchSystemAccessories,
        watchTabletsSold,
        watchUpgrade,
        watchWatchesSold,
    ]);

    const handleConfirm = useCallback(async () => {
        if (!formData) { return; }
        setShowConfirm(false);
        setLoading(true);
        try {
            await submitEodReport(formData);
            setShowSuccess(true);
            resetForm();
            setTimeout(() => { logout(); }, 3000);
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    }, [formData, logout, resetForm]);

    return {
        onSubmit,
        handleConfirm,
        loading,
        showConfirm,
        setShowConfirm,
        showSuccess,
        setShowSuccess,
        validationErrors,
        setValidationErrors,
    };
}
