export interface CommissionSpiff {
    id?: number;
    fromDate: string;
    toDate: string;
    activationCommission?: number;
    reactivationCommission?: number;
    upgradeCommission?: number;
    tabletCommission?: number;
    smartwatchCommission?: number;
    hsiCommission?: number;
    migrationPerAccountCommission?: number;
    migrationPerLineCommission?: number;
}

export type CommissionSpiffFieldKey =
    | "activationCommission"
    | "reactivationCommission"
    | "upgradeCommission"
    | "tabletCommission"
    | "smartwatchCommission"
    | "hsiCommission"
    | "migrationPerAccountCommission"
    | "migrationPerLineCommission";

export interface SaveCommissionSpiffRequest extends CommissionSpiff {
    companyName: string;
}

export const SPIFF_FIELDS: { key: CommissionSpiffFieldKey; label: string }[] = [
    { key: "activationCommission", label: "Activation" },
    { key: "reactivationCommission", label: "Reactivation" },
    { key: "upgradeCommission", label: "Upgrade" },
    { key: "tabletCommission", label: "Tablet" },
    { key: "smartwatchCommission", label: "Smartwatch" },
    { key: "hsiCommission", label: "HSI" },
    { key: "migrationPerAccountCommission", label: "Migration (Per Account)" },
    { key: "migrationPerLineCommission", label: "Migration (Per Line)" },
];
