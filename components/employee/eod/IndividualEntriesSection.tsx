import InputField from "@/components/ui/InputField";

interface Props {
    employeesWorking: { employeeNtid: string; employeeName: string }[];
    individualEntries: any[];
    validationErrors: Record<string, string>;
    onChange: (index: number, field: string, value: number) => void;
}

export default function IndividualEntriesSection({
    employeesWorking,
    individualEntries,
    validationErrors,
    onChange,
}: Props) {
    return (
        <div className="mt-6 p-4 sm:p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Individual Employee Sales</h3>
            {employeesWorking.map((emp, index) => (
                <div key={emp.employeeNtid} className="mb-4 border-b pb-4">
                    <h4 className="text-md pb-3 font-semibold text-gray-700 dark:text-gray-300">{emp.employeeName} ({emp.employeeNtid})</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <InputField
                            name="boxesSold"
                            label="Activations"
                            type="number"
                            value={individualEntries[index]?.boxesSold ?? 0}
                            onChange={(e) => onChange(index, "boxesSold", Number(e.target.value))}
                            error={validationErrors["boxesSold"]}
                            required
                        />
                        <InputField
                            name="upgrade"
                            label="Upgrades"
                            type="number"
                            value={individualEntries[index]?.upgrade ?? 0}
                            onChange={(e) => onChange(index, "upgrade", Number(e.target.value))}
                            error={validationErrors["upgrade"]}
                            required
                        />
                        <InputField
                            name="migrations"
                            label="Migrations"
                            type="number"
                            value={individualEntries[index]?.migrations ?? 0}
                            onChange={(e) => onChange(index, "migrations", Number(e.target.value))}
                            error={validationErrors["migrations"]}
                            required
                        />
                        <InputField
                            name="hsiSold"
                            label="HSI"
                            type="number"
                            value={individualEntries[index]?.hsiSold ?? 0}
                            onChange={(e) => onChange(index, "hsiSold", Number(e.target.value))}
                            error={validationErrors["hsiSold"]}
                            required
                        />
                        <InputField
                            name="tabletsSold"
                            label="Tablets & Watches"
                            type="number"
                            value={individualEntries[index]?.tabletsSold ?? 0}
                            onChange={(e) => onChange(index, "tabletsSold", Number(e.target.value))}
                            error={validationErrors["tabletsSold"]}
                            required
                        />
                        <InputField
                            name="watchesSold"
                            label="Free/$5 Lines(2GPROMO)"
                            type="number"
                            value={individualEntries[index]?.watchesSold ?? 0}
                            onChange={(e) => onChange(index, "watchesSold", Number(e.target.value))}
                            error={validationErrors["watchesSold"]}
                            required
                        />
                        <InputField
                            name="accessoriesByEmployee"
                            label="Total Cash/Card Diff"
                            type="number"
                            value={individualEntries[index]?.accessoriesByEmployee ?? 0}
                            onChange={(e) => onChange(index, "accessoriesByEmployee", Number(e.target.value))}
                            error={validationErrors["accessoriesByEmployee"]}
                            required
                        />
                        <InputField
                            name="systemAccessories"
                            label="System $$"
                            type="number"
                            value={individualEntries[index]?.systemAccessories ?? 0}
                            onChange={(e) => onChange(index, "systemAccessories", Number(e.target.value))}
                            error={validationErrors["systemAccessories"]}
                            required
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
