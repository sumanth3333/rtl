"use client";

interface EodSummary {
    dealerStoreId: string;
    employeeName: string;
    boxesSold: string;
    upgrade: string;
    migrations: string;
    accessories: string;
    hsiSold: string;
    tabletsSold: string;
    watchesSold: string;
    saleDate: string;
}

interface LatestEodListProps {
    eodList: EodSummary[];
    totals?: {
        totalActivations: number;
        totalUpgrades: number;
        totalMigrations: number;
        totalHsi: number;
        totalBts: number;
        totalFreeLines: number;
        totalAccessories: number;
    };
}

import { useMemo, useState } from "react";

type SortKey = "store" | "employee" | "accessories";
type SortDir = "asc" | "desc";

export default function LatestEodList({ eodList, totals }: LatestEodListProps) {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDir }>({ key: "store", direction: "asc" });

    const parseAccessories = (value: string) => {
        const num = Number.parseFloat(String(value).replace(/[^0-9.-]/g, ""));
        return Number.isFinite(num) ? num : 0;
    };

    const sortedEod = useMemo(() => {
        const list = [...eodList];
        const { key, direction } = sortConfig;

        return list.sort((a, b) => {
            if (key === "store") {
                const result = a.dealerStoreId.localeCompare(b.dealerStoreId);
                return direction === "asc" ? result : -result;
            }

            if (key === "employee") {
                const result = a.employeeName.localeCompare(b.employeeName);
                return direction === "asc" ? result : -result;
            }

            const result = parseAccessories(a.accessories) - parseAccessories(b.accessories);
            return direction === "asc" ? result : -result;
        });
    }, [eodList, sortConfig]);

    const toggleSort = (key: SortKey) => {
        setSortConfig((prev) =>
            prev.key === key
                ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
                : { key, direction: "asc" }
        );
    };

    const indicator = (key: SortKey) => {
        if (sortConfig.key !== key) return "";
        return sortConfig.direction === "asc" ? "▲" : "▼";
    };
    return (
        <div className="w-full p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            {/* ✅ Desktop View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-300 dark:border-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 uppercase">
                        <tr>
                            <th
                                className="p-2 text-left cursor-pointer select-none"
                                onClick={() => toggleSort("store")}
                                title="Sort by store"
                            >
                                Store {indicator("store")}
                            </th>
                            <th
                                className="p-2 text-left cursor-pointer select-none"
                                onClick={() => toggleSort("employee")}
                                title="Sort by employee"
                            >
                                Employee {indicator("employee")}
                            </th>
                            <th className="p-2 text-center">Activations</th>
                            <th className="p-2 text-center">Upgrades</th>
                            <th className="p-2 text-center">Migrations</th>
                            <th className="p-2 text-center">HSI</th>
                            <th className="p-2 text-center">BTS</th>
                            <th className="p-2 text-center">Free Lines</th>
                            <th
                                className="p-2 text-center cursor-pointer select-none"
                                onClick={() => toggleSort("accessories")}
                                title="Sort by accessories"
                            >
                                Accessories ($) {indicator("accessories")}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedEod.map((eod, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                <td className="p-2 text-gray-700 dark:text-gray-300">{eod.dealerStoreId}</td>
                                <td className="p-2 text-gray-700 dark:text-gray-300">{eod.employeeName}</td>
                                <td className="p-2 text-center font-semibold text-blue-600 dark:text-blue-400">{eod.boxesSold}</td>
                                <td className="p-2 text-center font-semibold text-blue-600 dark:text-blue-400">{eod.upgrade}</td>
                                <td className="p-2 text-center font-semibold text-blue-600 dark:text-blue-400">{eod.migrations}</td>
                                <td className="p-2 text-center font-semibold text-green-600 dark:text-green-400">{eod.hsiSold}</td>
                                <td className="p-2 text-center font-semibold text-indigo-600 dark:text-indigo-400">{eod.tabletsSold}</td>
                                <td className="p-2 text-center font-semibold text-purple-600 dark:text-purple-400">{eod.watchesSold}</td>
                                <td className="p-2 text-center font-semibold text-yellow-600 dark:text-yellow-400">${eod.accessories}</td>
                            </tr>
                        ))}
                    </tbody>

                    {totals && (
                        <tfoot className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 font-semibold">
                            <tr>
                                <td className="p-2" colSpan={2}>Totals</td>
                                <td className="p-2 text-center text-blue-600 dark:text-blue-300">{totals.totalActivations}</td>
                                <td className="p-2 text-center text-blue-600 dark:text-blue-300">{totals.totalUpgrades}</td>
                                <td className="p-2 text-center text-blue-600 dark:text-blue-300">{totals.totalMigrations}</td>
                                <td className="p-2 text-center text-green-600 dark:text-green-300">{totals.totalHsi}</td>
                                <td className="p-2 text-center text-indigo-600 dark:text-indigo-300">{totals.totalBts}</td>
                                <td className="p-2 text-center text-purple-600 dark:text-purple-300">{totals.totalFreeLines}</td>
                                <td className="p-2 text-center text-yellow-600 dark:text-yellow-300">
                                    ${totals.totalAccessories?.toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* ✅ Mobile View */}
            <div className="md:hidden flex flex-col gap-2">
                {sortedEod.map((eod, index) => (
                    <div
                        key={index}
                        className="p-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 dark:border-blue-400 rounded-md shadow-sm flex flex-col"
                    >
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Date</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {eod.saleDate}
                            </span>
                        </div>

                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Store</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {eod.dealerStoreId}
                            </span>
                        </div>

                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Employee</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {eod.employeeName}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-2 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex justify-between bg-white dark:bg-gray-700 p-2 rounded-md shadow-sm">
                                <span>Activations</span>
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {eod.boxesSold}
                                </span>
                            </div>
                            <div className="flex justify-between bg-white dark:bg-gray-700 p-2 rounded-md shadow-sm">
                                <span>Upgrades</span>
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {eod.upgrade}
                                </span>
                            </div>
                            <div className="flex justify-between bg-white dark:bg-gray-700 p-2 rounded-md shadow-sm">
                                <span>Migrations</span>
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {eod.migrations}
                                </span>
                            </div>
                            <div className="flex justify-between bg-white dark:bg-gray-700 p-2 rounded-md shadow-sm">
                                <span>HSI</span>
                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    {eod.hsiSold}
                                </span>
                            </div>

                            <div className="flex justify-between bg-white dark:bg-gray-700 p-2 rounded-md shadow-sm">
                                <span>BTS</span>
                                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                    {eod.tabletsSold}
                                </span>
                            </div>

                            <div className="flex justify-between bg-white dark:bg-gray-700 p-2 rounded-md shadow-sm">
                                <span>Free Lines</span>
                                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                    {eod.watchesSold}
                                </span>
                            </div>

                            <div className="col-span-2 flex justify-between bg-white dark:bg-gray-700 p-2 rounded-md shadow-sm">
                                <span>Accessories ($)</span>
                                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                                    ${eod.accessories}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {totals && (
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex justify-between">
                                <span>Activations</span>
                                <span className="font-semibold text-blue-600 dark:text-blue-300">{totals.totalActivations}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Upgrades</span>
                                <span className="font-semibold text-blue-600 dark:text-blue-300">{totals.totalUpgrades}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Migrations</span>
                                <span className="font-semibold text-blue-600 dark:text-blue-300">{totals.totalMigrations}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>HSI</span>
                                <span className="font-semibold text-green-600 dark:text-green-300">{totals.totalHsi}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>BTS</span>
                                <span className="font-semibold text-indigo-600 dark:text-indigo-300">{totals.totalBts}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Free Lines</span>
                                <span className="font-semibold text-purple-600 dark:text-purple-300">{totals.totalFreeLines}</span>
                            </div>
                            <div className="col-span-2 flex justify-between">
                                <span>Accessories ($)</span>
                                <span className="font-semibold text-yellow-600 dark:text-yellow-300">
                                    ${totals.totalAccessories?.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
