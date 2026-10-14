"use client";

import { StoreAddressCorrection } from "@/schemas/storeSchema";

interface AddressVerificationModalProps {
    isOpen: boolean;
    message: string;
    submittedAddress: string;
    suggestedAddress: string;
    corrections: StoreAddressCorrection[];
    onUseSuggested: () => void;
    onEditManually: () => void;
}

const FIELD_LABELS: Record<string, string> = {
    streetName: "Street",
    city: "City",
    state: "State",
    zipcode: "Zip Code",
};

export default function AddressVerificationModal({
    isOpen,
    message,
    submittedAddress,
    suggestedAddress,
    corrections,
    onUseSuggested,
    onEditManually,
}: AddressVerificationModalProps) {
    if (!isOpen) { return null; }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-[60] p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-gray-300 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Verify Store Address
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">{message}</p>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            You entered
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-through decoration-rose-400">
                            {submittedAddress}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                            Suggested address
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                            {suggestedAddress}
                        </p>
                    </div>

                    {corrections.length > 0 && (
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 pt-3">
                            {corrections.map((correction) => (
                                <li key={correction.field}>
                                    <span className="font-medium">{FIELD_LABELS[correction.field] ?? correction.field}:</span>{" "}
                                    <span className="line-through text-rose-500">{correction.oldValue}</span>
                                    {" → "}
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{correction.newValue}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <p className="px-6 text-xs text-gray-500 dark:text-gray-400">
                    This only updates the address fields below — you&apos;ll still need to review and hit Enroll Store to save.
                </p>

                <div className="p-6 border-t border-gray-300 dark:border-gray-700 flex justify-end space-x-3 bg-white dark:bg-gray-900">
                    <button
                        onClick={onEditManually}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        Edit Address Myself
                    </button>
                    <button
                        onClick={onUseSuggested}
                        className="px-5 py-2 bg-teal-900 text-white rounded-md hover:bg-teal-700 transition"
                    >
                        Fill In Suggested Address
                    </button>
                </div>
            </div>
        </div>
    );
}
