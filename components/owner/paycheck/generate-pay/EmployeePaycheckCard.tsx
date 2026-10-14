import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { EmployeePaycheck } from "@/types/paycheckTypes";
import apiClient from "@/services/api/apiClient";

interface EmployeePaycheckProps {
    paycheck: EmployeePaycheck;
    fromDate: string;
    toDate: string;
    includeBoxes: string;
    includeAccessories: string;
    includeTaxes: string;
}

export default function EmployeePaycheckCard({ paycheck, fromDate, toDate, includeBoxes, includeAccessories, includeTaxes }: EmployeePaycheckProps) {
    const [expanded, setExpanded] = useState(false);
    const [showCommissionBreakdown, setShowCommissionBreakdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [adjustReason, setAdjustReason] = useState<string>("");
    const [adjustAmount, setAdjustAmount] = useState<string>("0");
    const [showAdjustments, setShowAdjustments] = useState(false);

    // And wherever needed, convert it back:
    const numericAdjust = parseFloat(adjustAmount || "0");
    const adjustedPay = paycheck.netPay.netPay + (isNaN(numericAdjust) ? 0 : numericAdjust);

    const magentaCommission = paycheck.commissionCalculations.reduce((sum, calc) => sum + calc.magentaCommission, 0);
    const totalCommission = paycheck.commission.boxesCommission + paycheck.commission.accessoriesCommission + magentaCommission;

    const handleGeneratePay = async () => {
        setLoading(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        const work: Record<string, unknown> = {
            workingHoursPay: paycheck.work.workingHoursPay,
            numberOfHoursWorked: paycheck.work.numberOfHoursWorked,
            numberOfDaysWorked: paycheck.work.numberOfDaysWorked,
            totalAccessories: paycheck.work.totalAccessories,
            boxesSold: paycheck.work.boxesSold,
            upgradesSold: paycheck.work.upgradesSold,
            tabletsSold: paycheck.work.tabletsSold,
            hsiSold: paycheck.work.hsiSold,
            watchesSold: paycheck.work.watchesSold,
            migration: paycheck.work.migration,
            totalPreActivatedPhones: paycheck.work.totalPreActivatedPhones,
        };
        if (paycheck.work.notEligibleForCommission.length > 0) {
            work.notEligibleForCommission = paycheck.work.notEligibleForCommission;
        }

        const payload: Record<string, unknown> = {
            fromDate,
            toDate,
            includeBoxesInPaycheck: includeBoxes,
            includeAccessoriesInPaycheck: includeAccessories,
            isTaxesIncluded: includeTaxes,
            employee: {
                employeeNtid: paycheck.employee.employeeNtid,
                employeeName: paycheck.employee.employeeName,
            },
            work,
            commission: {
                boxesCommission: paycheck.commission.boxesCommission,
                accessoriesCommission: paycheck.commission.accessoriesCommission,
            },
            netPay: {
                deduction: {
                    taxes: paycheck.netPay.deduction.taxes,
                    totalDeductions: paycheck.netPay.deduction.totalDeductions,
                },
                netPay: paycheck.netPay.netPay,
            },
            employeeSalesHistory: paycheck.sales,
            commissionCalculations: paycheck.commissionCalculations,
        };

        if (!isNaN(numericAdjust) && numericAdjust !== 0) {
            payload.adjustments = [
                {
                    amount: numericAdjust,
                    reason: adjustReason,
                },
            ];
        }
        try {
            const response = await apiClient.post("/company/payslip", payload);

            // A 200 response with no usable PDF payload is still a failure —
            // some business-rule rejections come back this way instead of a non-2xx status.
            if (!response.data?.response) {
                throw new Error(response.data?.message || "The server did not return a payslip. Please review the details and try again.");
            }

            let blobUrl: string;
            try {
                const byteCharacters = atob(response.data.response); // Decode base64
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "application/pdf" });
                blobUrl = URL.createObjectURL(blob);
            } catch {
                throw new Error("The payslip was generated but could not be read. Please try again.");
            }

            window.open(blobUrl, "_blank");
            setSuccessMessage("✅ Payslip generated successfully!");
        } catch (error) {
            const message =
                error instanceof Error && error.message
                    ? error.message
                    : "Failed to generate payslip. Please try again.";

            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg mb-6">
            {/* Employee Header */}
            <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-700 pb-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {paycheck.employee.employeeName}{" "}
                    <span className="text-gray-500 text-sm">({paycheck.employee.employeeNtid})</span>
                </h3>
            </div>

            {/* Work Summary */}
            <div className="mt-4 border-t border-gray-300 dark:border-gray-700 pt-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Work Summary</h4>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    {[
                        ["Days Worked", paycheck.work.numberOfDaysWorked],
                        ["Hours Worked", paycheck.work.numberOfHoursWorked.toFixed(2)],
                        ["Accessories Sold", paycheck.work.totalAccessories],
                        ["Activations", paycheck.work.boxesSold],
                        ["Upgrades", paycheck.work.upgradesSold],
                        ["Migrations", `${paycheck.work.migration.accounts} acct / ${paycheck.work.migration.lines} lines`],
                        ["BTS", paycheck.work.tabletsSold],
                        ["HSI", paycheck.work.hsiSold],
                        ["Free Lines", paycheck.work.watchesSold],
                        ["Preactivated Phones", paycheck.work.totalPreActivatedPhones],
                    ].map(([label, value], index) => (
                        <div key={index} className="flex flex-col items-center">
                            <span className="text-gray-500 dark:text-gray-400 text-xs uppercase">{label}</span>
                            <span className="text-lg font-medium">{value}</span>
                        </div>
                    ))}
                </div>

                {paycheck.work.notEligibleForCommission.length > 0 && (
                    <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                        Not eligible for commission:{" "}
                        {paycheck.work.notEligibleForCommission
                            .map((entry) => `${entry.date} (${entry.totalPreActivatedPhones} preactivated)`)
                            .join(", ")}
                    </p>
                )}
            </div>

            {/* Commission, Deductions & Net Pay */}
            <div className="mt-6 flex flex-wrap justify-between items-center gap-4 border-t border-gray-300 dark:border-gray-700 pt-4">
                {/* Commission */}
                <div className="flex flex-col items-center text-sm sm:text-base">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Commission</p>
                    <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                        +${totalCommission.toFixed(2)}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Boxes: <span className="text-gray-800 dark:text-gray-200 font-medium">${paycheck.commission.boxesCommission.toFixed(2)}</span>
                    </p><p className="text-xs text-gray-500 dark:text-gray-400">
                        Accessories: <span className="text-gray-800 dark:text-gray-200 font-medium">${paycheck.commission.accessoriesCommission.toFixed(2)}</span>
                    </p>
                    {magentaCommission > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Magenta: <span className="text-gray-800 dark:text-gray-200 font-medium">${magentaCommission.toFixed(2)}</span>
                        </p>
                    )}
                </div>

                {/* Paid for Hours */}
                <div className="flex flex-col items-center text-sm sm:text-base">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Paid for Hours</p>
                    <span className="text-xl font-semibold text-green-600 dark:text-green-400">
                        ${paycheck.work.workingHoursPay.toFixed(2)}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Hours: <span className="text-gray-800 dark:text-gray-200 font-medium">${paycheck.work.numberOfHoursWorked.toFixed(2)}</span>
                    </p>
                </div>

                {/* Deductions */}
                <div className="flex flex-col items-center text-sm sm:text-base">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Deductions</p>
                    <span className="text-xl font-semibold text-red-500">
                        -${paycheck.netPay.deduction.totalDeductions.toFixed(2)}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Taxes: <span className="text-gray-800 dark:text-gray-200 font-medium">${paycheck.netPay.deduction.taxes.toFixed(2)}</span>
                    </p>
                </div>


                {/* Net Pay */}
                <div className="text-gray-800 dark:text-gray-200 text-sm sm:text-base border-t w-full text-center pt-4">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Net Pay</p>
                    <span
                        className={`text-2xl font-bold ${paycheck.netPay.netPay >= 0 ? "text-green-600" : "text-red-500"
                            }`}
                    >
                        ${adjustedPay.toFixed(2)}
                    </span>
                    <p className="text-xs italic text-gray-500 dark:text-gray-400 mt-1">
                        Adjustment of {numericAdjust >= 0 ? "+" : ""}
                        ${isNaN(numericAdjust) ? "0.00" : numericAdjust.toFixed(2)} applied for "{adjustReason || "N/A"}"
                    </p>
                </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-between items-center gap-4">
                {/* Add Pay Adjustment Button */}
                <button
                    onClick={() => setShowAdjustments(!showAdjustments)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md shadow-sm hover:bg-blue-200 hover:text-blue-800 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {showAdjustments ? "Hide Pay Adjustment" : "➕ Add Pay Adjustment"}
                </button>

                {/* Generate Pay Button */}
                <button
                    onClick={handleGeneratePay}
                    className={`px-5 py-3 text-white font-semibold rounded-md shadow-md transition-all ${loading
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                        }`}
                    disabled={loading}
                >
                    {loading ? "Processing..." : "✅ Verified & Generate Pay"}
                </button>
            </div>


            {/* Adjustments Section */}
            {showAdjustments && (
                <div className="mt-6 border-t border-gray-300 dark:border-gray-700 pt-4">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Pay Adjustments (Optional)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Adjustment Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Adjustment Amount ($)
                            </label>
                            <input
                                type="number"
                                inputMode="decimal"
                                step="any"
                                value={adjustAmount}
                                onChange={(e) => setAdjustAmount(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., -20 for deduction, +50 for bonus"
                            />

                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Enter negative values for deductions and positive for bonuses.
                            </p>
                        </div>

                        {/* Adjustment Reason */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Adjustment Reason
                            </label>
                            <input
                                type="text"
                                value={adjustReason}
                                onChange={(e) => setAdjustReason(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., late penalty, bonus, adjustment"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Success/Error Messages */}
            {successMessage && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/40 px-4 py-3">
                    <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">{successMessage}</p>
                </div>
            )}
            {errorMessage && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40 px-4 py-3">
                    <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <div>
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300">Couldn&apos;t generate paycheck</p>
                        <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
                    </div>
                </div>
            )}

            {/* Expandable Commission Breakdown */}
            {paycheck.commissionCalculations.length > 0 && (
                <div className="mt-4">
                    <button
                        className="w-full flex justify-between items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                        onClick={() => setShowCommissionBreakdown(!showCommissionBreakdown)}
                    >
                        <span>{showCommissionBreakdown ? "Hide Commission Breakdown" : "Show Commission Breakdown"}</span>
                        {showCommissionBreakdown ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                    </button>

                    {showCommissionBreakdown && (
                        <div className="mt-5 bg-gray-50 dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
                            {paycheck.commissionCalculations.map((calc, index) => (
                                <div key={index}>
                                    <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                        {calc.startDate} – {calc.endDate} ({calc.structureType})
                                    </h5>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                                <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300">
                                                    <th className="p-3 text-left">Category</th>
                                                    <th className="p-3 text-center">Sales Count</th>
                                                    <th className="p-3 text-center">Applied Threshold</th>
                                                    <th className="p-3 text-center">Rate</th>
                                                    <th className="p-3 text-left">Calculation</th>
                                                    <th className="p-3 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {calc.categories.map((cat, catIndex) => (
                                                    <tr
                                                        key={catIndex}
                                                        className={`border-b border-gray-300 dark:border-gray-700 ${catIndex % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-100 dark:bg-gray-800"
                                                            }`}
                                                    >
                                                        <td className="p-3 font-medium text-gray-700 dark:text-gray-300">{cat.category}</td>
                                                        <td className="p-3 text-center text-gray-700 dark:text-gray-300">{cat.salesCount}</td>
                                                        <td className="p-3 text-center text-gray-700 dark:text-gray-300">{cat.appliedThreshold}</td>
                                                        <td className="p-3 text-center text-gray-700 dark:text-gray-300">${cat.commissionRate}</td>
                                                        <td className="p-3 text-gray-500 dark:text-gray-400">{cat.calculation}</td>
                                                        <td className="p-3 text-right font-semibold text-green-600 dark:text-green-400">${cat.commissionAmount.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                                <tr className="border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
                                                    <td className="p-3 font-medium text-gray-700 dark:text-gray-300">Magenta</td>
                                                    <td className="p-3 text-center text-gray-700 dark:text-gray-300">
                                                        {calc.magenta.totalAccounts} acct / {calc.magenta.totalLines} lines
                                                    </td>
                                                    <td className="p-3 text-center text-gray-700 dark:text-gray-300">{calc.magenta.appliedThreshold}</td>
                                                    <td className="p-3 text-center text-gray-700 dark:text-gray-300">${calc.magenta.commissionRate}</td>
                                                    <td className="p-3 text-gray-500 dark:text-gray-400">{calc.magenta.calculation}</td>
                                                    <td className="p-3 text-right font-semibold text-green-600 dark:text-green-400">${calc.magenta.commissionAmount.toFixed(2)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="mt-2 text-right text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        Period Commission: ${calc.periodCommission.toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Expandable Sales Section */}
            {paycheck.sales.length > 0 && (
                <div className="mt-4">
                    <button
                        className="w-full flex justify-between items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                        onClick={() => setExpanded(!expanded)}
                    >
                        <span>{expanded ? "Hide Sales History" : "Show Sales History"}</span>
                        {expanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                    </button>

                    {expanded && (
                        <div className="mt-5 bg-gray-50 dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                📊 Sales Transactions
                            </h4>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300">
                                            <th className="p-3 text-left">Sale Date</th>
                                            <th className="p-3 text-left">Opened At</th>
                                            <th className="p-3 text-left">Closed At</th>
                                            <th className="p-3 text-left">Hours</th>
                                            <th className="p-3 text-left">Store</th>
                                            <th className="p-3 text-center">Activations</th>
                                            <th className="p-3 text-center">Upgrades</th>
                                            <th className="p-3 text-center">Migrations</th>
                                            <th className="p-3 text-center">Accessories ($)</th>
                                            <th className="p-3 text-center">BTS</th>
                                            <th className="p-3 text-center">HSI</th>
                                            <th className="p-3 text-center">Free Lines</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paycheck.sales.map((sale, index) => (
                                            <tr
                                                key={index}
                                                className={`border-b border-gray-300 dark:border-gray-700 ${index % 2 === 0
                                                    ? "bg-white dark:bg-gray-900"
                                                    : "bg-gray-100 dark:bg-gray-800"
                                                    } hover:bg-gray-200 dark:hover:bg-gray-700 transition`}
                                            >
                                                <td className="p-3 font-medium text-gray-700 dark:text-gray-300">
                                                    {sale.saleDate}
                                                </td>
                                                <td className="p-3 font-medium text-gray-700 dark:text-gray-300">
                                                    {sale.clockInTime}
                                                </td>
                                                <td className="p-3 font-medium text-gray-700 dark:text-gray-300">
                                                    {sale.clockOutTime}
                                                </td>
                                                <td className="p-3 font-medium text-gray-700 dark:text-gray-300">
                                                    {sale.numberOfHoursWorkedByEmployee}
                                                </td>
                                                <td className="p-3 text-gray-700 dark:text-gray-300">
                                                    {sale.store.storeName}
                                                </td>
                                                <td className="p-3 text-center text-blue-600 dark:text-blue-400 font-bold">
                                                    {sale.boxesSold}
                                                </td>
                                                <td className="p-3 text-center text-blue-600 dark:text-blue-400 font-bold">
                                                    {sale.upgrade}
                                                </td>
                                                <td className="p-3 text-center text-blue-600 dark:text-blue-400 font-bold">
                                                    {sale.migrations.accounts} acct / {sale.migrations.lines} lines
                                                </td>
                                                <td className="p-3 text-center text-green-600 dark:text-green-400 font-semibold">
                                                    ${sale.accessories.toFixed(2)}
                                                </td>
                                                <td className="p-3 text-center text-gray-700 dark:text-gray-300">
                                                    {sale.tabletsSold}
                                                </td>
                                                <td className="p-3 text-center text-gray-700 dark:text-gray-300">
                                                    {sale.hsiSold}
                                                </td>
                                                <td className="p-3 text-center text-gray-700 dark:text-gray-300">
                                                    {sale.watchesSold}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
