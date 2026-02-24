import { useFormContext, useFieldArray } from "react-hook-form";
import { EodReport } from "@/types/employeeSchema";
import InputField from "@/components/ui/InputField";
import apiClient from "@/services/api/apiClient";

export default function ExpensesSection() {
    const { control, register, formState: { errors } } = useFormContext<EodReport>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "expenses"
    });

    return (
        <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Expenses (Short / Over)
            </h3>

            <div className="space-y-6">
                {fields.map((field, index) => (
                    <div
                        key={field.id}
                        className="relative border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 shadow-sm"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <InputField
                                label="Amount"
                                type="number"
                                step="0.01"
                                {...register(`expenses.${index}.amount`, { valueAsNumber: true })}
                                error={errors.expenses?.[index]?.amount?.message}
                            />

                            <InputField
                                label="Reason"
                                type="text"
                                {...register(`expenses.${index}.reason`)}
                                error={errors.expenses?.[index]?.reason?.message}
                            />

                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Type
                                </label>
                                <select
                                    {...register(`expenses.${index}.expenseType`)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select</option>
                                    <option value="Short">Short</option>
                                    <option value="Over">Over</option>
                                </select>
                                {errors.expenses?.[index]?.expenseType?.message && (
                                    <span className="text-xs text-red-500 mt-1">
                                        {errors.expenses[index]?.expenseType?.message}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Method
                                </label>
                                <select
                                    {...register(`expenses.${index}.paymentType`)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                </select>
                                {errors.expenses?.[index]?.paymentType?.message && (
                                    <span className="text-xs text-red-500 mt-1">
                                        {errors.expenses[index]?.paymentType?.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="absolute top-2 right-2">
                            <button
                                type="button"
                                onClick={async () => {
                                    const expense = fields[index] as typeof fields[number] & { expenseId?: number };

                                    if (!expense.expenseId || expense.expenseId === 0) {
                                        remove(index);
                                    } else {
                                        try {
                                            await apiClient.delete(`/expense/deleteEodExpense`, {
                                                params: { expenseId: expense.expenseId },
                                            });
                                            remove(index);
                                        } catch (err) {
                                            console.error("❌ Error deleting expense:", err);
                                            alert("Failed to delete expense. Please try again.");
                                        }
                                    }
                                }}
                                className="text-red-600 text-xs font-medium hover:underline"
                            >
                                ✕ Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <button
                    type="button"
                    onClick={() =>
                        append({
                            id: 0,
                            amount: 0,
                            reason: "",
                            expenseType: "Short",
                            paymentType: "Cash",
                        })
                    }
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                >
                    + Add Expense
                </button>
            </div>
        </div>
    );
}
