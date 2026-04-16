"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import { fetchAllCompanies, fetchReportUploadSuggestions, fetchRetentionGroupedSuggestions, fetchUploadedReports, uploadFileExport } from "@/services/admin/adminService";
import { FileExportResult, FileExportType, SimpleCompany, UploadedReport } from "@/types/fileExportTypes";
import { ReportUploadSuggestionGroup, ReportUploadSuggestionItem, ReportUploadSuggestionStatus } from "@/types/retentionSuggestion";
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
    reportType: FileExportType;
};

const REPORT_TYPE_OPTIONS: { value: FileExportType; label: string }[] = [
    { value: "activation", label: "Activation Detail" },
    { value: "saleDetail", label: "Sales Detail" },
    { value: "callidus", label: "Callidus" },
    { value: "retentionReport", label: "Retention Report" },
];

const REPORT_INSTRUCTIONS: Record<FileExportType, { title: string; steps: string[] }> = {
    activation: {
        title: "Download activation report first for the selected date range.",
        steps: [
            "Go to myrtpos.com and log in with the company's credentials.",
            "Navigate to Activation Reports and choose “Activation Details [XLS]”.",
            "Select the same start/end dates as on this form, click Export.",
            "Save the file as ACTRPT_COMPANY_DATE.",
        ],
    },
    saleDetail: {
        title: "After activation, download the sales detail report.",
        steps: [
            "Go to Sales Reports and pick “Sales Detailed [RAW]”.",
            "Use the same date range, click Generate.",
            "Save the file as SLSRPT_COMPANY_DATE.",
        ],
    },
    callidus: {
        title: "Then download the Callidus reconciled report.",
        steps: [
            "Go to Callidus and select “Reconciled Report”.",
            "Select the same date range, click Raw Excel.",
            "Save the file as CALRPT_COMPANY_DATE.",
        ],
    },
    retentionReport: {
        title: "Download the retention report for the selected range.",
        steps: [
            "Go to Retention Reports and choose the retention export.",
            "Select the same start/end dates, click Export.",
            "Save the file as RTRPT_COMPANY_DATE.",
        ],
    },
};

