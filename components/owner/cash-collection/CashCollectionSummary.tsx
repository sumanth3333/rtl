"use client";

import { CashCollectionData } from "@/types/cashCollectionTypes";
import { useState } from "react";
import CashSummary from "../CashSummary";
import SaleHistoryTable from "../SaleHistoryTable";

interface CashCollectionSummaryProps {
    cashData: CashCollectionData[];
}

export default function CashCollectionSummary({ cashData }: CashCollectionSummaryProps) {
    const [expandedStore, setExpandedStore] = useState<string | null>(null);
    const toggleStore = (storeId: string) => {
        setExpandedStore(expandedStore === storeId ? null : storeId);
    };

    if (!cashData || cashData.length === 0) {
        return <p className="text-gray-500 text-center text-sm sm:text-base py-4">No cash collection data available.</p>;
    }

    // Extract overall company cash from the first entry
    const overallCompanyCash = cashData[0].overalllCompanyCash;

    return (
        <div className="mt-4 sm:mt-6 px-2 sm:px-4 lg:px-6">
            {/* Overall Company Cash Summary - Displayed Only If More Than One Store Exists */}
            {cashData.length > 1 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 text-center">Overall Company Cash</h2>
                    <CashSummary cash={overallCompanyCash} />
                </div>
            )}

            {/* Store-wise Cash Collection Data */}
            {cashData.map(({ store, cash, saleHistory }) => (
                <div key={store.dealerStoreId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-3 sm:mb-4 p-3 sm:p-4 md:p-5">
                    {/* Store Header - Click to Expand */}
                    <div
                        className="flex justify-between items-center p-2 sm:p-3 md:p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        onClick={() => toggleStore(store.dealerStoreId)}
                    >
                        <h3 className="text-sm sm:text-lg font-medium text-gray-900 dark:text-gray-200 truncate">{store.storeName}</h3>
                        <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                            {expandedStore === store.dealerStoreId ? "▲" : "▼"}
                        </span>
                    </div>

                    {/* Cash Summary */}
                    <div className="px-2 sm:px-3">
                        <CashSummary cash={cash} />
                    </div>

                    {/* Expandable Sale History */}
                    {expandedStore === store.dealerStoreId && (
                        <div className="mt-2 sm:mt-3">
                            <SaleHistoryTable saleHistory={saleHistory} dealerStoreId={store.dealerStoreId} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
