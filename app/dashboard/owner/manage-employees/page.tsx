"use client";

import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { OwnerContext } from "@/contexts/OwnerContext";
import ManagePage from "@/components/ui/ManagePage";
import { getEmployees, addEmployee, deleteEmployee, updateEmployee } from "@/services/owner/ownerService";
import { Employee, employeeSchema } from "@/types/employeeSchema";
import EmployeeForm from "@/components/owner/EmployeeForm";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";

export default function ManageEmployees() {
    const { companyName } = useContext(OwnerContext);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        if (!companyName) { return; }
        setLoading(true);
        Promise.all([getEmployees(companyName)]).then(([employeesData]) => {
            setEmployees(employeesData);
        })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [companyName]);

    const handleAdd = async (newEmployee: Employee) => {
        if (!companyName) { return; }
        setLoading(true);
        const updatedEmployees = await addEmployee(companyName, newEmployee);
        setEmployees(updatedEmployees);
        setLoading(false);
    };

    const handleDelete = async (employeeNtid: string) => {
        if (!employeeNtid) { return; } // ✅ Prevents accidental calls with empty NTID

        setLoading(true);
        try {
            await deleteEmployee(employeeNtid); // ✅ Call delete API
            setEmployees((prevEmployees) => prevEmployees.filter(emp => emp.employeeNtid !== employeeNtid)); // ✅ Remove employee from state
        } catch (error) {
            console.error("Error deleting employee:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee); // ✅ Store the employee to edit
    };

    const editSchema = employeeSchema.extend({
        address: employeeSchema.shape.address.partial().optional(), // optional for edits
        company: employeeSchema.shape.company.partial().optional(), // optional for edits
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<Employee>({
        resolver: zodResolver(editSchema),
        mode: "all",
        shouldUnregister: false, // keep nested fields like address even if not rendered
        values: editingEmployee ?? undefined,
    });

    useEffect(() => {
        if (editingEmployee) {
            reset(editingEmployee);
        }
    }, [editingEmployee, reset]);

    const onUpdateSubmit = async (data: Employee) => {
        console.log("Submitting employee update", data);
        if (!companyName) { return; }
        setSavingEdit(true);
        try {
            const updatedList = await updateEmployee(companyName, data);
            setEmployees(updatedList);
            setEditingEmployee(null);
            console.log("Update success");
        } catch (err) {
            console.error("Failed to update employee", err);
        } finally {
            setSavingEdit(false);
        }
    };

    return (
        <>
            <ManagePage
                title={`Manage Employees - ${companyName}`}
                data={employees}
                isLoading={loading}
                columns={[
                    { key: "employeeNtid", label: "Employee NTID" },
                    { key: "employeeName", label: "Employee Name" },
                    { key: "accessLevel", label: "Access Level" },
                    { key: "AssignedManager", label: "Handled By" },
                ]}
                onAdd={() => { }}
                onEdit={handleEdit}
                onDelete={handleDelete}
                addForm={<EmployeeForm onSubmit={handleAdd} />}
                renderActions={(emp) => (
                    <div className="flex space-x-2">
                        <Button variant="primary" onClick={() => handleEdit(emp)}>Edit</Button>
                        <Button variant="danger" onClick={() => handleDelete((emp as any).employeeNtid)}>Deactivate</Button>
                    </div>
                )}
            />

            {editingEmployee && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Edit Employee
                            </h2>
                            <button className="text-gray-500 hover:text-gray-700" onClick={() => setEditingEmployee(null)}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Employee NTID" disabled {...register("employeeNtid")} error={errors.employeeNtid?.message} />
                                <InputField label="Employee Name" {...register("employeeName")} error={errors.employeeName?.message} />
                                <InputField label="Phone Number" {...register("phoneNumber")} error={errors.phoneNumber?.message} />
                                <InputField label="Email" type="email" {...register("email")} error={errors.email?.message} />
                                <InputField label="$/hour" type="number" step="0.01" {...register("employeePayRatePerHour", { valueAsNumber: true })} error={errors.employeePayRatePerHour?.message} />
                                <InputField label="Commission %" type="number" step="0.01" {...register("commissionPercentage", { valueAsNumber: true })} error={errors.commissionPercentage?.message} />
                                <InputField label="$/Box" type="number" step="0.01" {...register("perBoxCommission", { valueAsNumber: true })} error={errors.perBoxCommission?.message} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex items-center space-x-3 text-gray-800 dark:text-gray-200">
                                    <input type="checkbox" className="h-4 w-4" {...register("isHavingAssurantAccess")} />
                                    <span>Assurant Access</span>
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Button type="button" variant="secondary" onClick={() => setEditingEmployee(null)}>Cancel</Button>
                                <Button type="submit" variant="primary" isLoading={savingEdit} disabled={savingEdit}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>

    );
}
