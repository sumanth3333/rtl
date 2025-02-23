"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companySchema, Company } from "@/schemas/schema";
import Button from "@/components/ui/Button";
import InputField from "../ui/InputField";
import ConfirmationModal from "@/components/ui/modals/ConfirmationModal";
import SuccessModal from "@/components/ui/modals/SuccessModal";
import { useAuth } from "@/hooks/useAuth";
import AddressFields from "../ui/addressFields/AddressFields";
import { createCompany } from "@/services/admin/adminService";

export default function CompanyForm() {
    const { username } = useAuth();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<Company>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            companyName: "",
            email: "",
            companyAddress: {
                streetName: "",
                city: "",
                state: "",
                zipcode: "",
            },
            updatedPerson: username || "",
        },
    });

    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState<Company | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        if (username) {
            setValue("updatedPerson", username);
        }
        setIsClient(true);
    }, [username, setValue]);

    const onSubmit = (data: Company) => {
        setFormData(data);
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        setShowConfirm(false);
        try {
            await createCompany(formData as Company);
            setShowSuccess(true);
            reset();
        } catch (error) {
            alert("Failed to create company.");
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-8 py-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100 text-center">
                Create Company
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* ✅ Two Input Fields Per Line */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="Company Name"
                        type="text"
                        {...register("companyName")}
                        error={errors.companyName?.message}
                    />
                    <InputField
                        label="Company Email"
                        type="email"
                        {...register("email")}
                        error={errors.email?.message}
                    />
                </div>

                {/* ✅ Address Fields */}
                <AddressFields register={register} errors={errors} fieldPrefix="companyAddress" />

                {/* ✅ Single Full-Width Input */}
                <InputField
                    label="Updated Person Name"
                    type="text"
                    {...register("updatedPerson")}
                    error={errors.updatedPerson?.message}
                    readOnly
                />

                {/* ✅ Full-Width Button */}
                <Button type="submit" isLoading={isSubmitting} fullWidth>
                    Create Company
                </Button>
            </form>

            {/* ✅ Modal Confirmation & Success */}
            {isClient && (
                <>
                    <ConfirmationModal
                        isOpen={showConfirm}
                        onClose={() => setShowConfirm(false)}
                        onConfirm={handleConfirm}
                        data={formData}
                        title="Confirm Company Creation"
                        message="Are you sure you want to create this company?"
                        confirmText="Create"
                        cancelText="Cancel"
                    />

                    <SuccessModal
                        isOpen={showSuccess}
                        onClose={() => setShowSuccess(false)}
                        title="Company Created Successfully"
                        message="The company has been successfully created."
                    />
                </>
            )}
        </div>
    );
}
