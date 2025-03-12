import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { EmployeePaycheck } from "@/types/paycheckTypes";
import apiClient from "@/services/api/apiClient";

interface EmployeePaycheckProps {
    paycheck: EmployeePaycheck;
    fromDate: string;
    toDate: string;
    includeBoxes: string;
    includeAccessories: string;
}

export default function EmployeePaycheckCard({ paycheck, fromDate, toDate, includeBoxes, includeAccessories }: EmployeePaycheckProps) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleGeneratePay = async () => {
        setLoading(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        const payload = {
            fromDate,
            toDate,
            includeBoxesInPaycheck: includeBoxes,
            includeAccessoriesInPaycheck: includeAccessories,
            employee: {
                employeeNtid: paycheck.employee.employeeNtid,
                employeeName: paycheck.employee.employeeName,
            },
            work: {
                numberOfHoursWorked: paycheck.work.numberOfHoursWorked,
                numberOfDaysWorked: paycheck.work.numberOfDaysWorked,
                totalAccessories: paycheck.work.totalAccessories,
                boxesSold: paycheck.work.boxesSold,
                tabletsSold: paycheck.work.tabletsSold,
                hsiSold: paycheck.work.hsiSold,
                watchesSold: paycheck.work.watchesSold,
            },
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
        };
        console.log(payload);
        try {
            const response = await apiClient.post("/company/payslip", payload);
            if (response.data) {
                // ✅ Decode Base64 to a Blob (PDF)
                const byteCharacters = atob(response.data.response); // Decode base64
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "application/pdf" });

                // ✅ Create a URL and open the PDF in a new tab
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, "_blank");

                setSuccessMessage("✅ Payslip generated successfully!");
            }
        } catch (error) {
            console.log(error);
            setErrorMessage("❌ Failed to generate payslip.");
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
                <span
                    className={`text-lg font-bold ${paycheck.netPay.netPay < 0 ? "text-red-500" : "text-green-600"
                        }`}
                >
                    ${paycheck.netPay.netPay.toFixed(2)}
                </span>
            </div>

            {/* Work Summary */}
            <div className="mt-4 border-t border-gray-300 dark:border-gray-700 pt-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Work Summary</h4>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    {[
                        ["Days Worked", paycheck.work.numberOfDaysWorked],
                        ["Hours Worked", paycheck.work.numberOfHoursWorked.toFixed(2)],
                        ["Accessories Sold", paycheck.work.totalAccessories],
                        ["Boxes Sold", paycheck.work.boxesSold],
                        ["Tablets Sold", paycheck.work.tabletsSold],
                        ["HSI Sold", paycheck.work.hsiSold],
                        ["Watches Sold", paycheck.work.watchesSold],
                    ].map(([label, value], index) => (
                        <div key={index} className="flex flex-col items-center">
                            <span className="text-gray-500 dark:text-gray-400 text-xs uppercase">{label}</span>
                            <span className="text-lg font-medium">{value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Commission, Deductions & Net Pay */}
            <div className="mt-6 flex flex-wrap justify-between items-center gap-4 border-t border-gray-300 dark:border-gray-700 pt-4">
                {/* Commission */}
                <div className="flex flex-col items-center text-sm sm:text-base">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Commission</p>
                    <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                        +$
                        {(paycheck.commission.boxesCommission + paycheck.commission.accessoriesCommission).toFixed(2)}
                    </span>
                </div>

                {/* Paid for Hours */}
                <div className="flex flex-col items-center text-sm sm:text-base">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Paid for Hours</p>
                    <span className="text-xl font-semibold text-green-600 dark:text-green-400">
                        ${paycheck.work.workingHoursPay.toFixed(2)}
                    </span>
                </div>

                {/* Deductions */}
                <div className="flex flex-col items-center text-sm sm:text-base">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Deductions</p>
                    <span className="text-xl font-semibold text-red-500">
                        -${paycheck.netPay.deduction.totalDeductions.toFixed(2)}
                    </span>
                </div>

                {/* Net Pay */}
                <div className="text-gray-800 dark:text-gray-200 text-sm sm:text-base border-t w-full text-center pt-4">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Net Pay</p>
                    <span
                        className={`text-2xl font-bold ${paycheck.netPay.netPay >= 0 ? "text-green-600" : "text-red-500"
                            }`}
                    >
                        ${paycheck.netPay.netPay.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* ✅ Generate Pay Button */}
            <div className="mt-4 flex justify-center">
                <button
                    onClick={handleGeneratePay}
                    className={`px-5 py-3 text-white font-semibold rounded-md transition-all ${loading
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                        }`}
                    disabled={loading}
                >
                    {loading ? "Processing..." : "✅ Verified & Generate Pay"}
                </button>
            </div>

            {/* ✅ Success/Error Messages */}
            {successMessage && (
                <p className="mt-3 text-center text-green-600 dark:text-green-400 font-medium">{successMessage}</p>
            )}
            {errorMessage && (
                <p className="mt-3 text-center text-red-500 font-medium">{errorMessage}</p>
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
                                            <th className="p-3 text-left">Store</th>
                                            <th className="p-3 text-center">Boxes</th>
                                            <th className="p-3 text-center">Accessories ($)</th>
                                            <th className="p-3 text-center">Tablets</th>
                                            <th className="p-3 text-center">HSI</th>
                                            <th className="p-3 text-center">Watches</th>
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
                                                <td className="p-3 text-gray-700 dark:text-gray-300">
                                                    {sale.store.storeName}
                                                </td>
                                                <td className="p-3 text-center text-blue-600 dark:text-blue-400 font-bold">
                                                    {sale.boxesSold}
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
