interface PaycheckFiltersProps {
    startDate: string;
    endDate: string;
    includeBoxes: string;
    includeAccessories: string;
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
    setIncludeBoxes: (value: string) => void;
    setIncludeAccessories: (value: string) => void;
    fetchPaychecks: () => void;
}

export default function PaycheckFilters({
    startDate,
    endDate,
    includeBoxes,
    includeAccessories,
    setStartDate,
    setEndDate,
    setIncludeBoxes,
    setIncludeAccessories,
    fetchPaychecks,
}: PaycheckFiltersProps) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                🔍 Filter Paychecks
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Start Date */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* End Date */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Date
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Include Boxes */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Include Boxes?
                    </label>
                    <select
                        value={includeBoxes}
                        onChange={(e) => setIncludeBoxes(e.target.value)}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="YES">Yes</option>
                        <option value="NO">No</option>
                    </select>
                </div>

                {/* Include Accessories */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Include Accessories?
                    </label>
                    <select
                        value={includeAccessories}
                        onChange={(e) => setIncludeAccessories(e.target.value)}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="YES">Yes</option>
                        <option value="NO">No</option>
                    </select>
                </div>
            </div>

            {/* Generate Pay Button */}
            <div className="mt-6 flex justify-center">
                <button
                    onClick={fetchPaychecks}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 text-lg font-semibold rounded-md hover:from-blue-700 hover:to-blue-600 transition-all"
                >
                    🔄 Generate Pay
                </button>
            </div>
        </div>
    );
}
