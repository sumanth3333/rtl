export default function TargetSummary({ title, targetData, isEmployee, cardStyle, textStyle, highlightStyle }: any) {
    if (!targetData || targetData.length < 3) {
        return <p className="text-gray-500 text-center py-4">Loading targets...</p>;
    }

    const total = targetData[0] || {};
    const achieved = targetData[1] || {};
    const remaining = targetData[2] || {};

    return (
        <div className={`${cardStyle} p-2 sm:p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 w-full`}>
            <h3 className="sm:text-sm md:text-sm lg:text-sm xl:text-base font-bold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wide text-center sm:text-left">{title}</h3>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-2 text-center w-full">
                {[
                    { label: "Activations", key: isEmployee ? "phonesTargetToEmployee" : "activationTargetToStore" },
                    { label: "Upgrades", key: isEmployee ? "upgradeTargetToEmployee" : "upgradeTargetToStore" },
                    { label: "Accessories", key: isEmployee ? "accessoriesTargetByEmployee" : "accessoriesTargetToStore" },
                    { label: "HSI", key: isEmployee ? "hsiTarget" : "hsiTargetToStore" },
                    { label: "Tablets", key: isEmployee ? "tabletsTargetByEmployee" : "tabletsTargetToStore" },
                    { label: "Watches", key: isEmployee ? "smartwatchTargetByEmployee" : "smartwatchTragetToStore" }
                ].map((item) => (
                    <div key={item.label} className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 flex flex-col items-center w-full overflow-hidden">
                        <p className="text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide w-full text-center">{item.label}</p>
                        <table className="w-full text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base mt-2 table-fixed">
                            <tbody>
                                <tr>
                                    <td className="text-gray-600 dark:text-gray-400 font-medium pr-2 text-left">Total:</td>
                                    <td className="text-gray-900 dark:text-gray-100 font-bold text-right">{item.key.includes("accessories") ? (total[item.key] || 0).toFixed(2) : total[item.key] || 0}</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 dark:text-gray-400 font-medium pr-2 text-left">Achieved:</td>
                                    <td className="text-blue-600 dark:text-blue-400 font-bold text-right">
                                        {item.key.includes("accessories") ? (achieved[item.key] || 0).toFixed(2) : achieved[item.key] || 0}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 dark:text-gray-400 font-medium pr-2 text-left">Remaining:</td>
                                    <td
                                        className={`font-bold text-right ${(remaining[item.key] || 0) > 0
                                            ? "text-red-600 dark:text-red-400"
                                            : "text-green-600 dark:text-green-400"
                                            }`}
                                    >
                                        {(() => {
                                            const value = remaining[item.key] || 0;
                                            const formatted = item.key.includes("accessories") ? Math.abs(value).toFixed(2) : Math.abs(value);
                                            return value < 0 ? `+${formatted}` : formatted;
                                        })()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
}