import { Threshold } from "@/types/companyTypes";

interface CommissionTableProps {
    thresholds: Threshold[];
    setThresholds: (updatedThresholds: Threshold[]) => void;
}

export default function CommissionTable({ thresholds, setThresholds }: CommissionTableProps) {
    const handleUpdate = (index: number, field: keyof Threshold, value: number) => {
        setThresholds(
            thresholds.map((t, i) => (i === index ? { ...t, [field]: value } : t))
        );
    };

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-3">Commission Structure</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                <table className="w-full text-sm md:text-base">
                    <thead>
                        <tr className="text-gray-700 dark:text-gray-300">
                            <th className="p-2 text-left">Item Type</th>
                            <th className="p-2 text-center">Threshold</th>
                            <th className="p-2 text-center">Pay Amount ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {thresholds.map((threshold, index) => (
                            <tr key={index} className="border-t border-gray-300 dark:border-gray-700">
                                <td className="p-2">{threshold.itemType}</td>
                                <td className="p-2 text-center">{threshold.threshold}</td>
                                <td className="p-2 text-center">
                                    <input
                                        type="number"
                                        className="w-16 p-1 text-center border rounded-md bg-gray-50 dark:bg-gray-900 dark:text-white"
                                        value={threshold.payAmount}
                                        onChange={(e) => handleUpdate(index, "payAmount", Number(e.target.value))}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
