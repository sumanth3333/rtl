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
  const [{ start: storeStart, end: storeEnd }, setStoreRange] = useState(getDefaultRange());
  const [{ start: empStart, end: empEnd }, setEmpRange] = useState(getDefaultRange());
  const [storeData, setStoreData] = useState<StoreClockinReport[]>([]);
  const [employeeData, setEmployeeData] = useState<StoreClockinReport[]>([]);
  const [storeLoading, setStoreLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  useEffect(() => {
    if (!companyName) { return; }
    setStoreLoading(true);
    getStoreClockins(companyName, storeStart, storeEnd)
      .then((res) => setStoreData(res))
      .catch(() => setStoreData([]))
      .finally(() => setStoreLoading(false));
  }, [companyName, storeStart, storeEnd]);

  useEffect(() => {
    if (!companyName) { return; }
    setEmployeeLoading(true);
    getStoreClockins(companyName, empStart, empEnd)
      .then((res) => setEmployeeData(res))
      .catch(() => setEmployeeData([]))
      .finally(() => setEmployeeLoading(false));
  }, [companyName, empStart, empEnd]);

  const dates = useMemo(() => {
    const set = new Set<string>();
    storeData.forEach((store) => {
      store.storeOpeningReport?.storeClockins?.forEach((c) => set.add(c.date));
    });
    return Array.from(set).sort();
  }, [storeData]);

  // Preserve user-selected start/end for employee picker next to heading
  const employeeDates = useMemo(() => {
    const set = new Set<string>();
    employeeData.forEach((store) => {
      store.storeOpeningReport?.storeClockins?.forEach((c) => set.add(c.date));
    });
    return Array.from(set).sort();
  }, [employeeData]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Store Clock-ins</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Visual matrices of clock-ins by store and by employee.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 dark:text-gray-200">Store range</span>
            <label className="text-gray-700 dark:text-gray-300">Start</label>
            <input
              type="date"
              value={storeStart}
              onChange={(e) => setStoreRange((r) => ({ ...r, start: e.target.value }))}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
            />
            <label className="text-gray-700 dark:text-gray-300">End</label>
            <input
              type="date"
              value={storeEnd}
              onChange={(e) => setStoreRange((r) => ({ ...r, end: e.target.value }))}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {storeLoading ? (
        <SkeletonTable rows={5} />
      ) : storeData.length > 0 ? (
        <ClockinsMatrix
          storeData={storeData}
          storeDates={dates}
          employeeData={employeeData}
          employeeDates={employeeDates}
          employeeRange={{
            start: empStart,
            end: empEnd,
            onChange: (field, value) => setEmpRange((r) => ({ ...r, [field]: value })),
          }}
        />
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No clock-ins found for the selected store range.</p>
      )}
    </div>
  );
}
