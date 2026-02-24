import InputField from "@/components/ui/InputField";
import { useFormContext } from "react-hook-form";
import { EodReport } from "@/types/employeeSchema";

export default function CashSummarySection({ cashDifference }: { cashDifference: number }) {
    const { register, formState: { errors } } = useFormContext<EodReport>();

    return (
        <section className="mt-10">
            <div className="border-b border-gray-300 dark:border-gray-700 pb-2 mb-4">
                <h3 className="text-sm sm:text-base font-semibold tracking-wide text-gray-800 dark:text-gray-100 uppercase">
                    Cash Summary
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    cash collected vs. recorded in the system. Difference is auto-calculated.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <InputField
                    label="Actual Cash"
                    type="number"
                    step="0.01"
                    className="text-sm"
                    {...register("actualCash", { valueAsNumber: true })}
                    error={errors.actualCash?.message}
                />
                <InputField
                    label="System Cash"
                    type="number"
                    step="0.01"
                    className="text-sm"
                    {...register("systemCash", { valueAsNumber: true })}
                    error={errors.systemCash?.message}
                />
                <InputField
                    label="Cash Difference"
                    type="text"
                    className="text-sm font-semibold text-blue-700 dark:text-blue-300"
                    value={`$${cashDifference.toFixed(2)}`}
                    readOnly
                />
            </div>
        </section>
    );
}
