import { useState } from "react";
import InputField from "@/components/ui/InputField";
import { useFormContext } from "react-hook-form";
import { EodReport } from "@/types/employeeSchema";
import Link from "next/link";

interface Props {
    validationErrors: Record<string, string>;
}

export default function SalesSummarySection({ validationErrors }: Props) {
    const { register, formState: { errors } } = useFormContext<EodReport>();
    const [isActivationsFocused, setIsActivationsFocused] = useState(false);
    const [isUpgradesFocused, setIsUpgradesFocused] = useState(false);
    const [showMigrationsLockedMessage, setShowMigrationsLockedMessage] = useState(false);

    return (
        <div className="mt-6">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">SALES SUMMARY</h3>
            {isActivationsFocused && (
                <div className="mb-4 px-4 py-3 rounded-md border-l-4 border-yellow-500 bg-yellow-100 dark:bg-yellow-800 animate-pulse-slow">
                    <div className="flex items-start gap-2">
                        <span className="text-yellow-700 dark:text-yellow-200 text-xl">⚠️</span>
                        <div className="text-sm text-yellow-900 dark:text-yellow-100 leading-snug">
                            <span className="underline">Do not</span> include <strong>BTS</strong>, <strong>HSI</strong>, or <strong>Free Lines</strong> here.
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-3">
                <div>
                    <InputField
                        label="Activations (incl. BYOD)"
                        type="number"
                        {...register("boxesSold", { valueAsNumber: true })}
                        error={errors.boxesSold?.message || validationErrors["boxesSold"]}
                        onFocus={() => {
                            setIsActivationsFocused(true);
                            setShowMigrationsLockedMessage(false);
                        }}
                        onBlur={() => setIsActivationsFocused(false)}
                    />
                </div>

                <InputField
                    label="Upgrades"
                    type="number"
                    {...register("upgrade", { valueAsNumber: true })}
                    error={errors.upgrade?.message || validationErrors["upgrade"]}
                    onFocus={() => {
                        setIsUpgradesFocused(true);
                        setShowMigrationsLockedMessage(false);
                    }}
                    onBlur={() => setIsUpgradesFocused(false)}
                />
                <InputField
                    label="Migrations"
                    type="number"
                    {...register("migrations", { valueAsNumber: true })}
                    error={errors.migrations?.message || validationErrors["migrations"]}
                    readOnly
                    className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                    onFocus={() => setShowMigrationsLockedMessage(true)}
                    onClick={() => setShowMigrationsLockedMessage(true)}
                    onKeyDown={() => setShowMigrationsLockedMessage(true)}
                    onPaste={(e) => {
                        e.preventDefault();
                        setShowMigrationsLockedMessage(true);
                    }}
                />
                {showMigrationsLockedMessage && (
                    <div className="col-span-3 rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-sm dark:border-amber-700 dark:bg-amber-900/25">
                        <div className="flex items-start gap-3">
                            <span className="text-lg leading-none text-amber-700 dark:text-amber-300">⚠️</span>
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                    Migrations field is not editable
                                </p>
                                <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-200">
                                    Migrations are non editable. If the count is different than the accounts migrated today, go to the new migration orders page from your sidebar or click here to add a new order.
                                </p>
                                <Link
                                    href="/dashboard/employee/magenta"
                                    className="inline-flex items-center rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 dark:bg-amber-500 dark:hover:bg-amber-400"
                                >
                                    Go To Magenta Orders
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
                <InputField
                    label="HSI"
                    type="number"
                    {...register("hsiSold", { valueAsNumber: true })}
                    error={errors.hsiSold?.message || validationErrors["hsiSold"]}
                    onFocus={() => setShowMigrationsLockedMessage(false)}
                />
                <InputField
                    label="Tablets & Watches"
                    type="number"
                    {...register("tabletsSold", { valueAsNumber: true })}
                    error={errors.tabletsSold?.message || validationErrors["tabletsSold"]}
                    onFocus={() => setShowMigrationsLockedMessage(false)}
                />
                <InputField
                    label="Free/$5 Lines(2GPROMO)"
                    type="number"
                    {...register("watchesSold", { valueAsNumber: true })}
                    error={errors.watchesSold?.message || validationErrors["watchesSold"]}
                    onFocus={() => setShowMigrationsLockedMessage(false)}
                />
            </div>
        </div>
    );
}
