"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import apiClient from "@/services/api/apiClient";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useOwner } from "@/hooks/useOwner";
import { getEmployees } from "@/services/owner/ownerService";
import { Employee } from "@/types/employeeSchema";
import { toast } from "react-toastify";

export default function ViewEmployeeEodRemarksPage() {
    const { companyName } = useOwner();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeNtid, setEmployeeNtid] = useState("");
    const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
    const [remarks, setRemarks] = useState<any[]>([]);
    const [employeeName, setEmployeeName] = useState("");
    const [overview, setOverview] = useState<any>(null);
    const [workSummary, setWorkSummary] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEmployees = async () => {
            if (!companyName) { return };
            const list = await getEmployees(companyName);
            setEmployees(list);
        };
        fetchEmployees();
    }, [companyName]);

    const fetchRemarks = async () => {
        if (!employeeNtid) {
            toast.error("Please select an employee.");
            return;
        }

        setLoading(true);
        try {
            const res = await apiClient.get("/company/viewEmployeeEodRemarks", {
                params: { employeeNtid, month },
            });

            setEmployeeName(res.data.employee?.employeeName || "");
            setWorkSummary(res.data.work || null);
            setOverview(res.data.eodremarksTotalOverview || null);
            setRemarks(res.data.eodremarks || []);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to fetch EOD remarks.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Employee EOD Remarks</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Select Employee</label>
                    <select
                        value={employeeNtid}
                        onChange={(e) => setEmployeeNtid(e.target.value)}
                        className="w-full p-2 rounded-lg border text-sm dark:bg-gray-800 dark:border-gray-700"
                    >
                        <option value="">-- Select --</option>
                        {employees.map((emp) => (
                            <option key={emp.employeeNtid} value={emp.employeeNtid}>
                                {emp.employeeName} ({emp.employeeNtid})
                            </option>
                        ))}
                    </select>
                </div>

                <Input
                    type="month"
                    label="Select Month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                />
            </div>

            <Button onClick={fetchRemarks} disabled={loading}>
                {loading ? "Fetching..." : "View Remarks"}
            </Button>
            {employeeName && (
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <p className="text-lg font-semibold">Employee: {employeeName} ({employeeNtid.toUpperCase()})</p>
                </div>
            )}

            {workSummary && (
                <div className="grid md:grid-cols-3 gap-4 text-sm bg-white dark:bg-gray-900 p-4 rounded-md border">
                    <div>
                        <p><strong>Days Worked:</strong> {workSummary.numberOfDaysWorked}</p>
                        <p><strong>Hours Worked:</strong> {workSummary.numberOfHoursWorked}</p>
                        {/* <p><strong>Pay:</strong> ${workSummary.workingHoursPay}</p> */}
                    </div>
                    <div>
                        <p><strong>Boxes:</strong> {workSummary.boxesSold}</p>
                        <p><strong>Upgrades:</strong> {workSummary.upgradesSold}</p>
                        <p><strong>Tablets:</strong> {workSummary.tabletsSold}</p>
                    </div>
                    <div>
                        <p><strong>Watches:</strong> {workSummary.watchesSold}</p>
                        <p><strong>HSI:</strong> {workSummary.hsiSold}</p>
                        <p><strong>Accessories:</strong> ${workSummary.totalAccessories}</p>
                    </div>
                </div>
            )}

            {overview && (
                <div className="grid md:grid-cols-3 gap-4 text-sm bg-white dark:bg-gray-900 p-4 rounded-md border">
                    <div>
                        <p><strong>Total Walk-ins:</strong> {overview.totalNumberOfWalkins}</p>
                        <p><strong>Bill Payments:</strong> {overview.totalNumberOfBillPayments}</p>
                    </div>
                    <div>
                        <p><strong>Edge Accessed:</strong> {overview.totalEdgeAccountsAccessed}</p>
                        <p><strong>Edge Not Accessed:</strong> {overview.totalEdgeAccountsNotAccessed}</p>
                    </div>
                    <div>
                        <p><strong>Google Reviews Taken:</strong> {overview.totalGoogleReviewsTaken}</p>
                    </div>
                </div>
            )}

            {remarks.length > 0 && (
                <div className="space-y-4">
                    {remarks.map((r, i) => (
                        <div key={i} className="p-4 border rounded-md bg-white dark:bg-gray-800">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                                📅 {r.remarksDate}
                            </p>
                            <p><strong>Walk-ins:</strong> {r.numberOfWalkins}</p>
                            <p><strong>Bill Payments:</strong> {r.numberOfBillPayments}</p>
                            <p><strong>What Went Well:</strong> {r.whatWentWell}</p>
                            <p><strong>What Didn't Go Well:</strong> {r.whatNotWentWell}</p>
                            <p><strong>Edge Accessed:</strong> {r.howManyEdgeAccountsAccessed}</p>
                            <p><strong>Edge Not Accessed:</strong> {r.howManyEdgeAccountsNotAccessed}</p>
                            <p><strong>Reason for Not Accessing Edge:</strong> {r.reasonForNotAccessingCustomerAccountInEdge}</p>
                            <p><strong>Google Reviews:</strong> {r.howManyGoogleReviewsTaken}</p>
                            <p><strong>Reason for No Reviews:</strong> {r.reasonForNotTakingGoogleReviews}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
