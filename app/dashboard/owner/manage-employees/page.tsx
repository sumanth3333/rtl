"use client";

import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { OwnerContext } from "@/contexts/OwnerContext";
import ManagePage from "@/components/ui/ManagePage";
import {
    getEmployees,
    addEmployee,
    deleteEmployee,
    updateEmployee,
    getInactiveEmployees,
    reactivateEmployee,
} from "@/services/owner/ownerService";
import { Employee, InactiveEmployee, employeeSchema } from "@/types/employeeSchema";
import { ApiError } from "@/services/api/errorHandler";
import EmployeeForm from "@/components/owner/EmployeeForm";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import SuccessToast from "@/components/ui/SuccessToast";

export default function ManageEmployees() {
    const { companyName } = useContext(OwnerContext);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);

    const [showInactiveModal, setShowInactiveModal] = useState(false);
    const [inactiveEmployees, setInactiveEmployees] = useState<InactiveEmployee[]>([]);
    const [inactiveLoading, setInactiveLoading] = useState(false);
    const [inactiveError, setInactiveError] = useState<string | null>(null);
    const [reactivatingNtid, setReactivatingNtid] = useState<string | null>(null);
    const [reactivateError, setReactivateError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        // companyName only ever comes from localStorage (set at interactive login) - if a
        // restored session reaches this page without it (e.g. localStorage was cleared but
        // the auth cookies are still valid), there's nothing to fetch. Without this branch
        // `loading` stays true forever with no request ever firing and no error shown.
        if (!companyName) { setLoading(false); return; }
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

    // ✅ Prevent the page behind the modal from scrolling while it's open
    useEffect(() => {
        if (!showInactiveModal) { return; }
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [showInactiveModal]);

    // ✅ Fetch inactive employees only when the modal is opened
    useEffect(() => {
        if (!showInactiveModal || !companyName) { return; }
        setInactiveLoading(true);
        setInactiveError(null);
        getInactiveEmployees(companyName)
            .then(setInactiveEmployees)
            .catch((err) => {
                const message = err instanceof ApiError ? err.message : "Failed to load inactive employees.";
                setInactiveError(message);
            })
            .finally(() => setInactiveLoading(false));
    }, [showInactiveModal, companyName]);

    const handleReactivate = async (employeeNtid: string) => {
        if (!companyName) { return; }
        setReactivateError(null);
        setReactivatingNtid(employeeNtid);
        try {
            const message = await reactivateEmployee(companyName, employeeNtid);
            setInactiveEmployees((prev) => prev.filter((emp) => emp.employeeNtid !== employeeNtid));
            setSuccessMessage(message || `${employeeNtid} reactivated successfully`);

            // ✅ Reactivation updates the existing record in place, so just refetch the active list
            const refreshed = await getEmployees(companyName);
            setEmployees(refreshed);
        } catch (error) {
            if (error instanceof ApiError && error.status === 409) {
                // Already active (e.g. reactivated from another tab) - drop it from this list instead of erroring
                setInactiveEmployees((prev) => prev.filter((emp) => emp.employeeNtid !== employeeNtid));
                setSuccessMessage(error.message);
            } else {
                const message = error instanceof ApiError ? error.message : "Failed to reactivate employee.";
                setReactivateError(message);
            }
        } finally {
            setReactivatingNtid(null);
        }
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee({
            ...employee,
            isHavingAssurantAccess:
                (employee as any).isHavingAssurantAccess ??
                (employee as any).havingAssurantAccess ??
                false,
        } as Employee); // ✅ Store normalized employee data for edit form
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
        if (!companyName) { return; }
        setSavingEdit(true);
        try {
            const updatedList = await updateEmployee(companyName, data);
            setEmployees(updatedList);
            setEditingEmployee(null);
        } catch (err) {
            console.error("Failed to update employee", err);
        } finally {
            setSavingEdit(false);
        }
    };

    if (!companyName) {
        return (
            <div className="m-6 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                We couldn&apos;t find your company for this session. Please sign out and sign back in.
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button variant="outline" onClick={() => setShowInactiveModal(true)}>
                    View Inactive Employees
                </Button>
            </div>

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
                                <InputField
                                    label="Phone Number"
                                    type="tel"
                                    {...register("phoneNumber")}
                                    error={errors.phoneNumber?.message}
                                    onInput={(e) => {
                                        const input = e.currentTarget;
                                        input.value = input.value.replace(/\D/g, "").slice(0, 15);
                                    }}
                                />
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

            {showInactiveModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[85vh] border border-gray-200 dark:border-gray-700 flex flex-col">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Inactive Employees - {companyName}
                            </h2>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => {
                                    setShowInactiveModal(false);
                                    setReactivateError(null);
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {reactivateError && (
                            <p className="mb-3 text-sm text-red-600 dark:text-red-400 shrink-0">{reactivateError}</p>
                        )}

                        <div className="overflow-y-auto">
                            {inactiveLoading ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-6">Loading...</p>
                            ) : inactiveError ? (
                                <p className="text-red-600 dark:text-red-400 text-center py-6">{inactiveError}</p>
                            ) : inactiveEmployees.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-6">No inactive employees found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                                            <tr>
                                                <th className="py-2 pr-4">NTID</th>
                                                <th className="py-2 pr-4">Name</th>
                                                <th className="py-2 pr-4">Phone</th>
                                                <th className="py-2 pr-4">Email</th>
                                                <th className="py-2 pr-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-800 dark:text-gray-200">
                                            {inactiveEmployees.map((emp) => (
                                                <tr key={emp.employeeNtid} className="border-b border-gray-100 dark:border-gray-700">
                                                    <td className="py-2 pr-4">{emp.employeeNtid}</td>
                                                    <td className="py-2 pr-4">{emp.employeeName}</td>
                                                    <td className="py-2 pr-4">{emp.phoneNumber}</td>
                                                    <td className="py-2 pr-4">{emp.email}</td>
                                                    <td className="py-2 pr-4 text-right">
                                                        <Button
                                                            variant="success"
                                                            isLoading={reactivatingNtid === emp.employeeNtid}
                                                            disabled={reactivatingNtid !== null}
                                                            onClick={() => handleReactivate(emp.employeeNtid)}
                                                        >
                                                            Reactivate
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {successMessage && (
                <SuccessToast message={successMessage} onClose={() => setSuccessMessage(null)} />
            )}
        </>

    );
}
