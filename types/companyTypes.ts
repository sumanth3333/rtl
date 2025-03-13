export type PayFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "SEMI_MONTHLY";

export interface Company {
    companyName: string;
}

export interface Threshold {
    thresholdId?: number,
    itemType: "Boxes" | "Tablets" | "Watches" | "HSI";
    minimumThreshold: number;
    threshold: number;
    payAmount: number;
}

export interface CompanyPayStructure {
    company: Company;
    payFrequency: PayFrequency;
    thresholds: Threshold[];
}
