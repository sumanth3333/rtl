"use client";

import { useState } from "react";

import { useOwner } from "@/hooks/useOwner";
import { submitContactUsRequest } from "@/services/contactUsService";
import ContactUsForm from "@/components/contactUs/ContactUsForm";
import MyRequestsList from "@/components/contactUs/MyRequestsList";

export default function OwnerContactUsPanel() {
    const { companyName, ownerEmail } = useOwner();
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="space-y-5">
            <ContactUsForm
                requesterLabel={companyName || "Your company"}
                requesterSubLabel={ownerEmail || undefined}
                onSubmit={({ concern, severity }) =>
                    submitContactUsRequest({ requestedUser: ownerEmail, concern, severity })
                }
                onSubmitted={() => setRefreshKey((k) => k + 1)}
            />

            {companyName && (
                <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Your Previous Requests
                    </h3>
                    <MyRequestsList companyName={companyName} refreshKey={refreshKey} />
                </div>
            )}
        </div>
    );
}
