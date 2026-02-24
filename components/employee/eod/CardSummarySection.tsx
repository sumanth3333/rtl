import InputField from "@/components/ui/InputField";
import { useFormContext } from "react-hook-form";
import { EodReport } from "@/types/employeeSchema";

export default function CardSummarySection({ cardDifference }: { cardDifference: number }) {
    const { register, formState: { errors } } = useFormContext<EodReport>();

    return (
        <section className="mt-10">
            <div className="border-b border-gray-300 dark:border-gray-700 pb-2 mb-4">
                <h3 className="text-sm sm:text-base font-semibold tracking-wide text-gray-800 dark:text-gray-100 uppercase">
                    Card Summary
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Payments in credit card machine vs. recorded in the system. Difference is auto-calculated.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <InputField
                    label="Actual Card"
                    type="number"
                    step="0.01"
                    className="text-sm"
                    {...register("actualCard", { valueAsNumber: true })}
                    error={errors.actualCard?.message}
                />
                <InputField
                    label="System Card"
                    type="number"
                    step="0.01"
                    className="text-sm"
                    {...register("systemCard", { valueAsNumber: true })}
                    error={errors.systemCard?.message}
                />
                <InputField
                    label="Card Difference"
                    type="text"
                    className="text-sm font-semibold text-blue-700 dark:text-blue-300"
                    value={`$${cardDifference.toFixed(2)}`}
                    readOnly
                />
            </div>
        </section>
    );
}
