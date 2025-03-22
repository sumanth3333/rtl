interface ExpensesTableProps {
    selectedMonth: string;
}

export default function ExpensesTable({ selectedMonth }: ExpensesTableProps) {
    // Placeholder Data
    const bills = [
        { dealerStore: "1017 State St", rent: 3000, electricity: 200, gas: 100, trash: 50, wifi: 75, alarm: 60, water: 40, cardMachineFees: 100, cardLeaseFee: 50, arzosoft: 30, bankFees: 20, total: 3675 },
        { dealerStore: "818 East St", rent: 3200, electricity: 180, gas: 120, trash: 55, wifi: 80, alarm: 65, water: 45, cardMachineFees: 105, cardLeaseFee: 55, arzosoft: 35, bankFees: 25, total: 3815 }
    ];

    const taxes = [
        { type: "Unemployment Compensation", amount: 500 },
        { type: "Employer Tax", amount: 800 },
        { type: "Sales Tax", amount: 600 },
        { type: "Employee Tax", amount: 400 },
    ];

    const commissions = [
        { dealerStore: "1017 State St", dealerCommission: 1200, shopperTracker: 300 },
        { dealerStore: "818 East St", dealerCommission: 1500, shopperTracker: 350 }
    ];

    const otherExpenses = [
        { description: "Office Supplies", paymentMethod: "Credit Card", amount: 250, date: "2025-03-10" },
        { description: "Marketing Ads", paymentMethod: "Bank Transfer", amount: 800, date: "2025-03-15" },
    ];

    return (
        <div className="space-y-6">
            {/* Bills Table */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-2">🏠 Dealer Store Bills - {selectedMonth}</h2>
                <table className="w-full text-sm md:text-base border-collapse border border-gray-300 dark:border-gray-700">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300">
                            <th className="p-3 text-left">Dealer Store</th>
                            <th className="p-3 text-center">Rent/Lease</th>
                            <th className="p-3 text-center">Electricity</th>
                            <th className="p-3 text-center">Gas</th>
                            <th className="p-3 text-center">Trash</th>
                            <th className="p-3 text-center">WiFi</th>
                            <th className="p-3 text-center">Alarm</th>
                            <th className="p-3 text-center">Water</th>
                            <th className="p-3 text-center">Card Fees</th>
                            <th className="p-3 text-center">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bills.map((bill, index) => (
                            <tr key={index} className="border-b border-gray-300 dark:border-gray-700">
                                <td className="p-3">{bill.dealerStore}</td>
                                <td className="p-3 text-center">${bill.rent}</td>
                                <td className="p-3 text-center">${bill.electricity}</td>
                                <td className="p-3 text-center">${bill.gas}</td>
                                <td className="p-3 text-center">${bill.trash}</td>
                                <td className="p-3 text-center">${bill.wifi}</td>
                                <td className="p-3 text-center">${bill.alarm}</td>
                                <td className="p-3 text-center">${bill.water}</td>
                                <td className="p-3 text-center">${bill.cardMachineFees}</td>
                                <td className="p-3 text-center font-bold">${bill.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
