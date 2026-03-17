"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import { fetchAllCompanies, fetchUploadedReports, uploadFileExport } from "@/services/admin/adminService";
import { FileExportResult, SimpleCompany, UploadedReport } from "@/types/fileExportTypes";
import DateRangePopover from "./components/DateRangePopover";
import FileUploadBox from "./components/FileUploadBox";
// import UploadProgressBar from "./components/UploadProgressBar";
import UploadSummary from "./components/UploadSummary";
import RecentUploadsTable from "./components/RecentUploadsTable";

type AlertState = { type: "success" | "error" | "info"; message: string } | null;

type FormState = {
    companyName: string;
    startDate: string;
    endDate: string;
    file: File | null;
};

export default function FileExportsPage() {
    const [companies, setCompanies] = useState<SimpleCompany[]>([]);
    const [companiesLoading, setCompaniesLoading] = useState(true);
    const [form, setForm] = useState<FormState>({
        companyName: "",
        startDate: "",
        endDate: "",
        file: null,
    });
    const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef<HTMLDivElement | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);
    const [progressTimer, setProgressTimer] = useState<NodeJS.Timeout | null>(null);
    const [progressReset, setProgressReset] = useState<NodeJS.Timeout | null>(null);

    const [alert, setAlert] = useState<AlertState>(null);
    const [fileInputKey, setFileInputKey] = useState(() => Date.now());
    const [result, setResult] = useState<FileExportResult | null>(null);
    const [showSummary, setShowSummary] = useState(true);

    const [uploads, setUploads] = useState<UploadedReport[]>([]);
    const [uploadsLoading, setUploadsLoading] = useState(false);
    const [sortAsc, setSortAsc] = useState(true);

    // Fetch companies
    useEffect(() => {
        const loadCompanies = async () => {
            try {
                const data = await fetchAllCompanies();
                setCompanies(data);
            } catch (error) {
                setAlert({ type: "error", message: "Couldn't load companies. Please try again." });
            } finally {
                setCompaniesLoading(false);
            }
        };
        loadCompanies();
    }, []);

    // Outside click to close calendar
    useEffect(() => {
        if (!showCalendar) { return; }
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showCalendar]);

    // Fetch recent uploads (only when company selected AND either both dates picked or none)
    useEffect(() => {
        const loadUploads = async () => {
            if (!form.companyName) {
                setUploads([]);
                return;
            }
            const hasBothDates = Boolean(form.startDate && form.endDate);
            const hasAnyDate = Boolean(form.startDate || form.endDate);
            if (hasAnyDate && !hasBothDates) { return; }

            setUploadsLoading(true);
            try {
                const data = await fetchUploadedReports(
                    form.companyName,
                    hasBothDates ? form.startDate : undefined,
                    hasBothDates ? form.endDate : undefined
                );
                setUploads(Array.isArray(data) ? data : []);
            } catch (error) {
                setUploads([]);
            } finally {
                setUploadsLoading(false);
            }
        };
        loadUploads();
    }, [form.companyName, form.startDate, form.endDate]);

    const companyOptions = useMemo(
        () => companies.map((c) => ({ value: c.companyName, label: c.companyName })),
        [companies]
    );

    const sortedUploads = useMemo(() => {
        const list = [...uploads];
        list.sort((a, b) => {
            const aDate = a.startDate || "";
            const bDate = b.startDate || "";
            return sortAsc ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate);
        });
        return list;
    }, [uploads, sortAsc]);

    const handleInputChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
        setAlert(null);
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) { return; }
        const extensionAllowed = [".csv", ".xlsx", ".xls"].some((ext) => file.name.toLowerCase().endsWith(ext));
        const allowedMimeTypes = [
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];
        const mimeAllowed = allowedMimeTypes.includes(file.type) || file.type === "";
        if (!extensionAllowed && !mimeAllowed) {
            setAlert({ type: "error", message: "Invalid file type. Please upload a CSV or Excel file." });
            event.target.value = "";
            return;
        }
        setForm((prev) => ({ ...prev, file }));
    };

    const validateForm = () => {
        if (!form.companyName) { return "Please select a company."; }
        if (form.startDate && form.endDate && form.startDate > form.endDate) { return "Start date cannot be after end date."; }
        if (!form.file) { return "Please attach a CSV or Excel file."; }
        return "";
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAlert(null);

        const validationMessage = validateForm();
        if (validationMessage) {
            setAlert({ type: "error", message: validationMessage });
            return;
        }

        setSubmitting(true);
        setShowProgress(true);
        setProgress(5);
        if (progressReset) {
            clearTimeout(progressReset);
            setProgressReset(null);
        }
        const timer = setInterval(() => {
            setProgress((p) => (p < 90 ? p + 5 : p));
        }, 350);
        setProgressTimer(timer);
        try {
            const data = await uploadFileExport(
                {
                    companyName: form.companyName,
                    startDate: form.startDate,
                    endDate: form.endDate,
                    file: form.file as File,
                },
                (evt) => {
                    if (!evt.total) { return; }
                    const percent = Math.round((evt.loaded / evt.total) * 100);
                    setProgress((prev) => Math.max(prev, percent));
                }
            );
            setAlert({ type: "success", message: "File sent successfully." });
            setResult(data);
            setShowSummary(true);
            setForm((prev) => ({
                ...prev,
                startDate: "",
                endDate: "",
                file: null,
            }));
            setRange([null, null]);
            setFileInputKey(Date.now());
            setProgress(100);
        } catch (error: any) {
            const message = typeof error === "string" ? error : error?.message || "Upload failed. Please try again.";
            setAlert({ type: "error", message });
            setResult(null);
        } finally {
            setSubmitting(false);
            if (progressTimer) {
                clearInterval(progressTimer);
                setProgressTimer(null);
            }
            const reset = setTimeout(() => setProgress(0), 800);
            setProgressReset(reset);
            setTimeout(() => setShowProgress(false), 850);
        }
    };

    return (
        <div className="space-y-8">
            <div className="p-2">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">File Exports</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Upload activation or sales reports (CSV or Excel). Dates are optional and sent as start/end query params when provided.
                </p>
            </div>

            <div className="p-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-800 dark:text-gray-100">Company</label>
                            <select
                                value={form.companyName}
                                onChange={(e) => handleInputChange("companyName", e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={companiesLoading}
                            >
                                <option value="">{companiesLoading ? "Loading companies..." : "Select company"}</option>
                                {companyOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <DateRangePopover
                            calendarRef={calendarRef}
                            showCalendar={showCalendar}
                            onToggle={() => setShowCalendar((s) => !s)}
                            range={range}
                            onRangeChange={(start, end) => {
                                setRange([start, end]);
                                handleInputChange("startDate", start ? start.toISOString().slice(0, 10) : "");
                                handleInputChange("endDate", end ? end.toISOString().slice(0, 10) : "");
                            }}
                            onClear={() => {
                                setRange([null, null]);
                                handleInputChange("startDate", "");
                                handleInputChange("endDate", "");
                            }}
                            startLabel={form.startDate}
                            endLabel={form.endDate}
                        />
                    </div>

                    <FileUploadBox
                        file={form.file}
                        onFileChange={handleFileChange}
                        fileInputKey={fileInputKey}
                    />

                    <div className="flex justify-center">
                        <Button type="submit" variant="primary" isLoading={submitting} className="px-8">
                            Upload
                        </Button>
                    </div>

                    {/* <UploadProgressBar visible={showProgress} progress={progress} /> */}

                    {alert && (
                        <div
                            className={`rounded-md px-4 py-3 text-sm border ${alert.type === "success"
                                ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200"
                                : alert.type === "error"
                                    ? "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-200"
                                    : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200"
                                }`}
                        >
                            {alert.message}
                        </div>
                    )}

                    <UploadSummary result={result} visible={showSummary} onHide={() => setShowSummary(false)} />

                    <RecentUploadsTable
                        uploads={sortedUploads}
                        loading={uploadsLoading}
                        sortAsc={sortAsc}
                        onToggleSort={() => setSortAsc((s) => !s)}
                        hasRange={Boolean(form.startDate && form.endDate)}
                    />
                </form>
            </div>
        </div>
    );
}
