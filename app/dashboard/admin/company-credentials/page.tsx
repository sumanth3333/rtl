"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Eye, EyeOff, Search } from "lucide-react";
import { fetchAllCompanyCredentials } from "@/services/admin/adminService";
import { AdminCompanyCredential } from "@/types/companyCredentialTypes";
import { ApiError } from "@/services/api/errorHandler";

export default function AdminCompanyCredentialsPage() {
    const [credentials, setCredentials] = useState<AdminCompanyCredential[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchAllCompanyCredentials();
                if (isMounted) { setCredentials(data); }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof ApiError ? err.message : "Failed to load company credentials.");
                }
            } finally {
                if (isMounted) { setLoading(false); }
            }
        };
        load();
        // ✅ Nothing fetched here is persisted anywhere - it only lives in this component's state
        // and is discarded automatically when the page unmounts.
        return () => { isMounted = false; };
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) { return credentials; }
        return credentials.filter((c) => c.companyName.toLowerCase().includes(q));
    }, [credentials, search]);

    const togglePassword = (companyName: string) => {
        setVisiblePasswords((prev) => {
            const next = new Set(prev);
            if (next.has(companyName)) {
                next.delete(companyName);
            } else {
                next.add(companyName);
            }
            return next;
        });
    };

    const handleCopy = async (key: string, value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 1500);
        } catch {
            // clipboard API unavailable - ignore silently, nothing sensitive is logged
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Company Credentials</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Stored login credentials for every company. Passwords are masked by default.
            </p>

            <div className="mt-6 relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by company name"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {error && (
                <div className="mt-4 rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                    {error}
                </div>
            )}

            {loading ? (
                <p className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">Loading credentials...</p>
            ) : !error && filtered.length === 0 ? (
                <p className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">
                    {credentials.length === 0 ? "No company credentials configured yet." : "No companies match your search."}
                </p>
            ) : !error && (
                <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="py-3 px-4">Company</th>
                                <th className="py-3 px-4">Username</th>
                                <th className="py-3 px-4">Password</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filtered.map((cred) => {
                                const isVisible = visiblePasswords.has(cred.companyName);
                                return (
                                    <tr key={cred.companyName} className="text-gray-800 dark:text-gray-200">
                                        <td className="py-3 px-4 font-medium">{cred.companyName}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <span>{cred.userName}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(`${cred.companyName}-user`, cred.userName)}
                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                    title="Copy username"
                                                >
                                                    {copiedKey === `${cred.companyName}-user`
                                                        ? <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                        : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono">
                                                    {isVisible ? cred.password : "••••••••"}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => togglePassword(cred.companyName)}
                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                    title={isVisible ? "Hide password" : "Show password"}
                                                >
                                                    {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(`${cred.companyName}-pass`, cred.password)}
                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                    title="Copy password"
                                                >
                                                    {copiedKey === `${cred.companyName}-pass`
                                                        ? <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                        : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
