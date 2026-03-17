"use client";

import React from "react";

interface Props {
    file: File | null;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputKey: number;
}

export default function FileUploadBox({ file, onFileChange, fileInputKey }: Props) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800 dark:text-gray-100">Upload File</label>
            <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/60">
                <p className="text-sm text-gray-700 dark:text-gray-200">Drag & drop or choose a CSV / Excel file.</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Accepted: .csv, .xlsx, .xls</p>
                <label className="cursor-pointer inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition">
                    Browse
                    <input
                        key={fileInputKey}
                        type="file"
                        accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        className="hidden"
                        onChange={onFileChange}
                    />
                </label>
                {file && (
                    <p className="text-sm text-green-700 dark:text-green-400">Selected: {file.name}</p>
                )}
            </div>
        </div>
    );
}
