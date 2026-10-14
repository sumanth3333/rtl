"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, X } from "lucide-react";

import { downloadMonitoringFile, previewMonitoringFile } from "@/services/admin/monitoringService";
import { ApiError } from "@/services/api/errorHandler";
import { MonitoringFile } from "@/types/monitoringTypes";

function prettyIfJson(fileName: string, content: string) {
    if (!fileName.endsWith(".json")) { return content; }
    try {
        return JSON.stringify(JSON.parse(content), null, 2);
    } catch {
        return content;
    }
}

export function FileViewerModal({ file, onClose }: { file: MonitoringFile; onClose: () => void }) {
    const [content, setContent] = useState("");
    const [truncated, setTruncated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        previewMonitoringFile(file.folder, file.fileName)
            .then((res) => {
                if (cancelled) { return; }
                setContent(prettyIfJson(file.fileName, res.content));
                setTruncated(res.truncated);
            })
            .catch((err) => { if (!cancelled) { setError(err instanceof ApiError ? err.message : "Failed to load this file."); } })
            .finally(() => { if (!cancelled) { setLoading(false); } });
        return () => { cancelled = true; };
    }, [file]);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await downloadMonitoringFile(file.folder, file.fileName);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to download the file.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono truncate">{file.fileName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{file.folder}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={downloading}
                            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-700 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                            {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            Download
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="rounded-md p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading file…
                        </div>
                    ) : error ? (
                        <div className="rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                            {error}
                        </div>
                    ) : (
                        <>
                            {truncated && (
                                <p className="mb-2 text-xs text-amber-600 dark:text-amber-400">
                                    Showing a truncated preview — download the file to see the rest.
                                </p>
                            )}
                            <pre className="text-xs font-mono whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-black/30 rounded-lg p-3">
                                {content || "(empty file)"}
                            </pre>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
