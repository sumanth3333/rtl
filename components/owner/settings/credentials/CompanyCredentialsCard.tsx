"use client";

import { useContext, useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { OwnerContext } from "@/contexts/OwnerContext";
import { useCompanyCredentials } from "@/hooks/useCompanyCredentials";
import CredentialCreateModal from "./CredentialCreateModal";
import CredentialUpdateModal from "./CredentialUpdateModal";
import CredentialViewModal from "./CredentialViewModal";
import CredentialDeleteDialog from "./CredentialDeleteDialog";

export default function CompanyCredentialsCard() {
    const ownerContext = useContext(OwnerContext);
    const companyName = ownerContext?.companyName || "";

    const {
        statusLoading,
        credentialsConfigured,
        statusError,
        saving,
        save,
        updating,
        update,
        deleting,
        remove,
        locating,
        locationError,
        otpStep,
        otpRequesting,
        otpRequestError,
        otpVerifying,
        otpError,
        otpExpiresAt,
        startViewFlow,
        verifyOtp,
        revealedUsername,
        revealedPassword,
        clearReveal,
    } = useCompanyCredentials(companyName);

    const [showCreate, setShowCreate] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [showView, setShowView] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    const flash = (message: string) => {
        setNotice(message);
        setTimeout(() => setNotice(null), 3000);
    };

    const closeView = () => {
        setShowView(false);
        clearReveal();
    };

    return (
        <div className="space-y-5">
            {notice && (
                <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-4 py-2 text-sm text-emerald-800 dark:text-emerald-200">
                    {notice}
                </div>
            )}

            {statusLoading ? (
                <div className="animate-pulse space-y-2">
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-9 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
            ) : statusError ? (
                <p className="text-sm text-rose-600 dark:text-rose-400">{statusError}</p>
            ) : credentialsConfigured === false ? (
                <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3">
                        <KeyRound className="w-5 h-5 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">No credentials configured yet.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreate(true)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        Add Credentials
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <p className="text-sm text-gray-700 dark:text-gray-200">Credentials are configured.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setShowView(true)}
                            className="px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        >
                            View
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowUpdate(true)}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            Update
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowDelete(true)}
                            className="px-3 py-1.5 text-sm font-medium text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/30"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}

            <CredentialCreateModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                saving={saving}
                onSave={async (username, password) => {
                    await save(username, password);
                    flash("Company credentials saved successfully.");
                }}
            />

            <CredentialUpdateModal
                isOpen={showUpdate}
                onClose={() => setShowUpdate(false)}
                updating={updating}
                onUpdate={async (username, password) => {
                    await update(username, password);
                    flash("Company credentials updated successfully.");
                }}
            />

            <CredentialViewModal
                isOpen={showView}
                onClose={closeView}
                onStart={startViewFlow}
                otpStep={otpStep}
                locating={locating}
                locationError={locationError}
                otpRequesting={otpRequesting}
                otpRequestError={otpRequestError}
                otpVerifying={otpVerifying}
                otpError={otpError}
                otpExpiresAt={otpExpiresAt}
                onVerify={verifyOtp}
                revealedUsername={revealedUsername}
                revealedPassword={revealedPassword}
            />

            <CredentialDeleteDialog
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                deleting={deleting}
                onDelete={async () => {
                    await remove();
                    flash("Company credentials deleted.");
                }}
            />
        </div>
    );
}
