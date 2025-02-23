"use client";

import { useContext, useEffect, useState } from "react";
import { OwnerContext } from "@/contexts/OwnerContext";
import ManagePage from "@/components/ui/ManagePage";
import { getEmployees, addEmployee, deleteEmployee } from "@/services/owner/ownerService";
import { Employee } from "@/types/employeeSchema";
import EmployeeForm from "@/components/owner/EmployeeForm";

export default function ManageEmployees() {
    const { companyName } = useContext(OwnerContext);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    useEffect(() => {
        if (!companyName) return;
        setLoading(true);
        Promise.all([getEmployees(companyName)]).then(([employeesData]) => {
            setEmployees(employeesData);
        })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [companyName]);

    const handleAdd = async (newEmployee: Employee) => {
        if (!companyName) return;
        setLoading(true);
        const updatedEmployees = await addEmployee(companyName, newEmployee);
        setEmployees(updatedEmployees);
        setLoading(false);
    };

    const handleDelete = async (employeeNtid: string) => {
        if (!employeeNtid) return; // ✅ Prevents accidental calls with empty NTID

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

    return (
        <ManagePage
            title={`Manage Employees - ${companyName}`}
            data={employees}
            isLoading={loading}
            columns={[
                { key: "employeeNtid", label: "Employee NTID" },
                { key: "employeeName", label: "Employee Name" },
                { key: "employeePayRatePerHour", label: "$/Hour" },
                { key: "commissionPercentage", label: "Accessories %" },
                { key: "perBoxCommission", label: "$/Box" },
            ]}
            onAdd={() => { }}
            onEdit={handleEdit} // ✅ Now updates state
            onDelete={handleDelete} // ✅ Uses fixed deletion logic
            addForm={<EmployeeForm onSubmit={handleAdd} />}
        />

    );
}
