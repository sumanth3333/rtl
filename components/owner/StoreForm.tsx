"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@/components/ui/InputField";
import AddressFields from "@/components/ui/addressFields/AddressFields";
import { useContext, useEffect, useState } from "react";
import { OwnerContext } from "@/contexts/OwnerContext";
import { Store, storeSchema, StoreAddressValidationError } from "@/schemas/storeSchema";
import { ApiError } from "@/services/api/errorHandler";
import Button from "@/components/ui/Button";
import ConfirmationModal from "@/components/ui/modals/ConfirmationModal";
import SuccessModal from "@/components/ui/modals/SuccessModal";
import AddressVerificationModal from "@/components/ui/modals/AddressVerificationModal";

const extractAddressValidationError = (error: unknown): StoreAddressValidationError | null => {
    if (
        error instanceof ApiError &&
        error.status === 400 &&
        error.data &&
        typeof error.data === "object" &&
        "suggestedAddress" in error.data &&
        "submittedAddress" in error.data
    ) {
        return error.data as StoreAddressValidationError;
    }
    return null;
};

interface StoreFormProps {
    onSubmit: (store: Store) => Promise<void>;
}

export default function StoreForm({ onSubmit }: StoreFormProps) {
    const ownerContext = useContext(OwnerContext);
    const companyName = ownerContext?.companyName || "";

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [storeData, setStoreData] = useState<Store | null>(null);
    const [addressValidationError, setAddressValidationError] = useState<StoreAddressValidationError | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isValid }, setValue, reset } = useForm<Store>({
        resolver: zodResolver(storeSchema),
        mode: "onChange", // ✅ Ensures validation updates dynamically
        defaultValues: {
            dealerStoreId: "",
            storeName: "",
            storeContactNumber: "",
            address: { streetName: "", city: "", state: "", zipcode: "" },
            company: { companyName },
        }
    });

    useEffect(() => {
        setValue("company.companyName", companyName);
    }, [companyName, setValue]);

    const handleConfirm = async () => {
        if (!storeData) { return; }
        setLoading(true);
        setSubmitError(null);
        //console.log("🚀 Submitting store data:", storeData);
        try {
            await onSubmit(storeData);
            setShowSuccess(true);
            setShowConfirmation(false);
            reset();
        } catch (error) {
            setShowConfirmation(false);
            const addressError = extractAddressValidationError(error);
            if (addressError) {
                setAddressValidationError(addressError);
            } else {
                console.error("❌ Error adding store:", error);
                setSubmitError(error instanceof ApiError ? error.message : "Failed to add store. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUseSuggestedAddress = () => {
        if (!addressValidationError || !storeData) { return; }

        const correctedAddress = { ...storeData.address };
        addressValidationError.corrections.forEach((correction) => {
            if (correction.field in correctedAddress) {
                (correctedAddress as Record<string, string>)[correction.field] = correction.newValue;
            }
        });

        // ✅ Reflect the corrected values in the visible form fields; the employee still has to hit Enroll Store to save
        Object.entries(correctedAddress).forEach(([field, value]) => {
            setValue(`address.${field}` as any, value, { shouldValidate: true });
        });
        setStoreData({ ...storeData, address: correctedAddress });
        setAddressValidationError(null);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-all">
            <form
                onSubmit={handleSubmit((data) => {
                    //console.log("✅ Form data captured:", data);
                    setStoreData(data);
                    setShowConfirmation(true);
                })}
                className="p-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl w-full max-w-3xl space-y-6 
                           transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
                    Enroll New Store
                </h2>

                {/* 🔹 Store Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Dealer Store ID" {...register("dealerStoreId")} error={errors.dealerStoreId?.message} />
                    <InputField label="Store Name" {...register("storeName")} error={errors.storeName?.message} />
                    <InputField
                        label="Contact Number"
                        type="tel"
                        {...register("storeContactNumber")}
                        onInput={(e) => {
                            const input = e.currentTarget;
                            input.value = input.value.replace(/\D/g, "").slice(0, 10); // allow only digits, max 10
                        }}
                        error={errors.storeContactNumber?.message}
                    />

                </div>

                {/* 🔹 Store Address */}
                <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Store Address
                    </h3>
                    <AddressFields register={register} errors={errors} fieldPrefix="address" />
                </div>

                {/* 🔹 Company Name (Read-Only) */}
                <div className="flex flex-col">
                    <label className="text-gray-700 dark:text-gray-300 font-medium">Company Name</label>
                    <input
                        value={companyName} readOnly
                        className="p-3 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                    />
                </div>

                {submitError && (
                    <p className="text-sm text-rose-600 dark:text-rose-400 text-center">{submitError}</p>
                )}

                {/* 🔹 Submit Button */}
                <div className="flex justify-center">
                    <Button type="submit" variant="primary" isLoading={loading} fullWidth disabled={!isValid}>
                        {loading ? "Processing..." : "Enroll Store"}
                    </Button>
                </div>

                {/* 🔹 Confirmation Modal */}
                <ConfirmationModal
                    isOpen={showConfirmation}
                    title="Confirm Store Enrollment"
                    message="Please review the details before confirming."
                    data={storeData}
                    onConfirm={handleConfirm}
                    onClose={() => setShowConfirmation(false)}
                    isLoadingConfirm={loading}
                />


                {/* 🔹 Success Modal */}
                <SuccessModal
                    isOpen={showSuccess}
                    title="Store Added Successfully!"
                    message="The store has been enrolled successfully."
                    onClose={() => setShowSuccess(false)}
                />

                {/* 🔹 Address Verification Modal */}
                {addressValidationError && (
                    <AddressVerificationModal
                        isOpen
                        message={addressValidationError.message}
                        submittedAddress={addressValidationError.submittedAddress}
                        suggestedAddress={addressValidationError.suggestedAddress}
                        corrections={addressValidationError.corrections}
                        onUseSuggested={handleUseSuggestedAddress}
                        onEditManually={() => setAddressValidationError(null)}
                    />
                )}
            </form>
        </div>
    );
}
