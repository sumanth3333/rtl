import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";


export function ExpensesSection({ expenses }: { expenses: any }) {
    const exp = expenses.expenses || {};
    const regular = exp.regularExpenses || {};
    const paycheck = exp.paycheck || {};
    const preActivations = exp.preActivationsTotal || {};

    return (
        <Card className="w-full mt-6">
            <CardHeader>
                <CardTitle>📉 Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ExpenseStat label="Total Expenses" value={expenses.totalExpenses} highlight />
                    <ExpenseStat label="Total Paycheck" value={paycheck.totalPaycheck} />
                    <ExpenseStat label="Dealer Expenses" value={exp.dealerExpenses?.amount} />
                    <ExpenseStat label="Legal Expenses" value={exp.legalExpenses?.amount} />
                    <ExpenseStat label="Store Expenses" value={exp.storeExpenses?.amount} />
                    <ExpenseStat label="Other Expenses" value={exp.otherExpenses?.amount} />
                    <ExpenseStat label="Pre-Activation Invoices" value={preActivations.totalInvoicesPrice} />

                    {/* Regular Expenses as individual items */}
                    {Object.entries(regular).map(([key, value]) => (
                        <ExpenseStat key={key} label={key} value={value as number} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function ExpenseStat({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
    return (
        <div className={`p-4 rounded-md ${highlight ? "bg-red-100 dark:bg-red-900" : "bg-gray-50 dark:bg-gray-800"}`}>
            <p className="text-sm capitalize text-gray-600 dark:text-gray-300">{label.replace(/([a-z])([A-Z])/g, '$1 $2')}</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">${value?.toFixed(2) ?? "0.00"}</p>
        </div>
    );
}
