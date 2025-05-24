import { useEffect, useState } from "react";
import { StoreTargetRequest, EmployeeTargetRequest } from "@/types/targetTypes";
import { updateEmployeeTarget, updateStoreTarget } from "@/services/owner/targetService";

interface TargetUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    target: StoreTargetRequest | EmployeeTargetRequest;
    month: string;
}

export default function TargetUpdateModal({ isOpen, onClose, target, month }: TargetUpdateModalProps) {
    const [formData, setFormData] = useState(target);
    const [loading, setLoading] = useState<boolean>(false);

    // ✅ Update formData when target changes
    useEffect(() => {
        if (target) {
            setFormData(target);
        }
    }, [target]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            if ("store" in prev) {
                return {
                    ...prev,
                    store: prev.store ?? { dealerStoreId: "" }, // ✅ Ensure store exists
                    target: {
                        ...(prev.target ?? {
                            activationTargetToStore: 0,
                            upgradeTargetToStore: 0,
                            migrationTargetToStore: 0,
                            accessoriesTargetToStore: 0.0,
                            hsiTargetToStore: 0,
                            tabletsTargetToStore: 0,
                            smartwatchTragetToStore: 0,
                            targetMonth: month, // ✅ Auto-assign month
                        }),
                        [name]: Number(value),
                    },
                };
            } else {
                return {
                    ...prev,
                    employee: prev.employee ?? { employeeNtid: "" }, // ✅ Ensure employee exists
                    target: {
                        ...(prev.target ?? {
                            phonesTargetToEmployee: 0,
                            upgradeTargetToEmployee: 0,
                            migrationTargetToEmployee: 0,
                            accessoriesTargetByEmployee: 0.0,
                            hsiTarget: 0,
                            tabletsTargetByEmployee: 0,
                            smartwatchTargetByEmployee: 0,
                            targetMonth: month,
                        }),
                        [name]: Number(value),
                    },
                };
            }
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if ("store" in formData) {
                await updateStoreTarget(formData as StoreTargetRequest);
            } else {
                await updateEmployeeTarget(formData as EmployeeTargetRequest);
            }
            onClose();

            // // ✅ Refresh the page after a short delay
            // setTimeout(() => {
            //     window.location.reload();
            // }, 500); // Small delay for better UX
        } catch (error) {
            console.error("Error updating target:", error);
        }
        setLoading(false);
    };

    // ✅ Extract correct heading (store ID or employee NTID)
    const heading = "store" in formData ? formData.store.dealerStoreId : formData.employee.employeeNtid;
    const targetData = formData.target ?? {}; // ✅ Ensure target exists

    return (
        isOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{heading}</h2>
                    <div className="space-y-4 mt-4">
                        {Object.entries(targetData).map(([key, value]) =>
                            key !== "targetId" && key !== "targetMonth" ? ( // ✅ Exclude targetId & targetMonth
                                <div key={key} className="flex flex-col">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {key.replace(/([A-Z])/g, " $1").trim()}
                                    </label>
                                    <input
                                        type="number"
                                        name={key}
                                        value={value}
                                        onChange={handleChange}
                                        className="border p-2 rounded-md text-gray-900 dark:text-white dark:bg-gray-700"
                                    />
                                </div>
                            ) : null
                        )}
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                        <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300">Cancel</button>
                        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md" disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        )
    );
}