export default function FileExportsPage() {
    const [companies, setCompanies] = useState<SimpleCompany[]>([]);
    const [companiesLoading, setCompaniesLoading] = useState(true);
    const [form, setForm] = useState<FormState>({
        companyName: "",
        startDate: "",
        endDate: "",
        file: null,
        reportType: "activation",
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

    const [reportSuggestions, setReportSuggestions] = useState<ReportUploadSuggestionItem[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);

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

    const statusClassName = (status?: ReportUploadSuggestionStatus) => {
        if (status === "OVERDUE") {
            return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-100";
        }
        if (status === "PENDING" || status === "UPCOMING") {
            return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100";
        }
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100";
    };

    const toLabel = (raw?: string) => {
        if (!raw) { return "-"; }
        return raw.replace(/_/g, " ");
    };

    const normalizeLegacyRetention = (item: ReportUploadSuggestionItem): ReportUploadSuggestionItem => ({
        ...item,
        reportType: item.reportType || "Retention_Report",
        startDate: item.startDate || item.fromDate,
        endDate: item.endDate || item.toDate,
        expectedUploadDate: item.expectedUploadDate || item.suggestedUploadDate || item.uploadedDate || undefined,
    });

    // Fetch report upload suggestions per company
    useEffect(() => {
        const loadSuggestions = async () => {
            if (!form.companyName) {
                setReportSuggestions([]);
                return;
            }
            setSuggestionsLoading(true);
            try {
                const [groups, legacyRetentionGroups] = await Promise.all([
                    fetchReportUploadSuggestions(),
                    fetchRetentionGroupedSuggestions(),
                ]);
                const match = groups.find((g) => g.companyName === form.companyName);
                const legacyMatch = legacyRetentionGroups.find((g) => g.companyName === form.companyName);
                if (match || legacyMatch) {
                    const withStatus = (items: ReportUploadSuggestionItem[] | undefined, defaultStatus: ReportUploadSuggestionStatus) =>
                        (items || []).map((item) => ({ ...item, status: item.status || defaultStatus }));

                    const itemsFromNewApi: ReportUploadSuggestionItem[] = [
                        ...withStatus(match?.overdue, "OVERDUE"),
                        ...withStatus(match?.pending, "PENDING"),
                        ...withStatus(match?.upcoming, "UPCOMING"),
                        ...withStatus(match?.uploaded, "UPLOADED"),
                    ];
                    const itemsFromLegacyRetention: ReportUploadSuggestionItem[] = [
                        ...withStatus(legacyMatch?.overdue, "OVERDUE"),
                        ...withStatus(legacyMatch?.pending, "PENDING"),
                        ...withStatus(legacyMatch?.upcoming, "UPCOMING"),
                        ...withStatus(legacyMatch?.uploaded, "UPLOADED"),
                    ].map(normalizeLegacyRetention);

                    const merged = [...itemsFromNewApi, ...itemsFromLegacyRetention];
                    const deduped = merged.filter((item, idx, arr) => {
                        const key = `${item.reportType || ""}|${item.startDate || ""}|${item.endDate || ""}|${item.status || ""}|${item.expectedUploadDate || ""}`;
                        return arr.findIndex((candidate) => (
                            `${candidate.reportType || ""}|${candidate.startDate || ""}|${candidate.endDate || ""}|${candidate.status || ""}|${candidate.expectedUploadDate || ""}`
                        ) === key) === idx;
                    });

                    deduped.sort((a, b) => {
                        const aDate = a.expectedUploadDate || a.suggestedUploadDate || a.uploadedDate || "";
                        const bDate = b.expectedUploadDate || b.suggestedUploadDate || b.uploadedDate || "";
                        return aDate.localeCompare(bDate);
                    });

                    const items: ReportUploadSuggestionItem[] = deduped.map((item) => ({
                        ...item,
                        reportType: item.reportType || (item.uploadType === "RETENTION" ? "Retention_Report" : item.uploadType),
                        startDate: item.startDate || item.fromDate,
                        endDate: item.endDate || item.toDate,
                        expectedUploadDate: item.expectedUploadDate || item.suggestedUploadDate || item.uploadedDate || undefined,
                    }));

                    items.sort((a, b) => {
                        const aDate = a.expectedUploadDate || a.suggestedUploadDate || a.uploadedDate || "";
                        const bDate = b.expectedUploadDate || b.suggestedUploadDate || b.uploadedDate || "";
                        return aDate.localeCompare(bDate);
                    });

                    setReportSuggestions(items);
                } else {
                    setReportSuggestions([]);
                }
            } catch (error) {
                setReportSuggestions([]);
            } finally {
                setSuggestionsLoading(false);
            }
        };
        loadSuggestions();
    }, [form.companyName]);

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
                    reportType: form.reportType,
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
                reportType: prev.reportType,
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
                    Upload activation, sales detail, Callidus, or retention reports (CSV or Excel). Dates are optional and sent as start/end query params when provided.
                </p>

                {form.companyName && (
                    <div className="mt-4 rounded-lg border border-indigo-100 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-900/30 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Report upload suggestions</p>
                            <span className="text-xs text-indigo-800 dark:text-indigo-200">
                                {suggestionsLoading ? "Loading..." : `${reportSuggestions.length} records`}
                            </span>
                        </div>
                        {reportSuggestions.length === 0 ? (
                            <p className="text-xs text-indigo-900 dark:text-indigo-100">No report upload suggestions available.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-xs text-left">
                                    <thead className="text-indigo-900 dark:text-indigo-100">
                                        <tr>
                                            <th className="px-2 py-1">Report</th>
                                            <th className="px-2 py-1">Start Date</th>
                                            <th className="px-2 py-1">End Date</th>
                                            <th className="px-2 py-1">Expected Upload</th>
                                            <th className="px-2 py-1">Status</th>
                                            <th className="px-2 py-1">Message</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-indigo-950 dark:text-indigo-50">
                                        {reportSuggestions.map((item, idx) => (
                                            <tr
                                                key={`${item.reportType || item.month || "report"}-${item.startDate || item.fromDate || idx}-${idx}`}
                                                className="odd:bg-white even:bg-indigo-50/50 dark:odd:bg-indigo-900/40 dark:even:bg-indigo-900/20"
                                            >
                                                <td className="px-2 py-1">{toLabel(item.reportType || item.uploadType)}</td>
                                                <td className="px-2 py-1">{item.startDate || item.fromDate || "-"}</td>
                                                <td className="px-2 py-1">{item.endDate || item.toDate || "-"}</td>
                                                <td className="px-2 py-1">{item.expectedUploadDate || item.suggestedUploadDate || item.uploadedDate || "-"}</td>
                                                <td className="px-2 py-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusClassName(item.status)}`}>
                                                        {item.status || "UPLOADED"}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-1">{item.message || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
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

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-800 dark:text-gray-100">Report Type</label>
                            <select
                                value={form.reportType}
                                onChange={(e) => handleInputChange("reportType", e.target.value as FileExportType)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {REPORT_TYPE_OPTIONS.map((option) => (
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

                    <div className="rounded-md border border-indigo-200/70 dark:border-indigo-700/70 bg-indigo-50/80 dark:bg-indigo-900/20 p-4 space-y-2">
                        <div className="flex items-center justify-between text-indigo-900 dark:text-indigo-100">
                            <p className="font-semibold text-sm">{REPORT_INSTRUCTIONS[form.reportType].title}</p>
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-white/70 dark:bg-indigo-800/60 border border-indigo-200/70 dark:border-indigo-700/70">
                                {REPORT_TYPE_OPTIONS.find((o) => o.value === form.reportType)?.label}
                            </span>
                        </div>
                        <ol className="list-decimal list-inside text-sm text-indigo-900 dark:text-indigo-100 space-y-1">
                            {REPORT_INSTRUCTIONS[form.reportType].steps.map((step, idx) => (
                                <li key={idx}>{step}</li>
                            ))}
                        </ol>
                        <p className="text-xs text-indigo-900/80 dark:text-indigo-100/80">
                            Sequence: upload activation first, then sales, then Callidus for the same dates.
                        </p>
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
