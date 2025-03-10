"use client";

import { useState } from "react";

export default function InvoiceSearchForm({ onSearch }: { onSearch: (imei: string) => void }) {
    const [imei, setImei] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (imei.trim().length === 15) {
            onSearch(imei);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
            <input
                type="text"
                placeholder="Enter IMEI (15 digits)"
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
            />
            <button
                type="submit"
                className="px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                disabled={imei.trim().length !== 15}
            >
                Search
            </button>
        </form>
    );
}
