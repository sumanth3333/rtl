import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";


export function RevenueSection({ revenue }: { revenue: any }) {
    const accessories = revenue.accessories || {};
    const compensation = revenue.compensation || {};

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>💰 Revenue Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <RevenueStat label="Total Revenue" value={revenue.totalRevenue} highlight />
                    <RevenueStat label="Cash Accessories" value={accessories.totalCashAccessories} />
                    <RevenueStat label="Card Accessories" value={accessories.totalCardAccessories} />
                    <RevenueStat label="System Accessories" value={accessories.totalSystemAccessories} />
                    <RevenueStat label="Total Accessories" value={accessories.totalAccessories} />
                    <RevenueStat label="Total Compensation" value={compensation.totalCompensation} />
                </div>
            </CardContent>
        </Card>
    );
}

function RevenueStat({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
    return (
        <div className={`p-4 rounded-md ${highlight ? "bg-green-100 dark:bg-green-900" : "bg-gray-50 dark:bg-gray-800"}`}>
            <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">${value?.toFixed(2) ?? "0.00"}</p>
        </div>
    );
}
