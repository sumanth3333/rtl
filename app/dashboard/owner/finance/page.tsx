// "use client";

// import { useState, useEffect } from "react";
// import Button from "@/components/ui/Button";
// import apiClient from "@/services/api/apiClient";
// import PAndENavBar from "@/components/owner/finance/PAndENavBar";
// import EditableTable from "@/components/owner/finance/EditableTable";

// export default function ProfitsAndExpensesPage() {
//     const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // Defaults to current month
//     const [expenses, setExpenses] = useState({
//         bills: [],
//         taxes: [],
//         dealerCommissions: [],
//         otherExpenses: [],
//     });

//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [successMessage, setSuccessMessage] = useState<string | null>(null);

//     // Fetch Expenses Data based on selected month
//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             try {
//                 const response = await apiClient.get(`/finance/expenses?month=${selectedMonth}`);
//                 setExpenses(response.data);
//             } catch (error) {
//                 setError("Failed to fetch expenses data.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [selectedMonth]); // Re-fetch when month changes

//     // Handle Table Updates
//     const handleUpdate = (category: string, updatedData: any[]) => {
//         setExpenses((prev) => ({ ...prev, [category]: updatedData }));
//     };

//     // Submit Updated Expenses
//     const handleSubmit = async () => {
//         setLoading(true);
//         setError(null);
//         setSuccessMessage(null);

//         try {
//             await apiClient.post(`/finance/update-expenses?month=${selectedMonth}`, expenses);
//             setSuccessMessage("✅ Expenses updated successfully!");
//         } catch (error) {
//             setError("❌ Failed to update expenses.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <>
//             {/* ✅ Pass `selectedMonth` and `setSelectedMonth` to Fix the Error */}
//             <PAndENavBar selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />

//             <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
//                 <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
//                     📊 Profits & Expenses - {selectedMonth}
//                 </h1>

//                 {loading && <p className="text-center text-gray-600 dark:text-gray-400">Loading data...</p>}
//                 {error && <p className="text-center text-red-500">{error}</p>}
//                 {successMessage && <p className="text-center text-green-500">{successMessage}</p>}

//                 {/* 🏠 Bills Table */}
//                 <EditableTable
//                     title="🏠 Business Bills"
//                     columns={["Dealer Store", "Rent", "Electricity", "Gas", "Trash", "WiFi", "Alarm", "Water", "Card Fees", "Lease Fees", "ARZOSOFT", "Bank Fees", "Total"]}
//                     data={expenses.bills}
//                     onUpdate={(updatedData) => handleUpdate("bills", updatedData)}
//                 />

//                 {/* ⚖️ Taxes & Legal Expenses Table */}
//                 <EditableTable
//                     title="⚖️ Taxes & Legal Expenses"
//                     columns={["Unemployment Compensation", "Employer Tax", "Sales Tax", "Employee Tax", "Total"]}
//                     data={expenses.taxes}
//                     onUpdate={(updatedData) => handleUpdate("taxes", updatedData)}
//                 />

//                 {/* 💳 Dealer Commissions & Metro Expenses Table */}
//                 <EditableTable
//                     title="💳 Dealer Commissions & Metro Expenses"
//                     columns={["Dealer Store", "Dealer Commission", "Shopper Tracker", "Total"]}
//                     data={expenses.dealerCommissions}
//                     onUpdate={(updatedData) => handleUpdate("dealerCommissions", updatedData)}
//                 />

//                 {/* 💸 Other Expenses Table */}
//                 <EditableTable
//                     title="💸 Other Expenses"
//                     columns={["Expense Description", "Payment Method", "Payment Amount", "Payment Date"]}
//                     data={expenses.otherExpenses}
//                     onUpdate={(updatedData) => handleUpdate("otherExpenses", updatedData)}
//                 />

//                 {/* ✅ Submit Button */}
//                 <div className="mt-6 flex justify-end">
//                     <Button onClick={handleSubmit} isLoading={loading} variant="primary">
//                         Update Expenses
//                     </Button>
//                 </div>
//             </div>
//         </>
//     );
// }

"use client";

export default function ComingSoon() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200">
            <div className="p-6 md:p-10 bg-white dark:bg-gray-800 shadow-lg rounded-lg text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">📊 Profits & Expenses</h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6">
                    We're working hard to bring you this feature. Stay tuned!
                </p>
                <div className="flex items-center justify-center space-x-4">
                    <span className="animate-pulse text-lg font-semibold text-blue-600 dark:text-blue-400">
                        Coming Soon...
                    </span>
                </div>
            </div>
        </div>
    );
}
