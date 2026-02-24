import { useState } from "react";
import InputField from "@/components/ui/InputField";
import { useFormContext } from "react-hook-form";
import { EodReport } from "@/types/employeeSchema";

interface Props {
    validationErrors: Record<string, string>;
}

export default function SalesSummarySection({ validationErrors }: Props) {
    const { register, formState: { errors } } = useFormContext<EodReport>();
    const [isActivationsFocused, setIsActivationsFocused] = useState(false);
    const [isUpgradesFocused, setIsUpgradesFocused] = useState(false);
    const [isMigrationsFocused, setIsMigrationsFocused] = useState(false);

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
                        onFocus={() => setIsActivationsFocused(true)}
                        onBlur={() => setIsActivationsFocused(false)}
                    />
                </div>

                <InputField
                    label="Upgrades"
                    type="number"
                    {...register("upgrade", { valueAsNumber: true })}
                    error={errors.upgrade?.message || validationErrors["upgrade"]}
                    onFocus={() => setIsUpgradesFocused(true)}
                    onBlur={() => setIsUpgradesFocused(false)}
                />
                <InputField
                    label="Migrations"
                    type="number"
                    {...register("migrations", { valueAsNumber: true })}
                    error={errors.migrations?.message || validationErrors["migrations"]}
                    onFocus={() => setIsMigrationsFocused(true)}
                    onBlur={() => setIsMigrationsFocused(false)}
                />
                <InputField
                    label="HSI"
                    type="number"
                    {...register("hsiSold", { valueAsNumber: true })}
                    error={errors.hsiSold?.message || validationErrors["hsiSold"]}
                />
                <InputField
                    label="Tablets & Watches"
                    type="number"
                    {...register("tabletsSold", { valueAsNumber: true })}
                    error={errors.tabletsSold?.message || validationErrors["tabletsSold"]}
                />
                <InputField
                    label="Free/$5 Lines(2GPROMO)"
                    type="number"
                    {...register("watchesSold", { valueAsNumber: true })}
                    error={errors.watchesSold?.message || validationErrors["watchesSold"]}
                />
            </div>
        </div>
    );
}
