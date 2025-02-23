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

    return (
        <div className="mt-6">
            {cashData?.length > 0 ? (
                cashData.map(({ store, cash, saleHistory }) => (
                    <div key={store.dealerStoreId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4">
                        {/* Store Header - Click to Expand */}
                        <div
                            className="flex justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => toggleStore(store.dealerStoreId)}
                        >
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">{store.storeName}</h3>
                            <span className="text-gray-700 dark:text-gray-300">
                                {expandedStore === store.dealerStoreId ? "▲" : "▼"}
                            </span>
                        </div>

                        {/* Cash Summary */}
                        <CashSummary cash={cash} />

                        {/* Expandable Sale History */}
                        {expandedStore === store.dealerStoreId && <SaleHistoryTable saleHistory={saleHistory} />}
                    </div>
                ))
            ) : (
                <p className="text-gray-500 text-center">No cash collection data available.</p>
            )}
        </div>
    );
}
