"use client";

import CompanyForm from "@/components/admin/CompanyForm";

export default function CreateCompanyPage() {
    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-4xl py-8 flex-grow"> {/* ✅ Ensure it takes full height */}
                <CompanyForm />
            </div>
        </div>
    );
}
