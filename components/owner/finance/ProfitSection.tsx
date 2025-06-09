import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";


export function ProfitSection({ profit }: { profit: any }) {
    return (
        <Card className="w-full mt-6 border-2 border-green-600 shadow-lg">
            <CardHeader className="bg-green-100 dark:bg-green-900 rounded-t-lg">
                <CardTitle className="text-green-800 dark:text-green-300 text-xl font-bold">
                    💹 Net Profit
                </CardTitle>
            </CardHeader>
            <CardContent className="bg-white dark:bg-gray-900 rounded-b-lg p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Profit</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                        ${profit?.profit?.toFixed(2) ?? "0.00"}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400">Revenue - Expenses</p>
                    <p className="text-xs text-gray-400">as of selected month</p>
                </div>
            </CardContent>
        </Card>
    );
}
