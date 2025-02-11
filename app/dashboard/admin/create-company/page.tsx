"use client";

import CompanyForm from "@/components/ui/admin/CompanyForm";

export default function CreateCompanyPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-4 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-4xl">
                <CompanyForm />
            </div>
        </div>
    );
}
