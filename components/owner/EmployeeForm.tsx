"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@/components/ui/InputField";
import AddressFields from "@/components/ui/addressFields/AddressFields";
import { useContext, useEffect, useState } from "react";
import { OwnerContext } from "@/contexts/OwnerContext";
import { Employee, employeeSchema } from "@/types/employeeSchema";
import Button from "@/components/ui/Button";
import ConfirmationModal from "@/components/ui/modals/ConfirmationModal";
import SuccessModal from "@/components/ui/modals/SuccessModal";

interface EmployeeFormProps {
    onSubmit: (employee: Employee) => Promise<void>;
}

export default function EmployeeForm({ onSubmit }: EmployeeFormProps) {
    const ownerContext = useContext(OwnerContext);
    const companyName = ownerContext?.companyName || "";

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [employeeData, setEmployeeData] = useState<Employee | null>(null);

    const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm<Employee>({
        resolver: zodResolver(employeeSchema),
        mode: "onChange", // ✅ Ensures validation updates dynamically
        defaultValues: {
            employeeNtid: "",
            employeeName: "",
            phoneNumber: "",
            email: "",
            address: {
                streetName: "",
                city: "",
                state: "",
                zipcode: "",
            },
            employeePayRatePerHour: 9,
            commissionPercentage: 7,
            perBoxCommission: 5,
            company: {
                companyName: companyName,
            }
        }
    });

    const handleConfirm = async () => {
        if (!employeeData) return;
        setLoading(true);
        console.log("🚀 Submitting employee data:", employeeData);
        try {
            await onSubmit(employeeData);
            setShowSuccess(true);
            reset();
        } catch (error) {
            console.error("❌ Error adding employee:", error);
        }
        setLoading(false);
        setShowConfirmation(false);
    };

    return (
        <div className="flex justify-center items-center min-h-screen py-8 bg-gray-100 dark:bg-gray-900 transition-all">
            <form
                onSubmit={handleSubmit((data) => {
                    console.log("✅ Form data captured:", data);
                    setEmployeeData(data);
                    setShowConfirmation(true);
                })}
                className="p-8 bg-white dark:bg-gray-800 shadow-xl rounded-xl w-full max-w-3xl space-y-6 
                           transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
                    Add New Employee
                </h2>

                {/* 🔹 Employee Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="Employee NTID" {...register("employeeNtid")}
                        error={errors.employeeNtid?.message}
                    />
                    <InputField
                        label="Employee Name" {...register("employeeName")}
                        error={errors.employeeName?.message}
                    />
                    <InputField
                        label="Phone Number" type="tel" {...register("phoneNumber")}
                        error={errors.phoneNumber?.message}
                    />
                    <InputField
                        label="Email" type="email" {...register("email")}
                        error={errors.email?.message}
                    />
                </div>

                {/* 🔹 Employee Address */}
                <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Employee Address
                    </h3>
                    <AddressFields register={register} errors={errors} fieldPrefix="address" />
                </div>

                {/* 🔹 Pay and Commission */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField
                        label="$/hour" type="number"
                        {...register("employeePayRatePerHour", { valueAsNumber: true })}
                        error={errors.employeePayRatePerHour?.message}
                    />
                    <InputField
                        label="Commission %" type="number"
                        {...register("commissionPercentage", { valueAsNumber: true })}
                        error={errors.commissionPercentage?.message}
                    />
                    <InputField
                        label="$/Box" type="number"
                        {...register("perBoxCommission", { valueAsNumber: true })}
                        error={errors.perBoxCommission?.message}
                    />
                </div>

                {/* 🔹 Submit Button */}
                <div className="flex justify-center">
                    <Button
                        type="submit" variant="primary"
                        isLoading={loading} fullWidth disabled={!isValid}
                    >
                        {loading ? "Processing..." : "Add Employee"}
                    </Button>
                </div>

                {/* 🔹 Confirmation Modal */}
                <ConfirmationModal
                    isOpen={showConfirmation}
                    title="Confirm New Employee Registration"
                    message="Please review the details before confirming."
                    data={employeeData}
                    onConfirm={handleConfirm}
                    onClose={() => setShowConfirmation(false)}
                />

                {/* 🔹 Success Modal */}
                <SuccessModal
                    isOpen={showSuccess}
                    title="Employee Added Successfully!"
                    message="The Employee has been added successfully."
                    onClose={() => setShowSuccess(false)}
                />
            </form>
        </div>
    );
}
