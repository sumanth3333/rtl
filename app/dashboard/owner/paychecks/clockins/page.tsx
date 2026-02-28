"use client";

import { useEffect, useMemo, useState } from "react";
import { useOwner } from "@/hooks/useOwner";
import ClockinsMatrix from "@/components/owner/paycheck/ClockinsMatrix";
import { getStoreClockins, StoreClockinReport } from "@/services/owner/ownerService";
import SkeletonTable from "@/components/ui/skeletons/SkeletonTable";

function getDefaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export default function ClockinsPage() {
  const { companyName } = useOwner();
  const [{ start, end }, setRange] = useState(getDefaultRange());
  const [data, setData] = useState<StoreClockinReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!companyName) { return; }
    setLoading(true);
    getStoreClockins(companyName, start, end)
      .then((res) => setData(res))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [companyName, start, end]);

  const dates = useMemo(() => {
    const set = new Set<string>();
    data.forEach((store) => {
      store.storeOpeningReport?.storeClockins?.forEach((c) => set.add(c.date));
    });
    return Array.from(set).sort();
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Store Clock-ins</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Visual matrix of openings by store and date.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="text-gray-700 dark:text-gray-300">Start</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
          />
          <label className="text-gray-700 dark:text-gray-300">End</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : data.length > 0 ? (
        <ClockinsMatrix data={data} dates={dates} />
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No clock-ins found for the selected range.</p>
      )}
    </div>
  );
}
