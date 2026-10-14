"use client";

import { useContext, useState } from "react";
import { ShieldQuestion } from "lucide-react";
import { EmployeeContext } from "@/contexts/EmployeeContext";
import SecureCodeResetModal from "@/components/employee/SecureCodeResetModal";

export default function SecureCodeSettings() {
    const { employee } = useContext(EmployeeContext);
    const [showReset, setShowReset] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                    <ShieldQuestion className="w-5 h-5 text-gray-400" />
                    <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Clock-In Secure Code</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Forgot your secure code? Reset it using a verification code sent to your email.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setShowReset(true)}
                    disabled={!employee}
                    className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                >
                    Reset Code
                </button>
            </div>

            {showReset && employee && (
                <SecureCodeResetModal
                    employeeName={employee.employeeName}
                    employeeNtid={employee.employeeNtid}
                    onClose={() => setShowReset(false)}
                />
            )}
        </div>
    );
}
