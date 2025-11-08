"use client";

import React, { useMemo, useState } from "react";
import { StoreAccessoriesMinQuantitySetup, AccessoriesMinQuantity } from "@/types/minQuantityTypes";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

type AccessoryQuantities = { caseQuantity: number; glassQuantity: number };
type StoreQuantities = Record<string, Record<number, AccessoryQuantities>>;

export default function MinQuantityAccessoriesTable({
  stores,
  storeQuantities,
  onQuantityChange,
  onSave,
}: {
  stores: StoreAccessoriesMinQuantitySetup[];
  storeQuantities: StoreQuantities;
  onQuantityChange: (
    storeId: string,
    productId: number,
    field: keyof AccessoryQuantities,
    value: number
  ) => void;
  onSave: (storeId: string) => void;
}) {
  // All collapsed initially
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (storeId: string) => setExpanded((e) => ({ ...e, [storeId]: !e[storeId] }));
  const hasStores = useMemo(() => (stores?.length ?? 0) > 0, [stores]);

  if (!hasStores) {
    return <div className="text-center text-gray-600 dark:text-gray-400">No stores found.</div>;
  }

  return (
    <div className="space-y-4">
      {stores.map(({ store, products }) => {
        const storeId = store.dealerStoreId;
        const isOpen = !!expanded[storeId];

        return (
          <div
            key={storeId}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 shadow-sm overflow-hidden"
          >
            {/* Header row (no nested buttons) */}
            <div className="w-full flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/50">
              {/* Left: toggle button only wraps icon+title */}
              <button
                type="button"
                onClick={() => toggle(storeId)}
                aria-expanded={isOpen}
                aria-controls={`panel-${storeId}`}
                className="inline-flex items-center gap-3"
              >
                <ChevronDownIcon
                  className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                />
                <span className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {store.storeName ?? storeId}
                </span>
              </button>

              {/* Right: Save button is a sibling, not inside the toggle button */}
              <button
                type="button"
                onClick={() => onSave(storeId)}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:opacity-90 shadow"
              >
                Save
              </button>
            </div>

            {/* Collapsible content */}
            <div
              id={`panel-${storeId}`}
              className={`transition-[grid-template-rows] duration-300 ease-out grid ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
            >
              <div className="overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-2 px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100/60 dark:bg-gray-800/60">
                  <div className="col-span-6 md:col-span-6">Accessory</div>
                  <div className="col-span-3 md:col-span-3 text-center">Case Qty</div>
                  <div className="col-span-3 md:col-span-3 text-center">Glass Qty</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {products.map((p: AccessoriesMinQuantity) => {
                    const current = storeQuantities[storeId]?.[p.id];
                    const caseQty = current?.caseQuantity ?? p.caseQuantity ?? 0;
                    const glassQty = current?.glassQuantity ?? p.glassQuantity ?? 0;

                    return (
                      <div
                        key={`${storeId}-${p.id}`}
                        className="grid grid-cols-12 gap-2 px-4 md:px-6 py-3 items-center"
                      >
                        <div className="col-span-6 md:col-span-6 text-sm text-gray-900 dark:text-gray-100">
                          {p.productName}
                        </div>

                        <div className="col-span-3 md:col-span-3">
                          <input
                            type="number"
                            min={0}
                            value={caseQty}
                            onChange={(e) =>
                              onQuantityChange(
                                storeId,
                                p.id,
                                "caseQuantity",
                                Number(e.target.value)
                              )
                            }
                            className="w-full text-center px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-300/40 dark:focus:ring-gray-700/30"
                          />
                        </div>

                        <div className="col-span-3 md:col-span-3">
                          <input
                            type="number"
                            min={0}
                            value={glassQty}
                            onChange={(e) =>
                              onQuantityChange(
                                storeId,
                                p.id,
                                "glassQuantity",
                                Number(e.target.value)
                              )
                            }
                            className="w-full text-center px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-300/40 dark:focus:ring-gray-700/30"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Save (visible when expanded) */}
                <div className="px-4 md:px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onSave(storeId)}
                    className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:opacity-90 shadow"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
