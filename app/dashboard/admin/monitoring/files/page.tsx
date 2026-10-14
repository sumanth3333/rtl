"use client";

import { useEffect, useState } from "react";
import { Download, Eye, File, FileArchive, FileJson, FolderOpen, Loader2 } from "lucide-react";

import { downloadMonitoringFile, fetchAllMonitoringFiles, fetchMonitoringFilesByFolder } from "@/services/admin/monitoringService";
import { MonitoringFile } from "@/types/monitoringTypes";
import { ApiError } from "@/services/api/errorHandler";
import { PillTag } from "@/components/admin/monitoring/badges";
import { FileViewerModal } from "@/components/admin/monitoring/FileViewerModal";

type FolderFilter = "" | "logs" | "monitor";

const FOLDER_TABS: { label: string; value: FolderFilter }[] = [
    { label: "All", value: "" },
    { label: "Logs", value: "logs" },
    { label: "Monitor", value: "monitor" },
];

const formatBytes = (bytes: number) => {
    if (bytes === 0) { return "0 B"; }
    const units = ["B", "KB", "MB", "GB"];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, exponent);
    return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

const formatDateTime = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) { return value; }
    return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

function fileIcon(fileName: string) {
    if (fileName.endsWith(".gz") || fileName.endsWith(".zip")) { return FileArchive; }
    if (fileName.endsWith(".json")) { return FileJson; }
    return File;
}

export default function MonitoringFilesPage() {
    const [folder, setFolder] = useState<FolderFilter>("");
    const [files, setFiles] = useState<MonitoringFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const [viewingFile, setViewingFile] = useState<MonitoringFile | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        const request = folder ? fetchMonitoringFilesByFolder(folder) : fetchAllMonitoringFiles();
        request
            .then((data) => { if (!cancelled) { setFiles(data); } })
            .catch((err) => { if (!cancelled) { setError(err instanceof ApiError ? err.message : "Failed to load files."); } })
            .finally(() => { if (!cancelled) { setLoading(false); } });
        return () => { cancelled = true; };
    }, [folder]);

    const handleDownload = async (file: MonitoringFile) => {
        const key = `${file.folder}/${file.fileName}`;
        setDownloadingKey(key);
        setDownloadError(null);
        try {
            await downloadMonitoringFile(file.folder, file.fileName);
        } catch (err) {
            setDownloadError(err instanceof ApiError ? err.message : "Failed to download the file.");
        } finally {
            setDownloadingKey(null);
        }
    };

    return (
        <div className="p-3 md:p-6 space-y-4 max-w-4xl mx-auto">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">System Files</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Application logs and monitoring startup/shutdown snapshots stored on the server.
                </p>
            </div>

            <div className="flex rounded-md border border-gray-300 dark:border-gray-700 overflow-hidden text-xs font-medium w-fit">
                {FOLDER_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => setFolder(tab.value)}
                        className={`px-3.5 py-1.5 transition-colors ${folder === tab.value
                            ? "bg-indigo-600 text-white"
                            : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                    {error}
                </div>
            )}
            {downloadError && (
                <div className="rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                    {downloadError}
                </div>
            )}

            <div className="space-y-2">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-[60px] rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 animate-pulse" />
                    ))
                ) : files.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <FolderOpen className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                        No files found{folder ? ` in "${folder}"` : ""}.
                    </div>
                ) : (
                    files.map((file) => {
                        const key = `${file.folder}/${file.fileName}`;
                        const Icon = fileIcon(file.fileName);
                        const isDownloading = downloadingKey === key;
                        return (
                            <div
                                key={key}
                                className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm px-3.5 py-3"
                            >
                                <div className="shrink-0 rounded-lg p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate font-mono">{file.fileName}</p>
                                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                        <PillTag tone="info">{file.folder}</PillTag>
                                        <span>{formatBytes(file.sizeBytes)}</span>
                                        <span>Modified {formatDateTime(file.lastModified)}</span>
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setViewingFile(file)}
                                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        View
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDownload(file)}
                                        disabled={isDownloading}
                                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                                        {isDownloading ? "Downloading…" : "Download"}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {viewingFile && <FileViewerModal file={viewingFile} onClose={() => setViewingFile(null)} />}
        </div>
    );
}
