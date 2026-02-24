import InputField from "@/components/ui/InputField";
import { useFormContext } from "react-hook-form";
import { EodReport } from "@/types/employeeSchema";

export default function AccessoriesSection({ accessoriesByEmployee }: { accessoriesByEmployee: number }) {
    const { register, formState: { errors } } = useFormContext<EodReport>();

    return (
        <section className="mt-10">
            <div className="border-b border-gray-300 dark:border-gray-700 pb-2 mb-4">
                <h3 className="text-sm sm:text-base font-semibold tracking-wide text-gray-800 dark:text-gray-100 uppercase">
                    Accessories
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    accessories sold in system and cash and card difference totals shown here.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <InputField
                    label="System Accessories($)"
                    type="number"
                    step="0.01"
                    className="text-sm"
                    {...register("systemAccessories", { valueAsNumber: true })}
                    error={errors.systemAccessories?.message}
                />
                <InputField
                    label="Cash/Card Difference($)"
                    type="number"
                    step="0.01"
                    className="text-sm font-medium"
                    value={accessoriesByEmployee.toFixed(2)}
                    error={errors.accessoriesByEmployee?.message}
                    readOnly
                />
                <InputField
                    label="Last Transaction Time"
                    type="time"
                    step="1"
                    placeholder="HH:mm:ss"
                    className="text-sm"
                    {...register("lastTransactionTime")}
                    error={errors.lastTransactionTime?.message}
                />
            </div>
        </section>
    );
}
